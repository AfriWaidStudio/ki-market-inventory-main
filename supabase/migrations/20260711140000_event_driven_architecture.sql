-- 1. Modify market_inventory_exchange_accounts
ALTER TABLE public.market_inventory_exchange_accounts
  ADD COLUMN IF NOT EXISTS last_sync_cursor text,
  ADD COLUMN IF NOT EXISTS polling_frequency_seconds integer DEFAULT 600;

-- 2. Modify market_inventory_exchange_transactions type constraint
ALTER TABLE public.market_inventory_exchange_transactions
  DROP CONSTRAINT IF EXISTS market_inventory_exchange_transactions_type_check;

ALTER TABLE public.market_inventory_exchange_transactions
  ADD CONSTRAINT market_inventory_exchange_transactions_type_check
  CHECK (type IN ('deposit', 'withdrawal', 'transfer', 'trade', 'trade_settlement', 'balance_snapshot', 'order_opened', 'order_filled', 'p2p_fiat_event'));

-- 3. Create Inferences table
CREATE TABLE IF NOT EXISTS public.market_inventory_inferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  inference_type text NOT NULL CHECK (inference_type IN ('p2p_sell_detected', 'arbitrage_route_completed', 'manual_capital_added')),
  confidence numeric,
  context_data jsonb,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.market_inventory_inferences TO authenticated;
GRANT ALL ON public.market_inventory_inferences TO service_role;

ALTER TABLE public.market_inventory_inferences ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "own inferences" ON public.market_inventory_inferences FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TRIGGER trg_inferences_updated BEFORE UPDATE ON public.market_inventory_inferences FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 4. Modify market_inventory_trades (Route Builder)
ALTER TABLE public.market_inventory_trades
  ADD COLUMN IF NOT EXISTS event_ids uuid[] DEFAULT '{}';
