import { cn } from "@/lib/utils";
import React from "react";

interface CyberButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
}

export const CyberButton = React.forwardRef<HTMLButtonElement, CyberButtonProps>(
  ({ className, variant = "primary", ...props }, ref) => {
    const base = "relative inline-flex items-center justify-center px-4 py-2 text-sm font-bold rounded-xl transition-all duration-200 active:translate-y-[2px] disabled:opacity-50 disabled:cursor-not-allowed";
    
    const variants = {
      primary: "text-black bg-gradient-to-r from-cyan-400 to-purple-500 shadow-[inset_0_2px_4px_rgba(255,255,255,0.8),0_5px_15px_rgba(147,51,234,0.3)] hover:shadow-[inset_0_2px_4px_rgba(255,255,255,0.8),0_10px_20px_rgba(6,182,212,0.4)] active:shadow-[inset_0_1px_2px_rgba(0,0,0,0.4),0_2px_5px_rgba(0,0,0,0.5)]",
      secondary: "text-white bg-slate-800 border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_4px_10px_rgba(0,0,0,0.3)] hover:bg-slate-700 active:shadow-[inset_0_1px_1px_rgba(0,0,0,0.2)]",
      danger: "text-rose-100 bg-rose-500/20 border border-rose-500/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_4px_10px_rgba(225,29,72,0.2)] hover:bg-rose-500/30 hover:border-rose-500/60 active:shadow-[inset_0_1px_1px_rgba(0,0,0,0.2)]",
      ghost: "text-slate-400 hover:text-white hover:bg-white/5 active:bg-white/10 shadow-none border border-transparent",
    };

    return (
      <button ref={ref} className={cn(base, variants[variant], className)} {...props} />
    );
  }
);
CyberButton.displayName = "CyberButton";
