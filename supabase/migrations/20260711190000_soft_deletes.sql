-- Soft Deletes for Trades and Journals
ALTER TABLE public.market_inventory_trades
ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL;

ALTER TABLE public.market_inventory_trade_journals
ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL;

-- Create an index to quickly filter out deleted items
CREATE INDEX IF NOT EXISTS idx_market_inventory_trades_deleted_at ON public.market_inventory_trades (deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_market_inventory_trade_journals_deleted_at ON public.market_inventory_trade_journals (deleted_at) WHERE deleted_at IS NULL;
