import { createClient } from "@supabase/supabase-js";
import { fetchExchangeTransactions, fetchExchangeBalances } from "../src/lib/apiKeys.functions";
import { analyzeNewEvents } from "../src/server/detectionEngine";
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runCronWorker() {
  console.log(`[Cron] Starting background sync worker at ${new Date().toISOString()}`);

  const { data: accounts, error: accErr } = await supabase
    .from("market_inventory_exchange_accounts")
    .select("*")
    .eq("is_active", true);

  if (accErr || !accounts) {
    console.error("[Cron] Failed to fetch active exchange accounts:", accErr);
    return;
  }

  for (const account of accounts) {
    try {
      console.log(`[Cron] Syncing account ${account.id} (${account.exchange}) for user ${account.user_id}`);
      
      const { data: apiKey } = await supabase
        .from("market_inventory_api_keys")
        .select("encrypted_key, encrypted_secret, encrypted_passphrase")
        .eq("user_id", account.user_id)
        .eq("exchange", account.exchange)
        .single();

      if (!apiKey) continue;

      // In a real environment, we'd decrypt here using the server crypto secret.
      // For this script, we'll mock the decryption assuming the encrypted string contains the raw text for sandbox purposes,
      // OR we would need access to the same `crypto.server` methods.
      // Since this is a server-side standalone script, we will import it:
      const { decryptString } = await import("../src/lib/crypto.server");
      
      const decKey = decryptString(Buffer.from(apiKey.encrypted_key.slice(2), "hex"));
      const decSecret = decryptString(Buffer.from(apiKey.encrypted_secret.slice(2), "hex"));
      // const decPassphrase = apiKey.encrypted_passphrase ? decryptString(Buffer.from(apiKey.encrypted_passphrase.slice(2), "hex")) : undefined;

      const [transactions, balances] = await Promise.all([
        fetchExchangeTransactions(decKey as string, decSecret as string, account.exchange),
        fetchExchangeBalances(decKey as string, decSecret as string, account.exchange)
      ]);

      // Upsert balances
      for (const bal of balances) {
        await supabase.from("market_inventory_exchange_balances").upsert({
          user_id: account.user_id,
          account_id: account.id,
          exchange: account.exchange,
          asset: bal.asset,
          free_balance: bal.free,
          locked_balance: bal.locked,
          updated_at: new Date().toISOString()
        }, { onConflict: 'account_id,asset' });
      }

      // Insert transactions
      let newTxs = [];
      for (const tx of transactions) {
        const { data, error } = await supabase.from("market_inventory_exchange_transactions").insert({
          user_id: account.user_id,
          account_id: account.id,
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
        }).select().single();
        
        if (!error && data) newTxs.push(data);
      }

      if (newTxs.length > 0) {
        await analyzeNewEvents(account.user_id, newTxs);
      }

    } catch (e) {
      console.error(`[Cron] Error syncing account ${account.id}:`, e);
    }
  }

  console.log(`[Cron] Finished background sync run.`);
}

// Run every 2 minutes
setInterval(runCronWorker, 120000);
runCronWorker(); // Run once immediately
