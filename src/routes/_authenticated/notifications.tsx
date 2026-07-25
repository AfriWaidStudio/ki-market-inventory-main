import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Bell, BellRing, ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/_authenticated/notifications")({
  head: () => ({ meta: [{ title: "Notifications — KI Market Inventory" }] }),
  component: NotificationsPage,
});

function NotificationsPage() {
  return (
    <AppShell
      title="Notifications"
      description="Recent system alerts and trading signals."
      icon={Bell}
    >
      <div className="max-w-2xl space-y-6">
        <Card variant="glass" className="p-6">
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
                <strong className="text-white">Push</strong> — opt-in for time-sensitive
                opportunities
              </li>
            </ul>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
