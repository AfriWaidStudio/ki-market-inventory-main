import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Fragment, useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { GlassCard } from "@/components/ui/GlassCard";
import { CyberBadge } from "@/components/ui/CyberBadge";
import { CyberButton } from "@/components/ui/CyberButton";
import { CyberInput } from "@/components/ui/CyberInput";
import { fmtMoney, fmtNumber } from "@/lib/currency";
import {
  listTrades,
  updateTradePrice,
  markClosed,
  cancelTrade,
} from "@/lib/trades.functions";
import { Activity, XCircle, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/trades")({
  head: () => ({ meta: [{ title: "Active Trades — KI Market Inventory" }] }),
  component: TradesPage,
});

function TradesPage() {
  const qc = useQueryClient();
  const listFn = useServerFn(listTrades);
  const updateFn = useServerFn(updateTradePrice);
  const closeFn = useServerFn(markClosed);
  const cancelFn = useServerFn(cancelTrade);

  const trades = useQuery({
    queryKey: ["active-trades"],
    queryFn: () => listFn({ data: { status: "active" } }),
  });

  const [editing, setEditing] = useState<string | null>(null);
  const [priceInput, setPriceInput] = useState("");
  const [closingId, setClosingId] = useState<string | null>(null);
  const [actualPrice, setActualPrice] = useState("");
  const [finalFees, setFinalFees] = useState("");
  const [amountSold, setAmountSold] = useState("");

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["active-trades"] });
    qc.invalidateQueries({ queryKey: ["dashboard-summary"] });
    qc.invalidateQueries({ queryKey: ["trade-history"] });
  };

  const doUpdate = useMutation({
    mutationFn: (v: { id: string; price: number }) =>
      updateFn({ data: { id: v.id, expected_sell_price: v.price } }),
    onSuccess: () => { setEditing(null); setPriceInput(""); invalidate(); toast.success("Updated"); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });
  const doClose = useMutation({
    mutationFn: (v: { id: string; price: number; fees: number; amountSold?: number }) =>
      closeFn({
        data: {
          id: v.id,
          actual_sell_price: v.price,
          final_fees: v.fees,
          amount_sold: v.amountSold,
        },
      }),
    onSuccess: (res) => {
      setClosingId(null); setActualPrice(""); setFinalFees(""); setAmountSold("");
      invalidate();
      const p = res.analysis.actualProfit;
      toast.success(`${res.fully_closed ? "Closed" : "Partially closed"}. ${p >= 0 ? "Profit" : "Loss"}: ${fmtNumber(p)}`);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });
  const doCancel = useMutation({
    mutationFn: (id: string) => cancelFn({ data: { id } }),
    onSuccess: () => { invalidate(); toast.success("Cancelled"); },
  });

  const rows = trades.data ?? [];

  return (
    <AppShell title="Active Trades">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-600 shadow-[0_0_15px_rgba(6,182,212,0.4)] flex items-center justify-center border border-white/20">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-sm font-black uppercase tracking-widest text-white drop-shadow-sm">Open Positions</h2>
        </div>
        <CyberBadge variant={rows.length > 0 ? "info" : "default"}>
          {rows.length} {rows.length === 1 ? 'Trade' : 'Trades'}
        </CyberBadge>
      </div>

      <GlassCard className="p-0 lg:p-0">
        {rows.length === 0 ? (
          <div className="p-16 text-center">
            <Activity className="w-12 h-12 text-cyan-400 mx-auto mb-4 opacity-50 drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]" />
            <p className="text-sm font-medium text-slate-400">
              No active trades. Open one from the <Link to="/scanner" className="text-cyan-400 font-bold hover:underline">Scanner</Link>.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-black/40 text-xs uppercase tracking-wider font-bold text-slate-500 border-b border-white/5">
                <tr>
                  <th className="text-left py-4 px-6">Route</th>
                  <th className="text-center py-4 px-6">Type</th>
                  <th className="text-left py-4 px-6">Stage</th>
                  <th className="text-right py-4 px-6">Amount</th>
                  <th className="text-right py-4 px-6">Buy</th>
                  <th className="text-right py-4 px-6">Exp. sell</th>
                  <th className="text-right py-4 px-6">Exp. profit</th>
                  <th className="text-center py-4 px-6">Confidence</th>
                  <th className="text-left py-4 px-6">Open for</th>
                  <th className="text-right py-4 px-6">Actions</th>
                </tr>
              </thead>
              <tbody className="tabular-nums font-medium">
                {rows.map((t: any) => (
                  <Fragment key={t.id}>
                    <tr className="border-t border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-4 px-6">
                        <Link to="/trades/$tradeId" params={{ tradeId: t.id }} className="text-cyan-400 font-bold hover:underline drop-shadow-[0_0_5px_rgba(6,182,212,0.5)]">
                          {t.route}
                        </Link>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <CyberBadge variant={t.trade_type === "paper" ? "info" : "profit"}>
                          {t.trade_type === "paper" ? "paper" : "manual"}
                        </CyberBadge>
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-400 capitalize">
                        {String(t.stage ?? t.status).replaceAll("_", " ")}
                      </td>
                      <td className="py-4 px-6 text-right text-slate-300">{fmtNumber(Number(t.amount), 0)} {t.asset}</td>
                      <td className="py-4 px-6 text-right text-slate-300">{fmtMoney(Number(t.buy_price), t.currency)}</td>
                      <td className="py-4 px-6 text-right">
                        {editing === t.id ? (
                          <div className="flex gap-2 justify-end items-center">
                            <CyberInput type="number" step="0.01" value={priceInput} onChange={(e) => setPriceInput(e.target.value)}
                              className="w-24 text-right py-1.5 px-2 bg-black/60" />
                            <CyberButton onClick={() => doUpdate.mutate({ id: t.id, price: Number(priceInput) })}
                              className="px-3 py-1.5 h-auto text-xs">Save</CyberButton>
                          </div>
                        ) : (
                          <button onClick={() => { setEditing(t.id); setPriceInput(String(t.expected_sell_price ?? "")); }}
                            className="text-slate-300 hover:text-cyan-400 transition-colors border-b border-dashed border-slate-600 hover:border-cyan-400 pb-0.5">
                            {fmtMoney(Number(t.expected_sell_price), t.currency)}
                          </button>
                        )}
                      </td>
                      <td className={`py-4 px-6 text-right font-bold ${Number(t.expected_profit) >= 0 ? "text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]" : "text-rose-400 drop-shadow-[0_0_8px_rgba(251,113,133,0.3)]"}`}>
                        {fmtMoney(Number(t.expected_profit), t.currency)}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <CyberBadge variant={Number(t.confidence_score) >= 70 ? "profit" : Number(t.confidence_score) >= 50 ? "info" : "warning"}>
                          {fmtNumber(Number(t.confidence_score), 0)}%
                        </CyberBadge>
                      </td>
                      <td className="py-4 px-6 text-xs font-bold text-slate-400">
                        {timeAgo(t.buy_time as string)}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex gap-2 justify-end">
                          <CyberButton variant="secondary" onClick={() => { setClosingId(t.id); setActualPrice(String(t.expected_sell_price ?? "")); setFinalFees(String(t.estimated_fees ?? "0")); setAmountSold(String(t.remaining_amount ?? t.amount)); }}
                            className="px-3 py-1.5 h-auto text-xs border-cyan-500/30 hover:border-cyan-500/60 text-cyan-400">
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> {t.trade_type === "paper" ? "Paper Close" : "Close"}
                          </CyberButton>
                          <CyberButton variant="ghost" onClick={() => doCancel.mutate(t.id)}
                            className="px-2 py-1.5 h-auto text-xs text-rose-400 hover:bg-rose-500/10">
                            <XCircle className="w-3.5 h-3.5" />
                          </CyberButton>
                        </div>
                      </td>
                    </tr>
                    {closingId === t.id && (
                      <tr className="bg-black/40 shadow-inner">
                        <td colSpan={10} className="px-6 py-5 border-t border-b border-cyan-500/20 relative">
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-500/50" />
                          <div className="flex flex-wrap items-end gap-4">
                            <label className="text-sm flex-1 max-w-[140px]">
                              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Amount sold</div>
                              <CyberInput type="number" step="0.000001" value={amountSold} onChange={(e) => setAmountSold(e.target.value)} />
                            </label>
                            <label className="text-sm flex-1 max-w-[140px]">
                              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Actual sell price</div>
                              <CyberInput type="number" step="0.01" value={actualPrice} onChange={(e) => setActualPrice(e.target.value)} />
                            </label>
                            <label className="text-sm flex-1 max-w-[140px]">
                              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Final fees</div>
                              <CyberInput type="number" step="0.01" value={finalFees} onChange={(e) => setFinalFees(e.target.value)} />
                            </label>
                            <CyberButton onClick={() => doClose.mutate({ id: t.id, price: Number(actualPrice), fees: Number(finalFees), amountSold: Number(amountSold) || undefined })}
                              disabled={!actualPrice || doClose.isPending}
                              className="px-6">
                              {t.trade_type === "paper" ? "Confirm Paper Close" : "Confirm Trade Close"}
                            </CyberButton>
                            <CyberButton variant="ghost" onClick={() => setClosingId(null)} className="px-4 text-slate-400">
                              Cancel
                            </CyberButton>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>
    </AppShell>
  );
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ${m % 60}m`;
  return `${Math.floor(h / 24)}d`;
}
