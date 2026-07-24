import { createServerFn } from "@tanstack/react-start";
import { requireAuth } from "@/lib/auth/middleware";

interface TradeRow {
  amount: number | string;
  buy_price: number | string;
  actual_profit: number | string | null;
  expected_profit: number | string | null;
  final_fees: number | string | null;
  estimated_fees: number | string | null;
  duration_minutes: number | null;
  status: string;
  trade_type: "paper" | "manual";
  stage: string | null;
  remaining_amount: number | string | null;
  realized_profit: number | string | null;
  total_recorded_fees: number | string | null;
  route: string | null;
  buy_time: string;
  sell_time: string | null;
  ki_accuracy_verdict: string | null;
  currency: string;
}

interface LedgerRow {
  amount: number | string;
  entry_type: string;
  trade_type: "paper" | "manual";
  created_at: string;
  currency: string;
  trade_id: string | null;
}

function num(value: unknown): number {
  if (value == null) return 0;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function isRealizedProfit(entry: LedgerRow): boolean {
  return entry.entry_type === "paper_realized_profit" || entry.entry_type === "manual_realized_profit";
}

function isMissingRelation(error: { message?: string; code?: string } | null | undefined): boolean {
  const message = error?.message?.toLowerCase() ?? "";
  return error?.code === "42P01" || message.includes("does not exist") || message.includes("schema cache");
}

function tradeType(trade: Partial<TradeRow>): "paper" | "manual" {
  return trade.trade_type === "paper" ? "paper" : "manual";
}

export const dashboardSummary = createServerFn({ method: "POST" })
  .middleware([requireAuth])
  .handler(async ({ context }) => {
    const [
      { data: tradeRows, error: tradeError },
      { data: ledgerRows, error: ledgerError },
      { data: txRows, error: txError },
      { data: balanceRows, error: balanceError }
    ] = await Promise.all([
      (context.supabase as any).from("market_inventory_trades").select("*").eq("user_id", context.userId),
      (context.supabase as any).from("market_inventory_capital_ledger").select("*").eq("user_id", context.userId),
      (context.supabase as any).from("market_inventory_exchange_transactions").select("*").eq("user_id", context.userId),
      (context.supabase as any).from("market_inventory_exchange_balances").select("*").eq("user_id", context.userId)
    ]);
    if (tradeError) throw new Error(tradeError.message);
    if (ledgerError && !isMissingRelation(ledgerError)) throw new Error(ledgerError.message);

    const trades = (tradeRows ?? []) as unknown as TradeRow[];
    const ledger = ledgerError ? [] : ((ledgerRows ?? []) as unknown as LedgerRow[]);
    const realizedLedger = ledger.filter(isRealizedProfit);

    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - 7);
    const startOfMonth = new Date(now);
    startOfMonth.setDate(now.getDate() - 30);

    const closed = trades.filter((trade) => trade.status === "closed");
    const active = trades.filter((trade) => trade.status === "active");
    const paperClosed = closed.filter((trade) => tradeType(trade) === "paper");
    const manualClosed = closed.filter((trade) => tradeType(trade) === "manual");

    const profitInWindow = (from: Date, tradeType?: "paper" | "manual") =>
      realizedLedger
        .filter(
          (entry) => new Date(entry.created_at) >= from && (!tradeType || entry.trade_type === tradeType),
        )
        .reduce((sum, entry) => sum + num(entry.amount), 0);

    const legacyMode = ledgerError || realizedLedger.length === 0;
    const totalProfit = legacyMode
      ? closed.reduce((sum, trade) => sum + num(trade.actual_profit), 0)
      : realizedLedger.reduce((sum, entry) => sum + num(entry.amount), 0);
    const paperProfit = legacyMode
      ? paperClosed.reduce((sum, trade) => sum + num(trade.actual_profit), 0)
      : realizedLedger
          .filter((entry) => entry.trade_type === "paper")
          .reduce((sum, entry) => sum + num(entry.amount), 0);
    const manualProfit = legacyMode
      ? manualClosed.reduce((sum, trade) => sum + num(trade.actual_profit), 0)
      : realizedLedger
          .filter((entry) => entry.trade_type === "manual")
          .reduce((sum, entry) => sum + num(entry.amount), 0);
    const totalFees = legacyMode
      ? closed.reduce((sum, trade) => sum + num(trade.final_fees ?? trade.estimated_fees), 0)
      : ledger
      .filter((entry) => entry.entry_type === "fee_recorded")
      .reduce((sum, entry) => sum + Math.abs(num(entry.amount)), 0);

    const wins = closed.filter((trade) => num(trade.realized_profit ?? trade.actual_profit) > 0).length;
    const winRate = closed.length ? wins / closed.length : 0;
    const avgProfit = closed.length ? totalProfit / closed.length : 0;
    const avgDurationMinutes = closed.length
      ? closed.reduce((sum, trade) => sum + (trade.duration_minutes ?? 0), 0) / closed.length
      : 0;

    const routeStats = new Map<string, { profit: number; count: number }>();
    for (const trade of closed) {
      const key = trade.route ?? "-";
      const current = routeStats.get(key) ?? { profit: 0, count: 0 };
      current.profit += num(trade.realized_profit ?? trade.actual_profit);
      current.count += 1;
      routeStats.set(key, current);
    }
    const routeArr = Array.from(routeStats.entries()).map(([route, values]) => ({ route, ...values }));
    routeArr.sort((a, b) => b.profit - a.profit);

    const trackedCapital = active
      .filter((trade) => tradeType(trade) === "manual")
      .reduce((sum, trade) => sum + num(trade.remaining_amount ?? trade.amount) * num(trade.buy_price), 0);
    const paperTrackedCapital = active
      .filter((trade) => tradeType(trade) === "paper")
      .reduce((sum, trade) => sum + num(trade.remaining_amount ?? trade.amount) * num(trade.buy_price), 0);

    const currency = trades[0]?.currency ?? ledger[0]?.currency ?? "NGN";

    // Calculate Capital in Transit (Withdrawals in last 60 mins without matching deposits)
    const txs = txRows ?? [];
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    let capitalInTransit = 0;
    const recentWithdrawals = txs.filter((t: any) => t.type === 'withdrawal' && new Date(t.tx_time) >= oneHourAgo);
    const recentDeposits = txs.filter((t: any) => t.type === 'deposit' && new Date(t.tx_time) >= oneHourAgo);

    for (const w of recentWithdrawals) {
      // Basic check: is there a deposit of similar amount (+/- 5%) after this withdrawal?
      const match = recentDeposits.find((d: any) => 
        new Date(d.tx_time) >= new Date(w.tx_time) && 
        d.asset === w.asset &&
        Math.abs(Number(d.amount) - Number(w.amount)) / Number(w.amount) < 0.05
      );
      if (!match) {
        capitalInTransit += Number(w.amount);
      }
    }

    const balances = balanceRows ?? [];
    let exchangeCapital = 0;
    for (const b of balances) {
      if (b.asset === 'USDT' || b.asset === 'USDC') {
        exchangeCapital += Number(b.free_balance) + Number(b.locked_balance);
      }
    }

    // Mock Idle Capital calculation: Live stablecoins that are completely free (not locked in orders)
    let idleCapital = 0;
    for (const b of balances) {
      if (b.asset === 'USDT' || b.asset === 'USDC') {
        idleCapital += Number(b.free_balance);
      }
    }
    if (balances.length === 0) {
      // Fallback to original mock if no balances synced yet
      idleCapital = totalProfit > 0 ? totalProfit * 0.1 : 0;
    }

    return {
      currency,
      trackedCapital,
      paperTrackedCapital,
      exchangeCapital,
      activeCount: active.length,
      manualActiveCount: active.filter((trade) => tradeType(trade) === "manual").length,
      paperActiveCount: active.filter((trade) => tradeType(trade) === "paper").length,
      closedCount: closed.length,
      manualClosedCount: manualClosed.length,
      paperClosedCount: paperClosed.length,
      todayProfit: profitInWindow(startOfDay),
      todayManualProfit: profitInWindow(startOfDay, "manual"),
      todayPaperProfit: profitInWindow(startOfDay, "paper"),
      weekProfit: profitInWindow(startOfWeek),
      monthProfit: profitInWindow(startOfMonth),
      totalProfit,
      manualProfit,
      paperProfit,
      avgProfit,
      avgDurationMinutes,
      bestRoute: routeArr[0]?.route ?? null,
      worstRoute: routeArr[routeArr.length - 1]?.route ?? null,
      winRate,
      totalFees,
      routeStats: routeArr,
      capitalInTransit,
      idleCapital
    };
  });

export const analyticsSeries = createServerFn({ method: "POST" })
  .middleware([requireAuth])
  .handler(async ({ context }) => {
    const [{ data: tradeRows, error: tradeError }, { data: ledgerRows, error: ledgerError }] =
      await Promise.all([
        (context.supabase as any)
          .from("market_inventory_trades")
          .select("*")
          .eq("user_id", context.userId)
          .eq("status", "closed")
          .order("buy_time", { ascending: true }),
        (context.supabase as any)
          .from("market_inventory_capital_ledger")
          .select("*")
          .eq("user_id", context.userId)
          .in("entry_type", ["paper_realized_profit", "manual_realized_profit"])
          .order("created_at", { ascending: true }),
      ]);
    if (tradeError) throw new Error(tradeError.message);
    if (ledgerError && !isMissingRelation(ledgerError)) throw new Error(ledgerError.message);

    const closed = (tradeRows ?? []) as unknown as TradeRow[];
    const ledger = ledgerError ? [] : ((ledgerRows ?? []) as unknown as LedgerRow[]);

    const byDay = new Map<string, number>();
    const byType = new Map<string, { date: string; paper: number; manual: number; total: number }>();
    for (const entry of ledger) {
      const date = entry.created_at.slice(0, 10);
      byDay.set(date, (byDay.get(date) ?? 0) + num(entry.amount));
      const row = byType.get(date) ?? { date, paper: 0, manual: 0, total: 0 };
      row[entry.trade_type] += num(entry.amount);
      row.total += num(entry.amount);
      byType.set(date, row);
    }
    if (ledger.length === 0) {
      for (const trade of closed) {
        if (!trade.sell_time) continue;
        const date = trade.sell_time.slice(0, 10);
        const amount = num(trade.actual_profit);
        byDay.set(date, (byDay.get(date) ?? 0) + amount);
        const row = byType.get(date) ?? { date, paper: 0, manual: 0, total: 0 };
        row[tradeType(trade)] += amount;
        row.total += amount;
        byType.set(date, row);
      }
    }
    const profitByDay = Array.from(byDay.entries()).map(([date, profit]) => ({ date, profit }));
    const profitByType = Array.from(byType.values());

    const byHour = new Map<number, number>();
    for (const trade of closed) {
      const hour = new Date(trade.buy_time).getHours();
      byHour.set(hour, (byHour.get(hour) ?? 0) + num(trade.realized_profit ?? trade.actual_profit));
    }
    const profitByHour = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      profit: byHour.get(hour) ?? 0,
    }));

    let running = 0;
    const capitalGrowth = profitByDay.map((day) => ({ date: day.date, cumulative: (running += day.profit) }));

    const totalWithVerdict = closed.filter((trade) => trade.ki_accuracy_verdict).length;
    const accurate = closed.filter((trade) => trade.ki_accuracy_verdict === "accurate").length;
    const kiAccuracy = totalWithVerdict ? accurate / totalWithVerdict : 0;

    return { profitByDay, profitByType, profitByHour, capitalGrowth, kiAccuracy };
  });
