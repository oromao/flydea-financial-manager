"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ReceiptText, Plus, MoreHorizontal, X, BarChart3, Wallet, BadgeDollarSign, Target, RotateCcw, CalendarRange, CreditCard, History, ShieldCheck } from "lucide-react";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { QuickAdd } from "@/components/quick-add";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const mainNavItems = [
  { name: "Inicio", href: "/", icon: LayoutDashboard },
  { name: "Transações", href: "/movimentacoes", icon: ReceiptText },
  { name: "Novo", href: "#", icon: Plus, isAction: true },
  { name: "Mais", href: "#", icon: MoreHorizontal, isSheetTrigger: true },
];

const allModules = [
  { name: "Contas", href: "/contas", icon: CreditCard },
  { name: "Fluxo de Caixa", href: "/fluxo-caixa", icon: Wallet },
  { name: "Contas a Pagar", href: "/contas-a-pagar", icon: BadgeDollarSign },
  { name: "Planejamento", href: "/orcamentos", icon: Target },
  { name: "Recorrências", href: "/recorrencias", icon: RotateCcw },
  { name: "Fechamento", href: "/fechamento", icon: CalendarRange },
  { name: "Relatórios", href: "/relatorios", icon: BarChart3 },
];

const adminModules = [
  { name: "Logs", href: "/admin/logs", icon: History },
  { name: "Aprovações", href: "/admin/aprovacoes", icon: ShieldCheck },
];

export function BottomNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [newOpen, setNewOpen] = useState(false);
  const [categories, setCategories] = useState<{ id: string; name: string; type: string }[]>([]);

  const isAdmin = session?.user?.role === "ADMIN";
  const modules = isAdmin ? [...allModules, ...adminModules] : allModules;

  if (pathname === "/login") return null;

  return (
    <>
      <nav
        aria-label="Navegação principal"
        className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background/80 backdrop-blur-xl border-t border-border"
        style={{
          height: "calc(4rem + max(0px, env(safe-area-inset-bottom)))",
          paddingBottom: "max(0px, env(safe-area-inset-bottom))",
        }}
      >
        <div className="flex items-stretch justify-around h-14 max-w-lg mx-auto px-2">
          {mainNavItems.map((item) => {
            const isActive = item.href !== "#" && (pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href)));
            const Icon = item.icon;

            if (item.isAction) {
              return (
                <button
                  key={item.name}
                  onClick={() => setNewOpen(true)}
                  aria-label="Adicionar transação"
                  className="flex flex-col items-center justify-center gap-0.5 flex-1 relative"
                >
                  <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-primary shadow-sm active:scale-95 transition-all">
                    <Icon className="w-5 h-5 text-on-primary" />
                  </div>
                  <span className="text-[9px] font-semibold text-primary tracking-wide">
                    {item.name}
                  </span>
                </button>
              );
            }

            if (item.isSheetTrigger) {
              return (
                <button
                  key={item.name}
                  onClick={() => setSheetOpen(true)}
                  aria-label="Explorar mais módulos"
                  className="flex flex-col items-center justify-center gap-0.5 flex-1 relative"
                >
                  <div className="flex items-center justify-center min-w-[44px] min-h-[44px] rounded-xl">
                    <Icon className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <span className="text-[9px] font-semibold text-muted-foreground tracking-wide">
                    {item.name}
                  </span>
                </button>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className="flex flex-col items-center justify-center gap-0.5 flex-1 relative"
              >
                {isActive && (
                  <span className="absolute top-1 left-1/2 -translate-x-1/2 w-6 h-0.5 rounded-full bg-primary" />
                )}
                <div className={cn(
                  "flex items-center justify-center min-w-[44px] min-h-[44px] rounded-xl",
                  isActive && "bg-primary/10"
                )}>
                  <Icon className={cn(
                    "w-5 h-5",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )} />
                </div>
                <span className={cn(
                  "text-[9px] font-semibold tracking-wide",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      <QuickAdd
        categories={categories}
        onSuccess={() => setNewOpen(false)}
        open={newOpen}
        onOpenChange={setNewOpen}
      />

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          side="bottom"
          showCloseButton={false}
          className="bg-card rounded-t-2xl shadow-xl border-t border-border"
          style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
        >
          <SheetHeader className="flex-row items-center justify-between p-5 border-b border-border">
            <SheetTitle className="text-base font-bold text-foreground">
              Explorar
            </SheetTitle>
            <SheetClose className="max-md:min-h-[44px] max-md:min-w-[44px] w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center">
              <X className="w-4 h-4 text-muted-foreground" />
              <span className="sr-only">Fechar</span>
            </SheetClose>
          </SheetHeader>
          <div className="p-4 grid grid-cols-4 gap-2">
            {modules.map((module) => {
              const Icon = module.icon;
              const isActive = pathname === module.href;
              return (
                <Link
                  key={module.href}
                  href={module.href}
                  onClick={() => setSheetOpen(false)}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all",
                    isActive ? "bg-primary/10 text-primary" : "hover:bg-surface-container text-on-surface-variant"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center",
                    isActive ? "bg-primary/15" : "bg-surface-container"
                  )}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[9px] font-semibold text-center leading-tight">{module.name}</span>
                </Link>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
