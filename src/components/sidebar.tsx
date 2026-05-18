"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, ReceiptText, BarChart3, LogOut, Wallet,
  RotateCcw, History, Target, CreditCard,
  BadgeDollarSign, CalendarRange, ShieldCheck,
  TrendingUp, Menu, X, ChevronRight, Activity
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
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Movimentações", href: "/movimentacoes", icon: ReceiptText },
  { name: "Contas", href: "/contas", icon: CreditCard },
  { name: "Fluxo de Caixa", href: "/fluxo-caixa", icon: TrendingUp },
  { name: "Contas a Pagar", href: "/contas-a-pagar", icon: BadgeDollarSign },
  { name: "Planejamento", href: "/orcamentos", icon: Target },
  { name: "Recorrências", href: "/recorrencias", icon: RotateCcw },
  { name: "Fechamento", href: "/fechamento", icon: CalendarRange },
  { name: "Relatórios", href: "/relatorios", icon: BarChart3 },
];

const adminItems = [
  { name: "Logs", href: "/admin/logs", icon: History },
  { name: "Aprovações", href: "/admin/aprovacoes", icon: ShieldCheck },
  { name: "Analytics", href: "/admin/analytics", icon: Activity },
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
    <nav aria-label="Navegação principal" className="space-y-0.5">
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
              "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium",
              isActive
                ? "bg-primary-container text-primary font-semibold"
                : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
            )}
          >
            <Icon className={cn("w-5 h-5 shrink-0", isActive ? "text-primary" : "text-outline")} />
            <span>{item.name}</span>
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

  const isAdmin = session?.user?.role === "ADMIN";
  const userInitials = getInitials(session?.user?.name);
  const userImage = session?.user?.image as string | undefined;

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background flex flex-col md:flex-row font-sans overflow-x-hidden">
        {/* Mobile Drawer Overlay */}
        <div
          className={cn(
            "fixed inset-0 z-[60] bg-background/60 backdrop-blur-sm transition-all duration-300 md:hidden",
            drawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          )}
          onClick={() => setDrawerOpen(false)}
          role="presentation"
          aria-hidden={!drawerOpen}
        />

        {/* Mobile Drawer Panel */}
        <nav
          aria-label="Menu de navegação"
          className={cn(
            "fixed inset-y-0 left-0 z-[70] w-72 bg-surface-container-lowest flex flex-col p-6 transform transition-all duration-300 ease-out md:hidden border-r border-border",
            drawerOpen ? "translate-x-0" : "-translate-x-full"
          )}
          aria-hidden={!drawerOpen}
        >
          {/* Drawer Header */}
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-on-primary">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg font-display font-bold tracking-tight text-foreground">FlyDea</h1>
                <p className="text-[10px] font-medium text-muted-foreground">Premium</p>
              </div>
            </div>
            <button
              onClick={() => setDrawerOpen(false)}
              aria-label="Fechar menu"
              className="w-10 h-10 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-surface-container transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <ScrollArea className="flex-1 -mx-3 px-3">
            <NavLinks pathname={pathname} isAdmin={isAdmin} onItemClick={() => setDrawerOpen(false)} />
          </ScrollArea>

          <Separator className="my-6" />

          <div className="space-y-4">
            <div className="flex items-center gap-3 px-1">
              <Avatar className="w-9 h-9 border border-border">
                <AvatarImage src={userImage} alt="Foto do perfil" />
                <AvatarFallback className="text-xs font-semibold bg-surface-container text-on-surface-variant">{userInitials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                  {session?.user?.name || "Usuário"}
                </p>
                <Link href="/perfil" className="text-xs text-muted-foreground hover:text-primary transition-colors">
                  Ver perfil
                </Link>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setDrawerOpen(false);
                  signOut({ callbackUrl: "/login" });
                }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
              >
                <LogOut className="w-4 h-4" />
                Sair
              </button>
              <DarkModeToggleClient />
            </div>
          </div>
        </nav>

        {/* Mobile Top Header */}
        <header aria-label="Cabeçalho" className="h-14 flex items-center justify-between px-5 bg-background/80 backdrop-blur-md md:hidden sticky top-0 z-50 shrink-0 border-b border-border">
          <button
            onClick={() => setDrawerOpen(true)}
            aria-label="Abrir menu"
            className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-surface-container transition-all"
          >
            <Menu className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-on-primary">
              <Wallet className="w-4 h-4" />
            </div>
            <span className="text-base font-display font-bold text-foreground">FlyDea</span>
          </div>
          <div className="flex items-center gap-1">
            <DarkModeToggleClient />
            <button
              onClick={() => setDrawerOpen(true)}
              className="w-9 h-9 rounded-full overflow-hidden border border-border flex items-center justify-center"
              aria-label="Abrir menu do usuário"
            >
              <Avatar className="w-9 h-9">
                <AvatarImage src={userImage} alt="Perfil" />
                <AvatarFallback className="text-xs font-semibold bg-surface-container text-on-surface-variant">{userInitials}</AvatarFallback>
              </Avatar>
            </button>
          </div>
        </header>

        {/* Sidebar - Desktop Only */}
        <aside aria-label="Menu lateral" className="w-64 bg-surface-container-lowest hidden md:flex flex-col fixed inset-y-0 z-50 border-r border-border py-8 px-4">
          {/* Logo */}
          <div className="flex items-center gap-3 px-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-on-primary shadow-sm">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-display font-bold tracking-tight text-foreground leading-none">FlyDea</h1>
              <p className="text-[10px] font-medium text-muted-foreground mt-0.5">Premium</p>
            </div>
          </div>

          <ScrollArea className="flex-1 -mx-3 px-3">
            <NavLinks pathname={pathname} isAdmin={isAdmin} />
          </ScrollArea>

          {/* User Section */}
          <div className="mt-6 pt-6 border-t border-border space-y-4 -mx-3 px-3">
            <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-surface-container transition-all group">
              <Avatar className="w-9 h-9 border border-border">
                <AvatarImage src={userImage} alt="Foto do perfil" />
                <AvatarFallback className="text-xs font-semibold bg-surface-container text-on-surface-variant">{userInitials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                  {session?.user?.name || "Usuário"}
                </p>
                <p className="text-xs text-muted-foreground truncate">{session?.user?.email}</p>
              </div>
              <Link href="/perfil" aria-label="Ver perfil" className="opacity-0 group-hover:opacity-100 w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-on-primary transition-all shrink-0">
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
              >
                <LogOut className="w-4 h-4" />
                Sair
              </button>
              <DarkModeToggleClient />
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main id="main-content" aria-label="Conteúdo principal" tabIndex={-1} className="flex-1 md:ml-64 min-h-screen pb-20 md:pb-0 bg-background scroll-mt-14">
          <div className="w-full max-w-7xl mx-auto p-5 md:p-10 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
            {children}
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <BottomNav />
      </div>
    </TooltipProvider>
  );
}
