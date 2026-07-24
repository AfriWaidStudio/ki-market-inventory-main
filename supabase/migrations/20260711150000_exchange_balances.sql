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
