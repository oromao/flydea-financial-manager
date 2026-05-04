"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, TrendingUp, TrendingDown, CheckCircle } from "lucide-react";

interface WeeklyForecast {
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

interface CashflowResponse {
  data: WeeklyForecast[];
  metrics: Metrics;
  referenceDate: string;
}

export function WeeklyCashflow() {
  const router = useRouter();
  const [data, setData] = useState<CashflowResponse | null>(null);
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
        const json = await res.json();
        setData(json);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erro desconhecido";
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    fetchCashflow();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-secondary mb-3" />
        <p className="text-on-surface-variant text-sm">Carregando fluxo semanal...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-10 h-10 text-destructive mx-auto mb-3" />
        <p className="text-destructive font-semibold">Erro ao carregar dados</p>
        <p className="text-on-surface-variant text-sm mt-1">{error || "Tente novamente mais tarde."}</p>
        <button
          onClick={() => router.refresh()}
          className="mt-4 px-4 py-2 bg-secondary text-white rounded-lg text-sm font-semibold hover:opacity-90"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  const { data: weeks, metrics } = data;

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

  const now = new Date();
  const monthLabel = now.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="p-4 rounded-lg border border-secondary/20 bg-secondary/5">
          <p className="text-xs font-bold uppercase text-on-surface-variant/70">Faturado</p>
          <p className="text-2xl font-bold text-secondary mt-1">{formatCurrency(metrics.faturado)}</p>
          <p className="text-[10px] text-on-surface-variant/50 mt-1">Recebido + A receber</p>
        </div>
        <div className="p-4 rounded-lg border border-primary/20 bg-primary/5">
          <p className="text-xs font-bold uppercase text-on-surface-variant/70">A Receber</p>
          <p className="text-2xl font-bold text-primary mt-1">{formatCurrency(metrics.aReceber)}</p>
          <p className="text-[10px] text-on-surface-variant/50 mt-1">Parcelas pendentes</p>
        </div>
        <div
          className={`p-4 rounded-lg border ${
            metrics.monthBalance >= 0
              ? "border-secondary/20 bg-secondary/5"
              : "border-destructive/20 bg-destructive/5"
          }`}
        >
          <p className="text-xs font-bold uppercase text-on-surface-variant/70">Saldo do Mês</p>
          <p className={`text-2xl font-bold mt-1 ${metrics.monthBalance >= 0 ? "text-secondary" : "text-destructive"}`}>
            {formatCurrency(metrics.monthBalance)}
          </p>
          <p className="text-[10px] text-on-surface-variant/50 mt-1">Receitas - Despesas</p>
        </div>
      </div>

      {/* Weekly cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {weeks.map((week) => (
          <div
            key={week.week}
            className={`p-4 rounded-lg border-2 ${
              week.balance >= 0
                ? "border-secondary/20 bg-secondary/5"
                : "border-destructive/20 bg-destructive/5"
            }`}
          >
            <h3 className="text-sm font-semibold text-on-background mb-3">
              Semana {week.week}
            </h3>
            <p className="text-[10px] text-on-surface-variant/60 mb-3">
              {new Date(week.weekStart).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
              {" - "}
              {new Date(week.weekEnd).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
            </p>

            <div className="space-y-2 text-xs sm:text-sm">
              {/* Entradas */}
              <div className="flex items-center justify-between gap-1">
                <span className="text-on-surface-variant flex items-center gap-1 shrink-0">
                  <TrendingUp size={16} />
                  Entradas
                </span>
                <span className="text-success font-semibold text-right">
                  +{formatCurrency(week.totalIncome)}
                </span>
              </div>
              {week.totalIncome > 0 && (
                <div className="text-[10px] text-on-surface-variant/60 ml-5">
                  Recebido: {formatCurrency(week.totalIncome - week.projectedIncome)}
                  {week.projectedIncome > 0 && ` | Previsto: ${formatCurrency(week.projectedIncome)}`}
                </div>
              )}

              <hr className="my-2 border-outline/30" />

              {/* Saídas */}
              <div className="flex items-center justify-between gap-1">
                <span className="text-on-surface-variant flex items-center gap-1 shrink-0">
                  <TrendingDown size={16} />
                  Saídas
                </span>
                <span className="text-destructive font-semibold text-right">
                  -{formatCurrency(week.totalExpenses)}
                </span>
              </div>

              <hr className="my-2 border-outline/30" />

              {/* Saldo */}
              <div className="flex items-center justify-between font-bold text-sm">
                <span>Saldo</span>
                <span className={week.balance >= 0 ? "text-secondary" : "text-destructive"}>
                  {formatCurrency(week.balance)}
                </span>
              </div>

              {/* Status */}
              <div className="mt-3 pt-2 border-t border-outline/30">
                {week.canSpend ? (
                  <span className="text-[10px] font-semibold px-2 py-1 rounded bg-success/20 text-success inline-block">
                    <CheckCircle size={12} className="inline mr-1 -mt-0.5" />
                    Pode Gastar
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold px-2 py-1 rounded bg-destructive/10 text-destructive inline-block">
                    <AlertCircle size={12} className="inline mr-1 -mt-0.5" />
                    Atenção
                  </span>
                )}
              </div>

              {/* Projection hint */}
              {week.projectedIncome > 0 && (
                <p className="text-[9px] text-primary font-semibold px-2 py-1 bg-primary/10 rounded">
                  💡 {formatCurrency(week.projectedIncome)} a receber
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Monthly summary */}
      <div className="bg-surface-variant p-4 rounded-lg">
        <h3 className="text-sm font-semibold text-on-background mb-4">
          Resumo — {monthLabel}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-[10px] text-on-surface-variant mb-1">Total Receitas</p>
            <p className="text-lg font-bold text-success">
              {formatCurrency(metrics.totalIncome)}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-on-surface-variant mb-1">Total Despesas</p>
            <p className="text-lg font-bold text-destructive">
              {formatCurrency(metrics.totalExpenses)}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-on-surface-variant mb-1">Saldo do Mês</p>
            <p className={`text-lg font-bold ${metrics.monthBalance >= 0 ? "text-secondary" : "text-destructive"}`}>
              {formatCurrency(metrics.monthBalance)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
