import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import appCss from "@/styles.css?url";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fmtMoney } from "@/lib/currency";
import { listTradesPaginated } from "@/lib/trades.functions";
import { History as HistoryIcon } from "lucide-react";

export const Route = createFileRoute("/_authenticated/history")({
  head: () => ({ meta: [{ title: "Trade History — KI Market Inventory" }] }),
  component: HistoryPage,
});

function HistoryPage() {
  const [page, setPage] = useState(0);
  const pageSize = 20;

  const [statusFilter, setStatusFilter] = useState<"all" | "closed" | "cancelled">("closed");
  const [typeFilter, setTypeFilter] = useState<"all" | "paper" | "manual">("all");
  const [routeFilter, setRouteFilter] = useState<string>("all");

  const listFn = useServerFn(listTradesPaginated);
  const query = useQuery({
    queryKey: ["trade-history", page, statusFilter, typeFilter, routeFilter],
    queryFn: () => {
      const data: any = { offset: page * pageSize, limit: pageSize };
      if (statusFilter !== "all") data.status = statusFilter;
      if (typeFilter !== "all") data.trade_type = typeFilter;
      if (routeFilter !== "all") data.route = routeFilter;
      return listFn({ data });
    },
    placeholderData: (prev) => prev,
  });

  const rows = query.data?.rows ?? [];
  const total = query.data?.total ?? 0;
  const totalPages = Math.ceil(total / pageSize);

  const routes = useMemo(() => {
    const allRoutes = rows.map((r: any) => r.route).filter(Boolean) as string[];
    return Array.from(new Set(allRoutes)).sort();
  }, [rows]);

  return (
    <AppShell
      title="Trade History"
      description="Review completed trades and performance."
      icon={History}
    >
      <div className="mb-6 flex flex-wrap gap-4">
        <select
          value={statusFilter}
          onChange={(e) => {
            setPage(0);
            setStatusFilter(e.target.value as any);
          }}
          className={selCls}
        >
          <option value="closed">Closed trades</option>
          <option value="cancelled">Cancelled trades</option>
        </select>
        <select
          value={typeFilter}
          onChange={(e) => {
            setPage(0);
            setTypeFilter(e.target.value as any);
          }}
          className={selCls}
        >
          <option value="all">Paper + Manual</option>
          <option value="manual">Manual only</option>
          <option value="paper">Paper only</option>
        </select>
        <select
          value={routeFilter}
          onChange={(e) => {
            setPage(0);
            setRouteFilter(e.target.value);
          }}
          className={selCls}
        >
          <option value="all">All routes</option>
          {routes.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      <Card variant="glass" className="p-0 lg:p-0">
        <div className="p-6 md:p-8 flex items-center gap-3 border-b border-white/5 bg-black/20">
          <HistoryIcon className="w-5 h-5 text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
          <h2 className="text-sm font-black uppercase tracking-widest text-white drop-shadow-sm">
            Transaction Logs
          </h2>
        </div>

        {query.isLoading && page === 0 ? (
          <div className="p-12 text-center text-sm font-medium text-slate-400 animate-pulse">
            Querying matrix databanks…
          </div>
        ) : rows.length === 0 ? (
          <div className="p-12 text-center text-sm font-medium text-slate-400">
            No trades match the current parameters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs font-bold uppercase tracking-wider text-slate-500 bg-black/40">
                <tr>
                  <th className="text-left py-4 px-6">Date</th>
                  <th className="text-left py-4 px-6">Route</th>
                  <th className="text-center py-4 px-6">Type</th>
                  <th className="text-right py-4 px-6">Amount</th>
                  <th className="text-right py-4 px-6">Buy</th>
                  <th className="text-right py-4 px-6">Sell</th>
                  <th className="text-right py-4 px-6">P/L</th>
                  <th className="text-center py-4 px-6">KI Verdict</th>
                  <th className="text-center py-4 px-6">Status</th>
                </tr>
              </thead>
              <tbody className="tabular-nums font-medium">
                {rows.map((t: any) => {
                  const p = Number(t.realized_profit ?? t.actual_profit ?? 0);
                  return (
                    <tr
                      key={t.id}
                      className="border-t border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="py-4 px-6 text-xs text-slate-400">
                        {new Date((t.sell_time ?? t.created_at) as string).toLocaleString()}
                      </td>
                      <td className="py-4 px-6">
                        <Link
                          to="/trades/$tradeId"
                          params={{ tradeId: t.id }}
                          className="text-cyan-400 font-bold hover:underline drop-shadow-glow-cyan"
                        >
                          {t.route}
                        </Link>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <Badge variant={t.trade_type === "paper" ? "info" : "profit"}>
                          {t.trade_type}
                        </Badge>
                      </td>
                      <td className="py-4 px-6 text-right text-slate-300">
                        {Number(t.amount).toFixed(0)} {t.asset}
                      </td>
                      <td className="py-4 px-6 text-right text-slate-300">
                        {fmtMoney(Number(t.buy_price), t.currency)}
                      </td>
                      <td className="py-4 px-6 text-right text-slate-300">
                        {t.actual_sell_price != null
                          ? fmtMoney(Number(t.actual_sell_price), t.currency)
                          : "—"}
                      </td>
                      <td
                        className={`py-4 px-6 text-right font-bold ${p >= 0 ? "text-emerald-400 drop-shadow-glow-emerald" : "text-rose-400 drop-shadow-glow-rose"}`}
                      >
                        {t.status === "closed" ? fmtMoney(p, t.currency) : "—"}
                      </td>
                      <td className="py-4 px-6 text-center">
                        {t.ki_accuracy_verdict ? (
                          <Badge
                            variant={t.ki_accuracy_verdict === "accurate" ? "profit" : "warning"}
                          >
                            {t.ki_accuracy_verdict}
                          </Badge>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <Badge variant={t.status === "closed" ? "info" : "default"}>
                          {t.status}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 p-6 border-t border-white/5 bg-black/20">
            <Button variant="cyber-secondary" onClick={() => setPage(0)} disabled={page === 0}>
              First
            </Button>
            <Button
              variant="cyber-secondary"
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
            >
              Prev
            </Button>
            <span className="px-4 text-xs font-bold text-slate-400 tracking-widest uppercase">
              Page {page + 1} of {totalPages}
            </span>
            <Button
              variant="cyber-secondary"
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page >= totalPages - 1}
            >
              Next
            </Button>
            <Button
              variant="cyber-secondary"
              onClick={() => setPage(totalPages - 1)}
              disabled={page >= totalPages - 1}
            >
              Last
            </Button>
          </div>
        )}
      </Card>
    </AppShell>
  );
}

const selCls =
  "rounded-xl border border-white/10 bg-slate-900/60 backdrop-blur-xl px-4 py-2.5 text-sm text-white shadow-inner focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all font-medium appearance-none";
