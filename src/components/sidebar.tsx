"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, ReceiptText, BarChart3, LogOut, Wallet, 
  UserCircle, RotateCcw, History, Target, CreditCard, 
  BadgeDollarSign, CalendarRange, ShieldCheck, 
  TrendingUp, Menu, X, Brain, Plus, ChevronRight,
  PieChart, Bell
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { BottomNav } from "./bottom-nav";
import dynamic from "next/dynamic";

const DarkModeToggleClient = dynamic(() => import("./dark-mode-toggle").then(mod => ({ default: mod.DarkModeToggle })), { ssr: false });

// Navigation sections for better organization
const navSections = [
  {
    title: "Principal",
    items: [
      { name: "Painel Geral", href: "/", icon: LayoutDashboard },
      { name: "Movimentações", href: "/movimentacoes", icon: ReceiptText },
      { name: "Contas e Cartões", href: "/contas", icon: CreditCard },
    ]
  },
  {
    title: "Gestão",
    items: [
      { name: "Fluxo de Caixa", href: "/fluxo-caixa", icon: TrendingUp },
      { name: "Contas a Pagar", href: "/contas-a-pagar", icon: BadgeDollarSign },
      { name: "Planejamento", href: "/orcamentos", icon: Target },
      { name: "Recorrências", href: "/recorrencias", icon: RotateCcw },
      { name: "Fechamento", href: "/fechamento", icon: CalendarRange },
    ]
  },
  {
    title: "Inteligência",
    items: [
      { name: "Agentes IA", href: "/agents", icon: Brain },
      { name: "Relatórios", href: "/relatorios", icon: BarChart3 },
      { name: "Insights", href: "/insights", icon: PieChart },
    ]
  }
];

const adminSection = {
  title: "Administração",
  items: [
    { name: "Logs de Sistema", href: "/admin/logs", icon: History },
    { name: "Aprovações", href: "/admin/aprovacoes", icon: ShieldCheck },
  ]
};

function NavLinks({ pathname, isAdmin, onItemClick }: { pathname: string; isAdmin: boolean; onItemClick?: () => void }) {
  const sections = isAdmin ? [...navSections, adminSection] : navSections;

  return (
    <nav className="space-y-6">
      {sections.map((section, sectionIdx) => (
        <div key={sectionIdx}>
          <p className="px-4 mb-2 text-[11px] font-semibold uppercase tracking-wider text-outline">
            {section.title}
          </p>
          <div className="space-y-0.5">
            {section.items.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onItemClick}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 group relative text-[13px] font-medium",
                    isActive
                      ? "bg-primary/5 text-primary font-semibold"
                      : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                  )}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-primary" />
                  )}
                  <Icon className={cn(
                    "w-[18px] h-[18px] shrink-0 transition-colors",
                    isActive ? "text-primary" : "text-outline group-hover:text-on-surface-variant"
                  )} />
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

export function Sidebar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [drawerOpen, setDrawerOpen] = useState(false);

  if (pathname === '/login') return <>{children}</>;

  const isAdmin = (session?.user as any)?.role === "ADMIN";

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row font-sans overflow-x-hidden">
      {/* Mobile Drawer Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm transition-all duration-300 md:hidden",
          drawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setDrawerOpen(false)}
        aria-hidden={!drawerOpen}
      />

      {/* Mobile Drawer Panel */}
      <nav
        className={cn(
          "fixed inset-y-0 left-0 z-[70] w-[280px] bg-surface-container-lowest flex flex-col overflow-y-auto transform transition-transform duration-300 ease-out md:hidden shadow-2xl",
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        )}
        aria-hidden={!drawerOpen}
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-outline-variant/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-on-primary">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-base font-display font-bold text-on-background leading-none">FlyDea</h1>
                <p className="text-[10px] uppercase tracking-widest font-semibold text-outline mt-0.5">Finance Manager</p>
              </div>
            </div>
            <button
              onClick={() => setDrawerOpen(false)}
              aria-label="Fechar menu"
              className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-surface-container transition-all"
            >
              <X className="w-5 h-5 text-on-surface-variant" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 p-4 overflow-y-auto no-scrollbar">
          <NavLinks pathname={pathname} isAdmin={isAdmin} onItemClick={() => setDrawerOpen(false)} />
        </div>

        {/* User Section */}
        <div className="p-4 border-t border-outline-variant/30">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-container">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              {session?.user?.image ? (
                <img src={session.user.image as string} alt="Foto do perfil" className="h-full w-full object-cover rounded-full" />
              ) : (
                <UserCircle className="w-5 h-5 text-primary" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-on-background truncate">
                {session?.user?.name || "Usuário"}
              </p>
              <p className="text-[11px] text-outline truncate">{session?.user?.email}</p>
            </div>
            <Link href="/perfil" aria-label="Ver perfil" className="p-1.5 rounded-lg hover:bg-surface-container-high transition-all">
              <ChevronRight className="w-4 h-4 text-outline" />
            </Link>
          </div>
          
          <button
            onClick={() => {
              setDrawerOpen(false);
              signOut({ callbackUrl: '/login' });
            }}
            className="flex items-center justify-center gap-2 mt-3 px-4 py-2.5 w-full rounded-lg text-sm font-medium text-on-surface-variant hover:bg-error/5 hover:text-error transition-all"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      </nav>

      {/* Mobile Top Header */}
      <header className="h-14 flex items-center justify-between px-4 bg-surface-container-lowest/95 backdrop-blur-xl md:hidden sticky top-0 z-50 shrink-0 border-b border-outline-variant/30">
        <button
          onClick={() => setDrawerOpen(true)}
          aria-label="Abrir menu"
          className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-surface-container transition-all"
        >
          <Menu className="w-5 h-5 text-on-surface-variant" />
        </button>
        
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-on-primary">
            <Wallet className="w-4 h-4" />
          </div>
          <span className="text-base font-display font-bold text-on-background tracking-tight">FlyDea</span>
        </div>

        <div className="flex items-center gap-1">
          <button className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-surface-container transition-all relative">
            <Bell className="w-5 h-5 text-on-surface-variant" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-error" />
          </button>
        </div>
      </header>

      {/* Sidebar - Desktop Only */}
      <aside className="w-[260px] bg-surface-container-lowest hidden md:flex flex-col fixed inset-y-0 z-50 border-r border-outline-variant/30">
        {/* Logo */}
        <div className="p-5 border-b border-outline-variant/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center text-on-primary shadow-sm">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-display font-bold text-on-background leading-none">
                FlyDea
              </h1>
              <p className="text-[10px] uppercase tracking-widest font-semibold text-outline mt-0.5">Finance Manager</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 p-4 overflow-y-auto no-scrollbar">
          <NavLinks pathname={pathname} isAdmin={isAdmin} />
        </div>

        {/* Bottom Section */}
        <div className="p-4 border-t border-outline-variant/30 space-y-3">
          {/* Quick Action */}
          <Link
            href="/movimentacoes?action=new"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg gradient-primary text-on-primary text-sm font-semibold hover:brightness-110 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Nova Transação
          </Link>

          {/* User Card */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-container">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              {session?.user?.image ? (
                <img src={session.user.image as string} alt="Foto do perfil" className="h-full w-full object-cover rounded-full" />
              ) : (
                <UserCircle className="w-5 h-5 text-primary" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-on-background truncate">
                {session?.user?.name || "Usuário"}
              </p>
              <p className="text-[11px] text-outline truncate">{session?.user?.email}</p>
            </div>
            <div className="flex items-center gap-1">
              <DarkModeToggleClient />
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="p-1.5 rounded-lg hover:bg-error/5 hover:text-error transition-all"
                aria-label="Sair"
              >
                <LogOut className="w-4 h-4 text-outline" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main id="main-content" tabIndex={-1} className="flex-1 md:ml-[260px] min-h-screen pb-20 md:pb-0 bg-background">
        <div className="w-full max-w-[1400px] mx-auto p-4 md:p-8 lg:p-10">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav />

      {/* Mobile FAB */}
      <div className="fixed bottom-20 right-4 z-[45] md:hidden">
        <Link
          href="/movimentacoes?action=new"
          className="flex items-center justify-center w-14 h-14 gradient-primary text-on-primary rounded-xl shadow-lg shadow-primary/25 active:scale-95 transition-all"
          aria-label="Nova transação"
        >
          <Plus className="w-7 h-7 stroke-[2.5px]" />
        </Link>
      </div>
    </div>
  );
}
