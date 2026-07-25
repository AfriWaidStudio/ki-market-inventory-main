import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/lib/auth";
import { ComponentErrorBoundary } from "@/components/ComponentErrorBoundary";
import { toast } from "sonner";
import { RefreshCw, Zap, Radar } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/StatCard";
import { fmtMoney, fmtNumber, SUPPORTED_CURRENCIES } from "@/lib/currency";
import {
  submitPriceSnapshot,
  listRecentSnapshots,
  listOpportunities,
} from "@/lib/scanner.functions";
import { refreshLivePrices } from "@/lib/prices.functions";
import { createManualTrade, createPaperTrade } from "@/lib/trades.functions";
import { getProfile } from "@/lib/profile.functions";

const EXCHANGES = ["Binance", "Bybit", "OKX", "KuCoin", "Bitget"];

export const Route = createFileRoute("/_authenticated/scanner")({
  head: () => ({ meta: [{ title: "Opportunity Scanner — KI Market Inventory" }] }),
  component: ScannerPage,
});

function ScannerPage() {
  const qc = useQueryClient();
  const submitFn = useServerFn(submitPriceSnapshot);
  const oppFn = useServerFn(listOpportunities);
  const snapsFn = useServerFn(listRecentSnapshots);
  const createPaperTradeFn = useServerFn(createPaperTrade);
  const createManualTradeFn = useServerFn(createManualTrade);
  const refreshFn = useServerFn(refreshLivePrices);
  const profileFn = useServerFn(getProfile);

  const profile = useQuery({ queryKey: ["profile"], queryFn: () => profileFn() });
  const fiat = profile.data?.preferred_currency ?? "NGN";

  const [exchange, setExchange] = useState("Binance");
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [price, setPrice] = useState("");
  const [merchantRating, setMerchantRating] = useState("4.5");
  const [merchantCount, setMerchantCount] = useState("20");
  const [liquidity, setLiquidity] = useState("70");
  const [amount, setAmount] = useState("100");
  const [autoRefresh, setAutoRefresh] = useState(true);

  const opps = useQuery({
    queryKey: ["opportunities", amount],
    queryFn: () => oppFn({ data: { amount: Number(amount) || 100 } }),
  });
  const snaps = useQuery({ queryKey: ["snapshots"], queryFn: () => snapsFn() });

  const submit = useMutation({
    mutationFn: () =>
      submitFn({
        data: {
          exchange,
          asset: "USDT",
          side,
          price: Number(price),
          currency: fiat,
          liquidity_score: Number(liquidity),
          merchant_count: Number(merchantCount),
          merchant_rating: Number(merchantRating),
        },
      }),
    onSuccess: () => {
      setPrice("");
      qc.invalidateQueries({ queryKey: ["snapshots"] });
      qc.invalidateQueries({ queryKey: ["opportunities"] });
      toast.success("Snapshot recorded");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  type OpportunityRow = {
    buy_exchange: string;
    sell_exchange: string;
    buy_price: number;
    sell_price: number;
    currency: string;
    liquidity_score: number | null;
    merchant_count: number | null;
    merchant_rating: number | null;
  };

  const toTradePayload = (opp: OpportunityRow) => ({
    asset: "USDT",
    amount: Number(amount) || 100,
    buy_exchange: opp.buy_exchange,
    sell_exchange: opp.sell_exchange,
    buy_price: opp.buy_price,
    expected_sell_price: opp.sell_price,
    estimated_fees: 0,
    currency: opp.currency,
    liquidity_score: opp.liquidity_score,
    merchant_count: opp.merchant_count,
    merchant_rating: opp.merchant_rating,
  });

  const paperBuy = useMutation({
    mutationFn: (opp: OpportunityRow) => createPaperTradeFn({ data: toTradePayload(opp) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dashboard-summary"] });
      qc.invalidateQueries({ queryKey: ["active-trades"] });
      toast.success("Paper trade opened. No real transaction occurred.");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  const iBought = useMutation({
    mutationFn: (opp: OpportunityRow) => createManualTradeFn({ data: toTradePayload(opp) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dashboard-summary"] });
      qc.invalidateQueries({ queryKey: ["active-trades"] });
      toast.success("Manual trade recorded. No order was placed.");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  const refresh = useMutation({
    mutationFn: () => refreshFn({ data: { asset: "USDT", fiat } }),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["snapshots"] });
      qc.invalidateQueries({ queryKey: ["opportunities"] });
      if (res.inserted > 0) {
        toast.success(`Live prices refreshed · ${res.exchanges_ok.join(", ")}`);
      } else if (res.failures.length) {
        const uniqueFailures = Array.from(new Set(res.failures.map((f) => f.exchange)));
        toast.error(`Exchanges unreachable: ${uniqueFailures.join(", ")}`);
      }
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Refresh failed"),
  });

  useEffect(() => {
    if (!autoRefresh) return;
    refresh.mutate();
    const id = setInterval(() => refresh.mutate(), 120_000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRefresh, fiat]);

  const notifiedOpps = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!opps.data) return;
    const highlyProfitable = opps.data.find(
      (o) => o.recommendation === "buy_now" && o.netProfit >= 2,
    );
    if (highlyProfitable) {
      const oppId = `${highlyProfitable.route}-${highlyProfitable.netProfit}`;
      if (!notifiedOpps.current.has(oppId)) {
        toast.success(
          `KI Alert: High profit on ${highlyProfitable.route}! Est. Profit: ${fmtMoney(highlyProfitable.netProfit, fiat)}`,
          { duration: 8000 },
        );
        notifiedOpps.current.add(oppId);
      }
    }
  }, [opps.data, fiat]);

  return (
    <AppShell
      title="Opportunity Scanner"
      description="Real-time arbitrage and price divergence."
      icon={Radar}
    >
      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        {/* LOG P2P PRICE CARD */}
        <div className="relative group overflow-hidden rounded-[2rem] bg-slate-900/50 backdrop-blur-xl p-8 border border-white/10 shadow-glass h-fit">
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          <div className="relative z-10 space-y-6">
            <div>
              <h2 className="text-sm font-black uppercase tracking-widest text-white drop-shadow-sm">
                Log a P2P price
              </h2>
              <p className="mt-1 text-xs font-medium text-slate-400">
                Manual entry. Add one buy and one sell per exchange to populate the scanner.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Exchange">
                <select
                  value={exchange}
                  onChange={(e) => setExchange(e.target.value)}
                  className={inputCls}
                >
                  {EXCHANGES.map((x) => (
                    <option key={x} value={x}>
                      {x}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Side">
                <select
                  value={side}
                  onChange={(e) => setSide(e.target.value as "buy" | "sell")}
                  className={inputCls}
                >
                  <option value="buy">Buy</option>
                  <option value="sell">Sell</option>
                </select>
              </Field>
              <Field label={`Price (${fiat}/USDT)`} className="col-span-2">
                <input
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className={inputCls}
                />
              </Field>
              <Field label="Merchants">
                <input
                  type="number"
                  value={merchantCount}
                  onChange={(e) => setMerchantCount(e.target.value)}
                  className={inputCls}
                />
              </Field>
              <Field label="Rating (0-5)">
                <input
                  type="number"
                  step="0.1"
                  value={merchantRating}
                  onChange={(e) => setMerchantRating(e.target.value)}
                  className={inputCls}
                />
              </Field>
              <Field label="Liquidity (0-100)" className="col-span-2">
                <input
                  type="number"
                  value={liquidity}
                  onChange={(e) => setLiquidity(e.target.value)}
                  className={inputCls}
                />
              </Field>
            </div>

            <button
              disabled={!price || submit.isPending}
              onClick={() => submit.mutate()}
              className="w-full relative flex items-center justify-center px-6 py-4 mt-2 text-sm font-bold text-black bg-gradient-to-r from-cyan-400 to-purple-500 rounded-xl shadow-[inset_0_2px_4px_rgba(255,255,255,0.8),0_5px_15px_rgba(147,51,234,0.3)] hover:shadow-[inset_0_2px_4px_rgba(255,255,255,0.8),0_10px_20px_rgba(6,182,212,0.4)] active:translate-y-[2px] active:shadow-[inset_0_1px_2px_rgba(0,0,0,0.4),0_2px_5px_rgba(0,0,0,0.5)] transition-all duration-300 disabled:opacity-50"
            >
              {submit.isPending ? "Saving Snapshot…" : "Record Snapshot"}
            </button>

            <div className="pt-6 mt-6 border-t border-white/10">
              <Field label="Simulation Trade Amount (USDT)">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className={inputCls}
                />
              </Field>
            </div>
          </div>
        </div>

        <div className="space-y-6 min-w-0">
          {/* LIVE OPPORTUNITIES TABLE */}
          <div className="relative group overflow-hidden rounded-[2rem] bg-slate-900/50 backdrop-blur-xl p-8 border border-white/10 shadow-glass">
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center justify-between gap-3 flex-wrap mb-6">
                <div>
                  <h2 className="text-sm font-black uppercase tracking-widest text-white drop-shadow-sm flex items-center gap-2">
                    <Zap className="h-4 w-4 text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]" />{" "}
                    Live Opportunities
                  </h2>
                  <p className="text-xs font-medium text-slate-400 mt-1">
                    Auto-fetched every 2 min. Paper Buy simulates only; I Bought records external
                    actions.
                    {SUPPORTED_CURRENCIES.find((c) => c.code === fiat) ? "" : " (unsupported fiat)"}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider cursor-pointer">
                    <div className="relative">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={autoRefresh}
                        onChange={(e) => setAutoRefresh(e.target.checked)}
                      />
                      <div className="w-9 h-5 bg-black/40 border border-white/10 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-500 peer-checked:border-cyan-400 shadow-inner"></div>
                    </div>
                    Auto
                  </label>
                  <button
                    onClick={() => refresh.mutate()}
                    disabled={refresh.isPending}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-800 border border-white/10 px-4 py-2 text-xs font-bold text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_4px_10px_rgba(0,0,0,0.3)] hover:bg-slate-700 active:translate-y-[2px] active:shadow-[inset_0_1px_1px_rgba(0,0,0,0.2)] transition-all disabled:opacity-50"
                  >
                    <RefreshCw
                      className={`h-3.5 w-3.5 ${refresh.isPending ? "animate-spin" : ""}`}
                    />
                    {refresh.isPending ? "Fetching…" : "Refresh"}
                  </button>
                </div>
              </div>

              <ComponentErrorBoundary>
                {opps.isLoading ? (
                  <div className="rounded-xl bg-black/40 border border-white/5 p-8 text-center shadow-inner">
                    <p className="text-sm font-medium text-slate-400 animate-pulse">
                      Scanning the market for opportunities…
                    </p>
                  </div>
                ) : (opps.data ?? []).length === 0 ? (
                  <div className="rounded-xl bg-black/40 border border-white/5 p-8 text-center shadow-inner">
                    <p className="text-sm font-medium text-slate-400">
                      No opportunities detected yet. Awaiting fresh snapshots.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl bg-black/40 border border-white/5 shadow-inner">
                    <table className="w-full text-sm">
                      <thead className="text-xs font-bold uppercase tracking-wider text-slate-500 bg-black/50">
                        <tr>
                          <th className="text-left py-4 px-6">Route</th>
                          <th className="text-right py-4 px-6">Buy</th>
                          <th className="text-right py-4 px-6">Sell</th>
                          <th className="text-right py-4 px-6">Spread</th>
                          <th className="text-right py-4 px-6">Net</th>
                          <th className="text-center py-4 px-6">KI Signal</th>
                          <th className="py-4 px-6"></th>
                        </tr>
                      </thead>
                      <tbody className="tabular-nums font-medium">
                        {(opps.data ?? []).map((o, i) => (
                          <tr
                            key={i}
                            className="border-t border-white/5 hover:bg-white/5 transition-colors"
                          >
                            <td className="py-4 px-6 text-white font-bold">
                              {o.buy_exchange}{" "}
                              <span className="text-slate-500 font-normal mx-1">→</span>{" "}
                              {o.sell_exchange}
                            </td>
                            <td className="text-right py-4 px-6 text-slate-300">
                              {fmtMoney(o.buy_price, o.currency)}
                            </td>
                            <td className="text-right py-4 px-6 text-slate-300">
                              {fmtMoney(o.sell_price, o.currency)}
                            </td>
                            <td className="text-right py-4 px-6 text-white">
                              {fmtNumber(o.spread)} <br />
                              <span className="text-[10px] text-cyan-400 font-bold tracking-wider">
                                ({(o.spreadPct * 100).toFixed(2)}%)
                              </span>
                            </td>
                            <td
                              className={`text-right py-4 px-6 font-bold ${o.netProfit >= 0 ? "text-emerald-400 drop-shadow-glow-emerald" : "text-rose-400 drop-shadow-glow-rose"}`}
                            >
                              {fmtMoney(o.netProfit, o.currency)}
                            </td>
                            <td className="text-center py-4 px-6">
                              <RecBadge
                                rec={o.recommendation}
                                confidence={o.confidence}
                                risk={o.risk}
                              />
                            </td>
                            <td className="text-right py-4 px-6">
                              <div className="flex justify-end gap-2">
                                <button
                                  disabled={paperBuy.isPending || iBought.isPending}
                                  onClick={() => paperBuy.mutate(o)}
                                  className="rounded-xl border border-purple-500/30 bg-purple-500/10 px-3 py-1.5 text-xs font-bold text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.1)] hover:bg-purple-500/20 active:translate-y-[1px] transition-all disabled:opacity-50"
                                  title="Paper Trade"
                                >
                                  Paper
                                </button>
                                <button
                                  disabled={paperBuy.isPending || iBought.isPending}
                                  onClick={() => iBought.mutate(o)}
                                  className="rounded-xl bg-cyan-500 border border-cyan-400 shadow-[inset_0_1px_2px_rgba(255,255,255,0.4),0_2px_10px_rgba(6,182,212,0.4)] px-3 py-1.5 text-xs font-bold text-black hover:bg-cyan-400 active:translate-y-[1px] transition-all disabled:opacity-50"
                                  title="Manual Execution"
                                >
                                  Bought
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </ComponentErrorBoundary>
            </div>
          </div>

          {/* RECENT SNAPSHOTS */}
          <div className="relative group overflow-hidden rounded-[2rem] bg-slate-900/50 backdrop-blur-xl p-8 border border-white/10 shadow-glass">
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <div className="relative z-10">
              <h2 className="text-sm font-black uppercase tracking-widest text-white drop-shadow-sm mb-6">
                Recent Snapshots
              </h2>

              <div className="rounded-xl bg-black/40 border border-white/5 p-4 shadow-inner">
                <div className="space-y-2 text-xs font-mono font-medium">
                  {(snaps.data ?? []).slice(0, 15).map((s: any) => (
                    <div
                      key={s.id}
                      className="flex justify-between items-center p-2 rounded-lg hover:bg-white/5 transition-colors"
                    >
                      <span className="text-slate-500">
                        {new Date(s.captured_at as string).toLocaleTimeString()}
                      </span>
                      <span className="text-slate-300 px-2 py-1 bg-white/5 rounded-md border border-white/5">
                        {s.exchange}{" "}
                        <span className={s.side === "buy" ? "text-emerald-400" : "text-rose-400"}>
                          {s.side.toUpperCase()}
                        </span>
                      </span>
                      <span className="text-white font-bold">
                        {fmtMoney(Number(s.price), s.currency)}
                      </span>
                    </div>
                  ))}
                  {(snaps.data ?? []).length === 0 && (
                    <div className="text-center p-4 text-slate-500">
                      No network snapshots available in cache.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

const inputCls =
  "mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white shadow-inner focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all font-medium";

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</span>
      {children}
    </label>
  );
}

function RecBadge({ rec, confidence, risk }: { rec: string; confidence: number; risk: number }) {
  const map: Record<string, "profit" | "info" | "warning" | "loss"> = {
    buy_now: "profit",
    wait: "info",
    watch: "warning",
    skip: "loss",
  };
  const label = rec.replace("_", " ");
  return (
    <div className="flex flex-col items-center gap-1">
      <Badge tone={map[rec] ?? "default"}>{label}</Badge>
      <span className="text-[10px] font-bold text-slate-500 tracking-widest">
        C{confidence.toFixed(0)} R{risk.toFixed(0)}
      </span>
    </div>
  );
}
