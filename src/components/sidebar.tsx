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
      <header className="h-20 flex items-center justify-between px-8 bg-surface/80 backdrop-blur-3xl border-b border-white/5 md:hidden sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-on-primary shadow-xl shadow-primary/20">
            <Wallet className="w-7 h-7" />
          </div>
          <span className="text-xl font-black text-on-background tracking-tighter italic">FLY DEA</span>
        </div>
        <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden">
          <UserCircle className="w-8 h-8 text-on-surface-variant/40" />
        </div>
      </header>

      {/* M3 Navigation Drawer (Sidebar - Desktop Only) */}
      <aside className="w-80 bg-surface/50 backdrop-blur-3xl border-r border-white/5 hidden md:flex flex-col fixed inset-y-0 z-50 p-6 overflow-y-auto">
        <div className="h-20 flex items-center px-4 mb-8">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-[24px] bg-primary flex items-center justify-center text-on-primary shadow-2xl shadow-primary/20">
              <Wallet className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter text-on-background italic">
                FLY DEA
              </h1>
              <p className="text-[10px] uppercase tracking-[0.4em] font-black text-on-surface-variant/40 mt-1">Enterprise 8.0</p>
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
                  "flex items-center gap-4 px-6 py-4 rounded-[20px] transition-all duration-500 group relative overflow-hidden",
                  isActive
                    ? "bg-secondary text-white font-black shadow-2xl shadow-secondary/20 scale-[1.02]"
                    : "text-on-surface-variant/40 hover:bg-white/[0.03] hover:text-on-background"
                )}
              >
                <Icon className={cn("w-5 h-5", isActive ? "text-white" : "group-hover:text-primary transition-colors")} />
                <span className="text-sm font-bold tracking-tight uppercase tracking-[0.1em]">{item.name}</span>
                {isActive && (
                   <div className="absolute right-0 w-1.5 h-6 bg-white rounded-l-full shadow-[0_0_15px_rgba(255,255,255,0.5)]"></div>
                )}
              </Link>
            );
          })}
        </div>

        <div className="mt-auto space-y-4 pt-6 border-t border-white/5">
          <div className="glass-card p-5 flex items-center gap-4 border-none rounded-[24px] bg-white/[0.03]">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 shrink-0">
              <UserCircle className="w-6 h-6 text-on-surface-variant/40" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-on-background truncate">
                {session?.user?.name || "Usuário"}
              </p>
              <p className="text-[10px] text-on-surface-variant/40 truncate uppercase font-bold tracking-widest">{session?.user?.email}</p>
            </div>
          </div>

          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex items-center justify-center gap-3 px-8 py-4 w-full rounded-full text-[10px] font-black tracking-[0.2em] text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/10 transition-all active:scale-95 uppercase"
          >
            <LogOut className="w-4 h-4" />
            ENCERRAR SESSÃO
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-80 min-h-screen pb-24 md:pb-0">
        <div className="w-full max-w-7xl mx-auto p-4 md:p-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
