import { cn } from "@/lib/utils";
import React from "react";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function GlassCard({ children, className, ...props }: GlassCardProps) {
  return (
    <div
      className={cn(
        "relative group overflow-hidden rounded-[2rem] bg-slate-900/50 backdrop-blur-xl p-6 lg:p-8 border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_15px_35px_rgba(0,0,0,0.5)] transition-all",
        className
      )}
      {...props}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
