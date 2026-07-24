import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { CyberBadge } from "@/components/ui/CyberBadge";
import { CyberButton } from "@/components/ui/CyberButton";
import { CyberInput } from "@/components/ui/CyberInput";
import { GlassCard } from "@/components/ui/GlassCard";
import { fmtMoney, fmtNumber } from "@/lib/currency";
import { addTradeFee, getTrade, updateTradeStage } from "@/lib/trades.functions";
import { getTradeJournal, saveTradeJournal } from "@/lib/journal.functions";
import { BrainCircuit, BookOpen, Timeline, CalendarClock, ChevronLeft, ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/_authenticated/trades/$tradeId")({
  head: () => ({ meta: [{ title: "Trade Details — KI Market Inventory" }] }),
  component: TradeDetailPage,
});

function TradeDetailPage() {
  const { tradeId } = Route.useParams();
  const qc = useQueryClient();
  const getFn = useServerFn(getTrade);
  const feeFn = useServerFn(addTradeFee);
  const stageFn = useServerFn(updateTradeStage);
  const journalGetFn = useServerFn(getTradeJournal);
  const journalSaveFn = useServerFn(saveTradeJournal);

  const q = useQuery({
    queryKey: ["trade", tradeId],
    queryFn: () => getFn({ data: { id: tradeId } }),
  });

  const [note, setNote] = useState("");
  const [feeAmount, setFeeAmount] = useState("");
  const [feeType, setFeeType] = useState("network");
  const [stage, setStage] = useState("");
  
  // Journal State
  const journal = useQuery({
    queryKey: ["journal", tradeId],
    queryFn: () => journalGetFn({ data: { trade_id: tradeId } }),
  });
  const [emotionalState, setEmotionalState] = useState<'fomo' | 'anxious' | 'confident' | 'neutral' | 'tilted'>('neutral');
  const [lessons, setLessons] = useState("");

  const saveJournal = useMutation({
    mutationFn: () => journalSaveFn({ data: { trade_id: tradeId, emotional_state: emotionalState, lessons_learned: lessons } }),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["journal", tradeId] });
      toast.success(`Journal saved! AI Risk Score: ${res.riskScore}/100`);
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  const addFee = useMutation({
    mutationFn: () =>
      feeFn({
        data: {
          trade_id: tradeId,
          fee_type: feeType,
          amount: Number(feeAmount),
          currency: q.data?.trade.currency ?? "NGN",
        },
      }),
    onSuccess: () => {
      setFeeAmount("");
      qc.invalidateQueries({ queryKey: ["trade", tradeId] });
      qc.invalidateQueries({ queryKey: ["dashboard-summary"] });
      toast.success("Fee recorded");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });
  const updateStage = useMutation({
    mutationFn: () => stageFn({ data: { id: tradeId, stage: stage as never } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["trade", tradeId] });
      qc.invalidateQueries({ queryKey: ["active-trades"] });
      toast.success("Stage updated");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  if (q.isLoading) return <AppShell title="Trade Details"><div className="p-8 text-center text-slate-400 font-medium animate-pulse">Decrypting trade record…</div></AppShell>;
  if (!q.data) return <AppShell title="Trade Details"><div className="p-8 text-center text-rose-400 font-bold">Record not found.</div></AppShell>;

  const { trade: t, notes, events, fees, ledger } = q.data;
  const p = t.realized_profit != null && Number(t.realized_profit) !== 0 ? Number(t.realized_profit) : Number(t.actual_profit ?? t.expected_profit ?? 0);
  const isClosed = t.status === "closed";

  return (
    <AppShell title={`Trade · ${t.route ?? ""}`}>
      <div className="mb-6">
        <Link to="/trades" className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-cyan-400 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back to open positions
        </Link>
      </div>

      <div className="grid gap-6 xl:grid-cols-3 items-start">
        <div className="xl:col-span-2 space-y-6">
          
          <GlassCard className="p-6 lg:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6 mb-6">
              <div>
                <h2 className="text-xl font-black text-white drop-shadow-md tracking-tight mb-2">{t.route}</h2>
                <div className="flex flex-wrap gap-2">
                  <CyberBadge variant={t.trade_type === "paper" ? "info" : "profit"}>{t.trade_type}</CyberBadge>
                  <CyberBadge variant={t.status === "active" ? "info" : t.status === "closed" ? "profit" : "default"}>{t.status}</CyberBadge>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              <Info label="Amount" value={`${fmtNumber(Number(t.amount), 0)} ${t.asset}`} />
              <Info label="Remaining" value={`${fmtNumber(Number(t.remaining_amount ?? t.amount), 6)} ${t.asset}`} />
              <Info label="Stage" value={String(t.stage ?? t.status).replaceAll("_", " ")} className="capitalize" />
              <Info label="Buy" value={fmtMoney(Number(t.buy_price), t.currency)} />
              <Info label={isClosed ? "Actual sell" : "Expected sell"} value={fmtMoney(Number(t.actual_sell_price ?? t.expected_sell_price), t.currency)} />
              <Info label={isClosed ? "Realized P/L" : "Expected P/L"} value={fmtMoney(p, t.currency)} tone={p >= 0 ? "profit" : "loss"} />
              <Info label="Estimated fees" value={fmtMoney(Number(t.estimated_fees ?? 0), t.currency)} />
              <Info label="Recorded fees" value={fmtMoney(Number(t.total_recorded_fees ?? 0), t.currency)} />
              {t.final_fees != null && <Info label="Final fees" value={fmtMoney(Number(t.final_fees), t.currency)} />}
              <Info label="Confidence" value={`${fmtNumber(Number(t.confidence_score), 0)}%`} tone={Number(t.confidence_score) >= 70 ? "profit" : "warning"} />
              <Info label="Risk" value={`${fmtNumber(Number(t.risk_score), 0)}%`} tone="loss" />
              <Info label="Opened" value={new Date(t.buy_time as string).toLocaleString()} />
              {t.sell_time && <Info label="Closed" value={new Date(t.sell_time as string).toLocaleString()} />}
              {t.duration_minutes != null && <Info label="Duration" value={`${t.duration_minutes}m`} />}
              {t.ki_accuracy_verdict && <Info label="KI verdict" value={t.ki_accuracy_verdict} tone={t.ki_accuracy_verdict === 'accurate' ? 'profit' : 'warning'} />}
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <h2 className="text-sm font-black uppercase tracking-widest text-white drop-shadow-sm flex items-center gap-2 mb-4">
              <BrainCircuit className="w-5 h-5 text-purple-400" /> KI Reasoning Matrix
            </h2>
            <div className="rounded-xl bg-black/40 border border-white/5 p-5 shadow-inner">
              <p className="text-sm text-slate-300 leading-relaxed font-medium">
                {t.ki_reasoning ?? "No reasoning recorded."}
              </p>
            </div>
            {t.lesson_learned && (
              <div className="mt-6">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-cyan-400 mb-2 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" /> Post-Trade Lesson
                </h3>
                <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/5 p-4 text-sm font-medium text-cyan-300">
                  {t.lesson_learned}
                </div>
              </div>
            )}
          </GlassCard>

          <GlassCard className="p-6">
            <h2 className="text-sm font-black uppercase tracking-widest text-white drop-shadow-sm flex items-center gap-2 mb-4">
              <CalendarClock className="w-5 h-5 text-emerald-400" /> Accounting Ledger
            </h2>
            <div className="rounded-xl bg-black/40 border border-white/5 shadow-inner overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-white/5 border-b border-white/5 text-left uppercase tracking-widest text-slate-500 font-bold">
                    <tr>
                      <th className="py-3 px-4">Timestamp</th>
                      <th className="py-3 px-4">Entry Type</th>
                      <th className="py-3 px-4 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="font-medium">
                    {ledger.map((entry: any) => (
                      <tr key={entry.id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                        <td className="py-3 px-4 text-slate-400">{new Date(entry.created_at as string).toLocaleString()}</td>
                        <td className="py-3 px-4 text-slate-300 capitalize">{String(entry.entry_type).replaceAll("_", " ")}</td>
                        <td className={`py-3 px-4 text-right tabular-nums ${Number(entry.amount) >= 0 ? "text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.3)]" : "text-rose-400 drop-shadow-[0_0_5px_rgba(251,113,133,0.3)]"}`}>
                          {fmtMoney(Number(entry.amount), entry.currency)}
                        </td>
                      </tr>
                    ))}
                    {ledger.length === 0 && (
                      <tr><td colSpan={3} className="py-6 text-center text-slate-500">No ledger entries yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </GlassCard>
        </div>

        <div className="space-y-6">
          {/* QUALITATIVE AI JOURNAL */}
          <GlassCard className="p-6">
            <div className="flex items-start justify-between mb-6">
              <h2 className="text-sm font-black uppercase tracking-widest text-fuchsia-400 drop-shadow-[0_0_5px_rgba(232,121,249,0.3)] flex items-center gap-2">
                <BookOpen className="w-5 h-5" /> Psychological AI Journal
              </h2>
              {journal.data && (
                <CyberBadge variant={journal.data.ai_risk_score > 50 ? "danger" : "info"}>
                  Risk Score: {journal.data.ai_risk_score}/100
                </CyberBadge>
              )}
            </div>
            
            <div className="space-y-4">
              {journal.data ? (
                <div className="rounded-xl bg-black/40 border border-white/5 p-4 space-y-2">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Logged State</div>
                  <CyberBadge variant="info">{journal.data.emotional_state.toUpperCase()}</CyberBadge>
                  <div className="mt-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Lessons Learned</div>
                  <div className="text-sm font-medium text-slate-200">{journal.data.lessons_learned}</div>
                  
                  {journal.data.ai_risk_score > 50 && (
                    <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-start gap-2">
                      <ShieldAlert className="w-4 h-4 text-rose-400 mt-0.5" />
                      <div className="text-xs text-rose-300 font-medium leading-relaxed">
                        <strong>AI Risk Warning:</strong> You logged this trade under a high-risk emotional state. The engine recommends taking a 24-hour break from manual trading and switching to paper mode to avoid tilt.
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Emotional State Before Entry</label>
                    <select 
                      value={emotionalState} 
                      onChange={(e) => setEmotionalState(e.target.value as any)}
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white shadow-inner focus:outline-none focus:border-cyan-500/50 appearance-none font-medium"
                    >
                      <option value="neutral">Neutral (Following System)</option>
                      <option value="confident">Confident (High Conviction)</option>
                      <option value="fomo">FOMO (Chasing Pump)</option>
                      <option value="anxious">Anxious (Doubtful)</option>
                      <option value="tilted">Tilted (Revenge Trading)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Lessons Learned</label>
                    <textarea 
                      value={lessons} 
                      onChange={(e) => setLessons(e.target.value)} 
                      rows={3}
                      placeholder="Why did you take this route? What did you learn?"
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white shadow-inner focus:outline-none focus:border-cyan-500/50 transition-all font-medium placeholder:text-slate-500 resize-none" 
                    />
                  </div>
                  <CyberButton onClick={() => saveJournal.mutate()} disabled={!lessons.trim() || saveJournal.isPending} className="w-full">
                    {saveJournal.isPending ? "Analyzing Risk..." : "Log Psychological State"}
                  </CyberButton>
                </div>
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </AppShell>
  );
}

function Info({ label, value, tone = "default", className = "" }: { label: string; value: string; tone?: "default" | "profit" | "loss" | "warning"; className?: string }) {
  const cls = tone === "profit" ? "text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]" 
    : tone === "loss" ? "text-rose-400 drop-shadow-[0_0_8px_rgba(251,113,133,0.3)]" 
    : tone === "warning" ? "text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.3)]"
    : "text-slate-200";
    
  return (
    <div className={`rounded-xl bg-black/40 border border-white/5 p-3 shadow-inner ${className}`}>
      <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">{label}</div>
      <div className={`text-sm font-black tracking-tight ${cls}`}>{value}</div>
    </div>
  );
}
