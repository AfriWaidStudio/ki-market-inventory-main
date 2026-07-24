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
