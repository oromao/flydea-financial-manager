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

  if (pathname === '/login') return null;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-surface/90 backdrop-blur-xl border-t border-outline/30 px-4 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]"
      style={{
        height: 'calc(4.5rem + max(0px, env(safe-area-inset-bottom)))',
        paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))',
      }}
    >
      <div className="flex items-center justify-between h-full max-w-lg mx-auto relative">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 transition-all duration-300 relative py-1 min-w-[64px] rounded-2xl",
                isActive ? "text-primary scale-110" : "text-on-surface-variant/60"
              )}
            >
              <Icon className={cn("w-6 h-6 transition-all", isActive ? "stroke-[2.5px]" : "stroke-[1.5px]")} />
              <span className={cn(
                "text-[10px] font-black tracking-tighter uppercase",
                isActive ? "opacity-100" : "opacity-0 scale-50"
              )}>
                {item.name}
              </span>
              {isActive && (
                <div className="absolute -top-1 w-1 h-1 bg-primary rounded-full shadow-[0_0_8px_rgba(var(--primary),0.8)]" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
