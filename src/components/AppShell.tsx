import { Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { type ReactNode } from "react";
import { useAuth } from "@/lib/auth";
import { m, AnimatePresence } from "framer-motion";
import { PageHeader } from "@/components/PageHeader";
import {
  LayoutDashboard,
  Radar,
  Activity,
  History,
  BarChart3,
  MessageSquare,
  Settings,
  LogOut,
  ShieldAlert,
  BookOpen,
  Search,
  Wallet,
  Bell,
  LifeBuoy,
  BrainCircuit,
  Send,
  Zap,
  CreditCard,
} from "lucide-react";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/operator", label: "KI Operator", icon: BrainCircuit },
  { to: "/telegram", label: "Telegram KI", icon: Send },
  { to: "/scanner", label: "Scanner", icon: Radar },
  { to: "/trades", label: "Active Trades", icon: Activity },
  { to: "/history", label: "History", icon: History },
  { to: "/journal", label: "Journal", icon: BookOpen },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/risk-center", label: "Risk Center", icon: ShieldAlert },
  { to: "/chat", label: "Ask KI", icon: MessageSquare },
  { to: "/search", label: "Search", icon: Search },
  { to: "/wallet", label: "Smaisika", icon: Wallet },
  { to: "/billing", label: "Billing & Tiers", icon: CreditCard },
  { to: "/notifications", label: "Notifications", icon: Bell },
  { to: "/help", label: "Help", icon: LifeBuoy },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function AppShell({
  children,
  title,
  description,
  icon,
  headerActions,
}: {
  children: ReactNode;
  title?: string;
  description?: React.ReactNode;
  icon?: any;
  headerActions?: React.ReactNode;
}) {
  const navigate = useNavigate();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { signOut: endSession } = useAuth();

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await endSession();
    await router.invalidate();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="h-[100dvh] w-screen flex bg-[#030712] text-slate-200 selection:bg-cyan-500/30 overflow-hidden relative font-sans">
      {/* GLOBAL 3D LIGHTING & MESH BACKGROUND */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-600/10 blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[10%] w-[50%] h-[50%] rounded-full bg-purple-700/10 blur-[150px] mix-blend-screen" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] mix-blend-overlay" />
      </div>

      {/* SIDEBAR */}
      <aside className="hidden md:flex md:w-64 shrink-0 flex-col z-20 bg-slate-900/40 backdrop-blur-2xl border-r border-white/10 shadow-[4px_0_24px_rgba(0,0,0,0.5)]">
        <div className="px-6 py-6 border-b border-white/5 bg-black/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-600 shadow-glow-cyan border border-white/20 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-cyan-400 font-black text-sm tracking-widest uppercase flex items-center gap-2">
                Waides KI{" "}
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_5px_rgba(6,182,212,0.8)]" />
              </div>
              <div className="mt-0.5 text-xs text-slate-400 font-medium">Market Inventory</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto scrollbar-hide">
          {NAV.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-white transition-all group border border-transparent hover:border-white/5"
              activeProps={{
                className:
                  "bg-gradient-to-r from-cyan-500/20 to-purple-500/10 text-cyan-300 border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]",
              }}
            >
              <Icon className="h-5 w-5 opacity-70 group-hover:opacity-100 group-hover:text-cyan-400 transition-colors" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5 bg-black/20">
          <button
            onClick={signOut}
            className="w-full flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 border border-transparent hover:border-rose-500/20 transition-all active:translate-y-[1px]"
          >
            <LogOut className="h-4 w-4" /> Sign Out Securely
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 z-10 relative h-[100dvh] overflow-y-auto">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/10 px-4 md:px-6 py-3 md:py-4 bg-slate-900/60 backdrop-blur-2xl shadow-sm">
          <PageHeader
            title={title ?? "Command Center"}
            description={
              description ?? (
                <span className="flex items-center gap-2 text-xs md:text-sm">
                  <ShieldAlert className="w-3.5 h-3.5 text-purple-400" />
                  <span className="hidden sm:inline">Tracking & decision support — </span>zero
                  auto-execution
                </span>
              )
            }
            icon={icon}
            className="mb-0 gap-0"
          >
            {headerActions}
          </PageHeader>
        </header>
        <main className="flex-1 min-w-0 p-4 md:p-8 relative overflow-x-hidden pb-24 md:pb-8">
          <AnimatePresence mode="wait">
            <m.div
              key={router.state.location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="h-full"
            >
              {children}
            </m.div>
          </AnimatePresence>
        </main>

        {/* MOBILE BOTTOM NAV */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900/90 backdrop-blur-2xl border-t border-white/10 p-2 flex overflow-x-auto gap-1 pb-safe scrollbar-hide shadow-[0_-10px_40px_rgba(0,0,0,0.5)] supports-[padding:max(0px)]:pb-[max(8px,env(safe-area-inset-bottom))]">
          {NAV.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="flex flex-col items-center justify-center gap-1 min-w-[4.5rem] p-2 rounded-xl text-slate-400 hover:bg-white/5 active:bg-white/10 transition-colors"
              activeProps={{ className: "text-cyan-400 bg-cyan-500/10" }}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[9px] font-medium whitespace-nowrap">{label}</span>
            </Link>
          ))}
          <button
            onClick={signOut}
            className="flex flex-col items-center justify-center gap-1 min-w-[4.5rem] p-2 rounded-xl text-rose-400/70 hover:bg-rose-500/10 active:bg-rose-500/20 transition-colors ml-1 border-l border-white/5"
          >
            <LogOut className="w-5 h-5 mb-0.5" />
            <span className="text-[9px] font-medium whitespace-nowrap">Sign Out</span>
          </button>
        </nav>
      </div>
    </div>
  );
}
