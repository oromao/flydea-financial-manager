"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, ReceiptText, BarChart3, LogOut, Wallet, 
  UserCircle, RotateCcw, History, Target, CreditCard, 
  BadgeDollarSign, CalendarRange, Camera, ShieldCheck, 
  TrendingUp, Menu, X, Brain, Clock, Plus, Sparkles, ChevronRight
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { BottomNav } from "./bottom-nav";
import dynamic from "next/dynamic";

const DarkModeToggleClient = dynamic(() => import("./dark-mode-toggle").then(mod => ({ default: mod.DarkModeToggle })), { ssr: false });

const navItems = [
  { name: "Painel Geral", href: "/", icon: LayoutDashboard },
  { name: "Movimentações", href: "/movimentacoes", icon: ReceiptText },
  { name: "Contas e Cartões", href: "/contas", icon: CreditCard },
  { name: "Fluxo de Caixa", href: "/fluxo-caixa", icon: TrendingUp },
  { name: "Contas a Pagar", href: "/contas-a-pagar", icon: BadgeDollarSign },
  { name: "Planejamento", href: "/orcamentos", icon: Target },
  { name: "Recorrências", href: "/recorrencias", icon: RotateCcw },
  { name: "Fechamento", href: "/fechamento", icon: CalendarRange },
  { name: "Inteligência IA", href: "/agents", icon: Brain },
  { name: "Análises", href: "/relatorios", icon: BarChart3 },
];

const adminItems = [
  { name: "Logs de Sistema", href: "/admin/logs", icon: History },
  { name: "Aprovações", href: "/admin/aprovacoes", icon: ShieldCheck },
];

function NavLinks({ pathname, isAdmin, onItemClick }: { pathname: string; isAdmin: boolean; onItemClick?: () => void }) {
  const allItems = isAdmin ? [...navItems, ...adminItems] : navItems;

  return (
    <nav className="space-y-1">
      {allItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onItemClick}
            className={cn(
              "flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 group relative text-sm font-medium",
              isActive
                ? "bg-surface-container-lowest shadow-sm text-primary"
                : "text-on-surface-variant hover:bg-surface-container-low hover:text-primary"
            )}
          >
            <div className="flex items-center gap-3">
              <Icon className={cn("w-5 h-5 shrink-0", isActive ? "text-primary" : "text-outline group-hover:text-primary transition-colors")} />
              <span className="truncate font-sans tracking-tight">{item.name}</span>
            </div>
            {isActive && <div className="w-1 h-4 rounded-full bg-primary" />}
          </Link>
        );
      })}
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
          "fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm transition-opacity duration-500 md:hidden",
          drawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setDrawerOpen(false)}
        aria-hidden={!drawerOpen}
      />

      {/* Mobile Drawer Panel */}
      <nav
        className={cn(
          "fixed inset-y-0 left-0 z-[70] w-80 bg-surface flex flex-col p-6 overflow-y-auto transform transition-transform duration-500 ease-in-out md:hidden border-none shadow-2xl",
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        )}
        aria-hidden={!drawerOpen}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between mb-10 px-2">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-on-primary shadow-lg shadow-primary/20">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold tracking-tight text-on-background leading-none">FlyDea</h1>
              <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-primary/60 mt-1.5">Sovereign</p>
            </div>
          </div>
          <button
            onClick={() => setDrawerOpen(false)}
            aria-label="Fechar menu"
            className="w-11 h-11 flex items-center justify-center rounded-xl bg-surface-container-low text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar">
          <NavLinks pathname={pathname} isAdmin={isAdmin} onItemClick={() => setDrawerOpen(false)} />
        </div>

        <div className="mt-8 pt-8 border-t border-surface-container-high space-y-6">
          <div className="p-4 rounded-2xl bg-surface-container-low flex items-center gap-4 transition-all hover:bg-surface-container">
            <div className="w-11 h-11 rounded-full overflow-hidden bg-surface-variant shrink-0 relative border-2 border-surface-container-lowest shadow-sm">
              {session?.user?.image ? (
                <img src={(session.user.image) as string} alt="Foto do perfil" className="h-full w-full object-cover" />
              ) : (
                <UserCircle className="w-11 h-11 text-on-surface-variant" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-on-background truncate">
                {session?.user?.name || "Usuário"}
              </p>
              <Link href="/perfil" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 mt-0.5">
                Ver perfil <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          <button
            onClick={() => {
              setDrawerOpen(false);
              signOut({ callbackUrl: '/login' });
            }}
            className="flex items-center justify-center gap-2 px-4 py-4 w-full rounded-2xl text-sm font-bold text-on-surface-variant bg-surface-container-low hover:bg-error/5 hover:text-error transition-all"
          >
            <LogOut className="w-4 h-4" />
            Encerrar Sessão
          </button>
        </div>
      </nav>

      {/* Mobile Top Header */}
      <header className="h-20 flex items-center justify-between px-6 bg-surface/80 backdrop-blur-xl md:hidden sticky top-0 z-50 shrink-0 border-none shadow-[0_1px_10px_rgba(0,0,0,0.02)]">
        <button
          onClick={() => setDrawerOpen(true)}
          className="w-12 h-12 flex items-center justify-center rounded-2xl bg-surface-container-low hover:bg-surface-container transition-all"
        >
          <Menu className="w-6 h-6 text-on-surface-variant" />
        </button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-on-primary shadow-md">
            <Wallet className="w-5 h-5" />
          </div>
          <span className="text-lg font-display font-bold text-on-background tracking-tight">FlyDea</span>
        </div>
        <div className="flex items-center gap-2">
          <DarkModeToggleClient />
          <button
            onClick={() => setDrawerOpen(true)}
            className="w-10 h-10 rounded-full overflow-hidden bg-surface-container-low border-2 border-surface-container-high flex items-center justify-center transition-all hover:border-primary/30"
            aria-label="Abrir menu do usuário"
          >
            {session?.user?.image ? (
              <img src={session.user.image as string} alt="Perfil" className="w-full h-full object-cover" />
            ) : (
              <UserCircle className="w-6 h-6 text-on-surface-variant" />
            )}
          </button>
        </div>
      </header>

      {/* Sidebar - Desktop Only */}
      <aside className="w-[320px] bg-surface hidden md:flex flex-col fixed inset-y-0 z-50 p-8 overflow-y-auto border-none shadow-[1px_0_20px_rgba(0,0,0,0.02)]">
        <div className="h-20 flex items-center px-2 mb-12">
          <div className="flex items-center gap-4 w-full">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-on-primary shrink-0 shadow-xl shadow-primary/10">
              <Wallet className="w-7 h-7" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-display font-bold tracking-tight text-on-background leading-none">
                FlyDea
              </h1>
              <p className="text-[10px] uppercase tracking-[0.4em] font-bold text-primary/60 mt-2">Premium Access</p>
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-1 no-scrollbar overflow-y-auto pr-2">
          <NavLinks pathname={pathname} isAdmin={isAdmin} />
        </div>

        <div className="mt-12 space-y-6">
          {/* Advice Card */}
          <div className="p-5 rounded-3xl bg-primary/5 border border-primary/10 space-y-3">
            <div className="flex items-center gap-2 text-primary">
              <Sparkles className="w-4 h-4" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Consultoria</span>
            </div>
            <p className="text-[11px] font-medium text-on-surface-variant leading-relaxed">
              Deseja otimizar sua carteira de investimentos? Fale com um especialista.
            </p>
            <button className="w-full py-2 rounded-xl bg-primary text-white text-[11px] font-bold hover:bg-primary-container transition-all">
              Agendar Conversa
            </button>
          </div>

          <div className="p-4 flex items-center gap-4 rounded-3xl bg-surface-container-low transition-all hover:bg-surface-container group">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-surface-variant shrink-0 relative border-2 border-surface-container-lowest shadow-sm">
              {session?.user?.image ? (
                <img src={(session.user.image) as string} alt="Foto do perfil" className="h-full w-full object-cover" />
              ) : (
                <UserCircle className="w-12 h-12 text-on-surface-variant" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-on-background truncate">
                {session?.user?.name || "Usuário"}
              </p>
              <p className="text-[10px] text-on-surface-variant truncate">{session?.user?.email}</p>
            </div>
            <Link href="/perfil" className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
               <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-xs font-bold text-on-surface-variant hover:bg-error/5 hover:text-error transition-all"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </button>
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-surface-container-low hover:bg-surface-container transition-all">
              <DarkModeToggleClient />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-[320px] min-h-screen pb-24 md:pb-0 bg-background">
        <div className="w-full max-w-7xl mx-auto p-6 md:p-12 lg:p-16 animate-in fade-in slide-in-from-bottom-4 duration-1000 ease-out">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav />

      {/* Mobile FAB */}
      <div className="fixed bottom-28 right-6 z-[45] md:hidden">
        <Link
          href="/movimentacoes?action=new"
          className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-primary-container text-on-primary rounded-2xl shadow-2xl shadow-primary/30 active:scale-95 transition-all animate-in zoom-in duration-500"
          aria-label="Nova transação"
        >
          <Plus className="w-9 h-9 stroke-[3px]" />
        </Link>
      </div>
    </div>
  );
}
