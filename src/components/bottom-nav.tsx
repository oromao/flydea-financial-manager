"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ReceiptText, CreditCard, BadgeDollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Início", href: "/", icon: LayoutDashboard },
  { name: "Fluxo", href: "/movimentacoes", icon: ReceiptText },
  { name: "Contas", href: "/contas", icon: CreditCard },
  { name: "Pendências", href: "/contas-a-pagar", icon: BadgeDollarSign },
];

export function BottomNav() {
  const pathname = usePathname();

  if (pathname === '/login') return null;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-surface/85 backdrop-blur-xl border-t border-outline/20 px-2 shadow-[0_-8px_30px_rgba(0,0,0,0.04)]"
      style={{
        height: 'calc(4rem + max(0px, env(safe-area-inset-bottom)))',
        paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))',
      }}
    >
      <div className="flex items-center justify-around h-full max-w-lg mx-auto relative gap-0.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 transition-colors duration-200 relative py-1 min-w-[44px] min-h-[44px] rounded-lg flex-1",
                isActive ? "text-secondary font-semibold" : "text-on-surface-variant"
              )}
            >
              {isActive && (
                <div className="absolute inset-0 bg-surface-variant/50 rounded-lg -z-10 animate-in fade-in zoom-in-95 duration-200"></div>
              )}
              <Icon className={cn("w-5 h-5 transition-transform", isActive && "scale-105")} />
              <span className={cn("text-[10px] font-medium tracking-wide truncate max-w-full", isActive ? "opacity-100" : "opacity-70")}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
