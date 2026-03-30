"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ReceiptText, BarChart3, LogOut, Wallet, UserCircle, RotateCcw, History, Target, CreditCard } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { BottomNav } from "./bottom-nav";

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Movimentações", href: "/movimentacoes", icon: ReceiptText },
  { name: "Contas", href: "/contas", icon: CreditCard },
  { name: "Orçamentos", href: "/orcamentos", icon: Target },
  { name: "Recorrências", href: "/recorrencias", icon: RotateCcw },
  { name: "Relatórios", href: "/relatorios", icon: BarChart3 },
  { name: "Logs", href: "/admin/logs", icon: History },
];

export function Sidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();

  if (pathname === '/login') return <>{children}</>;

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row font-sans overflow-x-hidden">
      {/* Mobile Top Header (Brand Only) */}
      <header className="h-16 flex items-center justify-between px-6 bg-surface border-b border-outline/20 md:hidden sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-on-primary">
            <Wallet className="w-5 h-5" />
          </div>
          <span className="text-lg font-bold text-on-background tracking-tighter uppercase italic">FLY DEA</span>
        </div>
        <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center overflow-hidden">
          <UserCircle className="w-7 h-7 text-on-surface-variant" />
        </div>
      </header>

      {/* Sidebar - Desktop Only */}
      <aside className="w-64 bg-surface border-r border-outline/30 hidden md:flex flex-col fixed inset-y-0 z-50 p-4 overflow-y-auto">
        <div className="h-14 flex items-center px-3 mb-6">
          <div className="flex items-center gap-3 w-full">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-on-primary shrink-0">
              <Wallet className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base font-bold tracking-tight text-on-background leading-none">
                FlyDea
              </h1>
              <p className="text-[8px] uppercase tracking-widest font-semibold text-on-surface-variant mt-0.5">Premium</p>
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-0.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group relative text-sm font-medium",
                  isActive
                    ? "bg-secondary/10 text-secondary"
                    : "text-on-surface-variant hover:bg-surface-variant hover:text-on-surface"
                )}
              >
                <Icon className={cn("w-4.5 h-4.5 shrink-0", isActive ? "text-secondary" : "group-hover:text-secondary transition-colors")} />
                <span className="truncate text-sm">{item.name}</span>
              </Link>
            );
          })}
        </div>

        <div className="mt-auto space-y-3 pt-4 border-t border-outline/20">
          <div className="p-3 flex items-center gap-2.5 rounded-lg bg-surface-variant/50 border border-outline/20">
            <UserCircle className="w-8 h-8 text-on-surface-variant shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-on-background truncate">
                {session?.user?.name || "Usuário"}
              </p>
              <p className="text-[11px] text-on-surface-variant truncate">{session?.user?.email}</p>
            </div>
          </div>

          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex items-center justify-center gap-2 px-4 py-2.5 w-full rounded-lg text-xs font-semibold text-on-surface-variant hover:bg-surface-variant hover:text-red-500 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 min-h-screen pb-24 md:pb-0">
        <div className="w-full max-w-7xl mx-auto p-4 md:p-8 animate-in fade-in duration-500">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
