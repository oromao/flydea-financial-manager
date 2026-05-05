"use client";

import { useState, useEffect } from "react";
import { Wallet, History, ArrowUpRight, Plus, TrendingUp, TrendingDown } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { QuickAdd } from "@/components/quick-add";
import { cn } from "@/lib/utils";

interface DashboardHeroProps {
  balance: number;
  loading: boolean;
  income: number;
  expenses: number;
  lastUpdated: Date | null;
  categories: any[];
}

export function DashboardHero({ balance, loading, income, expenses, lastUpdated, categories }: DashboardHeroProps) {
  const router = useRouter();
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

  const netMonth = income - expenses;
  const [timeAgo, setTimeAgo] = useState<string | null>(null);

  useEffect(() => {
    if (lastUpdated && !isNaN(lastUpdated.getTime())) {
      setTimeAgo(
        new Intl.RelativeTimeFormat("pt-BR", { numeric: "auto" }).format(
          -Math.round((Date.now() - lastUpdated.getTime()) / 60000),
          "minute"
        )
      );
    }
  }, [lastUpdated]);

  return (
    <section className="relative">
      {/* Hero Card */}
      <div className="bg-primary overflow-hidden rounded-[32px] md:rounded-[40px] p-6 md:p-10 shadow-2xl text-white relative">
        {/* Ambient glow effects */}
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-56 h-56 bg-black/10 rounded-full blur-2xl" />

        <div className="relative z-10 space-y-8">
          {/* Top row: Label + Icon */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-white/50">
              <Wallet className="w-3.5 h-3.5" aria-hidden="true" />
              <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em]">Saldo Geral</span>
              {!loading && timeAgo && (
                <>
                  <div className="w-1 h-1 rounded-full bg-white/20" />
                  <span className="text-[10px] md:text-xs text-white/30">atualizado {timeAgo}</span>
                </>
              )}
            </div>
            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10">
              <Wallet className="w-5 h-5 md:w-6 md:h-6 text-white" aria-hidden="true" />
            </div>
          </div>

          {/* Balance - Hero display */}
          <div>
            <motion.p
              key={balance}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="text-[42px] md:text-[56px] font-display font-extrabold tracking-tight leading-none"
            >
              {loading ? (
                <span className="inline-block h-12 md:h-16 w-48 md:w-72 bg-white/10 animate-pulse rounded-2xl" />
              ) : (
                formatCurrency(balance)
              )}
            </motion.p>
          </div>

          {/* Mini cards: Entradas / Saídas / Saldo do Mês */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 md:p-4 border border-white/5">
              <div className="flex items-center gap-1.5 mb-1">
                <ArrowUpRight className="w-3 h-3 text-white/60" />
                <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-white/50">Entradas</p>
              </div>
              <p className="text-sm md:text-base font-display font-bold">
                {loading ? (
                  <span className="inline-block h-4 w-16 bg-white/10 animate-pulse rounded" />
                ) : (
                  formatCurrency(income)
                )}
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 md:p-4 border border-white/5">
              <div className="flex items-center gap-1.5 mb-1">
                <ArrowUpRight className="w-3 h-3 rotate-180 text-white/60" />
                <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-white/50">Saídas</p>
              </div>
              <p className="text-sm md:text-base font-display font-bold">
                {loading ? (
                  <span className="inline-block h-4 w-16 bg-white/10 animate-pulse rounded" />
                ) : (
                  formatCurrency(expenses)
                )}
              </p>
            </div>

            <div className={cn(
              "backdrop-blur-sm rounded-2xl p-3 md:p-4 border",
              netMonth >= 0
                ? "bg-white/10 border-white/5"
                : "bg-white/5 border-white/10"
            )}>
              <div className="flex items-center gap-1.5 mb-1">
                {netMonth >= 0 ? (
                  <TrendingUp className="w-3 h-3 text-white/60" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-white/60" />
                )}
                <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-white/50">Saldo Mês</p>
              </div>
              <p className="text-sm md:text-base font-display font-bold">
                {loading ? (
                  <span className="inline-block h-4 w-16 bg-white/10 animate-pulse rounded" />
                ) : (
                  formatCurrency(netMonth)
                )}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <QuickAdd categories={categories} onSuccess={() => router.refresh()} />
            <Link
              href="/movimentacoes"
              className="h-11 md:h-12 px-5 md:px-8 rounded-2xl bg-white/10 hover:bg-white/20 transition-all text-sm md:text-base font-semibold text-white flex items-center gap-2 backdrop-blur-sm border border-white/5 shadow-lg active:scale-95"
            >
              <History className="w-4 h-4 md:w-5 md:h-5" />
              Extrato
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
