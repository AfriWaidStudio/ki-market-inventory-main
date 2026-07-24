import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  hint,
  tone = "default",
  className,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "profit" | "loss" | "warning";
  className?: string;
}) {
  const map = {
    default: {
      text: "text-white",
      glow: "group-hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]",
      border: "border-white/10 hover:border-white/20",
    },
    profit: {
      text: "text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.4)]",
      glow: "group-hover:shadow-[0_0_20px_rgba(52,211,153,0.15)]",
      border: "border-emerald-500/20 hover:border-emerald-500/40",
    },
    loss: {
      text: "text-rose-400 drop-shadow-[0_0_10px_rgba(251,113,133,0.4)]",
      glow: "group-hover:shadow-[0_0_20px_rgba(251,113,133,0.15)]",
      border: "border-rose-500/20 hover:border-rose-500/40",
    },
    warning: {
      text: "text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.4)]",
      glow: "group-hover:shadow-[0_0_20px_rgba(251,191,36,0.15)]",
      border: "border-amber-500/20 hover:border-amber-500/40",
    },
  };

  const style = map[tone];

  return (
    <div className={cn(
      "group relative overflow-hidden rounded-2xl bg-slate-900/50 backdrop-blur-xl p-5 transition-all duration-300",
      "shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_8px_20px_rgba(0,0,0,0.4)] hover:-translate-y-1",
      style.border,
      style.glow,
      className
    )}>
      {/* Glossy overlay effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      
      <div className="relative z-10">
        <div className="text-xs font-bold uppercase tracking-widest text-slate-400 drop-shadow-sm">{label}</div>
        <div className={cn("mt-3 text-3xl font-black tabular-nums tracking-tight", style.text)}>{value}</div>
        {hint && <div className="mt-2 text-xs font-medium text-slate-500">{hint}</div>}
      </div>
    </div>
  );
}

export function Badge({
  children,
  tone = "default",
}: {
  children: React.ReactNode;
  tone?: "default" | "profit" | "loss" | "warning" | "info";
}) {
  const map = {
    default: "bg-slate-800/80 text-slate-300 border-white/10",
    profit: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(52,211,153,0.1)]",
    loss: "bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_10px_rgba(251,113,133,0.1)]",
    warning: "bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_10px_rgba(251,191,36,0.1)]",
    info: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20 shadow-[0_0_10px_rgba(6,182,212,0.1)]",
  } as const;
  
  return (
    <span className={cn(
      "inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-bold border backdrop-blur-md", 
      map[tone]
    )}>
      {children}
    </span>
  );
}
