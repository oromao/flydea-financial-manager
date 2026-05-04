"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ReceiptText, BrainCircuit, User, MoreHorizontal, X, BarChart3, Wallet, BadgeDollarSign, Target, RotateCcw, CalendarRange, Brain, CreditCard, History, ShieldCheck, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";

const mainNavItems = [
  { name: "Início", href: "/", icon: LayoutDashboard },
  { name: "Fluxo", href: "/movimentacoes", icon: ReceiptText },
  { name: "IA", href: "/insights", icon: BrainCircuit },
  { name: "Mais", href: "#", icon: MoreHorizontal, isSheetTrigger: true },
];

const allModules = [
  { name: "Contas", href: "/contas", icon: CreditCard },
  { name: "Fluxo de Caixa", href: "/fluxo-caixa", icon: Wallet },
  { name: "Contas a Pagar", href: "/contas-a-pagar", icon: BadgeDollarSign },
  { name: "Planejamento", href: "/orcamentos", icon: Target },
  { name: "Recorrências", href: "/recorrencias", icon: RotateCcw },
  { name: "Fechamento", href: "/fechamento", icon: CalendarRange },
  { name: "IA", href: "/insights", icon: Brain },
  { name: "Análises", href: "/relatorios", icon: BarChart3 },
];

const adminModules = [
  { name: "Logs", href: "/admin/logs", icon: History },
  { name: "Aprovações", href: "/admin/aprovacoes", icon: ShieldCheck },
];

export function BottomNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [sheetOpen, setSheetOpen] = useState(false);

  const isAdmin = session?.user?.role === "ADMIN";
  const modules = isAdmin ? [...allModules, ...adminModules] : allModules;

  if (pathname === "/login") return null;

  return (
    <>
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-surface-container-lowest/95 backdrop-blur-2xl border-t border-outline/10"
        style={{
          height: "calc(4rem + max(0px, env(safe-area-inset-bottom)))",
          paddingBottom: "max(0px, env(safe-area-inset-bottom))",
        }}
      >
        <div className="flex items-stretch justify-around h-16 max-w-lg mx-auto px-2">
          {mainNavItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            const Icon = item.icon;

            if (item.isSheetTrigger) {
              return (
                <button
                  key={item.name}
                  onClick={() => setSheetOpen(true)}
                  className="flex flex-col items-center justify-center gap-1 flex-1 relative group"
                >
                  <div className="flex items-center justify-center min-w-[44px] min-h-[44px] rounded-2xl transition-all duration-200 group-active:bg-surface-container">
                    <Icon className="w-5 h-5 text-on-surface-variant/50 stroke-[1.5px]" />
                  </div>
                  <span className="text-[10px] font-bold tracking-wide transition-all duration-200 text-on-surface-variant/50">
                    {item.name}
                  </span>
                </button>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center gap-1 flex-1 relative group"
              >
                {isActive && (
                  <span className="absolute top-2 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-primary" />
                )}
                <div className={cn(
                  "flex items-center justify-center min-w-[44px] min-h-[44px] rounded-2xl transition-all duration-200",
                  isActive ? "bg-primary/10" : "group-active:bg-surface-container"
                )}>
                  <Icon className={cn(
                    "transition-all duration-200",
                    isActive ? "w-5 h-5 text-primary stroke-[2.5px]" : "w-5 h-5 text-on-surface-variant/50 stroke-[1.5px]"
                  )} />
                </div>
                <span className={cn(
                  "text-[10px] font-bold tracking-wide transition-all duration-200",
                  isActive ? "text-primary" : "text-on-surface-variant/50"
                )}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      <AnimatePresence>
        {sheetOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-[60] md:hidden"
              onClick={() => setSheetOpen(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-[70] md:hidden bg-surface rounded-t-[32px] shadow-2xl"
              style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
            >
              <div className="flex items-center justify-between p-6 border-b border-outline/10">
                <h2 className="text-xl font-black text-on-background">Explorar</h2>
                <button
                  onClick={() => setSheetOpen(false)}
                  className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center"
                  aria-label="Fechar painel"
                >
                  <X className="w-5 h-5 text-on-surface-variant" />
                </button>
              </div>
              <div className="p-4 grid grid-cols-4 gap-3">
                {modules.map((module) => {
                  const Icon = module.icon;
                  const isActive = pathname === module.href;
                  return (
                    <Link
                      key={module.href}
                      href={module.href}
                      onClick={() => setSheetOpen(false)}
                      className={cn(
                        "flex flex-col items-center gap-2 p-3 rounded-2xl transition-all",
                        isActive ? "bg-primary/10 text-primary" : "hover:bg-surface-variant/50 text-on-surface-variant"
                      )}
                    >
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center",
                        isActive ? "bg-primary/20" : "bg-surface-variant/50"
                      )}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-bold text-center leading-tight">{module.name}</span>
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
