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
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-surface/80 backdrop-blur-3xl border-t border-white/5 px-2 pb-safe pt-2 h-20 shadow-[0_-8px_30px_rgba(0,0,0,0.5)]">
      <div className="flex items-center justify-around h-full max-w-lg mx-auto relative">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 transition-all duration-300 relative px-2 flex-1",
                isActive ? "text-primary font-black" : "text-on-surface-variant/40 hover:text-on-background"
              )}
            >
              {isActive && (
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-12 h-7 bg-primary/10 rounded-full -z-10 animate-in zoom-in-75 duration-300 border border-primary/20 shadow-[0_0_20px_rgba(var(--primary),0.2)]"></div>
              )}
              <Icon className={cn("w-5 h-5 transition-transform", isActive && "scale-110")} />
              <span className={cn("text-[8px] uppercase tracking-[0.15em] font-black", isActive ? "opacity-100" : "opacity-60")}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
