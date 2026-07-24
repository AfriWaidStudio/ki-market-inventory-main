import { cn } from "@/lib/utils";
import React from "react";

export interface CyberBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "profit" | "loss" | "warning" | "info";
}

export const CyberBadge = React.forwardRef<HTMLSpanElement, CyberBadgeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const map = {
      default: "bg-slate-800/80 text-slate-300 border-white/10",
      profit: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(52,211,153,0.1)]",
      loss: "bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_10px_rgba(251,113,133,0.1)]",
      warning: "bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_10px_rgba(251,191,36,0.1)]",
      info: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20 shadow-[0_0_10px_rgba(6,182,212,0.1)]",
    } as const;

    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-bold border backdrop-blur-md uppercase tracking-wider",
          map[variant],
          className
        )}
        {...props}
      />
    );
  }
);
CyberBadge.displayName = "CyberBadge";
