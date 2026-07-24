import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { GlassCard } from "@/components/ui/GlassCard";
import { HelpCircle, ShieldCheck, Zap, Info } from "lucide-react";

export const Route = createFileRoute("/_authenticated/help")({
  head: () => ({ meta: [{ title: "Help & Safety — KI Market Inventory" }] }),
  component: HelpPage,
});

function HelpPage() {
  return (
    <AppShell title="Help & Safety">
      <div className="max-w-3xl space-y-8">
        
        <GlassCard className="p-6">
          <h2 className="text-sm font-black uppercase tracking-widest text-white drop-shadow-sm flex items-center gap-2 mb-4">
            <Info className="w-4 h-4 text-cyan-400" /> What this app does
          </h2>
          <p className="text-sm font-medium text-slate-400 leading-relaxed">
            KI Market Inventory is a personal tracker and decision-support workspace for P2P and arbitrage
            trades. It never executes trades, moves funds, or connects with trading permissions. All
            recommendations are probabilistic — never guaranteed outcomes.
          </p>
        </GlassCard>

        <GlassCard className="p-6">
          <h2 className="text-sm font-black uppercase tracking-widest text-white drop-shadow-sm flex items-center gap-2 mb-4">
            <Zap className="w-4 h-4 text-purple-400" /> Getting started
          </h2>
          <ol className="list-decimal pl-5 space-y-3 text-sm font-medium text-slate-400 marker:text-purple-400 marker:font-black">
            <li>Set your reporting currency in <Link to="/settings" className="text-cyan-400 hover:underline">Settings</Link>.</li>
            <li>Log a manual opportunity in the <Link to="/scanner" className="text-cyan-400 hover:underline">Scanner</Link>.</li>
            <li>Mark it as bought to move it into <Link to="/trades" className="text-cyan-400 hover:underline">Active Trades</Link>.</li>
            <li>Close it with actual sell price and fees to build your <Link to="/journal" className="text-cyan-400 hover:underline">Journal</Link>.</li>
            <li>Ask <Link to="/chat" className="text-cyan-400 hover:underline">Waides KI</Link> questions grounded in your real data.</li>
          </ol>
        </GlassCard>

        <GlassCard className="p-6">
          <h2 className="text-sm font-black uppercase tracking-widest text-white drop-shadow-sm flex items-center gap-2 mb-4">
            <ShieldCheck className="w-4 h-4 text-emerald-400" /> Safety principles
          </h2>
          <ul className="list-disc pl-5 space-y-3 text-sm font-medium text-slate-400 marker:text-emerald-400">
            <li>API keys, when connected, must be read-only. The app rejects trading permissions.</li>
            <li>Secrets are encrypted server-side and never returned to the browser.</li>
            <li>All trade data is scoped to your account and inaccessible to other users.</li>
            <li>KI answers only from your authorized data; it will say when information is missing or stale.</li>
          </ul>
        </GlassCard>

        <GlassCard className="p-6 border-l-4 border-l-rose-500/50 bg-rose-500/5">
          <h2 className="text-sm font-black uppercase tracking-widest text-white drop-shadow-sm flex items-center gap-2 mb-4">
            <HelpCircle className="w-4 h-4 text-rose-400" /> Not financial advice
          </h2>
          <p className="text-sm font-medium text-slate-400 leading-relaxed">
            Nothing in this product is financial, investment, tax, or legal advice. Verify prices, fees,
            and merchant conditions on the exchange before acting.
          </p>
        </GlassCard>

      </div>
    </AppShell>
  );
}
