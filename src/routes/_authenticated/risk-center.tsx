import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/AppShell";
import { CyberBadge } from "@/components/ui/CyberBadge";
import { CyberButton } from "@/components/ui/CyberButton";
import { GlassCard } from "@/components/ui/GlassCard";
import { listRiskAlerts, dismissRiskAlert } from "@/lib/risk.functions";
import { toast } from "sonner";
import { ShieldAlert, AlertTriangle, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/_authenticated/risk-center")({
  head: () => ({ meta: [{ title: "Risk Center — KI Market Inventory" }] }),
  component: RiskCenter,
});

function toneFor(sev: string): "profit" | "loss" | "warning" | "info" {
  if (sev === "critical" || sev === "high") return "loss";
  if (sev === "medium") return "warning";
  return "info";
}

function RiskCenter() {
  const listFn = useServerFn(listRiskAlerts);
  const dismissFn = useServerFn(dismissRiskAlert);
  const qc = useQueryClient();
  const opts = queryOptions({ queryKey: ["risk-alerts"], queryFn: () => listFn() });
  const { data } = useSuspenseQuery(opts);
  const dismiss = useMutation({
    mutationFn: (id: string) => dismissFn({ data: { id } }),
    onSuccess: () => {
      toast.success("Alert dismissed");
      qc.invalidateQueries({ queryKey: ["risk-alerts"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const active = data.filter((a: any) => !a.dismissed_at);
  const dismissed = data.filter((a: any) => a.dismissed_at);

  return (
    <AppShell title="Risk Center">
      <div className="mb-8 flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 shadow-[0_0_20px_rgba(244,63,94,0.4)] flex items-center justify-center shrink-0 border border-white/20">
          <ShieldAlert className="w-6 h-6 text-white" />
        </div>
        <p className="text-sm font-medium text-slate-400 max-w-2xl mt-1">
          Risk alerts flag conditions that may hurt a trade: stale prices, thin liquidity, fees eating profit,
          merchants with weak history, network delays. Signals are estimates, not accusations — always verify
          before acting.
        </p>
      </div>

      <section className="mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-black uppercase tracking-widest text-white drop-shadow-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" /> Active Alerts
          </h2>
          <CyberBadge variant={active.length > 0 ? "warning" : "profit"}>
            {active.length} {active.length === 1 ? 'Alert' : 'Alerts'}
          </CyberBadge>
        </div>
        
        {active.length === 0 ? (
          <GlassCard className="p-12 text-center border-emerald-500/20 bg-emerald-500/5">
            <ShieldCheck className="w-12 h-12 text-emerald-400 mx-auto mb-4 opacity-80 drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
            <p className="text-sm font-bold text-slate-300">
              No active risk alerts. New alerts appear here when the system detects stale prices, thin
              liquidity, or profit erosion on tracked trades.
            </p>
          </GlassCard>
        ) : (
          <div className="space-y-4">
            {active.map((a: any) => (
              <GlassCard key={a.id} className="p-5 flex items-start gap-5 transition-all hover:border-white/20">
                <CyberBadge variant={toneFor(a.severity)} className="mt-0.5">
                  {a.severity}
                </CyberBadge>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-200">{a.message}</p>
                  <p className="mt-1.5 text-xs font-medium text-slate-500">
                    {new Date(a.created_at).toLocaleString()}
                  </p>
                </div>
                <CyberButton
                  variant="ghost"
                  onClick={() => dismiss.mutate(a.id)}
                  disabled={dismiss.isPending}
                  className="shrink-0"
                >
                  Dismiss
                </CyberButton>
              </GlassCard>
            ))}
          </div>
        )}
      </section>

      {dismissed.length > 0 && (
        <section className="mt-12">
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
            Recently Dismissed
          </h2>
          <div className="space-y-2">
            {dismissed.slice(0, 20).map((a: any) => (
              <div key={a.id} className="rounded-xl border border-white/5 bg-black/40 p-4 text-sm text-slate-400 shadow-inner flex items-center gap-3">
                <CyberBadge variant="default" className="opacity-50">
                  {a.severity}
                </CyberBadge>
                <span className="font-medium opacity-70">{a.message}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </AppShell>
  );
}
