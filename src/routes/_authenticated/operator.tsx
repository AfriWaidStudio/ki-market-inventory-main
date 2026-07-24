import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/AppShell";
import { GlassCard } from "@/components/ui/GlassCard";
import { CyberBadge } from "@/components/ui/CyberBadge";
import { CyberButton } from "@/components/ui/CyberButton";
import { getOperatorOverview, acknowledgeOperatorAlert } from "@/lib/operator.functions";
import { fmtMoney } from "@/lib/currency";
import { BrainCircuit, AlertTriangle, CheckCircle2, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/_authenticated/operator")({
  component: OperatorPage,
  head: () => ({ meta: [{ title: "KI Operator — Market Inventory" }] }),
});

function OperatorPage() {
  const overviewFn = useServerFn(getOperatorOverview);
  const ackFn = useServerFn(acknowledgeOperatorAlert);
  const qc = useQueryClient();

  const q = useQuery(queryOptions({
    queryKey: ["operator-overview"],
    queryFn: () => overviewFn(),
    refetchInterval: 30_000,
  }));

  const ack = useMutation({
    mutationFn: (id: string) => ackFn({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["operator-overview"] }),
  });

  const data = q.data;

  return (
    <AppShell title="KI Operator">
      <div className="space-y-8">
        
        {/* HEADER CARD */}
        <GlassCard className="flex items-center justify-between p-6 md:p-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-600 shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center justify-center shrink-0 border border-white/20">
              <BrainCircuit className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-white drop-shadow-md">Continuous Market Intelligence</h2>
              <p className="text-sm font-medium text-slate-400 mt-1">Capital protection · break-even first · 24-hour normal horizon</p>
            </div>
          </div>
          <div>
            <CyberBadge variant={data?.settings.shadow_mode ? "warning" : "profit"}>
              {data?.settings.shadow_mode ? "Shadow Mode" : "Live Alerts"}
            </CyberBadge>
          </div>
        </GlassCard>

        {/* LOADING & ERROR STATES */}
        {!data && !q.error && (
          <GlassCard className="p-8 text-center">
            <p className="text-sm font-medium text-slate-400 animate-pulse">Connecting to KI matrix…</p>
          </GlassCard>
        )}
        
        {q.error && (
          <GlassCard className="p-8 border-rose-500/30 bg-rose-500/5">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle className="w-5 h-5" />
              <span className="text-sm font-bold">Apply the operator migration and start the worker.</span>
            </div>
          </GlassCard>
        )}

        {/* OPERATOR PLANS */}
        <div className="grid gap-6 lg:grid-cols-2">
          {data?.plans.map((p: any) => {
            const t = Array.isArray(p.market_inventory_trades) ? p.market_inventory_trades[0] : p.market_inventory_trades;
            const c = t?.currency ?? "NGN";
            return (
              <GlassCard key={p.id} className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <CyberBadge variant={p.action === "sell_now" ? "profit" : "info"}>
                      {p.action.replace("_", " ")}
                    </CyberBadge>
                    <h3 className="mt-3 text-lg font-black text-white tracking-tight">
                      {t?.remaining_amount} {t?.asset} <span className="text-slate-500 font-normal mx-2">·</span> {p.venue ?? "No venue"}
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-cyan-400 drop-shadow-[0_0_5px_rgba(6,182,212,0.5)]">
                      {p.confidence_eligible ? `${Number(p.confidence).toFixed(0)}% confidence` : "Calibrating"}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  <Metric label="Break-even" value={fmtMoney(Number(p.break_even_price), c)} />
                  <Metric label="Executable" value={p.executable_price ? fmtMoney(Number(p.executable_price), c) : "Unavailable"} />
                  <Metric label="Target" value={fmtMoney(Number(p.target_price), c)} />
                  <Metric label="Expected Net" value={p.expected_net == null ? "Unknown" : fmtMoney(Number(p.expected_net), c)} highlight={p.expected_net != null && Number(p.expected_net) > 0} />
                </div>

                <div className="rounded-xl bg-black/40 border border-white/5 p-4 shadow-inner">
                  <ul className="space-y-1.5 text-xs font-medium text-slate-300">
                    {(p.evidence ?? []).map((e: string) => <li key={e} className="flex gap-2"><span className="text-cyan-400 opacity-70">▹</span> {e}</li>)}
                  </ul>
                  {p.missing_data?.length > 0 && (
                    <p className="mt-3 text-xs font-bold text-amber-400 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" /> Missing: {p.missing_data.join(" · ")}
                    </p>
                  )}
                </div>
              </GlassCard>
            );
          })}
        </div>

        {/* ALERTS & HEALTH */}
        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
          <section>
            <h2 className="mb-4 text-sm font-black uppercase tracking-widest text-white drop-shadow-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" /> Active Alerts
            </h2>
            <div className="space-y-3">
              {data?.alerts.map((a: any) => (
                <GlassCard key={a.id} className="p-4 border-l-4 border-l-amber-500/50">
                  <div className="flex justify-between items-center gap-4">
                    <div>
                      <div className="text-sm font-bold text-white mb-1">{a.title}</div>
                      <p className="text-xs font-medium text-slate-400">{a.message}</p>
                    </div>
                    <CyberButton variant="ghost" onClick={() => ack.mutate(a.id)} className="text-xs text-amber-400 hover:text-amber-300">
                      Acknowledge
                    </CyberButton>
                  </div>
                </GlassCard>
              ))}
              {data?.alerts.length === 0 && (
                <GlassCard className="p-6 text-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 opacity-50 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-400">All clear. No active alerts.</p>
                </GlassCard>
              )}
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-sm font-black uppercase tracking-widest text-white drop-shadow-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Feed Health
            </h2>
            <GlassCard className="p-5">
              <div className="flex flex-col gap-2.5">
                {data?.health.map((h: any) => (
                  <div key={`${h.exchange}-${h.fiat}`} className="flex justify-between items-center bg-black/40 rounded-lg p-2.5 border border-white/5 shadow-inner">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">{h.exchange} {h.fiat}</span>
                    <CyberBadge variant={h.status === "healthy" ? "profit" : "warning"}>{h.status}</CyberBadge>
                  </div>
                ))}
              </div>
            </GlassCard>
          </section>
        </div>

      </div>
    </AppShell>
  );
}

function Metric({ label, value, highlight }: { label: string, value: string, highlight?: boolean }) {
  return (
    <div className="rounded-xl bg-black/40 border border-white/5 p-3 shadow-inner">
      <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">{label}</div>
      <div className={`text-sm font-black tracking-tight ${highlight ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]' : 'text-slate-200'}`}>
        {value}
      </div>
    </div>
  );
}
