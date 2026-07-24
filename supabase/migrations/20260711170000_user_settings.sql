CREATE TABLE public.market_inventory_user_settings (
    user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    telegram_chat_id text,
    updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.market_inventory_user_settings TO authenticated;
GRANT ALL ON public.market_inventory_user_settings TO service_role;
ALTER TABLE public.market_inventory_user_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own settings" ON public.market_inventory_user_settings FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
