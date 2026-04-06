"use client";

import { useEffect, useState } from "react";
import { AlertCircle, TrendingUp, TrendingDown, CheckCircle } from "lucide-react";

interface WeeklyForecast {
  week: {
    weekNumber: number;
    weekStart: string;
    weekEnd: string;
    display: string;
  };
  projectedIncome: number;
  receivedIncome: number;
  totalExpenses: number;
  balance: number;
  canSpend: boolean;
}

interface CashflowData {
  cashflow: {
    month: string;
    weeks: WeeklyForecast[];
    totalMonthIncome: number;
    totalMonthExpenses: number;
    monthBalance: number;
  };
  spendDecision: {
    canSpend: boolean;
    availableAmount: number;
    reason: string;
    weekNumber: number;
  };
}

export function WeeklyCashflow() {
  const [data, setData] = useState<CashflowData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCashflow() {
      try {
        const res = await fetch("/api/cashflow/weekly");
        if (!res.ok) throw new Error("Falha ao buscar fluxo");
        const json = await res.json();
        setData(json);
      } catch (error) {
        console.error("Error fetching cashflow:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCashflow();
  }, []);

  if (loading) {
    return <div className="text-center py-8">Carregando fluxo semanal...</div>;
  }

  if (!data) {
    return <div className="text-center py-8 text-red-600">Erro ao carregar dados</div>;
  }

  const { cashflow, spendDecision } = data;

  return (
    <div className="space-y-6">
      {/* Decisão de gastos */}
      <div
        className={`p-3 sm:p-4 rounded-lg border-2 ${
          spendDecision.canSpend
            ? "border-green-500 bg-green-50"
            : "border-red-500 bg-red-50"
        }`}
      >
        <div className="flex items-center gap-2 sm:gap-3">
          {spendDecision.canSpend ? (
            <CheckCircle className="text-green-600 shrink-0" size={24} />
          ) : (
            <AlertCircle className="text-red-600 shrink-0" size={24} />
          )}
          <div className="min-w-0">
            <p className="text-sm sm:text-base font-semibold text-gray-900">
              Semana {spendDecision.weekNumber}
            </p>
            <p className={`text-xs sm:text-sm ${spendDecision.canSpend ? "text-green-700" : "text-red-700"}`}>
              {spendDecision.reason}
            </p>
          </div>
        </div>
      </div>

      {/* Cards de semanas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {cashflow.weeks.map((week) => (
          <div
            key={week.week.weekNumber}
            className={`p-3 sm:p-4 rounded-lg border-2 ${
              week.balance >= 0
                ? "border-green-200 bg-green-50"
                : "border-red-200 bg-red-50"
            }`}
          >
            <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-3">
              {week.week.display}
            </h3>

            <div className="space-y-2 text-xs sm:text-sm">
              {/* Receitas */}
              <div className="flex items-center justify-between gap-1">
                <span className="text-gray-600 flex items-center gap-1 shrink-0">
                  <TrendingUp size={16} />
                  <span className="hidden sm:inline">Receitas</span>
                  <span className="sm:hidden">Rec.</span>
                </span>
                <span className="text-green-700 font-semibold text-right">
                  +R$ {(week.receivedIncome + week.projectedIncome).toFixed(2)}
                </span>
              </div>
              <div className="text-[11px] sm:text-xs text-gray-500 ml-5">
                Recebido: R$ {week.receivedIncome.toFixed(2)}
              </div>
              <div className="text-[11px] sm:text-xs text-gray-500 ml-5">
                Previsto: R$ {week.projectedIncome.toFixed(2)}
              </div>

              <hr className="my-2 border-gray-300" />

              {/* Despesas */}
              <div className="flex items-center justify-between gap-1">
                <span className="text-gray-600 flex items-center gap-1 shrink-0">
                  <TrendingDown size={16} />
                  <span className="hidden sm:inline">Despesas</span>
                  <span className="sm:hidden">Desp.</span>
                </span>
                <span className="text-red-700 font-semibold text-right">
                  -R$ {week.totalExpenses.toFixed(2)}
                </span>
              </div>

              <hr className="my-2 border-gray-300" />

              {/* Saldo */}
              <div className="flex items-center justify-between font-bold text-sm sm:text-base">
                <span>Saldo</span>
                <span
                  className={`text-right ${
                    week.balance >= 0
                      ? "text-green-700"
                      : "text-red-700"
                  }`}
                >
                  R$ {week.balance.toFixed(2)}
                </span>
              </div>

              {/* Status */}
              <div className="mt-3 pt-2 border-t border-gray-300">
                <span
                  className={`text-[11px] sm:text-xs font-semibold px-2 py-1 rounded inline-block ${
                    week.canSpend
                      ? "bg-green-200 text-green-800"
                      : "bg-red-200 text-red-800"
                  }`}
                >
                  {week.canSpend ? "Pode Gastar" : "Atenção"}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Resumo mensal */}
      <div className="bg-gray-100 p-3 sm:p-4 rounded-lg">
        <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-4">
          Resumo - {cashflow.month}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-center">
          <div>
            <p className="text-[11px] sm:text-xs text-gray-600 mb-1">Total Receitas</p>
            <p className="text-sm sm:text-base font-bold text-green-700">
              R$ {cashflow.totalMonthIncome.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-[11px] sm:text-xs text-gray-600 mb-1">Total Despesas</p>
            <p className="text-sm sm:text-base font-bold text-red-700">
              R$ {cashflow.totalMonthExpenses.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-[11px] sm:text-xs text-gray-600 mb-1">Saldo do Mês</p>
            <p
              className={`text-sm sm:text-base font-bold ${
                cashflow.monthBalance >= 0 ? "text-green-700" : "text-red-700"
              }`}
            >
              R$ {cashflow.monthBalance.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
