import React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface PageHeaderProps {
  title: string;
  description?: React.ReactNode;
  icon?: LucideIcon;
  className?: string;
  children?: React.ReactNode;
}

export function PageHeader({
  title,
  description,
  icon: Icon,
  className,
  children,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8",
        className,
      )}
    >
      <div>
        <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-3">
          {Icon && <Icon className="w-6 h-6 md:w-8 md:h-8 text-cyan-400" />}
          {title}
        </h1>
        {description && (
          <p className="text-slate-400 font-medium mt-2 max-w-2xl text-sm leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {children && <div className="flex items-center gap-3 shrink-0">{children}</div>}
    </div>
  );
}
