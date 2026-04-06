/**
 * Motor de Cálculo de Fluxo de Caixa Semanal
 *
 * Regras:
 * 1. Receita entra no caixa apenas na data de vencimento (parcela)
 * 2. Despesa sai do caixa na data de vencimento
 * 3. Semanas: W1 (1-7), W2 (8-14), W3 (15-21), W4 (22-31)
 */

import { startOfMonth, endOfMonth, getDate, isWithinInterval } from "date-fns";

export interface WeeklyCashflow {
  week: number;
  weekStart: string; // ISO date
  weekEnd: string; // ISO date
  totalIncome: number; // parcelas com status RECEIVED
  projectedIncome: number; // parcelas com status PENDING
  totalExpenses: number; // despesas vencendo
  balance: number; // income - expenses
  canSpend: boolean; // saldo > 0
}

export interface RevenueInstallmentData {
  id: string;
  amount: number;
  dueDate: Date;
  status: "PENDING" | "RECEIVED";
}

export interface ExpenseData {
  id: string;
  amount: number;
  dueDate: Date;
  paymentStatus: string;
}

/**
 * Calcula o intervalo de datas para uma semana específica do mês
 */
function getWeekDates(
  referenceDate: Date,
  weekNumber: 1 | 2 | 3 | 4
): { start: Date; end: Date } {
  const monthStart = startOfMonth(referenceDate);
  const monthEnd = endOfMonth(referenceDate);

  const dayRanges: Record<number, [number, number]> = {
    1: [1, 7],
    2: [8, 14],
    3: [15, 21],
    4: [22, 31],
  };

  const [dayStart, dayEnd] = dayRanges[weekNumber];

  const start = new Date(monthStart.getFullYear(), monthStart.getMonth(), dayStart);
  const end = new Date(monthStart.getFullYear(), monthStart.getMonth(), dayEnd);

  // Garantir que não ultrapassa o final do mês
  if (end > monthEnd) {
    return { start, end: monthEnd };
  }

  return { start, end };
}

/**
 * Calcula o fluxo de caixa semanal para um mês completo
 *
 * @param referenceDate - Data de referência (qualquer dia do mês)
 * @param revenueInstallments - Lista de parcelas de receita
 * @param expenses - Lista de despesas/lançamentos
 * @returns Array com 4 objetos representando cada semana
 */
export function calculateWeeklyCashflow(
  referenceDate: Date,
  revenueInstallments: RevenueInstallmentData[],
  expenses: ExpenseData[]
): WeeklyCashflow[] {
  const result: WeeklyCashflow[] = [];

  for (let weekNumber = 1; weekNumber <= 4; weekNumber++) {
    const { start, end } = getWeekDates(referenceDate, weekNumber as 1 | 2 | 3 | 4);

    // RECEITAS: filtrar parcelas que vencem nesta semana
    const weekIncome = revenueInstallments
      .filter((installment) =>
        isWithinInterval(installment.dueDate, { start, end })
      )
      .reduce((sum, installment) => sum + installment.amount, 0);

    // RECEITAS PROJETADAS: parcelas PENDING nesta semana
    const projectedIncome = revenueInstallments
      .filter(
        (installment) =>
          installment.status === "PENDING" &&
          isWithinInterval(installment.dueDate, { start, end })
      )
      .reduce((sum, installment) => sum + installment.amount, 0);

    // DESPESAS: filtrar despesas que vencem nesta semana
    const weekExpenses = expenses
      .filter((expense) =>
        isWithinInterval(expense.dueDate, { start, end })
      )
      .reduce((sum, expense) => sum + expense.amount, 0);

    const balance = weekIncome - weekExpenses;

    result.push({
      week: weekNumber,
      weekStart: start.toISOString().split("T")[0],
      weekEnd: end.toISOString().split("T")[0],
      totalIncome: weekIncome,
      projectedIncome: projectedIncome,
      totalExpenses: weekExpenses,
      balance: balance,
      canSpend: balance > 0,
    });
  }

  return result;
}

/**
 * Determina a decisão de gasto para a semana atual
 *
 * @param currentWeek - Número da semana atual (1-4)
 * @param weeklyCashflows - Array retornado por calculateWeeklyCashflow
 * @returns Status e motivo da decisão
 */
export function canSpendThisWeek(
  currentWeek: number,
  weeklyCashflows: WeeklyCashflow[]
): {
  status: "PODE_GASTAR" | "ALERTA" | "NAO_PODE_GASTAR";
  motivo: string;
  saldoAtual: number;
  saldoProximaSemana: number;
} {
  if (currentWeek < 1 || currentWeek > 4) {
    return {
      status: "NAO_PODE_GASTAR",
      motivo: "Semana inválida",
      saldoAtual: 0,
      saldoProximaSemana: 0,
    };
  }

  const currentWeekData = weeklyCashflows[currentWeek - 1];
  const nextWeekData = weeklyCashflows[currentWeek] || null;

  const saldoAtual = currentWeekData.balance;
  const saldoProximaSemana = nextWeekData?.balance || 0;

  // Regras de decisão
  if (saldoAtual > 0 && saldoProximaSemana > 0) {
    return {
      status: "PODE_GASTAR",
      motivo: "Saldo positivo esta semana e próxima",
      saldoAtual,
      saldoProximaSemana,
    };
  }

  if (saldoAtual > 0 && saldoProximaSemana <= 0) {
    return {
      status: "ALERTA",
      motivo: "Saldo positivo agora, mas próxima semana em risco",
      saldoAtual,
      saldoProximaSemana,
    };
  }

  if (saldoAtual <= 0) {
    return {
      status: "NAO_PODE_GASTAR",
      motivo: "Saldo negativo ou zerado nesta semana",
      saldoAtual,
      saldoProximaSemana,
    };
  }

  return {
    status: "ALERTA",
    motivo: "Situação indefinida",
    saldoAtual,
    saldoProximaSemana,
  };
}

/**
 * Calcula métricas de resumo do fluxo
 */
export function calculateCashflowMetrics(weeklyCashflows: WeeklyCashflow[]) {
  const totalIncome = weeklyCashflows.reduce((sum, w) => sum + w.totalIncome, 0);
  const totalExpenses = weeklyCashflows.reduce((sum, w) => sum + w.totalExpenses, 0);
  const totalProjectedIncome = weeklyCashflows.reduce(
    (sum, w) => sum + w.projectedIncome,
    0
  );
  const monthBalance = totalIncome - totalExpenses;

  return {
    totalIncome,
    totalExpenses,
    totalProjectedIncome,
    monthBalance,
    faturado: totalIncome + totalProjectedIncome, // FATURADO = recebido + a receber
    aReceber: totalProjectedIncome, // A RECEBER = parcelas pendentes
  };
}
