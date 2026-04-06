import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, addWeeks, isBefore, isAfter, isSameDay } from "date-fns";
import { prisma } from "./prisma";

export interface WeekInfo {
  weekNumber: number;
  weekStart: Date;
  weekEnd: Date;
  display: string;
}

export interface WeeklyForecast {
  week: WeekInfo;
  projectedIncome: number;
  receivedIncome: number;
  totalExpenses: number;
  balance: number;
  canSpend: boolean;
}

export interface MonthCashflow {
  month: string;
  monthStart: Date;
  monthEnd: Date;
  weeks: WeeklyForecast[];
  totalMonthIncome: number;
  totalMonthExpenses: number;
  monthBalance: number;
}

/**
 * Divide um mês em semanas com início/fim corretos
 * W1: do 1º até domingo da primeira semana
 * W2-W4: semanas completas
 * W5 (se houver): dias restantes
 */
export function getWeeksForMonth(date: Date): WeekInfo[] {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const weeks: WeekInfo[] = [];

  let currentDate = monthStart;
  let weekNumber = 1;

  while (isBefore(currentDate, monthEnd)) {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday
    let weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 }); // Sunday

    // Adjustar se a semana ultrapassa o fim do mês
    if (isAfter(weekEnd, monthEnd)) {
      weekEnd = monthEnd;
    }

    weeks.push({
      weekNumber,
      weekStart,
      weekEnd,
      display: `W${weekNumber}`
    });

    currentDate = addWeeks(weekEnd, 1);
    weekNumber++;
  }

  return weeks;
}

/**
 * Calcula em qual semana uma data cai (dentro de um mês)
 */
export function getWeekNumberForDate(date: Date, monthStart: Date): number {
  const weeks = getWeeksForMonth(monthStart);
  const week = weeks.find(
    w => !isBefore(date, w.weekStart) && !isAfter(date, w.weekEnd)
  );
  return week?.weekNumber || 0;
}

/**
 * Motor principal: Calcula fluxo de caixa semanal
 * Leva em conta:
 * - Invoices emitidas + suas parcelas (data de vencimento)
 * - Transactions de INCOME (já recebidas)
 * - Transactions de EXPENSE (a pagar)
 * - Parcelas já pagas vs pendentes
 */
export async function calculateWeeklyCashflow(
  userId: string,
  date: Date = new Date()
): Promise<MonthCashflow> {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const weeks = getWeeksForMonth(date);

  // Buscar todas as invoices + installments do mês
  const invoices = await prisma.invoice.findMany({
    where: {
      userId,
      emissionDate: { gte: monthStart, lte: monthEnd }
    },
    include: { installments: true }
  });

  // Buscar transactions do mês
  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      date: { gte: monthStart, lte: monthEnd }
    }
  });

  const weeklyData: WeeklyForecast[] = weeks.map((week) => {
    let projectedIncome = 0;
    let receivedIncome = 0;
    let totalExpenses = 0;

    // Processar parcelas de invoices que vencem nesta semana
    invoices.forEach((invoice) => {
      invoice.installments.forEach((installment) => {
        const instDate = new Date(installment.dueDate);
        if (
          !isBefore(instDate, week.weekStart) &&
          !isAfter(instDate, week.weekEnd)
        ) {
          // Parcela vence nesta semana
          if (installment.status === "RECEIVED" || installment.paidAt) {
            // Já foi recebida
            receivedIncome += installment.paidAmount || installment.amount;
          } else {
            // Ainda está pendente
            projectedIncome += installment.amount;
          }
        }
      });
    });

    // Processar transactions (INCOME já registrada, EXPENSE a pagar)
    transactions.forEach((tx) => {
      const txDate = new Date(tx.date);
      if (
        !isBefore(txDate, week.weekStart) &&
        !isAfter(txDate, week.weekEnd)
      ) {
        if (tx.type === "INCOME") {
          // Transaction de renda é o que já foi recebido
          if (tx.paymentStatus === "PAID" || tx.paidAt) {
            receivedIncome += tx.amount;
          } else {
            projectedIncome += tx.amount;
          }
        } else if (tx.type === "EXPENSE") {
          totalExpenses += tx.amount;
        }
      }
    });

    const balance = projectedIncome + receivedIncome - totalExpenses;
    const canSpend = balance > 0;

    return {
      week,
      projectedIncome,
      receivedIncome,
      totalExpenses,
      balance,
      canSpend
    };
  });

  const totalMonthIncome = weeklyData.reduce(
    (sum, w) => sum + w.projectedIncome + w.receivedIncome,
    0
  );
  const totalMonthExpenses = weeklyData.reduce(
    (sum, w) => sum + w.totalExpenses,
    0
  );
  const monthBalance = totalMonthIncome - totalMonthExpenses;

  return {
    month: monthStart.toLocaleDateString("pt-BR", {
      month: "long",
      year: "numeric"
    }),
    monthStart,
    monthEnd,
    weeks: weeklyData,
    totalMonthIncome,
    totalMonthExpenses,
    monthBalance
  };
}

/**
 * Função de decisão: posso gastar nesta semana?
 */
export async function canSpendThisWeek(userId: string): Promise<{
  canSpend: boolean;
  availableAmount: number;
  reason: string;
  weekNumber: number;
}> {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const cashflow = await calculateWeeklyCashflow(userId, monthStart);

  // Encontrar a semana atual
  const weeks = getWeeksForMonth(monthStart);
  const currentWeek = weeks.find(
    w => !isBefore(now, w.weekStart) && !isAfter(now, w.weekEnd)
  );

  if (!currentWeek) {
    return {
      canSpend: false,
      availableAmount: 0,
      reason: "Semana não encontrada",
      weekNumber: 0
    };
  }

  const weekForecast = cashflow.weeks.find(
    w => w.week.weekNumber === currentWeek.weekNumber
  );

  if (!weekForecast) {
    return {
      canSpend: false,
      availableAmount: 0,
      reason: "Dados da semana não disponíveis",
      weekNumber: currentWeek.weekNumber
    };
  }

  return {
    canSpend: weekForecast.canSpend,
    availableAmount: Math.max(0, weekForecast.balance),
    reason: weekForecast.canSpend
      ? `Você pode gastar até R$ ${weekForecast.balance.toFixed(2)} nesta semana`
      : `Saldo negativo: R$ ${Math.abs(weekForecast.balance).toFixed(2)}. Não recomendado gastar.`,
    weekNumber: currentWeek.weekNumber
  };
}

/**
 * Salvar/atualizar projeção semanal no banco (cache)
 */
export async function saveCashflowForecast(
  userId: string,
  monthYear: string,
  weekData: WeeklyForecast
): Promise<void> {
  await prisma.cashflowWeekly.upsert({
    where: {
      userId_weekStart_monthYear: {
        userId,
        weekStart: weekData.week.weekStart,
        monthYear
      }
    },
    create: {
      userId,
      weekStart: weekData.week.weekStart,
      weekEnd: weekData.week.weekEnd,
      weekNumber: weekData.week.weekNumber,
      monthYear,
      totalIncome: weekData.projectedIncome,
      totalExpenses: weekData.totalExpenses,
      receivedAmount: weekData.receivedIncome,
      projectedAmount: weekData.projectedIncome,
      balance: weekData.balance
    },
    update: {
      totalIncome: weekData.projectedIncome,
      totalExpenses: weekData.totalExpenses,
      receivedAmount: weekData.receivedIncome,
      projectedAmount: weekData.projectedIncome,
      balance: weekData.balance
    }
  });
}
