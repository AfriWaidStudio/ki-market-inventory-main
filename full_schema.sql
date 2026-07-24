
-- Extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- App role enum + has_role helper
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'user',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;

-- Profiles
CREATE TABLE public.profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  preferred_currency text NOT NULL DEFAULT 'NGN',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- updated_at helper
CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Signup trigger: create profile + default 'user' role
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trade status enum
CREATE TYPE public.trade_status AS ENUM ('active', 'closed', 'cancelled');

-- Trades
CREATE TABLE public.market_inventory_trades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  asset text NOT NULL DEFAULT 'USDT',
  amount numeric NOT NULL,
  buy_exchange text NOT NULL,
  sell_exchange text NOT NULL,
  route text GENERATED ALWAYS AS (buy_exchange || ' → ' || sell_exchange) STORED,
  buy_price numeric NOT NULL,
  expected_sell_price numeric,
  actual_sell_price numeric,
  estimated_fees numeric NOT NULL DEFAULT 0,
  final_fees numeric,
  expected_profit numeric,
  actual_profit numeric,
  buy_time timestamptz NOT NULL DEFAULT now(),
  sell_time timestamptz,
  duration_minutes integer,
  status public.trade_status NOT NULL DEFAULT 'active',
  confidence_score numeric,
  risk_score numeric,
  ki_reasoning text,
  ki_accuracy_verdict text,
  lesson_learned text,
  user_notes text,
  currency text NOT NULL DEFAULT 'NGN',
  event_ids uuid[] DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.market_inventory_trades TO authenticated;
GRANT ALL ON public.market_inventory_trades TO service_role;
ALTER TABLE public.market_inventory_trades ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own trades" ON public.market_inventory_trades FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_trades_updated BEFORE UPDATE ON public.market_inventory_trades FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX idx_trades_user_status ON public.market_inventory_trades(user_id, status);
CREATE INDEX idx_trades_user_created ON public.market_inventory_trades(user_id, created_at DESC);

-- Price snapshots
CREATE TABLE public.market_inventory_price_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exchange text NOT NULL,
  asset text NOT NULL DEFAULT 'USDT',
  side text NOT NULL CHECK (side IN ('buy','sell')),
  price numeric NOT NULL,
  currency text NOT NULL DEFAULT 'NGN',
  liquidity_score numeric,
  merchant_count integer,
  merchant_rating numeric,
  captured_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.market_inventory_price_snapshots TO authenticated;
GRANT ALL ON public.market_inventory_price_snapshots TO service_role;
ALTER TABLE public.market_inventory_price_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own snapshots" ON public.market_inventory_price_snapshots FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_snapshots_user_captured ON public.market_inventory_price_snapshots(user_id, captured_at DESC);

-- Exchange accounts
CREATE TABLE public.market_inventory_exchange_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exchange text NOT NULL,
  label text,
  is_active boolean NOT NULL DEFAULT true,
  last_sync_cursor text,
  polling_frequency_seconds integer DEFAULT 600,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.market_inventory_exchange_accounts TO authenticated;
GRANT ALL ON public.market_inventory_exchange_accounts TO service_role;
ALTER TABLE public.market_inventory_exchange_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own accounts" ON public.market_inventory_exchange_accounts FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Encrypted API keys (never expose encrypted_key/encrypted_secret to client through select policy — we route reads via server functions with service role)
CREATE TABLE public.market_inventory_api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exchange text NOT NULL,
  key_label text NOT NULL,
    encrypted_passphrase text,
  encrypted_key bytea NOT NULL,
  encrypted_secret bytea NOT NULL,
  permissions text NOT NULL DEFAULT 'read_only' CHECK (permissions = 'read_only'),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.market_inventory_api_keys TO authenticated;
GRANT ALL ON public.market_inventory_api_keys TO service_role;
ALTER TABLE public.market_inventory_api_keys ENABLE ROW LEVEL SECURITY;
-- SELECT policy limited to metadata; encrypted columns are never sent to client (server fns strip them)
CREATE POLICY "own api keys" ON public.market_inventory_api_keys FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Trade notes
CREATE TABLE public.market_inventory_trade_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trade_id uuid NOT NULL REFERENCES public.market_inventory_trades(id) ON DELETE CASCADE,
  note text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.market_inventory_trade_notes TO authenticated;
GRANT ALL ON public.market_inventory_trade_notes TO service_role;
ALTER TABLE public.market_inventory_trade_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own notes" ON public.market_inventory_trade_notes FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Daily reports (computed cache)
CREATE TABLE public.market_inventory_daily_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  report_date date NOT NULL,
  total_profit numeric NOT NULL DEFAULT 0,
  trade_count integer NOT NULL DEFAULT 0,
  win_rate numeric,
  avg_duration_minutes numeric,
  best_route text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, report_date)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.market_inventory_daily_reports TO authenticated;
GRANT ALL ON public.market_inventory_daily_reports TO service_role;
ALTER TABLE public.market_inventory_daily_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own reports" ON public.market_inventory_daily_reports FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Risk alerts
CREATE TABLE public.market_inventory_risk_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  severity text NOT NULL CHECK (severity IN ('low','medium','high')),
  message text NOT NULL,
  related_trade_id uuid REFERENCES public.market_inventory_trades(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  dismissed_at timestamptz
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.market_inventory_risk_alerts TO authenticated;
GRANT ALL ON public.market_inventory_risk_alerts TO service_role;
ALTER TABLE public.market_inventory_risk_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own alerts" ON public.market_inventory_risk_alerts FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Audit log (append-only for user; service role can read all)
CREATE TABLE public.market_inventory_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action text NOT NULL,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.market_inventory_audit_log TO authenticated;
GRANT ALL ON public.market_inventory_audit_log TO service_role;
ALTER TABLE public.market_inventory_audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read own audit" ON public.market_inventory_audit_log FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert own audit" ON public.market_inventory_audit_log FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
CREATE TYPE public.market_inventory_trade_type AS ENUM ('paper', 'manual');
CREATE TYPE public.market_inventory_ledger_entry_type AS ENUM (
  'paper_position_opened',
  'paper_realized_profit',
  'manual_capital_committed',
  'manual_realized_profit',
  'fee_recorded',
  'adjustment'
);

ALTER TABLE public.market_inventory_trades
  ADD COLUMN trade_type public.market_inventory_trade_type NOT NULL DEFAULT 'manual',
  ADD COLUMN stage text NOT NULL DEFAULT 'bought',
  ADD COLUMN remaining_amount numeric,
  ADD COLUMN closed_amount numeric NOT NULL DEFAULT 0,
  ADD COLUMN realized_profit numeric NOT NULL DEFAULT 0,
  ADD COLUMN total_recorded_fees numeric NOT NULL DEFAULT 0,
  ADD COLUMN last_event_at timestamptz NOT NULL DEFAULT now(),
  ADD CONSTRAINT market_inventory_trades_stage_check CHECK (
    stage IN (
      'paper_active',
      'paper_closed',
      'bought',
      'awaiting_transfer',
      'received',
      'listed_for_sale',
      'awaiting_payment',
      'ready_to_close',
      'partially_closed',
      'closed',
      'cancelled'
    )
  );

UPDATE public.market_inventory_trades
SET
  remaining_amount = CASE WHEN status = 'closed' THEN 0 ELSE amount END,
  closed_amount = CASE WHEN status = 'closed' THEN amount ELSE 0 END,
  realized_profit = COALESCE(actual_profit, 0),
  total_recorded_fees = COALESCE(final_fees, estimated_fees, 0),
  stage = CASE
    WHEN status = 'closed' THEN 'closed'
    WHEN status = 'cancelled' THEN 'cancelled'
    ELSE 'bought'
  END
WHERE remaining_amount IS NULL;

ALTER TABLE public.market_inventory_trades
  ALTER COLUMN remaining_amount SET NOT NULL;

CREATE TABLE public.market_inventory_trade_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trade_id uuid NOT NULL REFERENCES public.market_inventory_trades(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  from_stage text,
  to_stage text,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.market_inventory_trade_events TO authenticated;
GRANT ALL ON public.market_inventory_trade_events TO service_role;
ALTER TABLE public.market_inventory_trade_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own trade events" ON public.market_inventory_trade_events
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_trade_events_trade_created ON public.market_inventory_trade_events(trade_id, created_at DESC);
CREATE INDEX idx_trade_events_user_created ON public.market_inventory_trade_events(user_id, created_at DESC);

CREATE TABLE public.market_inventory_trade_fees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trade_id uuid NOT NULL REFERENCES public.market_inventory_trades(id) ON DELETE CASCADE,
  fee_type text NOT NULL DEFAULT 'other',
  amount numeric NOT NULL CHECK (amount >= 0),
  currency text NOT NULL DEFAULT 'NGN',
  note text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.market_inventory_trade_fees TO authenticated;
GRANT ALL ON public.market_inventory_trade_fees TO service_role;
ALTER TABLE public.market_inventory_trade_fees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own trade fees" ON public.market_inventory_trade_fees
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_trade_fees_trade_created ON public.market_inventory_trade_fees(trade_id, created_at DESC);

CREATE TABLE public.market_inventory_capital_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  trade_id uuid REFERENCES public.market_inventory_trades(id) ON DELETE SET NULL,
  trade_type public.market_inventory_trade_type NOT NULL,
  entry_type public.market_inventory_ledger_entry_type NOT NULL,
  amount numeric NOT NULL,
  currency text NOT NULL DEFAULT 'NGN',
  description text NOT NULL,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.market_inventory_capital_ledger TO authenticated;
GRANT ALL ON public.market_inventory_capital_ledger TO service_role;
ALTER TABLE public.market_inventory_capital_ledger ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own capital ledger" ON public.market_inventory_capital_ledger
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_capital_ledger_user_created ON public.market_inventory_capital_ledger(user_id, created_at DESC);
CREATE INDEX idx_capital_ledger_trade ON public.market_inventory_capital_ledger(trade_id);

INSERT INTO public.market_inventory_trade_events (
  user_id,
  trade_id,
  event_type,
  to_stage,
  metadata,
  created_at
)
SELECT
  user_id,
  id,
  'legacy_trade_imported',
  stage,
  jsonb_build_object('status', status, 'trade_type', trade_type),
  created_at
FROM public.market_inventory_trades;

INSERT INTO public.market_inventory_capital_ledger (
  user_id,
  trade_id,
  trade_type,
  entry_type,
  amount,
  currency,
  description,
  metadata,
  created_at
)
SELECT
  user_id,
  id,
  trade_type,
  'manual_capital_committed',
  amount * buy_price,
  currency,
  'Backfilled capital committed for existing manual trade',
  jsonb_build_object('amount', amount, 'buy_price', buy_price),
  buy_time
FROM public.market_inventory_trades
WHERE trade_type = 'manual';

INSERT INTO public.market_inventory_capital_ledger (
  user_id,
  trade_id,
  trade_type,
  entry_type,
  amount,
  currency,
  description,
  metadata,
  created_at
)
SELECT
  user_id,
  id,
  trade_type,
  'manual_realized_profit',
  COALESCE(actual_profit, realized_profit, 0),
  currency,
  'Backfilled realized profit for existing closed manual trade',
  jsonb_build_object('source', 'legacy_actual_profit'),
  COALESCE(sell_time, updated_at)
FROM public.market_inventory_trades
WHERE trade_type = 'manual'
  AND status = 'closed'
  AND COALESCE(actual_profit, realized_profit, 0) <> 0;

INSERT INTO public.market_inventory_capital_ledger (
  user_id,
  trade_id,
  trade_type,
  entry_type,
  amount,
  currency,
  description,
  metadata,
  created_at
)
SELECT
  user_id,
  id,
  trade_type,
  'fee_recorded',
  -ABS(COALESCE(final_fees, estimated_fees, 0)),
  currency,
  'Backfilled recorded fee for existing trade',
  jsonb_build_object('source', 'legacy_fee_columns'),
  COALESCE(sell_time, updated_at)
FROM public.market_inventory_trades
WHERE COALESCE(final_fees, estimated_fees, 0) > 0;
-- Sync runs tracking
CREATE TYPE public.sync_status AS ENUM ('running', 'completed', 'failed');

CREATE TABLE public.market_inventory_sync_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id uuid REFERENCES public.market_inventory_exchange_accounts(id) ON DELETE SET NULL,
  exchange text NOT NULL,
  status public.sync_status NOT NULL DEFAULT 'running',
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  records_imported integer DEFAULT 0,
  records_failed integer DEFAULT 0,
  error_message text,
  metadata jsonb
);
GRANT SELECT, INSERT, UPDATE ON public.market_inventory_sync_runs TO authenticated;
GRANT ALL ON public.market_inventory_sync_runs TO service_role;
ALTER TABLE public.market_inventory_sync_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own sync runs" ON public.market_inventory_sync_runs FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Exchange transactions (imported from connected exchanges)
CREATE TABLE public.market_inventory_exchange_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id uuid REFERENCES public.market_inventory_exchange_accounts(id) ON DELETE SET NULL,
  external_tx_id text NOT NULL,
  asset text NOT NULL,
  amount numeric NOT NULL,
  type text NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'transfer', 'trade', 'trade_settlement', 'balance_snapshot', 'order_opened', 'order_filled', 'p2p_fiat_event')),
  side text,
  status text NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  tx_time timestamptz NOT NULL,
  fee numeric DEFAULT 0,
  fee_asset text,
  from_address text,
  to_address text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.market_inventory_exchange_transactions TO authenticated;
GRANT ALL ON public.market_inventory_exchange_transactions TO service_role;
ALTER TABLE public.market_inventory_exchange_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own transactions" ON public.market_inventory_exchange_transactions FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_exchange_tx_user_time ON public.market_inventory_exchange_transactions(user_id, tx_time DESC);
CREATE INDEX idx_exchange_tx_external_id ON public.market_inventory_exchange_transactions(external_tx_id);

-- Transaction matches (suggested trade pairings)
CREATE TABLE public.market_inventory_transaction_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  deposit_tx_id uuid REFERENCES public.market_inventory_exchange_transactions(id) ON DELETE SET NULL,
  withdrawal_tx_id uuid REFERENCES public.market_inventory_exchange_transactions(id) ON DELETE SET NULL,
  trade_id uuid REFERENCES public.market_inventory_trades(id) ON DELETE SET NULL,
  confidence numeric CHECK (confidence >= 0 AND confidence <= 1),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected')),
  created_at timestamptz NOT NULL DEFAULT now(),
  confirmed_at timestamptz,
  UNIQUE(user_id, deposit_tx_id, withdrawal_tx_id)
);
GRANT SELECT, INSERT, UPDATE ON public.market_inventory_transaction_matches TO authenticated;
GRANT ALL ON public.market_inventory_transaction_matches TO service_role;
ALTER TABLE public.market_inventory_transaction_matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own matches" ON public.market_inventory_transaction_matches FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Inferences (Event Detection Engine)
CREATE TABLE public.market_inventory_inferences (
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
CREATE POLICY "own inferences" ON public.market_inventory_inferences FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_inferences_updated BEFORE UPDATE ON public.market_inventory_inferences FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
-- First-party identity and revocable sessions. Supabase remains data storage only.
CREATE TABLE public.app_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  display_name text,
  password_hash text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','disabled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT app_users_email_normalized CHECK (email = lower(trim(email))),
  CONSTRAINT app_users_email_unique UNIQUE (email)
);

INSERT INTO public.app_users (id, email, display_name, created_at)
SELECT u.id, lower(u.email), COALESCE(u.raw_user_meta_data->>'display_name', u.email), u.created_at
FROM auth.users u WHERE u.email IS NOT NULL
ON CONFLICT (id) DO NOTHING;

CREATE TABLE public.auth_identities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.app_users(id) ON DELETE CASCADE,
  provider text NOT NULL CHECK (provider IN ('password','google')),
  provider_subject text NOT NULL,
  provider_email text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(provider, provider_subject),
  UNIQUE(provider, user_id)
);

INSERT INTO public.auth_identities (user_id, provider, provider_subject, provider_email, metadata)
SELECT i.user_id, 'google', i.identity_data->>'sub', lower(i.identity_data->>'email'), i.identity_data
FROM auth.identities i
WHERE i.provider = 'google' AND i.identity_data->>'sub' IS NOT NULL
ON CONFLICT DO NOTHING;

CREATE TABLE public.auth_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.app_users(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  last_activity_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX auth_sessions_active_token_idx ON public.auth_sessions(token_hash) WHERE revoked_at IS NULL;
CREATE INDEX auth_sessions_user_idx ON public.auth_sessions(user_id);

CREATE TABLE public.password_reset_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.app_users(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  consumed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Repoint every direct auth.users foreign key without changing user UUIDs.
DO $$
DECLARE item record;
BEGIN
  FOR item IN
    SELECT n.nspname schema_name, c.relname table_name, con.conname constraint_name,
           a.attname column_name
    FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    JOIN pg_class ref ON ref.oid = con.confrelid
    JOIN pg_namespace refn ON refn.oid = ref.relnamespace
    JOIN unnest(con.conkey) WITH ORDINALITY cols(attnum, ord) ON true
    JOIN pg_attribute a ON a.attrelid = c.oid AND a.attnum = cols.attnum
    WHERE con.contype = 'f' AND refn.nspname = 'auth' AND ref.relname = 'users' AND n.nspname = 'public'
  LOOP
    EXECUTE format('ALTER TABLE %I.%I DROP CONSTRAINT %I', item.schema_name, item.table_name, item.constraint_name);
    EXECUTE format('ALTER TABLE %I.%I ADD CONSTRAINT %I FOREIGN KEY (%I) REFERENCES public.app_users(id) ON DELETE CASCADE',
      item.schema_name, item.table_name, item.constraint_name, item.column_name);
  END LOOP;
END $$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auth_identities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auth_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.app_users, public.auth_identities, public.auth_sessions, public.password_reset_tokens TO service_role;
REVOKE ALL ON public.app_users, public.auth_identities, public.auth_sessions, public.password_reset_tokens FROM anon, authenticated;
-- Shared market memory and user-owned KI operator state.
CREATE TABLE public.market_intelligence_ads (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  exchange text NOT NULL,
  asset text NOT NULL DEFAULT 'USDT',
  fiat text NOT NULL,
  side text NOT NULL CHECK (side IN ('buy','sell')),
  external_ad_id text NOT NULL,
  price numeric NOT NULL CHECK (price > 0),
  available_asset numeric,
  min_fiat numeric,
  max_fiat numeric,
  payment_methods text[] NOT NULL DEFAULT '{}',
  merchant_name text,
  merchant_verified boolean,
  completion_rate numeric,
  completed_orders integer,
  response_latency_ms integer,
  schema_version text NOT NULL,
  observed_at timestamptz NOT NULL,
  raw_fingerprint text NOT NULL,
  UNIQUE(exchange, fiat, side, external_ad_id, observed_at)
);
CREATE INDEX market_ads_lookup_idx ON public.market_intelligence_ads(fiat, exchange, side, observed_at DESC);

CREATE TABLE public.market_intelligence_candles (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  exchange text NOT NULL,
  asset text NOT NULL DEFAULT 'USDT',
  fiat text NOT NULL,
  side text NOT NULL CHECK (side IN ('buy','sell')),
  interval_seconds integer NOT NULL,
  bucket_at timestamptz NOT NULL,
  open numeric NOT NULL, high numeric NOT NULL, low numeric NOT NULL, close numeric NOT NULL,
  executable_price numeric NOT NULL,
  depth_asset numeric NOT NULL DEFAULT 0,
  merchant_count integer NOT NULL DEFAULT 0,
  volatility numeric NOT NULL DEFAULT 0,
  UNIQUE(exchange, asset, fiat, side, interval_seconds, bucket_at)
);
CREATE INDEX market_candles_lookup_idx ON public.market_intelligence_candles(fiat, exchange, side, interval_seconds, bucket_at DESC);

CREATE TABLE public.market_intelligence_feed_health (
  exchange text NOT NULL,
  fiat text NOT NULL,
  status text NOT NULL CHECK (status IN ('healthy','degraded','stale','blocked','unsupported')),
  schema_version text,
  consecutive_failures integer NOT NULL DEFAULT 0,
  last_success_at timestamptz,
  last_failure_at timestamptz,
  next_attempt_at timestamptz,
  latency_ms integer,
  error_message text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY(exchange, fiat)
);

ALTER TABLE public.market_inventory_trades
  ADD COLUMN IF NOT EXISTS source_exchange text,
  ADD COLUMN IF NOT EXISTS destination_exchange text,
  ADD COLUMN IF NOT EXISTS payment_method text,
  ADD COLUMN IF NOT EXISTS total_fiat_spent numeric,
  ADD COLUMN IF NOT EXISTS entry_fees numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS transfer_network text,
  ADD COLUMN IF NOT EXISTS transfer_fee_asset numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS intended_horizon_hours integer NOT NULL DEFAULT 24,
  ADD COLUMN IF NOT EXISTS available_amount numeric;

CREATE TABLE public.ki_strategy_settings (
  user_id uuid PRIMARY KEY REFERENCES public.app_users(id) ON DELETE CASCADE,
  posture text NOT NULL DEFAULT 'capital_protection' CHECK (posture IN ('capital_protection','balanced','aggressive')),
  break_even_first boolean NOT NULL DEFAULT true,
  normal_horizon_hours integer NOT NULL DEFAULT 24 CHECK (normal_horizon_hours BETWEEN 1 AND 168),
  enabled_fiats text[] NOT NULL DEFAULT ARRAY['NGN','GHS','KES','ZAR','USD','EUR','GBP','AED'],
  evaluation_amounts numeric[] NOT NULL DEFAULT ARRAY[100,500,1000],
  shadow_mode boolean NOT NULL DEFAULT true,
  shadow_started_at timestamptz NOT NULL DEFAULT now(),
  live_alerts_enabled boolean NOT NULL DEFAULT false,
  alert_cooldown_minutes integer NOT NULL DEFAULT 30,
  muted_until timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.ki_position_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.app_users(id) ON DELETE CASCADE,
  trade_id uuid NOT NULL REFERENCES public.market_inventory_trades(id) ON DELETE CASCADE,
  action text NOT NULL CHECK (action IN ('sell_now','wait','transfer','avoid','insufficient_data')),
  venue text,
  executable_price numeric,
  executable_amount numeric,
  break_even_price numeric NOT NULL,
  target_price numeric NOT NULL,
  expected_net numeric,
  downside numeric,
  target_window_hours integer,
  confidence numeric,
  confidence_eligible boolean NOT NULL DEFAULT false,
  regime text NOT NULL,
  evidence jsonb NOT NULL DEFAULT '[]',
  missing_data text[] NOT NULL DEFAULT '{}',
  invalidation_condition text NOT NULL,
  next_evaluation_at timestamptz NOT NULL,
  model_version text NOT NULL,
  computed_at timestamptz NOT NULL DEFAULT now(),
  active boolean NOT NULL DEFAULT true
);
CREATE UNIQUE INDEX ki_active_plan_trade_idx ON public.ki_position_plans(trade_id) WHERE active;
CREATE INDEX ki_plans_user_idx ON public.ki_position_plans(user_id, computed_at DESC);

CREATE TABLE public.ki_recommendation_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.app_users(id) ON DELETE CASCADE,
  trade_id uuid REFERENCES public.market_inventory_trades(id) ON DELETE CASCADE,
  plan_id uuid REFERENCES public.ki_position_plans(id) ON DELETE SET NULL,
  action text NOT NULL,
  evidence jsonb NOT NULL,
  market_snapshot jsonb NOT NULL,
  predicted_windows jsonb NOT NULL DEFAULT '{}',
  model_version text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  outcome jsonb,
  evaluated_at timestamptz
);
CREATE TABLE public.ki_recommendation_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.app_users(id) ON DELETE CASCADE,
  recommendation_id uuid NOT NULL REFERENCES public.ki_recommendation_snapshots(id) ON DELETE CASCADE,
  rating text NOT NULL CHECK (rating IN ('helpful','not_helpful','followed','ignored')),
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, recommendation_id)
);

CREATE TABLE public.ki_operator_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.app_users(id) ON DELETE CASCADE,
  trade_id uuid REFERENCES public.market_inventory_trades(id) ON DELETE CASCADE,
  alert_type text NOT NULL,
  severity text NOT NULL CHECK (severity IN ('info','warning','critical')),
  dedupe_key text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  evidence jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  acknowledged_at timestamptz,
  UNIQUE(user_id, dedupe_key)
);

CREATE TABLE public.ki_alert_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id uuid NOT NULL REFERENCES public.ki_operator_alerts(id) ON DELETE CASCADE,
  channel text NOT NULL CHECK (channel IN ('in_app','telegram')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','sent','failed','suppressed')),
  attempts integer NOT NULL DEFAULT 0,
  next_attempt_at timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz,
  error_message text,
  UNIQUE(alert_id, channel)
);

CREATE TABLE public.telegram_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES public.app_users(id) ON DELETE CASCADE,
  telegram_user_id bigint UNIQUE,
  chat_id bigint UNIQUE,
  link_code_hash text,
  link_code_expires_at timestamptz,
  linked_at timestamptz,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.ki_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.app_users(id) ON DELETE CASCADE,
  channel text NOT NULL CHECK (channel IN ('web','telegram')),
  external_thread_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX ki_conversation_channel_thread_idx ON public.ki_conversations(user_id, channel, external_thread_id);
CREATE TABLE public.ki_conversation_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.ki_conversations(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user','assistant','system')),
  content text NOT NULL,
  external_message_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(conversation_id, external_message_id)
);

CREATE TABLE public.ki_telegram_updates (
  update_id bigint PRIMARY KEY,
  received_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz,
  error_message text
);

CREATE TABLE public.ki_worker_leases (
  lease_key text PRIMARY KEY,
  owner_id text NOT NULL,
  lease_until timestamptz NOT NULL,
  checkpoint jsonb NOT NULL DEFAULT '{}',
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.ki_model_metrics (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  model_version text NOT NULL,
  fiat text NOT NULL,
  metric_date date NOT NULL,
  sample_count integer NOT NULL,
  direction_accuracy numeric,
  target_hit_rate numeric,
  calibration_error numeric,
  feed_uptime numeric,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(model_version, fiat, metric_date)
);

ALTER TABLE public.ki_strategy_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ki_position_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ki_recommendation_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ki_recommendation_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ki_operator_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ki_alert_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telegram_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ki_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ki_conversation_messages ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.market_intelligence_ads, public.market_intelligence_candles, public.market_intelligence_feed_health,
  public.ki_strategy_settings, public.ki_position_plans, public.ki_recommendation_snapshots, public.ki_recommendation_feedback, public.ki_operator_alerts,
  public.ki_alert_deliveries, public.telegram_connections, public.ki_conversations, public.ki_conversation_messages,
  public.ki_telegram_updates, public.ki_worker_leases, public.ki_model_metrics FROM anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;


CREATE TABLE public.market_inventory_exchange_balances (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    account_id uuid NOT NULL REFERENCES public.market_inventory_exchange_accounts(id) ON DELETE CASCADE,
    exchange text NOT NULL,
    asset text NOT NULL,
    free_balance numeric NOT NULL DEFAULT 0,
    locked_balance numeric NOT NULL DEFAULT 0,
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(account_id, asset)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.market_inventory_exchange_balances TO authenticated;
GRANT ALL ON public.market_inventory_exchange_balances TO service_role;
ALTER TABLE public.market_inventory_exchange_balances ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own balances" ON public.market_inventory_exchange_balances FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);



CREATE TABLE public.market_inventory_user_settings (
    user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    telegram_chat_id text,
    updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.market_inventory_user_settings TO authenticated;
GRANT ALL ON public.market_inventory_user_settings TO service_role;
ALTER TABLE public.market_inventory_user_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own settings" ON public.market_inventory_user_settings FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);



CREATE TABLE public.market_inventory_trade_journals (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    trade_id uuid NOT NULL REFERENCES public.market_inventory_trades(id) ON DELETE CASCADE,
    emotional_state text NOT NULL CHECK (emotional_state IN ('fomo', 'anxious', 'confident', 'neutral', 'tilted')),
    lessons_learned text NOT NULL,
    ai_risk_score numeric,
    created_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(trade_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.market_inventory_trade_journals TO authenticated;
GRANT ALL ON public.market_inventory_trade_journals TO service_role;
ALTER TABLE public.market_inventory_trade_journals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own journals" ON public.market_inventory_trade_journals FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

