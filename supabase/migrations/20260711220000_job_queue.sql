-- Create the job queue table
CREATE TABLE IF NOT EXISTS market_inventory_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
    queue_name TEXT NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}',
    attempts INT NOT NULL DEFAULT 0,
    max_attempts INT NOT NULL DEFAULT 3,
    last_error TEXT,
    run_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes for fast querying of pending jobs
CREATE INDEX IF NOT EXISTS idx_market_inventory_jobs_status_run_at ON market_inventory_jobs(status, run_at) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_market_inventory_jobs_queue_name ON market_inventory_jobs(queue_name);

-- Trigger to update `updated_at`
CREATE OR REPLACE FUNCTION update_market_inventory_jobs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_market_inventory_jobs_updated_at ON market_inventory_jobs;
CREATE TRIGGER trigger_market_inventory_jobs_updated_at
BEFORE UPDATE ON market_inventory_jobs
FOR EACH ROW
EXECUTE FUNCTION update_market_inventory_jobs_updated_at();

-- Add RLS policies (only service role should interact with this, or admins)
ALTER TABLE market_inventory_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can do everything on jobs" 
ON market_inventory_jobs 
FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);
