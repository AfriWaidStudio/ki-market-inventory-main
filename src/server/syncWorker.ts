import { createClient } from "@supabase/supabase-js";
import { decryptString } from "@/lib/crypto.server";
import { fetchExchangeTransactions } from "@/lib/apiKeys.functions";

// Using service role for backend operations
const supabaseUrl = process.env.VITE_SUPABASE_URL! || process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Intelligent background worker that adaptively polls exchange accounts
 * based on user activity and polling_frequency_seconds.
 */
export async function runSyncWorker() {
  console.log("[SyncWorker] Starting adaptive sync cycle...");

  try {
    // 1. Fetch all active exchange accounts
    const { data: accounts, error: accErr } = await supabase
      .from("market_inventory_exchange_accounts")
      .select("*, app_users!inner(id, updated_at)")
      .eq("is_active", true);

    if (accErr) throw new Error(accErr.message);

    for (const account of accounts || []) {
      const lastActivity = new Date(account.app_users.updated_at);
      const isUserActive = Date.now() - lastActivity.getTime() < 1000 * 60 * 30; // Active within last 30 mins

      // Adaptive polling frequency: 20s if active, fallback to database setting (or 10m default) if idle
      const pollingFreqMs = isUserActive
        ? 20_000
        : (account.polling_frequency_seconds || 600) * 1000;

      // Determine if it's time to sync
      const { data: lastRun } = await supabase
        .from("market_inventory_sync_runs")
        .select("started_at")
        .eq("account_id", account.id)
        .order("started_at", { ascending: false })
        .limit(1)
        .single();

      if (lastRun) {
        const timeSinceLastRun = Date.now() - new Date(lastRun.started_at).getTime();
        if (timeSinceLastRun < pollingFreqMs) {
          continue; // Skip this account for now
        }
      }

      console.log(`[SyncWorker] Triggering sync for account ${account.id} (${account.exchange})`);

      try {
        // Find API key
        const { data: apiKey } = await supabase
          .from("market_inventory_api_keys")
          .select("encrypted_key, encrypted_secret")
          .eq("user_id", account.user_id)
          .eq("exchange", account.exchange)
          .single();

        if (!apiKey) continue;

        const decKey = decryptString(Buffer.from(apiKey.encrypted_key.slice(2), "hex"));
        const decSecret = decryptString(Buffer.from(apiKey.encrypted_secret.slice(2), "hex"));

        // Trigger the fetch and analysis pipeline (In a real setup, this runs the actual exchange fetchers)
        // Here we simulate the pipeline to respect the new architectural vision
        await performSmartFetch(
          account.user_id,
          account.id,
          account.exchange,
          decKey,
          decSecret,
          account.last_sync_cursor,
        );
      } catch (err) {
        console.error(`[SyncWorker] Failed to sync account ${account.id}:`, err);
      }
    }
  } catch (error) {
    console.error("[SyncWorker] Cycle failed:", error);
  }
}

async function performSmartFetch(
  userId: string,
  accountId: string,
  exchange: string,
  key: string,
  secret: string,
  cursor: string | null,
) {
  // Record run start
  await supabase.from("market_inventory_sync_runs").insert({
    user_id: userId,
    account_id: accountId,
    exchange,
    status: "running",
  });

  try {
    let imported = 0;
    let failed = 0;

    const transactions = await fetchExchangeTransactions(key, secret, exchange);

    for (const tx of transactions) {
      const { error } = await supabase.from("market_inventory_exchange_transactions").insert({
        user_id: userId,
        account_id: accountId,
        external_tx_id: tx.id,
        asset: tx.asset,
        amount: tx.amount,
        type: tx.type,
        side: tx.side,
        status: tx.status,
        tx_time: tx.time,
        fee: tx.fee,
        fee_asset: tx.fee_asset,
        from_address: tx.from_address,
        to_address: tx.to_address,
      });
      if (error) failed++;
      else imported++;
    }

    // Here we would call the Detection Engine:
    // await analyzeNewEvents(userId, newTransactions);

    await supabase
      .from("market_inventory_sync_runs")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
        records_imported: imported,
        records_failed: failed,
      })
      .eq("account_id", accountId)
      .eq("status", "running");
  } catch (err: any) {
    await supabase
      .from("market_inventory_sync_runs")
      .update({
        status: "failed",
        completed_at: new Date().toISOString(),
        error_message: err.message || String(err),
      })
      .eq("account_id", accountId)
      .eq("status", "running");
  }
}
