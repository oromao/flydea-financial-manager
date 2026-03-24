"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ReceiptText, BarChart3, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Início", href: "/", icon: LayoutDashboard },
  { name: "Fluxo", href: "/movimentacoes", icon: ReceiptText },
  { name: "Relatórios", href: "/relatorios", icon: BarChart3 },
];

export function BottomNav() {
  const pathname = usePathname();

  if (pathname === '/login') return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-[#1A1C1E]/95 backdrop-blur-xl border-t border-[#43474E] px-6 pb-safe pt-2 h-20 shadow-[0_-8px_30px_rgb(0,0,0,0.12)]">
      <div className="flex items-center justify-around h-full max-w-lg mx-auto relative">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1.5 transition-all duration-300 relative px-4",
                isActive ? "text-[#D1E4FF]" : "text-[#8D9199]"
              )}
            >
              {isActive && (
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-16 h-8 bg-[#00497D] rounded-full -z-10 animate-in zoom-in-75 duration-300"></div>
              )}
              <Icon className={cn("w-6 h-6 transition-transform", isActive && "scale-110")} />
              <span className={cn("text-[10px] font-black uppercase tracking-widest", isActive ? "opacity-100" : "opacity-60")}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
