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
      <aside className="w-72 bg-surface-variant/50 border-r border-outline/20 hidden md:flex flex-col fixed inset-y-0 z-50 p-6 overflow-y-auto">
        <div className="h-16 flex items-center px-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center text-on-primary">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tighter text-on-background uppercase italic leading-none">
                FLY DEA
              </h1>
              <p className="text-[9px] uppercase tracking-[0.3em] font-medium text-on-surface-variant mt-1">Enterprise 8.0</p>
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group relative",
                  isActive
                    ? "bg-surface text-primary font-semibold shadow-sm"
                    : "text-on-surface-variant hover:bg-surface/50 hover:text-on-surface"
                )}
              >
                <Icon className={cn("w-5 h-5", isActive ? "text-secondary" : "group-hover:text-primary transition-colors")} />
                <span className="text-sm tracking-tight">{item.name}</span>
                {isActive && (
                   <div className="absolute left-0 w-1 h-5 bg-secondary rounded-r-full"></div>
                )}
              </Link>
            );
          })}
        </div>

        <div className="mt-auto space-y-4 pt-6">
          <div className="p-4 flex items-center gap-3 rounded-xl bg-surface border border-outline/20">
            <div className="w-9 h-9 rounded-lg bg-surface-variant flex items-center justify-center shrink-0">
              <UserCircle className="w-6 h-6 text-on-surface-variant" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-on-background truncate">
                {session?.user?.name || "Usuário"}
              </p>
              <p className="text-[10px] text-on-surface-variant truncate font-medium">{session?.user?.email}</p>
            </div>
          </div>

          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex items-center justify-center gap-2 px-6 py-3 w-full rounded-full text-xs font-semibold text-on-surface-variant hover:bg-surface-variant transition-all hover:text-red-500"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-72 min-h-screen pb-24 md:pb-0">
        <div className="w-full max-w-7xl mx-auto p-4 md:p-10 animate-in fade-in duration-500">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
