import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/AppShell";
import { InferenceInbox } from "@/components/InferenceInbox";
import { StatCard, Badge } from "@/components/StatCard";
import { fmtMoney, fmtNumber } from "@/lib/currency";
import { dashboardSummary } from "@/lib/analytics.functions";
import { supabase } from "@/lib/supabaseClient";
import { BrainCircuit } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — KI Market Inventory" }] }),
  component: DashboardPage,
});

function DashboardPage() {
  const qc = useQueryClient();
  const summaryFn = useServerFn(dashboardSummary);
  const opts = queryOptions({
    queryKey: ["dashboard-summary"],
    queryFn: () => summaryFn(),
  });
  const { data } = useSuspenseQuery(opts);
  const c = data.currency;

  useEffect(() => {
    const channel = supabase
      .channel("schema-db-changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "market_inventory_inferences" },
        () => {
          qc.invalidateQueries({ queryKey: ["inferences"] });
        },
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "market_inventory_exchange_transactions" },
        () => {
          qc.invalidateQueries({ queryKey: ["dashboard-summary"] });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [qc]);

  return (
    <AppShell
      title="Executive Dashboard"
      description="Real-time portfolio intelligence across all connected exchanges."
      icon={BrainCircuit}
    >
      <InferenceInbox />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Live exchange capital (USDT)"
          value={fmtMoney(data.exchangeCapital, c)}
          tone="profit"
          hint="Synced live from connected exchanges"
        />
        <StatCard
          label="Idle capital"
          value={fmtMoney(data.idleCapital, c)}
          tone={data.idleCapital > 0 ? "loss" : "default"}
          hint="Stablecoins not in active trades"
        />
        <StatCard
          label="Capital in transit"
          value={fmtMoney(data.capitalInTransit, c)}
          tone={data.capitalInTransit > 0 ? "warning" : "default"}
          hint="Withdrawals missing deposits"
        />
        <StatCard
          label="Paper capital active"
          value={fmtMoney(data.paperTrackedCapital, c)}
          hint={`${data.paperActiveCount} paper active`}
        />
        <StatCard
          label="Today manual profit"
          value={fmtMoney(data.todayManualProfit, c)}
          tone={data.todayManualProfit >= 0 ? "profit" : "loss"}
        />
        <StatCard
          label="Today paper profit"
          value={fmtMoney(data.todayPaperProfit, c)}
          tone={data.todayPaperProfit >= 0 ? "profit" : "loss"}
        />
        <StatCard
          label="7-day profit"
          value={fmtMoney(data.weekProfit, c)}
          tone={data.weekProfit >= 0 ? "profit" : "loss"}
        />
        <StatCard
          label="30-day profit"
          value={fmtMoney(data.monthProfit, c)}
          tone={data.monthProfit >= 0 ? "profit" : "loss"}
        />
        <StatCard
          label="Manual realized profit"
          value={fmtMoney(data.manualProfit, c)}
          tone={data.manualProfit >= 0 ? "profit" : "loss"}
          hint={`${data.manualClosedCount} manual closed`}
        />
        <StatCard
          label="Paper realized profit"
          value={fmtMoney(data.paperProfit, c)}
          tone={data.paperProfit >= 0 ? "profit" : "loss"}
          hint={`${data.paperClosedCount} paper closed`}
        />
        <StatCard
          label="Total separated profit"
          value={fmtMoney(data.totalProfit, c)}
          tone={data.totalProfit >= 0 ? "profit" : "loss"}
          hint={`${data.closedCount} closed trades`}
        />
        <StatCard label="Avg profit / trade" value={fmtMoney(data.avgProfit, c)} />
        <StatCard label="Avg duration" value={`${fmtNumber(data.avgDurationMinutes, 0)}m`} />
        <StatCard label="Win rate" value={`${(data.winRate * 100).toFixed(1)}%`} />
        <StatCard label="Total fees" value={fmtMoney(data.totalFees, c)} tone="warning" />
        <StatCard label="Best route" value={data.bestRoute ?? "—"} />
        <StatCard label="Worst route" value={data.worstRoute ?? "—"} tone="loss" />
      </div>

      <div className="mt-10 relative group overflow-hidden rounded-[2rem] bg-slate-900/50 backdrop-blur-xl p-8 border border-white/10 shadow-glass transition-all">
        {/* Glossy overlay effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-black uppercase tracking-widest text-white drop-shadow-sm">
              Route performance
            </h2>
            <Badge tone="info">{data.routeStats.length} routes</Badge>
          </div>

          {data.routeStats.length === 0 ? (
            <div className="rounded-xl bg-black/40 border border-white/5 p-8 text-center shadow-inner">
              <p className="text-sm text-slate-400 font-medium">
                No closed trades yet. Mark trades as bought on the{" "}
                <a
                  href="/scanner"
                  className="text-cyan-400 font-bold hover:underline drop-shadow-glow-cyan"
                >
                  Scanner
                </a>
                , then close them to build history.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl bg-black/40 border border-white/5 shadow-inner">
              <table className="w-full text-sm">
                <thead className="text-xs font-bold uppercase tracking-wider text-slate-500 bg-black/50">
                  <tr>
                    <th className="text-left py-4 px-6">Route</th>
                    <th className="text-right py-4 px-6">Trades</th>
                    <th className="text-right py-4 px-6">Total profit</th>
                    <th className="text-right py-4 px-6">Avg</th>
                  </tr>
                </thead>
                <tbody className="tabular-nums font-medium">
                  {data.routeStats.map((r) => (
                    <tr
                      key={r.route}
                      className="border-t border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="py-4 px-6 text-slate-300">{r.route}</td>
                      <td className="text-right py-4 px-6 text-slate-400">{r.count}</td>
                      <td
                        className={`text-right py-4 px-6 ${r.profit >= 0 ? "text-emerald-400 drop-shadow-glow-emerald" : "text-rose-400 drop-shadow-glow-rose"}`}
                      >
                        {fmtMoney(r.profit, c)}
                      </td>
                      <td className="text-right py-4 px-6 text-slate-300 font-bold">
                        {fmtMoney(r.profit / Math.max(1, r.count), c)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
