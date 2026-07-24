import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { StatCard } from "@/components/StatCard";
import { CyberBadge } from "@/components/ui/CyberBadge";
import { GlassCard } from "@/components/ui/GlassCard";
import { Wallet, Coins } from "lucide-react";

export const Route = createFileRoute("/_authenticated/wallet")({
  head: () => ({ meta: [{ title: "Smaisika Wallet — KI Market Inventory" }] }),
  component: WalletPage,
});

function WalletPage() {
  return (
    <AppShell title="Smaisika Wallet">
      <div className="max-w-3xl">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 shadow-[0_0_20px_rgba(251,191,36,0.4)] flex items-center justify-center shrink-0 border border-white/20">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-xl font-black text-white drop-shadow-md tracking-tight">Ecosystem Ledger</h2>
              <CyberBadge variant="warning">Coming soon</CyberBadge>
            </div>
            <p className="text-sm font-medium text-slate-400">
              Smaisika is the Konsmik ecosystem credit — not a currency for withdrawing funds.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-3">
          <StatCard label="Balance" value="—" hint="Ledger not yet enabled" />
          <StatCard label="Lifetime spent" value="—" />
          <StatCard label="Burned today" value="—" />
        </div>

        <GlassCard className="mt-8 p-6 lg:p-8">
          <h2 className="text-sm font-black uppercase tracking-widest text-white drop-shadow-sm flex items-center gap-2 mb-4">
            <Coins className="w-4 h-4 text-amber-400" /> What Smaisika is used for
          </h2>
          <div className="rounded-xl bg-black/40 border border-white/5 p-4 shadow-inner mb-4">
            <ul className="space-y-2 text-sm font-medium text-slate-300">
              <li className="flex items-center gap-2">
                <span className="text-amber-400">▹</span> KI chat messages beyond your free quota
              </li>
              <li className="flex items-center gap-2">
                <span className="text-amber-400">▹</span> Premium scans and deep reports
              </li>
              <li className="flex items-center gap-2">
                <span className="text-amber-400">▹</span> Data exports, alerts, extended storage
              </li>
            </ul>
          </div>
          <p className="text-xs font-medium text-slate-500 leading-relaxed">
            When the ledger goes live every charge, refund, and grant is recorded with balance-before and
            balance-after. Failed jobs auto-refund. You will always see the cost before confirming.
          </p>
        </GlassCard>
      </div>
    </AppShell>
  );
}
