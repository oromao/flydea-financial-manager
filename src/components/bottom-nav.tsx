"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ReceiptText, BrainCircuit, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Início", href: "/", icon: LayoutDashboard },
  { name: "Fluxo", href: "/movimentacoes", icon: ReceiptText },
  { name: "IA", href: "/insights", icon: BrainCircuit },
  { name: "Perfil", href: "/perfil", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  if (pathname === "/login") return null;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-surface-container-lowest/95 backdrop-blur-2xl border-t border-outline/10"
      style={{
        height: "calc(4rem + max(0px, env(safe-area-inset-bottom)))",
        paddingBottom: "max(0px, env(safe-area-inset-bottom))",
      }}
    >
      <div className="flex items-stretch justify-around h-16 max-w-lg mx-auto px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center gap-1 flex-1 relative group"
            >
              {isActive && (
                <span className="absolute top-2 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-primary" />
              )}
              <div className={cn(
                "flex items-center justify-center w-11 h-8 rounded-2xl transition-all duration-200",
                isActive ? "bg-primary/10" : "group-active:bg-surface-container"
              )}>
                <Icon className={cn(
                  "transition-all duration-200",
                  isActive ? "w-5 h-5 text-primary stroke-[2.5px]" : "w-5 h-5 text-on-surface-variant/50 stroke-[1.5px]"
                )} />
              </div>
              <span className={cn(
                "text-[10px] font-bold tracking-wide transition-all duration-200",
                isActive ? "text-primary" : "text-on-surface-variant/50"
              )}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
