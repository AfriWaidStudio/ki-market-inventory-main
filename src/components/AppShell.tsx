import { Link, useNavigate, useRouter } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { type ReactNode } from "react";
import { useAuth } from "@/lib/auth";
import { motion } from "framer-motion";
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
  { to: "/notifications", label: "Notifications", icon: Bell },
  { to: "/help", label: "Help", icon: LifeBuoy },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function AppShell({ children, title }: { children: ReactNode; title?: string }) {
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
    <div className="h-screen w-screen flex bg-[#030712] text-slate-200 selection:bg-cyan-500/30 overflow-hidden relative font-sans">
      
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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-600 shadow-[0_0_15px_rgba(6,182,212,0.4)] border border-white/20 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-cyan-400 font-black text-sm tracking-widest uppercase flex items-center gap-2">
                Waides KI <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_5px_rgba(6,182,212,0.8)]" />
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
              activeProps={{ className: "bg-gradient-to-r from-cyan-500/20 to-purple-500/10 text-cyan-300 border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]" }}
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
      <div className="flex-1 flex flex-col min-w-0 z-10 relative h-screen overflow-y-auto">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/10 px-6 py-4 bg-slate-900/60 backdrop-blur-2xl shadow-sm">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white drop-shadow-md">{title ?? "Command Center"}</h1>
            <p className="text-sm font-medium text-slate-400 mt-1 flex items-center gap-2">
              <ShieldAlert className="w-3.5 h-3.5 text-purple-400" />
              Tracking & decision support — zero auto-execution
            </p>
          </div>
          <div className="flex md:hidden gap-2 overflow-x-auto max-w-[50vw] pb-1 scrollbar-hide">
            {NAV.map(({ to, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className="rounded-xl p-3 text-slate-400 hover:bg-white/10 border border-transparent active:border-white/10"
                activeProps={{ className: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30" }}
              >
                <Icon className="h-5 w-5" />
              </Link>
            ))}
            <button onClick={signOut} className="rounded-xl p-3 text-rose-400 hover:bg-rose-500/20 ml-2">
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </header>
        
        <main className="flex-1 min-w-0 p-4 md:p-8 relative">
          {children}
        </main>
      </div>
    </div>
  );
}
