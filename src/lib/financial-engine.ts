/**
 * Financial Engine — Single Source of Truth for All Financial Calculations
 *
 * This module centralizes ALL financial computation rules to eliminate
 * divergence between Dashboard, Movimentacoes, Fechamento, Fluxo de Caixa,
 * Pendencias, and Recorrencias.
 *
 * === FINANCIAL DEFINITIONS (explicit and unambiguous) ===
 *
 * TRANSACTION TYPES:
 * - INCOME  = money coming in (revenue, payments received)
 * - EXPENSE = money going out (costs, bills, payments made)
 *
 * PAYMENT STATES:
 * - PAID    = paymentStatus === "PAID" (money actually moved)
 * - PENDING = paymentStatus === "PENDING" (expected but not yet realized)
 *
 * FINANCIAL CONCEPTS:
 * - Faturado (Billed)     = All revenue installments marked as RECEIVED
 * - A Receber (Receivable)= Revenue installments still PENDING
 * - Recebido (Received)   = INCOME transactions with paymentStatus PAID
 * - Previsto (Projected)  = INCOME transactions with paymentStatus PENDING
 * - Despesa (Expense)     = EXPENSE transactions (regardless of status)
 * - Despesa Paga          = EXPENSE with paymentStatus PAID
 * - Despesa Pendente      = EXPENSE with paymentStatus PENDING
 * - Pendencias (Pending)  = EXPENSE with paymentStatus PENDING ONLY (not INCOME)
 * - Atrasadas (Overdue)   = EXPENSE PENDING where dueDate < today
 * - Vencendo (Due Soon)   = EXPENSE PENDING where dueDate is within next 7 days
 *
 * SALDO (Balance):
 * - Saldo Realizado       = All-time (PAID INCOME - PAID EXPENSE)
 * - Saldo do Mes          = Current month (all INCOME - all EXPENSE, regardless of payment status)
 * - Saldo Projetado       = Saldo Realizado + pending INCOME - pending EXPENSE
 *
 * PENDING TOTAL:
 * - "Total Pendente" on Contas a Pagar = ALL PENDING transactions (INCOME + EXPENSE)
 * - "Pendencias" on Dashboard/Fechamento = EXPENSE PENDING only
 * These are DIFFERENT concepts and must be labeled distinctly.
 *
 * WEEKLY FORECAST:
 * - Week definition: Fixed day ranges 1-7, 8-14, 15-21, 22-end_of_month
 * - Revenue enters on installment dueDate
 * - Expenses enter on transaction dueDate (or date if no dueDate)
 * - Only transactions/ installments within the current month
 *
 * RECURRENCES:
 * - Recurrence templates are NOT transactions
 * - Only generated transaction instances count in calculations
 * - A recurrence generates a transaction with recurrenceId set
 * - Recurring transactions are treated identically to manual ones
 */

import {
  startOfMonth,
  endOfMonth,
  isWithinInterval,
  isBefore,
  addMonths,
  subMonths,
  startOfDay,
  addDays,
} from "date-fns";

// ============================================================
// TYPES
// ============================================================

export type TransactionType = "INCOME" | "EXPENSE";
export type PaymentStatus = "PAID" | "PENDING";

export interface Transaction {
  id: string;
  type: TransactionType;
  description: string;
  amount: number;
  date: Date;
  dueDate: Date | null;
  paidAt: Date | null;
  amountPaid: number;
  paymentStatus: PaymentStatus;
  categoryId: string;
  categoryName?: string;
  recurrenceId: string | null;
  accountId: string | null;
  createdAt: Date;
}

export interface RevenueInstallment {
  id: string;
  revenueId: string;
  installmentNumber: number;
  amount: number;
  dueDate: Date;
  status: "PENDING" | "RECEIVED";
  receivedAt: Date | null;
}

export interface InvoiceInstallment {
  id: string;
  invoiceId: string;
  installmentNumber: number;
  amount: number;
  dueDate: Date;
  status: string;
  paidAt: Date | null;
  paidAmount: number | null;
}

// ============================================================
// WEEK DEFINITION — Fixed day ranges (single source)
// ============================================================

export interface WeekInfo {
  weekNumber: number;
  weekStart: Date;
  weekEnd: Date;
  display: string;
}

/**
 * Get week number for a given day of month using fixed ranges:
 * W1: days 1-7, W2: days 8-14, W3: days 15-21, W4: days 22-end_of_month
 */
export function getWeekNumber(dayOfMonth: number, daysInMonth: number): number {
  if (dayOfMonth <= 7) return 1;
  if (dayOfMonth <= 14) return 2;
  if (dayOfMonth <= 21) return 3;
  return 4;
}

/**
 * Get all week boundaries for a given month.
 */
export function getWeeksForMonth(referenceDate: Date): WeekInfo[] {
  const monthStart = startOfMonth(referenceDate);
  const monthEnd = endOfMonth(referenceDate);
  const year = monthStart.getFullYear();
  const month = monthStart.getMonth();

  const ranges = [
    { num: 1, startDay: 1, endDay: 7 },
    { num: 2, startDay: 8, endDay: 14 },
    { num: 3, startDay: 15, endDay: 21 },
    { num: 4, startDay: 22, endDay: 31 },
  ];

  const weeks: WeekInfo[] = [];

  for (const r of ranges) {
    const start = new Date(year, month, r.startDay);
    const endDay = Math.min(r.endDay, monthEnd.getDate());
    const end = new Date(year, month, endDay);

    // Skip weeks that don't exist (e.g., February doesn't have W4 if it ends on day 28)
    if (start > monthEnd) break;

    weeks.push({
      weekNumber: r.num,
      weekStart: start,
      weekEnd: end,
      display: `W${r.num}`,
    });
  }

  return weeks;
}

// ============================================================
// PURE COMPUTATION FUNCTIONS
// ============================================================

// Minimal shape for all-time balance computation (used by dashboard)
export interface MinimalTransactionForBalance {
  type: string;
  amount: number;
  paymentStatus: string;
}

/**
 * Monthly summary — the SINGLE source for Dashboard, Movimentacoes, Fechamento.
 *
 * Rules:
 * - Filters transactions by date within the month (using transaction.date)
 * - Income = sum of all INCOME transactions in the month (regardless of paymentStatus)
 * - Expenses = sum of all EXPENSE transactions in the month (regardless of paymentStatus)
 * - Paid = sum of EXPENSE with paymentStatus PAID
 * - Pending = sum of EXPENSE with paymentStatus PENDING
 * - Overdue = sum of EXPENSE PENDING where dueDate < today
 * - Balance = Income - Expenses
 * - All-time balance = sum of ALL transactions ever (INCOME - EXPENSE)
 */
export function computeMonthlySummary(
  transactions: Transaction[],
  monthStart: Date,
  monthEnd: Date,
  allTimeTransactions: MinimalTransactionForBalance[] = []
): {
  monthIncome: number;
  monthExpenses: number;
  monthPaid: number;
  monthPending: number;
  monthOverdue: number;
  monthBalance: number;
  allTimeBalance: number;
  pendingExpenses: number;
  pendingReceivables: number;
  totalPending: number; // pending expenses + pending income (for Contas a Pagar page)
  transactionsByDay: Record<number, { income: number; expenses: number }>;
  categoryExpenses: Record<string, number>;
  topCategories: { name: string; amount: number }[];
} {
  const now = startOfDay(new Date());

  // Filter to month
  const monthTx = transactions.filter(
    (t) => !isBefore(t.date, monthStart) && !isBefore(monthEnd, t.date)
  );

  let monthIncome = 0;
  let monthExpenses = 0;
  let monthPaid = 0;
  let monthPending = 0;
  let monthOverdue = 0;
  let pendingReceivables = 0;
  const transactionsByDay: Record<number, { income: number; expenses: number }> = {};
  const categoryExpenses: Record<string, number> = {};

  // Initialize all days
  for (let d = 1; d <= monthEnd.getDate(); d++) {
    transactionsByDay[d] = { income: 0, expenses: 0 };
  }

  for (const t of monthTx) {
    const day = t.date.getDate();

    if (t.type === "INCOME") {
      monthIncome += t.amount;
      transactionsByDay[day] = transactionsByDay[day] || { income: 0, expenses: 0 };
      transactionsByDay[day].income += t.amount;

      if (t.paymentStatus === "PENDING") {
        pendingReceivables += t.amount;
      }
    } else {
      monthExpenses += t.amount;
      transactionsByDay[day] = transactionsByDay[day] || { income: 0, expenses: 0 };
      transactionsByDay[day].expenses += t.amount;

      const catName = t.categoryName || "Outros";
      categoryExpenses[catName] = (categoryExpenses[catName] || 0) + t.amount;

      if (t.paymentStatus === "PAID") {
        monthPaid += t.amount;
      } else {
        monthPending += t.amount;

        if (t.dueDate && isBefore(t.dueDate, now)) {
          monthOverdue += t.amount;
        }
      }
    }
  }

  // All-time REALIZED balance (only PAID transactions)
  const allTimeBalance = allTimeTransactions.reduce((sum, t) => {
    if (t.paymentStatus !== "PAID") return sum;
    return t.type === "INCOME" ? sum + t.amount : sum - t.amount;
  }, 0);

  // Top categories
  const topCategories = Object.entries(categoryExpenses)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([name, amount]) => ({ name, amount }));

  return {
    monthIncome,
    monthExpenses,
    monthPaid,
    monthPending,
    monthOverdue,
    monthBalance: monthIncome - monthExpenses,
    allTimeBalance,
    pendingExpenses: monthPending,
    pendingReceivables,
    totalPending: monthPending + pendingReceivables,
    transactionsByDay,
    categoryExpenses,
    topCategories,
  };
}

/**
 * Weekly cashflow forecast — SINGLE source for Fluxo de Caixa and Dashboard preview.
 *
 * Rules:
 * - Revenue installments: filtered by month, assigned to week by dueDate
 *   - receivedIncome = installments with status RECEIVED
 *   - projectedIncome = installments with status PENDING
 * - Expenses: transactions of type EXPENSE filtered by month
 *   - Uses dueDate if available, otherwise transaction.date
 *   - All expenses count in the week they fall (regardless of paymentStatus)
 * - Balance per week = (receivedIncome + projectedIncome) - totalExpenses
 */
export function computeWeeklyForecast(
  referenceDate: Date,
  revenueInstallments: RevenueInstallment[],
  expenses: Transaction[]
): {
  weeks: {
    weekNumber: number;
    weekStart: Date;
    weekEnd: Date;
    display: string;
    receivedIncome: number;
    projectedIncome: number;
    totalIncome: number;
    totalExpenses: number;
    balance: number;
    canSpend: boolean;
  }[];
  totalMonthIncome: number;
  totalMonthExpenses: number;
  monthBalance: number;
  faturado: number;
  aReceber: number;
} {
  const monthStart = startOfMonth(referenceDate);
  const monthEnd = endOfMonth(referenceDate);
  const weeks = getWeeksForMonth(referenceDate);

  // Filter revenue installments to current month
  const monthInstallments = revenueInstallments.filter(
    (inst) => !isBefore(inst.dueDate, monthStart) && !isBefore(monthEnd, inst.dueDate)
  );

  // Filter expenses to current month (using dueDate if available, else date)
  // Only include EXPENSE type transactions
  const monthExpenses = expenses
    .filter((t) => t.type === "EXPENSE")
    .filter((t) => {
      const effectiveDate = t.dueDate || t.date;
      return !isBefore(effectiveDate, monthStart) && !isBefore(monthEnd, effectiveDate);
    });

  const weekResults = weeks.map((week) => {
    let receivedIncome = 0;
    let projectedIncome = 0;
    let totalExpenses = 0;

    // Revenue installments in this week
    for (const inst of monthInstallments) {
      if (isWithinInterval(inst.dueDate, { start: week.weekStart, end: week.weekEnd })) {
        if (inst.status === "RECEIVED") {
          receivedIncome += inst.amount;
        } else {
          projectedIncome += inst.amount;
        }
      }
    }

    // Expenses in this week
    for (const exp of monthExpenses) {
      const effectiveDate = exp.dueDate || exp.date;
      if (isWithinInterval(effectiveDate, { start: week.weekStart, end: week.weekEnd })) {
        totalExpenses += exp.amount;
      }
    }

    const totalIncome = receivedIncome + projectedIncome;
    const balance = totalIncome - totalExpenses;

    return {
      weekNumber: week.weekNumber,
      weekStart: week.weekStart,
      weekEnd: week.weekEnd,
      display: week.display,
      receivedIncome,
      projectedIncome,
      totalIncome,
      totalExpenses,
      balance,
      canSpend: balance > 0,
    };
  });

  const totalMonthIncome = weekResults.reduce((s, w) => s + w.totalIncome, 0);
  const totalMonthExpenses = weekResults.reduce((s, w) => s + w.totalExpenses, 0);

  // Faturado = all received installments this month (regardless of week assignment)
  const faturado = monthInstallments
    .filter((i) => i.status === "RECEIVED")
    .reduce((s, i) => s + i.amount, 0);

  // A Receber = all pending installments this month
  const aReceber = monthInstallments
    .filter((i) => i.status === "PENDING")
    .reduce((s, i) => s + i.amount, 0);

  return {
    weeks: weekResults,
    totalMonthIncome,
    totalMonthExpenses,
    monthBalance: totalMonthIncome - totalMonthExpenses,
    faturado,
    aReceber,
  };
}

/**
 * Spend decision — SINGLE source for SpendDecisionIndicator.
 */
export function computeSpendDecision(
  weeklyForecast: ReturnType<typeof computeWeeklyForecast>,
  referenceDate: Date
): {
  currentWeek: number;
  status: "PODE_GASTAR" | "ALERTA" | "NAO_PODE_GASTAR";
  motivo: string;
  saldoAtual: number;
  saldoProximaSemana: number;
} {
  const dayOfMonth = referenceDate.getDate();
  const daysInMonth = endOfMonth(referenceDate).getDate();
  const currentWeek = getWeekNumber(dayOfMonth, daysInMonth);

  const currentWeekData = weeklyForecast.weeks.find(
    (w) => w.weekNumber === currentWeek
  );
  const nextWeekData = weeklyForecast.weeks.find(
    (w) => w.weekNumber === currentWeek + 1
  );

  const saldoAtual = currentWeekData?.balance ?? 0;
  const saldoProximaSemana = nextWeekData?.balance ?? 0;

  if (saldoAtual > 0 && saldoProximaSemana > 0) {
    return {
      currentWeek,
      status: "PODE_GASTAR",
      motivo: "Saldo positivo esta semana e a próxima. Fluxo de caixa saudável.",
      saldoAtual,
      saldoProximaSemana,
    };
  }

  if (saldoAtual > 0 && saldoProximaSemana <= 0) {
    return {
      currentWeek,
      status: "ALERTA",
      motivo: "Saldo positivo agora, mas a próxima semana pode ficar negativa. Considere reservar.",
      saldoAtual,
      saldoProximaSemana,
    };
  }

  return {
    currentWeek,
    status: "NAO_PODE_GASTAR",
    motivo: `Saldo negativo ou zerado nesta semana (R$ ${saldoAtual.toFixed(2)}). Evite novos gastos.`,
    saldoAtual,
    saldoProximaSemana,
  };
}

/**
 * Payables summary — for Contas a Pagar page.
 *
 * "Total Pendente" on this page = ALL PENDING transactions (both INCOME and EXPENSE).
 * This is intentionally different from "Pendências" on Dashboard (EXPENSE only).
 */
export function computePayablesSummary(
  pendingTransactions: Transaction[]
): {
  totalPending: number; // INCOME + EXPENSE pending
  pendingExpenses: number; // EXPENSE pending only
  pendingReceivables: number; // INCOME pending only
  overdueExpenses: number; // EXPENSE PENDING with dueDate < today
  upcomingExpenses: number; // EXPENSE PENDING with dueDate within next 7 days
  noDateExpenses: number; // EXPENSE PENDING without dueDate
  overdueList: Transaction[];
  upcomingList: Transaction[];
  noDateList: Transaction[];
} {
  const now = startOfDay(new Date());
  const sevenDaysFromNow = addDays(now, 7);

  let totalPending = 0;
  let pendingExpenses = 0;
  let pendingReceivables = 0;
  let overdueExpenses = 0;
  let upcomingExpenses = 0;
  let noDateExpenses = 0;

  const overdueList: Transaction[] = [];
  const upcomingList: Transaction[] = [];
  const noDateList: Transaction[] = [];

  for (const t of pendingTransactions) {
    totalPending += t.amount;

    if (t.type === "EXPENSE") {
      pendingExpenses += t.amount;

      if (!t.dueDate) {
        noDateExpenses += t.amount;
        noDateList.push(t);
      } else if (isBefore(t.dueDate, now)) {
        overdueExpenses += t.amount;
        overdueList.push(t);
      } else if (!isBefore(t.dueDate, now) && !isBefore(sevenDaysFromNow, t.dueDate)) {
        upcomingExpenses += t.amount;
        upcomingList.push(t);
      }
    } else {
      // INCOME pending = receivables
      pendingReceivables += t.amount;
    }
  }

  return {
    totalPending,
    pendingExpenses,
    pendingReceivables,
    overdueExpenses,
    upcomingExpenses,
    noDateExpenses,
    overdueList,
    upcomingList,
    noDateList,
  };
}

/**
 * Closing summary — for Fechamento Mensal page.
 * Uses the same computeMonthlySummary but adds export-friendly structure.
 */
export function computeClosingSummary(
  transactions: Transaction[],
  monthStart: Date,
  monthEnd: Date
) {
  const monthly = computeMonthlySummary(transactions, monthStart, monthEnd);

  return {
    income: monthly.monthIncome,
    expenses: monthly.monthExpenses,
    paid: monthly.monthPaid,
    pending: monthly.monthPending,
    overdue: monthly.monthOverdue,
    balance: monthly.monthBalance,
    topCategories: monthly.topCategories,
    transactionsByDay: monthly.transactionsByDay,
  };
}

/**
 * Cashflow metrics — summary for weekly forecast cards.
 */
export function computeCashflowMetrics(weeklyForecast: ReturnType<typeof computeWeeklyForecast>) {
  return {
    totalIncome: weeklyForecast.totalMonthIncome,
    totalExpenses: weeklyForecast.totalMonthExpenses,
    totalProjectedIncome: weeklyForecast.aReceber,
    monthBalance: weeklyForecast.monthBalance,
    faturado: weeklyForecast.faturado,
    aReceber: weeklyForecast.aReceber,
  };
}
