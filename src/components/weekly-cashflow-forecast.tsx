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
        setError(null);
        const res = await fetch("/api/cashflow/weekly");
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `HTTP ${res.status}`);
        }
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
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-secondary mb-2" />
          <p className="text-on-surface-variant text-sm">Carregando previsão semanal...</p>
        </div>
      </Card>
    );
  }

  if (error || !data || !metrics) {
    return (
      <Card className="premium-card p-6 col-span-full border-amber-100 bg-amber-50/20">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
          <p className="text-amber-700 font-semibold">
            {error || "Sem dados disponíveis"}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 px-3 py-1.5 bg-amber-600 text-white rounded text-xs font-semibold hover:bg-amber-700"
          >
            Tentar novamente
          </button>
        </div>
      </Card>
    );
  }

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);

  // Extract numeric value from formatted currency for display after + or -
  const formatValue = (value: number) => {
    const formatted = formatCurrency(value);
    // "R$ 1.234,56" → "1.234,56"
    return formatted.replace(/^R\$\s*/, "");
  };

  return (
    <div className="space-y-6 col-span-full">
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-lg font-bold text-on-background tracking-tight">
          Previsão Semanal
        </h2>
        <p className="text-xs text-on-surface-variant">
          Fluxo de caixa por semana — mês atual
        </p>
      </div>

      {/* Métricas Resumidas */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Card className="premium-card p-4">
          <p className="text-[10px] font-bold uppercase text-on-surface-variant/70">
            Faturado
          </p>
          <p className="text-xl font-bold text-secondary mt-1">
            {formatCurrency(metrics.faturado)}
          </p>
          <p className="text-[9px] text-on-surface-variant/50 mt-1">
            Recebido + A receber
          </p>
        </Card>

        <Card className="premium-card p-4">
          <p className="text-[10px] font-bold uppercase text-on-surface-variant/70">
            A Receber
          </p>
          <p className="text-xl font-bold text-amber-600 mt-1">
            {formatCurrency(metrics.aReceber)}
          </p>
          <p className="text-[9px] text-on-surface-variant/50 mt-1">
            Parcelas pendentes
          </p>
        </Card>

        <Card
          className={cn(
            "premium-card p-4",
            metrics.monthBalance >= 0
              ? "border-emerald-100 bg-emerald-50/20"
              : "border-red-100 bg-red-50/20"
          )}
        >
          <p className="text-[10px] font-bold uppercase text-on-surface-variant/70">
            Saldo do Mês
          </p>
          <p
            className={cn(
              "text-xl font-bold",
              metrics.monthBalance >= 0 ? "text-emerald-600" : "text-red-600"
            )}
          >
            {formatCurrency(metrics.monthBalance)}
          </p>
          <p className="text-[9px] text-on-surface-variant/50 mt-1">
            Receitas - Despesas
          </p>
        </Card>
      </div>

      {/* Cards Semanais */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {data.map((week, idx) => (
          <motion.div
            key={week.week}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card
              className={cn(
                "premium-card p-4 relative overflow-hidden group",
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

              <div className="relative space-y-2">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-on-background text-sm">
                    Semana {week.week}
                  </h3>
                  {week.canSpend ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600" />
                  )}
                </div>

                {/* Dates */}
                <p className="text-[9px] text-on-surface-variant/60">
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

                <div className="border-t border-outline/10 pt-2 space-y-1.5">
                  {/* Entradas */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-on-surface-variant/70">
                      Entradas
                    </span>
                    <span className="text-xs font-bold text-emerald-600">
                      +{formatValue(week.totalIncome)}
                    </span>
                  </div>

                  {/* Saídas */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-on-surface-variant/70">
                      Saídas
                    </span>
                    <span className="text-xs font-bold text-red-600">
                      -{formatValue(week.totalExpenses)}
                    </span>
                  </div>

                  {/* Saldo */}
                  <div className="border-t border-outline/10 pt-1.5 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-on-surface-variant/70">
                      SALDO
                    </span>
                    <span
                      className={cn(
                        "text-sm font-black",
                        week.balance >= 0 ? "text-emerald-600" : "text-red-600"
                      )}
                    >
                      {formatValue(week.balance)}
                    </span>
                  </div>
                </div>

                {/* Status Indicator */}
                <div
                  className={cn(
                    "flex items-center gap-1.5 px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wider",
                    week.canSpend
                      ? "bg-emerald-100/50 text-emerald-700"
                      : "bg-red-100/50 text-red-700"
                  )}
                >
                  {week.canSpend ? "Pode gastar" : "Atenção"}
                </div>

                {/* Projeção */}
                {week.projectedIncome > 0 && (
                  <p className="text-[9px] text-amber-600 font-semibold px-2 py-0.5 bg-amber-50/50 rounded">
                    💡 {formatCurrency(week.projectedIncome)} a receber
                  </p>
                )}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Dica */}
      <Card className="premium-card p-4 bg-secondary/5 border-secondary/20">
        <p className="text-[10px] text-on-surface-variant leading-relaxed">
          <span className="font-bold">📊 Como funciona:</span> A previsão semanal
          mostra quando o dinheiro entra no caixa (parcelas recebidas) e quando as
          despesas vencem. Valores são do mês atual.
        </p>
      </Card>
    </div>
  );
}
