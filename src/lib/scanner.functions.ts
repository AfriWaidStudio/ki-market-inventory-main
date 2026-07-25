import { createServerFn } from "@tanstack/react-start";
import { requireAuth } from "@/lib/auth/middleware";
import { z } from "zod";
import { scoreOpportunity } from "./ki-logic";

const SnapshotInput = z.object({
  exchange: z.string().min(1),
  asset: z.string().default("USDT"),
  side: z.enum(["buy", "sell"]),
  price: z.number().positive(),
  currency: z.string().default("NGN"),
  liquidity_score: z.number().min(0).max(100).nullable().optional(),
  merchant_count: z.number().int().min(0).nullable().optional(),
  merchant_rating: z.number().min(0).max(5).nullable().optional(),
});

export const submitPriceSnapshot = createServerFn({ method: "POST" })
  .middleware([requireAuth])
  .inputValidator((d: unknown) => SnapshotInput.parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("market_inventory_price_snapshots").insert({
      user_id: context.userId,
      exchange: data.exchange,
      asset: data.asset,
      side: data.side,
      price: data.price,
      currency: data.currency,
      liquidity_score: data.liquidity_score ?? null,
      merchant_count: data.merchant_count ?? null,
      merchant_rating: data.merchant_rating ?? null,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listRecentSnapshots = createServerFn({ method: "POST" })
  .middleware([requireAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("market_inventory_price_snapshots")
      .select("*")
      .eq("user_id", context.userId)
      .order("captured_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

const AmountInput = z.object({ amount: z.number().positive().default(100) });
export const listOpportunities = createServerFn({ method: "POST" })
  .middleware([requireAuth])
  .inputValidator((d: unknown) => AmountInput.parse(d ?? { amount: 100 }))
  .handler(async ({ data, context }) => {
    const { data: snaps, error } = await context.supabase
      .from("market_inventory_price_snapshots")
      .select("*")
      .eq("user_id", context.userId)
      .order("captured_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);

    // Keep latest per (exchange, side)
    const latest = new Map<string, (typeof snaps)[number]>();
    for (const s of snaps ?? []) {
      const key = `${s.exchange}::${s.side}`;
      if (!latest.has(key)) latest.set(key, s);
    }
    const buys = Array.from(latest.values()).filter((s) => s.side === "buy");
    const sells = Array.from(latest.values()).filter((s) => s.side === "sell");

    const opps: Array<{
      buy_exchange: string;
      sell_exchange: string;
      buy_price: number;
      sell_price: number;
      currency: string;
      buy_captured_at: string;
      sell_captured_at: string;
      liquidity_score: number | null;
      merchant_count: number | null;
      merchant_rating: number | null;
      spread: number;
      spreadPct: number;
      netProfit: number;
      confidence: number;
      risk: number;
      recommendation: string;
      reasoning: string;
    }> = [];

    for (const b of buys) {
      for (const s of sells) {
        if (b.exchange === s.exchange) continue;

        const buyPrice = Number(b.price);
        const sellPrice = Number(s.price);
        const amount = data.amount;

        // Fee calculation logic
        // Buy fee: 0.1% taker/maker fee
        const buyFeeFiat = amount * 0.001 * buyPrice;
        // Network transfer fee: approx 1 USDT transferred across TRC20/BEP20
        const networkFeeFiat = 1 * sellPrice;
        // Sell fee: 0.1% taker/maker fee on the remaining balance
        const sellFeeFiat = Math.max(0, amount - 1) * 0.001 * sellPrice;

        const totalEstFees = buyFeeFiat + networkFeeFiat + sellFeeFiat;

        const score = scoreOpportunity({
          buyPrice,
          sellPrice,
          amount,
          estimatedFees: totalEstFees,
          liquidityScore: (b.liquidity_score as number) ?? (s.liquidity_score as number) ?? null,
        });

        // Filter out opportunities that are unprofitable after fees
        if (score.netProfit <= 0) continue;

        opps.push({
          buy_exchange: b.exchange,
          sell_exchange: s.exchange,
          buy_price: buyPrice,
          sell_price: sellPrice,
          currency: b.currency,
          buy_captured_at: b.captured_at as string,
          sell_captured_at: s.captured_at as string,
          liquidity_score: (b.liquidity_score as number) ?? (s.liquidity_score as number) ?? null,
          merchant_count: (b.merchant_count as number) ?? (s.merchant_count as number) ?? null,
          merchant_rating: (b.merchant_rating as number) ?? (s.merchant_rating as number) ?? null,
          spread: score.spread,
          spreadPct: score.spreadPct,
          netProfit: score.netProfit,
          confidence: score.confidence,
          risk: score.risk,
          recommendation: score.recommendation,
          reasoning: score.reasoning,
        });
      }
    }
    opps.sort((a, b) => b.netProfit - a.netProfit);
    return opps;
  });
