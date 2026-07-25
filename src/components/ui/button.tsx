import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        cyber:
          "text-black bg-gradient-to-r from-cyan-400 to-purple-500 shadow-[inset_0_2px_4px_rgba(255,255,255,0.8),0_5px_15px_rgba(147,51,234,0.3)] hover:shadow-[inset_0_2px_4px_rgba(255,255,255,0.8),0_10px_20px_rgba(6,182,212,0.4)] active:shadow-[inset_0_1px_2px_rgba(0,0,0,0.4),0_2px_5px_rgba(0,0,0,0.5)]",
        "cyber-secondary":
          "text-white bg-slate-800 border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_4px_10px_rgba(0,0,0,0.3)] hover:bg-slate-700 active:shadow-[inset_0_1px_1px_rgba(0,0,0,0.2)]",
        "cyber-danger":
          "text-rose-100 bg-rose-500/20 border border-rose-500/40 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_4px_10px_rgba(225,29,72,0.2)] hover:bg-rose-500/30 hover:border-rose-500/60 active:shadow-[inset_0_1px_1px_rgba(0,0,0,0.2)]",
        "cyber-ghost":
          "text-slate-400 hover:text-white hover:bg-white/5 active:bg-white/10 shadow-none border border-transparent",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
