-- Daily Analytics Rollup Table
CREATE TABLE public.daily_analytics_rollup (
    user_id UUID NOT NULL,
    date DATE NOT NULL,
    total_trades INT DEFAULT 0,
    total_profit NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, date)
);

-- Trigger function to update the rollup table on trade changes
CREATE OR REPLACE FUNCTION public.update_daily_analytics_rollup()
RETURNS TRIGGER AS $$
DECLARE
    trade_date DATE;
    profit_diff NUMERIC := 0;
    count_diff INT := 0;
BEGIN
    -- Handle INSERT
    IF (TG_OP = 'INSERT') THEN
        IF NEW.status = 'closed' AND NEW.sell_time IS NOT NULL THEN
            trade_date := NEW.sell_time::DATE;
            profit_diff := COALESCE(NEW.actual_profit, 0);
            count_diff := 1;
        END IF;
    -- Handle UPDATE
    ELSIF (TG_OP = 'UPDATE') THEN
        -- If trade was closed just now
        IF NEW.status = 'closed' AND OLD.status != 'closed' AND NEW.sell_time IS NOT NULL THEN
            trade_date := NEW.sell_time::DATE;
            profit_diff := COALESCE(NEW.actual_profit, 0);
            count_diff := 1;
        -- If profit changed on an already closed trade
        ELSIF NEW.status = 'closed' AND OLD.status = 'closed' AND NEW.sell_time IS NOT NULL THEN
            trade_date := NEW.sell_time::DATE;
            profit_diff := COALESCE(NEW.actual_profit, 0) - COALESCE(OLD.actual_profit, 0);
        -- If trade was un-closed (e.g. cancelled)
        ELSIF OLD.status = 'closed' AND NEW.status != 'closed' AND OLD.sell_time IS NOT NULL THEN
            trade_date := OLD.sell_time::DATE;
            profit_diff := -COALESCE(OLD.actual_profit, 0);
            count_diff := -1;
        END IF;
    -- Handle DELETE
    ELSIF (TG_OP = 'DELETE') THEN
        IF OLD.status = 'closed' AND OLD.sell_time IS NOT NULL THEN
            trade_date := OLD.sell_time::DATE;
            profit_diff := -COALESCE(OLD.actual_profit, 0);
            count_diff := -1;
        END IF;
    END IF;

    -- Apply the differences if applicable
    IF trade_date IS NOT NULL AND (profit_diff != 0 OR count_diff != 0) THEN
        INSERT INTO public.daily_analytics_rollup (user_id, date, total_trades, total_profit)
        VALUES (
            COALESCE(NEW.user_id, OLD.user_id), 
            trade_date, 
            GREATEST(count_diff, 0), 
            profit_diff
        )
        ON CONFLICT (user_id, date)
        DO UPDATE SET 
            total_trades = public.daily_analytics_rollup.total_trades + count_diff,
            total_profit = public.daily_analytics_rollup.total_profit + profit_diff,
            updated_at = NOW();
    END IF;

    IF (TG_OP = 'DELETE') THEN
        RETURN OLD;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger on market_inventory_trades
CREATE TRIGGER trg_market_inventory_trades_analytics
AFTER INSERT OR UPDATE OR DELETE ON public.market_inventory_trades
FOR EACH ROW
EXECUTE FUNCTION public.update_daily_analytics_rollup();
