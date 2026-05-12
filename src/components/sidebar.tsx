"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, ReceiptText, BarChart3, LogOut, Wallet,
  RotateCcw, History, Target, CreditCard,
  BadgeDollarSign, CalendarRange, ShieldCheck,
  TrendingUp, Menu, X, ChevronRight
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { BottomNav } from "./bottom-nav";
import dynamic from "next/dynamic";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

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
  { name: "Relatórios", href: "/relatorios", icon: BarChart3 },
];

const adminItems = [
  { name: "Logs de Sistema", href: "/admin/logs", icon: History },
  { name: "Aprovações", href: "/admin/aprovacoes", icon: ShieldCheck },
];

function getInitials(name?: string | null): string {
  if (!name) return "U";
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function NavLinks({ pathname, isAdmin, onItemClick }: { pathname: string; isAdmin: boolean; onItemClick?: () => void }) {
  const allItems = isAdmin ? [...navItems, ...adminItems] : navItems;

  return (
    <nav aria-label="Navegação principal" className="space-y-1">
      {allItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onItemClick}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 group relative text-sm font-medium",
              isActive
                ? "bg-surface-container-lowest shadow-sm text-primary"
                : "text-on-surface-variant hover:bg-surface-container hover:text-primary"
            )}
          >
            <div className="flex items-center gap-3">
              <Icon className={cn("w-5 h-5 shrink-0", isActive ? "text-primary" : "text-outline group-hover:text-primary transition-colors")} />
              <span className="font-sans tracking-tight whitespace-nowrap">{item.name}</span>
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

  if (pathname === "/login") return <>{children}</>;

  const isAdmin = (session?.user as any)?.role === "ADMIN";
  const userInitials = getInitials(session?.user?.name);
  const userImage = session?.user?.image as string | undefined;

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background flex flex-col md:flex-row font-sans overflow-x-hidden">
        {/* Mobile Drawer Overlay */}
        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
        <div
          className={cn(
            "fixed inset-0 z-[60] bg-background/80 transition-opacity duration-500 md:hidden",
            drawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          )}
          onClick={() => setDrawerOpen(false)}
          onKeyDown={(e) => { if (e.key === "Escape") setDrawerOpen(false); }}
          role="presentation"
          aria-hidden={!drawerOpen}
        />

        {/* Mobile Drawer Panel */}
        <nav
          aria-label="Menu de navegação"
          className={cn(
            "fixed inset-y-0 left-0 z-[70] w-80 bg-surface flex flex-col p-6 transform transition-transform duration-500 ease-in-out md:hidden border-none shadow-2xl",
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
                <Badge variant="secondary" className="mt-1.5 text-[10px] uppercase tracking-[0.3em] font-bold bg-transparent text-primary/60 border-0 p-0">
                  Premium
                </Badge>
              </div>
            </div>
            <Tooltip>
              <TooltipTrigger
                onClick={() => setDrawerOpen(false)}
                aria-label="Fechar menu"
                className="w-11 h-11 flex items-center justify-center rounded-xl bg-surface-container-low text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all"
              >
                <X className="w-5 h-5" />
              </TooltipTrigger>
              <TooltipContent>Fechar menu</TooltipContent>
            </Tooltip>
          </div>

          <ScrollArea className="flex-1">
            <NavLinks pathname={pathname} isAdmin={isAdmin} onItemClick={() => setDrawerOpen(false)} />
          </ScrollArea>

          <div className="mt-8 pt-8 space-y-6">
            <Separator />
            <div className="p-4 rounded-2xl bg-surface-container flex items-center gap-4 transition-all hover:bg-surface-container-high">
              <Avatar size="lg" className="w-11 h-11 border-2 border-surface-container-lowest shadow-sm">
                <AvatarImage src={userImage} alt="Foto do perfil" />
                <AvatarFallback>{userInitials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-on-background truncate">
                  {session?.user?.name || "Usuário"}
                </p>
                <Link href="/perfil" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 mt-0.5">
                  Ver perfil <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            <Tooltip>
              <TooltipTrigger
                onClick={() => {
                  setDrawerOpen(false);
                  signOut({ callbackUrl: "/login" });
                }}
                className="flex items-center justify-center gap-2 px-4 py-4 w-full rounded-2xl text-sm font-bold text-on-surface-variant bg-surface-container-low hover:bg-error/5 hover:text-error transition-all"
              >
                <LogOut className="w-4 h-4" />
                Encerrar Sessão
              </TooltipTrigger>
              <TooltipContent>Encerrar sessão</TooltipContent>
            </Tooltip>
          </div>
        </nav>

        {/* Mobile Top Header */}
        <header aria-label="Cabeçalho" className="h-20 flex items-center justify-between px-6 bg-background md:hidden sticky top-0 z-50 shrink-0 border-none">
          <Tooltip>
            <TooltipTrigger
              onClick={() => setDrawerOpen(true)}
              aria-label="Abrir menu"
              className="w-12 h-12 flex items-center justify-center rounded-2xl bg-surface-container-low hover:bg-surface-container transition-all"
            >
              <Menu className="w-6 h-6 text-on-surface-variant" />
            </TooltipTrigger>
            <TooltipContent>Abrir menu</TooltipContent>
          </Tooltip>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-on-primary shadow-md">
              <Wallet className="w-5 h-5" />
            </div>
            <span className="text-lg font-display font-bold text-on-background tracking-tight">FlyDea</span>
          </div>
          <div className="flex items-center gap-2">
            <DarkModeToggleClient />
            <Tooltip>
              <TooltipTrigger
                onClick={() => setDrawerOpen(true)}
                className="w-10 h-10 rounded-full overflow-hidden bg-surface-container-low border-2 border-surface-container-high flex items-center justify-center transition-all hover:border-primary/30"
                aria-label="Abrir menu do usuário"
              >
                <Avatar size="lg" className="w-10 h-10">
                  <AvatarImage src={userImage} alt="Perfil" />
                  <AvatarFallback>{userInitials}</AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent>Abrir menu do usuário</TooltipContent>
            </Tooltip>
          </div>
        </header>

        {/* Sidebar - Desktop Only */}
        <aside aria-label="Menu lateral" className="w-[320px] bg-surface hidden md:flex flex-col fixed inset-y-0 z-50 p-8 border-none shadow-[1px_0_20px_rgba(0,0,0,0.02)]">
          <div className="h-20 flex items-center px-2 mb-12">
            <div className="flex items-center gap-4 w-full">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-on-primary shrink-0 shadow-xl shadow-primary/10">
                <Wallet className="w-7 h-7" />
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl font-display font-bold tracking-tight text-on-background leading-none">
                  FlyDea
                </h1>
                <Badge variant="secondary" className="mt-2 text-[10px] uppercase tracking-[0.4em] font-bold bg-transparent text-primary/60 border-0 p-0">
                  Premium
                </Badge>
              </div>
            </div>
          </div>

          <ScrollArea className="flex-1 pr-2">
            <div className="space-y-1">
              <NavLinks pathname={pathname} isAdmin={isAdmin} />
            </div>
          </ScrollArea>

          <div className="mt-12 space-y-6">
            <div className="p-4 flex items-center gap-4 rounded-3xl bg-surface-container transition-all hover:bg-surface-container-high group">
              <Avatar size="lg" className="w-12 h-12 border-2 border-surface-container-lowest shadow-sm">
                <AvatarImage src={userImage} alt="Foto do perfil" />
                <AvatarFallback>{userInitials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-on-background truncate">
                  {session?.user?.name || "Usuário"}
                </p>
                <p className="text-[10px] text-on-surface-variant truncate">{session?.user?.email}</p>
              </div>
              <Tooltip>
                <TooltipTrigger>
                  <Link href="/perfil" aria-label="Ver perfil" className="w-11 h-11 rounded-full bg-surface-container flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent>Ver perfil</TooltipContent>
              </Tooltip>
            </div>

            <div className="flex items-center gap-3">
              <Tooltip>
                <TooltipTrigger
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-xs font-bold text-on-surface-variant hover:bg-error/5 hover:text-error transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  Sair
                </TooltipTrigger>
                <TooltipContent>Encerrar sessão</TooltipContent>
              </Tooltip>
              <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-surface-container-low hover:bg-surface-container transition-all">
                <Tooltip>
                  <TooltipTrigger>
                    <DarkModeToggleClient />
                  </TooltipTrigger>
                  <TooltipContent>Alternar tema</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main id="main-content" aria-label="Conteúdo principal" tabIndex={-1} className="flex-1 md:ml-[320px] min-h-screen pb-24 md:pb-0 bg-background scroll-mt-20">
          <div className="w-full max-w-7xl mx-auto p-6 md:p-12 lg:p-16 animate-in fade-in slide-in-from-bottom-4 duration-1000 ease-out">
            {children}
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <BottomNav />
      </div>
    </TooltipProvider>
  );
}
