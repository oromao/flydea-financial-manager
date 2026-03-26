"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ReceiptText, BarChart3, CreditCard, Target } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Início", href: "/", icon: LayoutDashboard },
  { name: "Fluxo", href: "/movimentacoes", icon: ReceiptText },
  { name: "Contas", href: "/contas", icon: CreditCard },
  { name: "Metas", href: "/orcamentos", icon: Target },
  { name: "Relatórios", href: "/relatorios", icon: BarChart3 },
];

export function BottomNav() {
  const pathname = usePathname();

  if (pathname === '/login') return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-surface border-t border-outline/20 px-4 pb-safe pt-2 h-16 shadow-lg">
      <div className="flex items-center justify-around h-full max-w-lg mx-auto relative gap-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 transition-all duration-200 relative py-1 rounded-lg flex-1",
                isActive ? "text-primary font-semibold" : "text-on-surface-variant hover:text-on-surface"
              )}
            >
              {isActive && (
                <div className="absolute inset-0 bg-surface-variant/50 rounded-lg -z-10 animate-in fade-in zoom-in-95 duration-200"></div>
              )}
              <Icon className={cn("w-5 h-5 transition-transform", isActive && "scale-105")} />
              <span className={cn("text-[10px] font-medium tracking-wide", isActive ? "opacity-100" : "opacity-80")}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
