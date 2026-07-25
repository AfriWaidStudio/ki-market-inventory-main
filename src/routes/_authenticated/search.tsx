import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { fmtMoney } from "@/lib/currency";
import { searchTrades } from "@/lib/search.functions";
import { Search, Database } from "lucide-react";

export const Route = createFileRoute("/_authenticated/search")({
  head: () => ({ meta: [{ title: "Search — KI Market Inventory" }] }),
  component: SearchPage,
});

function SearchPage() {
  const [q, setQ] = useState("");
  const searchFn = useServerFn(searchTrades);
  const { data, isFetching } = useQuery({
    queryKey: ["search", q],
    queryFn: () => searchFn({ data: { q } }),
    placeholderData: (prev) => prev,
  });

  return (
    <AppShell
      title="Universal Search"
      description="Find trades, market pairs, and logs."
      icon={Search}
    >
      <div className="max-w-3xl">
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-cyan-400" />
          <Input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search asset, exchange, route, status…"
            className="pl-12 py-4 text-base"
          />
          <p className="mt-3 text-xs font-medium text-slate-500 pl-4">
            Searches your trades only. Try:{" "}
            <span className="text-cyan-400 cursor-pointer" onClick={() => setQ("USDT")}>
              USDT
            </span>
            ,{" "}
            <span className="text-cyan-400 cursor-pointer" onClick={() => setQ("Binance")}>
              Binance
            </span>
            ,{" "}
            <span className="text-cyan-400 cursor-pointer" onClick={() => setQ("closed")}>
              closed
            </span>
            .
          </p>
        </div>

        <div>
          {isFetching && !data && (
            <div className="p-8 text-center text-sm font-medium text-slate-400 animate-pulse">
              Searching databanks…
            </div>
          )}

          {data && data.length === 0 && (
            <Card variant="glass" className="p-12 text-center">
              <Database className="w-12 h-12 text-slate-600 mx-auto mb-4 opacity-50" />
              <p className="text-sm font-medium text-slate-400">No results found for "{q}".</p>
            </Card>
          )}

          {data && data.length > 0 && (
            <div className="space-y-3">
              {data.map((t: any) => {
                const profit =
                  t.actual_profit != null
                    ? Number(t.actual_profit)
                    : Number(t.expected_profit ?? 0);
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
                      className="p-4 border-white/5 hover:border-cyan-500/30 transition-all hover:-translate-y-1 hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_10px_20px_rgba(6,182,212,0.1)]"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                        <div className="flex items-center gap-3">
                          <Badge variant="info">{t.asset}</Badge>
                          <span className="text-white font-bold tracking-wide">
                            {t.buy_exchange}{" "}
                            <span className="text-slate-500 font-normal mx-1">→</span>{" "}
                            {t.sell_exchange}
                          </span>
                          <Badge
                            variant={
                              t.status === "closed"
                                ? "profit"
                                : t.status === "cancelled"
                                  ? "loss"
                                  : "warning"
                            }
                          >
                            {t.status}
                          </Badge>
                        </div>
                        <div
                          className={`text-base font-black tabular-nums tracking-tight ${tone === "profit" ? "text-emerald-400 drop-shadow-glow-emerald" : "text-rose-400 drop-shadow-glow-rose"}`}
                        >
                          {fmtMoney(profit, t.currency ?? "NGN")}
                        </div>
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
