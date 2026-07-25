import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function sendTelegramAlert(userId: string, message: string) {
  try {
    const { data } = await supabase
      .from("market_inventory_user_settings")
      .select("telegram_chat_id")
      .eq("user_id", userId)
      .single();
    if (!data?.telegram_chat_id) return;

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      console.log(`[MOCK TELEGRAM] To ${data.telegram_chat_id}: ${message}`);
      return;
    }

    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: data.telegram_chat_id, text: message, parse_mode: "HTML" }),
    });
  } catch (e) {
    console.error("Failed to send Telegram alert", e);
  }
}

/**
 * Detection Engine
 * Analyzes new exchange events to draw inferences (P2P sells, arbitrage routes).
 */

function calculateConfidence(durationMs: number, idealMs: number): number {
  // Simple exponential decay based on how much longer it took vs ideal time
  if (durationMs <= idealMs) return 0.99;
  const ratio = durationMs / idealMs;
  // If it took 2x the ideal time, confidence drops
  const confidence = 0.99 * Math.pow(0.8, ratio - 1);
  return Math.max(0.1, Number(confidence.toFixed(2)));
}
export async function analyzeNewEvents(userId: string, newEvents: any[]) {
  if (!newEvents.length) return;

  // Find fiat deposits or withdrawals (indicative of P2P activity)
  const fiatEvents = newEvents.filter((e) => e.type === "deposit" || e.type === "withdrawal");
  const cryptoEvents = newEvents.filter(
    (e) => e.type === "transfer" || e.type === "trade_settlement",
  );

  // Mock pattern: If there's a fiat deposit and a crypto withdrawal around the same time,
  // it might be a P2P Sell.
  const fiatDeposits = fiatEvents.filter(
    (e) => e.type === "deposit" && !["USDT", "BTC", "ETH"].includes(e.asset),
  );
  const cryptoWithdrawals = fiatEvents.filter(
    (e) => e.type === "withdrawal" && ["USDT", "BTC", "ETH"].includes(e.asset),
  );

  for (const fDeposit of fiatDeposits) {
    // Find a corresponding crypto withdrawal within a 1-hour window
    const dTime = new Date(fDeposit.tx_time).getTime();
    const match = cryptoWithdrawals.find((c) => {
      const cTime = new Date(c.tx_time).getTime();
      return Math.abs(dTime - cTime) < 1000 * 60 * 60; // 1 hour
    });

    if (match) {
      const durationMs = Math.abs(
        new Date(fDeposit.tx_time).getTime() - new Date(match.tx_time).getTime(),
      );
      const confidence = calculateConfidence(durationMs, 1000 * 60 * 15); // Ideal P2P conversion is < 15 mins

      // P2P Sell Detected
      await supabase.from("market_inventory_inferences").insert({
        user_id: userId,
        inference_type: "p2p_sell_detected",
        confidence: confidence,
        context_data: {
          crypto_asset: match.asset,
          crypto_amount: match.amount,
          fiat_asset: fDeposit.asset,
          fiat_amount: fDeposit.amount,
          events: [fDeposit.id, match.id],
        },
      });

      if (confidence >= 0.8) {
        await sendTelegramAlert(
          userId,
          `🚨 <b>P2P Sell Detected</b>\nSold ${match.amount} ${match.asset} for ${fDeposit.amount} ${fDeposit.asset}\nConfidence: ${(confidence * 100).toFixed(0)}%`,
        );
      }
    }
  }

  // Detect Arbitrage Routes
  // Logic: Crypto withdrawn from Exchange A and deposited to Exchange B
  const cryptoDeposits = fiatEvents.filter(
    (e) => e.type === "deposit" && ["USDT", "BTC", "ETH"].includes(e.asset),
  );

  for (const w of cryptoWithdrawals) {
    const wTime = new Date(w.tx_time).getTime();
    const match = cryptoDeposits.find((d) => {
      const dTime = new Date(d.tx_time).getTime();
      return dTime > wTime && dTime - wTime < 1000 * 60 * 60 * 2; // within 2 hours
    });

    if (match) {
      const durationMs = new Date(match.tx_time).getTime() - wTime;
      const confidence = calculateConfidence(durationMs, 1000 * 60 * 5); // Ideal crypto transfer is < 5 mins

      await supabase.from("market_inventory_inferences").insert({
        user_id: userId,
        inference_type: "arbitrage_route_completed",
        confidence: confidence,
        context_data: {
          asset: match.asset,
          amount: match.amount,
          from_account: w.account_id,
          to_account: match.account_id,
          duration_ms: new Date(match.tx_time).getTime() - wTime,
          events: [w.id, match.id],
        },
      });

      if (confidence >= 0.8) {
        await sendTelegramAlert(
          userId,
          `⚡ <b>Arbitrage Route Completed</b>\nTransferred ${match.amount} ${match.asset}\nConfidence: ${(confidence * 100).toFixed(0)}%`,
        );
      }
    }
  }
}
