-- Add max_exchange_exposure_pct to market_inventory_user_settings
ALTER TABLE public.market_inventory_user_settings
ADD COLUMN max_exchange_exposure_pct NUMERIC NOT NULL DEFAULT 40;
