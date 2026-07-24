import { cn } from "@/lib/utils";
import React from "react";

export interface CyberInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const CyberInput = React.forwardRef<HTMLInputElement, CyberInputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white shadow-inner focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all font-medium placeholder:text-slate-500",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
CyberInput.displayName = "CyberInput";
