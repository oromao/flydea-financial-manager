import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface PageHeaderProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  iconClassName?: string;
  children?: React.ReactNode;
  className?: string;
}

export function PageHeader({ icon: Icon, title, subtitle, iconClassName, children, className }: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col md:flex-row md:items-center justify-between gap-4", className)}>
      <div className="flex items-center gap-3">
        <div className={cn("p-3 rounded-2xl shadow-lg flex-shrink-0", iconClassName ?? "bg-primary text-on-primary shadow-primary/20")}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-on-background">{title}</h1>
          <p className="text-on-surface-variant font-medium text-sm mt-1">{subtitle}</p>
        </div>
      </div>
      {children && <div className="flex items-center gap-3 flex-wrap">{children}</div>}
    </div>
  );
}
