import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { m, useScroll, useTransform } from "framer-motion";
import {
  ShieldCheck,
  ArrowRight,
  Lock,
  Zap,
  RefreshCw,
  Bell,
  Activity,
  BrainCircuit,
} from "lucide-react";
import { Button } from "@/components/ui/button";

import syncImg from "@/assets/illustrations/sync_illustration_1784950206924.png";
import alertsImg from "@/assets/illustrations/alerts_illustration_1784950219379.png";
import journalImg from "@/assets/illustrations/journal_illustration_1784950232197.png";
import detectionImg from "@/assets/illustrations/detection_illustration_1784950245333.png";

const features = [
  {
    id: "sync",
    icon: RefreshCw,
    image: syncImg,
    title: "Universal Exchange Sync",
    description:
      "Connect OKX, KuCoin, Bitget, Binance, and Bybit. KI polls 24/7 in the background without needing your browser open.",
    size: "col-span-1 md:col-span-2 row-span-2",
  },
  {
    id: "alerts",
    icon: Bell,
    image: alertsImg,
    title: "Instant Telegram Alerts",
    description:
      "Push notifications for high-confidence arbitrage routes and P2P spreads straight to your phone.",
    size: "col-span-1 md:col-span-1 row-span-1",
  },
  {
    id: "journal",
    icon: BrainCircuit,
    image: journalImg,
    title: "Psychological AI Journal",
    description:
      "Log your emotional state before trades. KI analyzes your risk and forces breaks when necessary.",
    size: "col-span-1 md:col-span-1 row-span-1",
  },
  {
    id: "detection",
    icon: Activity,
    image: detectionImg,
    title: "Arbitrage Detection Engine",
    description:
      "Automated detection of cross-exchange spreads and fiat/crypto legs for maximum profit.",
    size: "col-span-1 md:col-span-2 row-span-1",
  },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading && isAuthenticated) void navigate({ to: "/dashboard" });
  }, [isAuthenticated, loading, navigate]);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans overflow-hidden">
      {/* Subtle background match dashboard */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-background to-background opacity-50" />

      {/* TOP NAVIGATION */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-card border border-border flex items-center justify-center">
            <Zap className="w-4 h-4 text-primary" fill="currentColor" />
          </div>
          <span className="font-semibold tracking-wide">KI Market</span>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/auth">
            <Button variant="ghost" className="hidden sm:flex">
              Log In
            </Button>
          </Link>
          <Link to="/auth">
            <Button>Sign Up</Button>
          </Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative pt-40 pb-20 lg:pt-56 lg:pb-32 z-10 px-6 min-h-[85vh] flex flex-col items-center justify-center">
        <div className="max-w-4xl mx-auto text-center">
          <m.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-secondary text-secondary-foreground text-sm font-medium mb-8 border border-border"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Tracking-only platform. Zero auto-execution.</span>
          </m.div>

          <m.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold tracking-tight mb-6 text-white"
          >
            The Operating System <br className="hidden md:block" />
            for Crypto Arbitrage.
          </m.h1>

          <m.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Monitor OKX, KuCoin, Bitget, Binance, and Bybit 24/7. Get instant Telegram alerts.
            Prevent revenge trading with AI psychological scoring.
          </m.p>

          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link to="/auth">
              <Button size="lg" className="w-full sm:w-auto text-base">
                Launch Platform
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </m.div>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section className="relative py-24 z-10 px-6 bg-secondary/20 border-y border-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">
              Platform Capabilities
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to find, track, and master arbitrage spreads.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 auto-rows-[280px] gap-6">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <m.div
                  key={feature.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className={`relative group rounded-xl overflow-hidden bg-card border border-border flex flex-col p-6 ${feature.size}`}
                >
                  <div className="relative z-20 h-full flex flex-col items-start justify-between">
                    <div className="w-10 h-10 rounded bg-secondary flex items-center justify-center border border-border mb-4">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>

                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-40 h-40 opacity-20 pointer-events-none mix-blend-screen transition-opacity group-hover:opacity-30">
                      <img
                        src={feature.image}
                        alt={feature.title}
                        className="w-full h-full object-contain grayscale"
                      />
                    </div>

                    <div className="mt-auto z-30">
                      <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </m.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SECURITY SECTION */}
      <section className="relative py-24 z-10 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-16 h-16 mx-auto bg-card rounded-xl border border-border flex items-center justify-center mb-8">
            <Lock className="w-8 h-8 text-primary" />
          </div>

          <h2 className="text-3xl md:text-4xl font-semibold mb-6">Fort Knox Security</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-12">
            Your API keys are encrypted at rest. We request strictly read-only access. The platform
            physically cannot withdraw or execute trades.
          </p>

          <div className="grid md:grid-cols-2 gap-6 text-left">
            {[
              {
                title: "AES-256 Encrypted Passphrases",
                desc: "Military grade database encryption for all API keys, secrets, and passphrases.",
              },
              {
                title: "Isolated Read-Only Access",
                desc: "The platform only connects to read-only endpoints. It cannot physically withdraw your capital.",
              },
            ].map((item, i) => (
              <div key={i} className="bg-card border border-border rounded-xl p-6">
                <h3 className="text-base font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER CTA */}
      <section className="relative py-24 z-10 px-6 border-t border-border bg-secondary/10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-semibold mb-8">Start Tracking Today.</h2>
          <Link to="/auth">
            <Button size="lg" className="text-base px-8 py-6">
              Create Your Command Center
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
