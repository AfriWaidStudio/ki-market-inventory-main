import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { CreditCard, Wallet, Zap, Shield, Crown, RefreshCw } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getWalletBalance, getSubscriptionStatus, initializePaystackPayment, upgradeTier } from "@/lib/billing.functions";

export const Route = createFileRoute("/_authenticated/billing")({
  component: BillingPage,
});

function BillingPage() {
  const qc = useQueryClient();
  const getWalletFn = useServerFn(getWalletBalance);
  const getSubFn = useServerFn(getSubscriptionStatus);
  const initPaystackFn = useServerFn(initializePaystackPayment);
  const upgradeTierFn = useServerFn(upgradeTier);

  const { data: wallet } = useQuery({
    queryKey: ["wallet"],
    queryFn: () => getWalletFn(),
  });

  const { data: subscription } = useQuery({
    queryKey: ["subscription"],
    queryFn: () => getSubFn(),
  });

  const [amount, setAmount] = useState("5000");
  const [funding, setFunding] = useState(false);

  const handleFund = async () => {
    try {
      setFunding(true);
      const res = await initPaystackFn(Number(amount));
      if (res.authorization_url) {
        window.location.href = res.authorization_url;
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to initialize payment");
      setFunding(false);
    }
  };

  const handleUpgrade = async (tier: "pro" | "elite") => {
    try {
      await upgradeTierFn(tier);
      toast.success(`Successfully upgraded to ${tier.toUpperCase()}`);
      qc.invalidateQueries({ queryKey: ["wallet"] });
      qc.invalidateQueries({ queryKey: ["subscription"] });
    } catch (e: any) {
      toast.error(e.message || "Failed to upgrade");
    }
  };

  return (
    <AppShell
      title="Billing & Tiers"
      description="Manage your KI credits, subscription tiers, and wallets."
      icon={CreditCard}
    >
      <div className="grid gap-6 lg:grid-cols-3 max-w-6xl">
        
        {/* Wallet Section */}
        <Card variant="glass" className="p-6 lg:col-span-3 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h2 className="text-sm font-black uppercase tracking-widest text-white drop-shadow-sm flex items-center gap-2 mb-2">
              <Wallet className="w-5 h-5 text-cyan-400" /> KI Wallet Balance
            </h2>
            <p className="text-slate-400 text-sm max-w-md">
              Fund your wallet using Paystack or Crypto. Your wallet balance is used to pay for KI Intelligence credits and Pro/Elite tier subscriptions.
            </p>
          </div>
          <div className="flex items-center gap-6 w-full md:w-auto bg-black/40 p-4 rounded-xl border border-white/5 shadow-inner">
            <div className="text-right">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Available Funds</p>
              <p className="text-3xl font-black text-white">₦{Number(wallet?.balance_fiat || 0).toLocaleString()}</p>
            </div>
            <div className="flex flex-col gap-2">
              <Input 
                type="number" 
                value={amount} 
                onChange={e => setAmount(e.target.value)} 
                className="w-32 bg-black/60 text-right"
              />
              <Button 
                onClick={handleFund} 
                disabled={funding}
                className="bg-cyan-500 hover:bg-cyan-600 text-black font-bold"
              >
                {funding ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : null}
                Fund Account
              </Button>
            </div>
          </div>
        </Card>

        {/* Basic Tier */}
        <Card variant="glass" className="p-6 border-slate-700 relative overflow-hidden">
          {subscription?.tier === "free" && (
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-slate-400 to-slate-600" />
          )}
          <h3 className="text-xl font-bold text-white mb-2">Basic</h3>
          <p className="text-3xl font-black text-white mb-4">Free</p>
          <ul className="space-y-3 text-sm text-slate-400 font-medium mb-6">
            <li className="flex items-center gap-2"><Shield className="w-4 h-4 text-emerald-400"/> Manual Exchange Sync</li>
            <li className="flex items-center gap-2"><Shield className="w-4 h-4 text-emerald-400"/> 10 KI Prompts / month</li>
            <li className="flex items-center gap-2"><Shield className="w-4 h-4 text-slate-600"/> No Auto-Trading</li>
          </ul>
          <Button disabled className="w-full bg-slate-800 text-slate-400">
            {subscription?.tier === "free" ? "Current Plan" : "Downgrade"}
          </Button>
        </Card>

        {/* Pro Tier */}
        <Card variant="glass" className="p-6 border-cyan-500/30 relative overflow-hidden transform md:-translate-y-4 shadow-[0_0_40px_rgba(6,182,212,0.1)]">
          {subscription?.tier === "pro" && (
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-blue-600" />
          )}
          <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
            Pro <Zap className="w-4 h-4 text-cyan-400 fill-cyan-400" />
          </h3>
          <p className="text-3xl font-black text-white mb-4">₦5,000<span className="text-sm font-normal text-slate-500"> /mo</span></p>
          <ul className="space-y-3 text-sm text-slate-400 font-medium mb-6">
            <li className="flex items-center gap-2"><Shield className="w-4 h-4 text-cyan-400"/> Auto Exchange Sync</li>
            <li className="flex items-center gap-2"><Shield className="w-4 h-4 text-cyan-400"/> Unlimited KI Prompts</li>
            <li className="flex items-center gap-2"><Shield className="w-4 h-4 text-cyan-400"/> Real-time Arbitrage Alerts</li>
          </ul>
          <Button 
            onClick={() => handleUpgrade("pro")}
            disabled={subscription?.tier === "pro"}
            className="w-full bg-cyan-500 hover:bg-cyan-600 text-black font-bold"
          >
            {subscription?.tier === "pro" ? "Current Plan" : "Upgrade to Pro"}
          </Button>
        </Card>

        {/* Elite Tier */}
        <Card variant="glass" className="p-6 border-purple-500/30 relative overflow-hidden">
          {subscription?.tier === "elite" && (
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 to-pink-600" />
          )}
          <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
            Elite <Crown className="w-4 h-4 text-purple-400 fill-purple-400" />
          </h3>
          <p className="text-3xl font-black text-white mb-4">₦25,000<span className="text-sm font-normal text-slate-500"> /mo</span></p>
          <ul className="space-y-3 text-sm text-slate-400 font-medium mb-6">
            <li className="flex items-center gap-2"><Shield className="w-4 h-4 text-purple-400"/> Everything in Pro</li>
            <li className="flex items-center gap-2"><Shield className="w-4 h-4 text-purple-400"/> 1-Click Auto Execution</li>
            <li className="flex items-center gap-2"><Shield className="w-4 h-4 text-purple-400"/> VIP Support</li>
          </ul>
          <Button 
            onClick={() => handleUpgrade("elite")}
            disabled={subscription?.tier === "elite"}
            className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold"
          >
            {subscription?.tier === "elite" ? "Current Plan" : "Upgrade to Elite"}
          </Button>
        </Card>
      </div>
    </AppShell>
  );
}
