"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ReceiptText, BarChart3, LogOut, Wallet, UserCircle, RotateCcw, History, Target, CreditCard, BadgeDollarSign, CalendarRange, Camera, ShieldCheck, TrendingUp, Menu, X, Brain } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { BottomNav } from "./bottom-nav";
import { DarkModeToggle } from "./dark-mode-toggle";
import dynamic from "next/dynamic";

const DarkModeToggleClient = dynamic(() => import("./dark-mode-toggle").then(mod => ({ default: mod.DarkModeToggle })), { ssr: false });

const navItems = [
  { name: "Início", href: "/", icon: LayoutDashboard },
  { name: "Transações", href: "/movimentacoes", icon: ReceiptText },
  { name: "Contas", href: "/contas", icon: CreditCard },
  { name: "Fluxo de Caixa", href: "/fluxo-caixa", icon: TrendingUp },
  { name: "Contas a Pagar", href: "/contas-a-pagar", icon: BadgeDollarSign },
  { name: "Orçamentos", href: "/orcamentos", icon: Target },
  { name: "Recorrências", href: "/recorrencias", icon: RotateCcw },
  { name: "Fechamento Mensal", href: "/fechamento", icon: CalendarRange },
  { name: "Agentes IA", href: "/agents", icon: Brain },
  { name: "Relatórios", href: "/relatorios", icon: BarChart3 },
  { name: "Logs", href: "/admin/logs", icon: History },
  { name: "Aprovações", href: "/admin/aprovacoes", icon: ShieldCheck },
];

function NavLinks({ pathname, onItemClick }: { pathname: string; onItemClick?: () => void }) {
  return (
    <>
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onItemClick}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-150 group relative text-sm font-medium min-h-[44px]",
              isActive
                ? "bg-secondary/10 text-secondary"
                : "text-on-surface-variant hover:bg-surface-variant hover:text-on-surface"
            )}
          >
            <Icon className={cn("w-5 h-5 shrink-0", isActive ? "text-secondary" : "group-hover:text-secondary transition-colors")} />
            <span className="truncate text-sm">{item.name}</span>
          </Link>
        );
      })}
    </>
  );
}

export function Sidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [drawerOpen, setDrawerOpen] = useState(false);

  if (pathname === '/login') return <>{children}</>;

  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row font-sans overflow-x-hidden">
      {/* Mobile Drawer Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm transition-opacity duration-300 md:hidden",
          drawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setDrawerOpen(false)}
        aria-hidden={!drawerOpen}
      />

      {/* Mobile Drawer Panel */}
      <nav
        role="navigation"
        aria-label="Menu principal"
        className={cn(
          "fixed inset-y-0 left-0 z-[70] w-72 bg-surface border-r border-outline/30 flex flex-col p-4 overflow-y-auto transform transition-transform duration-300 ease-in-out md:hidden",
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        )}
        aria-hidden={!drawerOpen}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-on-primary shrink-0">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-on-background leading-none">FlyDea</h1>
              <p className="text-[8px] uppercase tracking-widest font-semibold text-on-surface-variant mt-0.5">Premium</p>
            </div>
          </div>
          <button
            onClick={() => setDrawerOpen(false)}
            aria-label="Fechar menu"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-surface-variant transition-colors"
          >
            <X className="w-5 h-5 text-on-surface-variant" />
          </button>
        </div>

        {/* Nav Links */}
        <div className="flex-1 space-y-0.5">
          <NavLinks pathname={pathname} onItemClick={() => setDrawerOpen(false)} />
        </div>

        {/* User Section */}
        <div className="mt-auto space-y-3 pt-4 border-t border-outline/20">
          <div className="p-3 flex items-center gap-2.5 rounded-lg bg-surface-variant/50 border border-outline/20">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-surface-variant shrink-0 relative">
              {session?.user?.image ? (
                <img src={(session.user.image) as string} alt="Foto do perfil" className="h-full w-full object-cover" />
              ) : (
                <UserCircle className="w-8 h-8 text-on-surface-variant" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-on-background truncate">
                {session?.user?.name || "Usuário"}
              </p>
              <p className="text-[11px] text-on-surface-variant truncate">{session?.user?.email}</p>
              <Link href="/perfil" className="inline-flex items-center gap-1 text-[11px] font-semibold text-secondary mt-1 hover:underline">
                <Camera className="w-3 h-3" />
                Perfil
              </Link>
            </div>
          </div>

          <button
            onClick={() => {
              setDrawerOpen(false);
              signOut({ callbackUrl: '/login' });
            }}
            className="flex items-center justify-center gap-2 px-4 py-2.5 w-full rounded-lg text-xs font-semibold text-on-surface-variant hover:bg-surface-variant hover:text-red-500 transition-colors min-h-[44px]"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      </nav>

      {/* Mobile Top Header */}
      <header className="h-16 flex items-center justify-between px-4 bg-surface border-b border-outline/20 md:hidden sticky top-0 z-50 shrink-0">
        <button
          onClick={() => setDrawerOpen(true)}
          aria-label="Abrir menu"
          className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-surface-variant transition-colors"
        >
          <Menu className="w-5 h-5 text-on-surface-variant" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-on-primary">
            <Wallet className="w-4 h-4" />
          </div>
          <span className="text-sm font-bold text-on-background tracking-tighter uppercase italic">FLYDEA</span>
        </div>
        <div className="flex items-center gap-1">
          <DarkModeToggleClient />
          <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center overflow-hidden relative">
          {session?.user?.image ? (
            <img src={(session.user.image) as string} alt="Foto do perfil" className="h-full w-full object-cover" />
          ) : (
            <UserCircle className="w-7 h-7 text-on-surface-variant" />
          )}
        </div>
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
          <NavLinks pathname={pathname} />
        </div>

        <div className="mt-auto space-y-3 pt-4 border-t border-outline/20">
          <div className="p-3 flex items-center gap-2.5 rounded-lg bg-surface-variant/50 border border-outline/20">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-surface-variant shrink-0 relative">
              {session?.user?.image ? (
                <img src={(session.user.image) as string} alt="Foto do perfil" className="h-full w-full object-cover" />
              ) : (
                <UserCircle className="w-8 h-8 text-on-surface-variant" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-on-background truncate">
                {session?.user?.name || "Usuário"}
              </p>
              <p className="text-[11px] text-on-surface-variant truncate">{session?.user?.email}</p>
              <Link href="/perfil" className="inline-flex items-center gap-1 text-[11px] font-semibold text-secondary mt-1 hover:underline">
                <Camera className="w-3 h-3" />
                Perfil
              </Link>
            </div>
          </div>

          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex items-center justify-center gap-2 px-4 py-2.5 w-full rounded-lg text-xs font-semibold text-on-surface-variant hover:bg-surface-variant hover:text-red-500 transition-colors min-h-[44px]"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>

          <div className="flex items-center justify-center pt-2 border-t border-outline/20">
            <DarkModeToggleClient />
          </div>
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
