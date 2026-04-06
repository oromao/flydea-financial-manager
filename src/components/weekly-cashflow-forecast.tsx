"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface WeeklyCashflow {
  week: number;
  weekStart: string;
  weekEnd: string;
  totalIncome: number;
  projectedIncome: number;
  totalExpenses: number;
  balance: number;
  canSpend: boolean;
}

interface Metrics {
  totalIncome: number;
  totalExpenses: number;
  totalProjectedIncome: number;
  monthBalance: number;
  faturado: number;
  aReceber: number;
}

export function WeeklyCashflowForecast() {
  const [data, setData] = useState<WeeklyCashflow[] | null>(null);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCashflow() {
      try {
        setLoading(true);
        const res = await fetch("/api/cashflow/weekly");
        if (!res.ok) throw new Error("Failed to fetch cashflow");
        const result = await res.json();
        setData(result.data);
        setMetrics(result.metrics);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    fetchCashflow();
  }, []);

  if (loading) {
    return (
      <Card className="premium-card p-6 col-span-full">
        <p className="text-center text-on-surface-variant animate-pulse">
          Carregando previsão semanal...
        </p>
      </Card>
    );
  }

  if (error || !data || !metrics) {
    return (
      <Card className="premium-card p-6 col-span-full border-amber-100 bg-amber-50/20">
        <p className="text-center text-amber-700 font-semibold">
          {error || "Sem dados disponíveis"}
        </p>
      </Card>
    );
  }

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
      value
    );

  return (
    <div className="space-y-6 col-span-full">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-on-background tracking-tight">
          Previsão Semanal
        </h2>
        <p className="text-sm text-on-surface-variant">
          Fluxo de caixa por semana - mês atual
        </p>
      </div>

      {/* Métricas Resumidas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Card className="premium-card p-4 sm:p-5">
          <p className="text-xs font-bold uppercase text-on-surface-variant mb-1">
            Faturado
          </p>
          <p className="text-2xl sm:text-3xl font-bold text-secondary">
            {formatCurrency(metrics.faturado)}
          </p>
          <p className="text-[10px] text-on-surface-variant/60 mt-2">
            Recebido + A receber
          </p>
        </Card>

        <Card className="premium-card p-4 sm:p-5">
          <p className="text-xs font-bold uppercase text-on-surface-variant mb-1">
            A Receber
          </p>
          <p className="text-2xl sm:text-3xl font-bold text-amber-600">
            {formatCurrency(metrics.aReceber)}
          </p>
          <p className="text-[10px] text-on-surface-variant/60 mt-2">
            Parcelas pendentes
          </p>
        </Card>

        <Card
          className={cn(
            "premium-card p-4 sm:p-5 transition-colors",
            metrics.monthBalance >= 0
              ? "border-emerald-100 bg-emerald-50/20"
              : "border-red-100 bg-red-50/20"
          )}
        >
          <p className="text-xs font-bold uppercase text-on-surface-variant mb-1">
            Saldo do Mês
          </p>
          <p
            className={cn(
              "text-2xl sm:text-3xl font-bold",
              metrics.monthBalance >= 0 ? "text-emerald-600" : "text-red-600"
            )}
          >
            {formatCurrency(metrics.monthBalance)}
          </p>
          <p className="text-[10px] text-on-surface-variant/60 mt-2">
            Receitas - Despesas
          </p>
        </Card>
      </div>

      {/* Cards Semanais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {data.map((week, idx) => (
          <motion.div
            key={week.week}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card
              className={cn(
                "premium-card p-4 sm:p-5 relative overflow-hidden group",
                week.balance >= 0
                  ? "border-emerald-100/40 hover:border-emerald-100/70"
                  : "border-red-100/40 hover:border-red-100/70"
              )}
            >
              {/* Background indicator */}
              <div
                className={cn(
                  "absolute inset-0 opacity-5 transition-opacity group-hover:opacity-10",
                  week.balance >= 0 ? "bg-emerald-500" : "bg-red-500"
                )}
              />

              <div className="relative space-y-3">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-on-background">
                    Semana {week.week}
                  </h3>
                  {week.balance >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-600" />
                  )}
                </div>

                {/* Dates */}
                <p className="text-[10px] text-on-surface-variant/60">
                  {new Date(week.weekStart).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "short",
                  })}{" "}
                  a{" "}
                  {new Date(week.weekEnd).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "short",
                  })}
                </p>

                <div className="border-t border-outline/10 pt-3 space-y-2">
                  {/* Entradas */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-on-surface-variant/70">
                      Entradas
                    </span>
                    <span className="text-sm font-bold text-emerald-600">
                      +{formatCurrency(week.totalIncome).split(" ")[1]}
                    </span>
                  </div>

                  {/* Saídas */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-on-surface-variant/70">
                      Saídas
                    </span>
                    <span className="text-sm font-bold text-red-600">
                      -{formatCurrency(week.totalExpenses).split(" ")[1]}
                    </span>
                  </div>

                  {/* Saldo */}
                  <div className="border-t border-outline/10 pt-2 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-on-surface-variant/70">
                      SALDO
                    </span>
                    <span
                      className={cn(
                        "text-base font-black",
                        week.balance >= 0 ? "text-emerald-600" : "text-red-600"
                      )}
                    >
                      {formatCurrency(week.balance).split(" ")[1]}
                    </span>
                  </div>
                </div>

                {/* Status Indicator */}
                <div
                  className={cn(
                    "flex items-center gap-2 px-2 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider",
                    week.canSpend
                      ? "bg-emerald-100/50 text-emerald-700"
                      : "bg-red-100/50 text-red-700"
                  )}
                >
                  {week.canSpend ? (
                    <>
                      <CheckCircle2 className="w-3 h-3" />
                      Pode gastar
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3 h-3" />
                      Não pode
                    </>
                  )}
                </div>

                {/* Projeção */}
                {week.projectedIncome > 0 && (
                  <p className="text-[9px] text-amber-600 font-semibold px-2 py-1 bg-amber-50/50 rounded">
                    💡 {formatCurrency(week.projectedIncome)} a receber
                  </p>
                )}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Dica */}
      <Card className="premium-card p-4 sm:p-5 bg-secondary/5 border-secondary/20">
        <p className="text-[10px] text-on-surface-variant leading-relaxed">
          <span className="font-bold">📊 Como funciona:</span> A previsão semanal
          mostra quando o dinheiro entra realmente no seu caixa (parcelas recebidas),
          não quando é faturado. Despesas entram na data de vencimento.
        </p>
      </Card>
    </div>
  );
}
