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
      const mins = Math.floor((Date.now() - lastUpdated.getTime()) / 60000);
      if (mins < 1) {
        setTimeAgo("agora");
      } else if (mins < 60) {
        setTimeAgo(`há ${mins} min`);
      } else {
        setTimeAgo(`há ${Math.floor(mins / 60)}h`);
      }
    }
  }, [lastUpdated]);

  return (
    <section aria-label="Resumo financeiro">
      <div className="bg-gradient-to-br from-primary to-cyan-600 overflow-hidden rounded-2xl p-6 md:p-8 text-white relative">
        <div className="relative z-10 space-y-6">
          {/* Top row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white/70">
              <Wallet className="w-4 h-4" aria-hidden="true" />
              <span className="text-xs font-semibold">Saldo Total</span>
              {!loading && timeAgo && (
                <>
                  <span className="text-white/30">·</span>
                  <span className="text-xs text-white/50">{timeAgo}</span>
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
              className="text-4xl md:text-5xl font-bold tracking-tight font-display"
            >
              {loading ? (
                <span aria-hidden="true" className="inline-block h-10 w-48 bg-white/20 animate-pulse rounded-lg" />
              ) : balance != null && !isNaN(balance) ? (
                formatCurrency(balance)
              ) : (
                <span className="text-white/40">—</span>
              )}
            </motion.p>
          </div>

          {/* Mini cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/10 rounded-xl p-4" aria-label={`Entradas: ${formatCurrency(income)}`}>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-white/60 mb-1">Entradas</p>
              <p className="text-base font-bold" aria-hidden="true">
                {loading ? <span className="inline-block h-4 w-16 bg-white/20 animate-pulse rounded" /> : formatCurrency(income)}
              </p>
            </div>
            <div className="bg-white/10 rounded-xl p-4" aria-label={`Saídas: ${formatCurrency(expenses)}`}>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-white/60 mb-1">Saídas</p>
              <p className="text-base font-bold" aria-hidden="true">
                {loading ? <span className="inline-block h-4 w-16 bg-white/20 animate-pulse rounded" /> : formatCurrency(expenses)}
              </p>
            </div>
            <div className="bg-white/10 rounded-xl p-4" aria-label={`Saldo do mês: ${formatCurrency(netMonth)}`}>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-white/60 mb-1">Saldo</p>
              <p className="text-base font-bold" aria-hidden="true">
                {loading ? <span className="inline-block h-4 w-16 bg-white/20 animate-pulse rounded" /> : formatCurrency(netMonth)}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <QuickAdd categories={categories} onSuccess={() => router.refresh()} />
            <Link
              href="/movimentacoes"
              className="h-10 px-4 rounded-xl bg-white/15 hover:bg-white/25 transition-all text-sm font-medium text-white flex items-center gap-2 active:scale-95"
            >
              <History className="w-4 h-4" />
              Extrato
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
