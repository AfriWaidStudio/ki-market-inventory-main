import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { CyberBadge } from "@/components/ui/CyberBadge";
import { GlassCard } from "@/components/ui/GlassCard";
import { BellRing, ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/_authenticated/notifications")({
  head: () => ({ meta: [{ title: "Notifications — KI Market Inventory" }] }),
  component: NotificationsPage,
});

function NotificationsPage() {
  return (
    <AppShell title="Notifications">
      <div className="max-w-2xl space-y-6">
        <div className="flex items-start gap-4 mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 shadow-[0_0_20px_rgba(251,191,36,0.4)] flex items-center justify-center shrink-0 border border-white/20">
            <BellRing className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-xl font-black text-white drop-shadow-md tracking-tight">Comms Relay</h2>
              <CyberBadge variant="warning">Coming soon</CyberBadge>
            </div>
            <p className="text-sm font-medium text-slate-400">
              Notification channels (email, push, in-app) and quiet hours are not yet enabled. Active risk
              signals appear on the{" "}
              <a href="/risk-center" className="text-cyan-400 font-bold hover:underline">
                Risk Center
              </a>{" "}
              in the meantime.
            </p>
          </div>
        </div>

        <GlassCard className="p-6">
          <h2 className="text-sm font-black uppercase tracking-widest text-white drop-shadow-sm mb-4">
            Planned Channels
          </h2>
          <div className="rounded-xl bg-black/40 border border-white/5 p-4 shadow-inner">
            <ul className="space-y-3 text-sm font-medium text-slate-300">
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_5px_rgba(6,182,212,0.8)]"></span> 
                <strong className="text-white">Email</strong> — daily digest, critical risk alerts
              </li>
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_5px_rgba(6,182,212,0.8)]"></span> 
                <strong className="text-white">In-app</strong> — real-time alerts while browsing
              </li>
              <li className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_5px_rgba(6,182,212,0.8)]"></span> 
                <strong className="text-white">Push</strong> — opt-in for time-sensitive opportunities
              </li>
            </ul>
          </div>
        </GlassCard>
      </div>
    </AppShell>
  );
}
