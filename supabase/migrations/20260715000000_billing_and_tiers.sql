-- 1. Enums
CREATE TYPE public.subscription_tier AS ENUM ('free', 'pro', 'elite');
CREATE TYPE public.subscription_status AS ENUM ('active', 'past_due', 'canceled');
CREATE TYPE public.wallet_tx_type AS ENUM ('deposit', 'withdrawal', 'subscription_charge');
CREATE TYPE public.payment_gateway AS ENUM ('paystack', 'crypto');
CREATE TYPE public.payment_status AS ENUM ('pending', 'success', 'failed');

-- 2. User Subscriptions
CREATE TABLE public.user_subscriptions (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tier public.subscription_tier NOT NULL DEFAULT 'free',
  status public.subscription_status NOT NULL DEFAULT 'active',
  current_period_end timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.user_subscriptions TO authenticated;
GRANT ALL ON public.user_subscriptions TO service_role;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read own subscription" ON public.user_subscriptions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER trg_user_sub_updated BEFORE UPDATE ON public.user_subscriptions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 3. Wallets
CREATE TABLE public.wallets (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  balance_fiat numeric NOT NULL DEFAULT 0,
  balance_credits numeric NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.wallets TO authenticated;
GRANT ALL ON public.wallets TO service_role;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read own wallet" ON public.wallets FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER trg_wallets_updated BEFORE UPDATE ON public.wallets FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 4. Wallet Transactions Ledger
CREATE TABLE public.wallet_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  type public.wallet_tx_type NOT NULL,
  reference text,
  status public.payment_status NOT NULL DEFAULT 'success',
  created_at timestamptz NOT NULL DEFAULT now()
);
-- Ledger is append-only by service_role, read-only for users
GRANT SELECT ON public.wallet_transactions TO authenticated;
GRANT ALL ON public.wallet_transactions TO service_role;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read own wallet_transactions" ON public.wallet_transactions FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- 5. Payment Intents
CREATE TABLE public.payment_intents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  gateway public.payment_gateway NOT NULL,
  gateway_reference text NOT NULL UNIQUE,
  amount numeric NOT NULL,
  status public.payment_status NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
-- Service role only inserts intents, user can read their own
GRANT SELECT ON public.payment_intents TO authenticated;
GRANT ALL ON public.payment_intents TO service_role;
ALTER TABLE public.payment_intents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read own intents" ON public.payment_intents FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER trg_intents_updated BEFORE UPDATE ON public.payment_intents FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 6. Trigger to auto-create wallet & subscription for new users
CREATE OR REPLACE FUNCTION public.handle_new_user_billing()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.user_subscriptions (user_id, tier) VALUES (NEW.id, 'free');
  INSERT INTO public.wallets (user_id, balance_fiat, balance_credits) VALUES (NEW.id, 0, 0);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_billing
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_billing();
