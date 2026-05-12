"use client";

import { useState, useEffect } from "react";
import { Wallet, History, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { QuickAdd } from "@/components/quick-add";
import { cn } from "@/lib/utils";

interface DashboardHeroProps {
  balance: number;
  projectedBalance: number;
  loading: boolean;
  income: number;
  expenses: number;
  lastUpdated: Date | null;
  categories: { id: string; name: string; type: string }[];
}

export function DashboardHero({ balance, projectedBalance, loading, income, expenses, lastUpdated, categories }: DashboardHeroProps) {
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
    <section aria-label="Resumo financeiro" className="relative">
      {/* Hero Card - Minimal */}
      <div className="bg-primary overflow-hidden rounded-3xl p-6 md:p-8 text-white relative">
        <div className="relative z-10 space-y-8">
          {/* Top row: Label */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white/60">
              <Wallet className="w-4 h-4" aria-hidden="true" />
              <span className="text-xs font-bold uppercase tracking-wider">Saldo Total</span>
              {!loading && timeAgo && (
                <>
                  <div className="w-1 h-1 rounded-full bg-white/20" />
                  <span className="text-xs text-white/40">{timeAgo}</span>
                </>
              )}
            </div>
          </div>

            {/* Balance */}
            <div aria-live="polite" aria-atomic="true">
              <motion.p
                key={balance}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="text-4xl md:text-5xl font-black tracking-tight leading-none"
              >
                {loading ? (
                  <span aria-hidden="true" className="inline-block h-12 w-48 bg-white/10 animate-pulse rounded-lg" />
                ) : balance != null && !isNaN(balance) ? (
                  formatCurrency(balance)
                ) : (
                  <span className="text-white/40">—</span>
                )}
              </motion.p>
            </div>

          {/* Mini cards: Entradas / Saídas / Saldo do Mês */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white/5 rounded-xl p-4" aria-label={`Entradas: ${formatCurrency(income)}`}>
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/50 mb-1">Entradas</p>
              <p className="text-lg font-bold" aria-hidden="true">
                {loading ? <span className="inline-block h-5 w-20 bg-white/10 animate-pulse rounded" /> : formatCurrency(income)}
              </p>
            </div>

            <div className="bg-white/5 rounded-xl p-4" aria-label={`Saídas: ${formatCurrency(expenses)}`}>
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/50 mb-1">Saídas</p>
              <p className="text-lg font-bold" aria-hidden="true">
                {loading ? <span className="inline-block h-5 w-20 bg-white/10 animate-pulse rounded" /> : formatCurrency(expenses)}
              </p>
            </div>

            <div className={cn("rounded-xl p-4", netMonth >= 0 ? "bg-white/5" : "bg-white/5")} aria-label={`Saldo do mês: ${formatCurrency(netMonth)}`}>
              <p className="text-[10px] font-bold uppercase tracking-wider text-white/50 mb-1">Saldo</p>
              <p className="text-lg font-bold" aria-hidden="true">
                {loading ? <span className="inline-block h-5 w-20 bg-white/10 animate-pulse rounded" /> : formatCurrency(netMonth)}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <QuickAdd categories={categories} onSuccess={() => router.refresh()} />
            <Link
              href="/movimentacoes"
              className="h-11 md:h-12 px-5 md:px-8 rounded-2xl bg-accent/10 hover:bg-accent/20 transition-all text-sm md:text-base font-semibold text-white flex items-center gap-2 border border-border shadow-lg active:scale-95"
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
