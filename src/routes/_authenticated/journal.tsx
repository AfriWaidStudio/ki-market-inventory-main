import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { fmtMoney } from "@/lib/currency";
import { listTradesPaginated } from "@/lib/trades.functions";
import { BookOpen } from "lucide-react";

export const Route = createFileRoute("/_authenticated/journal")({
  head: () => ({ meta: [{ title: "Journal — KI Market Inventory" }] }),
  component: JournalPage,
});

function JournalPage() {
  const [page, setPage] = useState(0);
  const pageSize = 20;

  const listFn = useServerFn(listTradesPaginated);
  const opts = queryOptions({
    queryKey: ["trades", "closed-journal", page],
    queryFn: () => listFn({ data: { status: "closed", offset: page * pageSize, limit: pageSize } }),
  });
  const { data } = useSuspenseQuery(opts);

  const rows = data?.rows ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / pageSize);

  return (
    <AppShell
      title="Trade Journal"
      description="Log and analyze your trading psychology."
      icon={BookOpen}
    >
      <div className="mb-8 flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-600 shadow-glow-cyan flex items-center justify-center shrink-0 border border-white/20">
          <BookOpen className="w-6 h-6 text-white" />
        </div>
        <p className="text-sm font-medium text-slate-400 max-w-2xl mt-1">
          Every closed trade generates a draft journal entry from your actual records. Lessons are
          estimated from KI's post-trade analysis — you can correct them on the trade detail page.
        </p>
      </div>

      {rows.length === 0 ? (
        <Card variant="glass" className="text-center p-12">
          <p className="text-sm font-medium text-slate-400">
            No closed trades yet. Close a trade on the{" "}
            <Link
              to="/trades"
              className="text-cyan-400 font-bold hover:underline drop-shadow-glow-cyan"
            >
              Active Trades
            </Link>{" "}
            page to start your journal.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {rows.map((t: any) => {
            const profit = t.actual_profit != null ? Number(t.actual_profit) : 0;
            const tone = profit >= 0 ? "profit" : "loss";
            return (
              <Link
                key={t.id}
                to="/trades/$tradeId"
                params={{ tradeId: t.id }}
                className="block group"
              >
                <Card
                  variant="glass"
                  className="p-5 border-white/5 hover:border-cyan-500/30 transition-all hover:-translate-y-1 hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_10px_30px_rgba(6,182,212,0.15)]"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3 text-sm">
                      <Badge variant="info">{t.asset}</Badge>
                      <span className="text-white font-bold tracking-wide">
                        {t.buy_exchange} <span className="text-slate-500 font-normal mx-1">→</span>{" "}
                        {t.sell_exchange}
                      </span>
                      <span className="text-xs font-medium text-slate-500">
                        {new Date(t.sell_time ?? t.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div
                      className={`text-lg font-black tabular-nums tracking-tight ${tone === "profit" ? "text-emerald-400 drop-shadow-glow-emerald" : "text-rose-400 drop-shadow-glow-rose"}`}
                    >
                      {fmtMoney(profit, t.currency ?? "NGN")}
                    </div>
                  </div>
                  {t.lesson_learned && (
                    <div className="mt-4 p-3 rounded-lg bg-black/40 border border-white/5 shadow-inner">
                      <p className="text-sm font-medium text-slate-300 italic">
                        "{t.lesson_learned}"
                      </p>
                    </div>
                  )}
                  {t.ki_accuracy_verdict && (
                    <div className="mt-3">
                      <Badge variant={t.ki_accuracy_verdict === "accurate" ? "profit" : "warning"}>
                        KI: {t.ki_accuracy_verdict}
                      </Badge>
                    </div>
                  )}
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-8">
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
    </AppShell>
  );
}
