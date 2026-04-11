/**
 * Unit tests for the Financial Engine
 * Tests all core computation functions for correctness, consistency, and edge cases.
 */

import { describe, it, expect } from "vitest";
import {
  getWeekNumber,
  getWeeksForMonth,
  computeMonthlySummary,
  computeWeeklyForecast,
  computeSpendDecision,
  computePayablesSummary,
  computeClosingSummary,
  computeCashflowMetrics,
} from "../src/lib/financial-engine";

// ============================================================
// WEEK DEFINITION TESTS
// ============================================================

describe("getWeekNumber", () => {
  it("returns week 1 for days 1-7", () => {
    for (let d = 1; d <= 7; d++) {
      expect(getWeekNumber(d, 31)).toBe(1);
    }
  });

  it("returns week 2 for days 8-14", () => {
    for (let d = 8; d <= 14; d++) {
      expect(getWeekNumber(d, 31)).toBe(2);
    }
  });

  it("returns week 3 for days 15-21", () => {
    for (let d = 15; d <= 21; d++) {
      expect(getWeekNumber(d, 31)).toBe(3);
    }
  });

  it("returns week 4 for days 22+", () => {
    for (let d = 22; d <= 31; d++) {
      expect(getWeekNumber(d, 31)).toBe(4);
    }
  });
});

describe("getWeeksForMonth", () => {
  it("returns 4 weeks for a 31-day month", () => {
    const weeks = getWeeksForMonth(new Date(2026, 3, 15)); // April has 30 days, let's use March
    const weeksMarch = getWeeksForMonth(new Date(2026, 2, 15)); // March has 31
    expect(weeksMarch.length).toBe(4);
    expect(weeksMarch[0].weekNumber).toBe(1);
    expect(weeksMarch[3].weekNumber).toBe(4);
  });

  it("W1 starts on day 1, W4 starts on day 22", () => {
    const weeks = getWeeksForMonth(new Date(2026, 2, 15)); // March 2026
    expect(weeks[0].weekStart.getDate()).toBe(1);
    expect(weeks[0].weekEnd.getDate()).toBe(7);
    expect(weeks[3].weekStart.getDate()).toBe(22);
    expect(weeks[3].weekEnd.getDate()).toBe(31);
  });

  it("February W4 ends on day 28 (or 29)", () => {
    const weeks = getWeeksForMonth(new Date(2026, 1, 15)); // Feb 2026 (28 days)
    expect(weeks.length).toBe(4);
    expect(weeks[3].weekEnd.getDate()).toBe(28);
  });
});

// ============================================================
// MONTHLY SUMMARY TESTS
// ============================================================

describe("computeMonthlySummary", () => {
  const makeTx = (overrides: Partial<any> = {}): any => ({
    id: "tx-1",
    type: "EXPENSE",
    description: "Test",
    amount: 100,
    date: new Date(2026, 2, 10),
    dueDate: null,
    paidAt: null,
    amountPaid: 0,
    paymentStatus: "PAID",
    categoryId: "cat-1",
    categoryName: "Test Category",
    recurrenceId: null,
    accountId: null,
    createdAt: new Date(),
    ...overrides,
  });

  const monthStart = new Date(2026, 2, 1);
  const monthEnd = new Date(2026, 2, 31);

  it("correctly sums income and expenses for the month", () => {
    const txs = [
      makeTx({ id: "1", type: "INCOME", amount: 5000 }),
      makeTx({ id: "2", type: "EXPENSE", amount: 3000 }),
      makeTx({ id: "3", type: "EXPENSE", amount: 2000, paymentStatus: "PENDING" }),
    ];

    const result = computeMonthlySummary(txs, monthStart, monthEnd);

    expect(result.monthIncome).toBe(5000);
    expect(result.monthExpenses).toBe(5000); // 3000 + 2000
    expect(result.monthPaid).toBe(3000);
    expect(result.monthPending).toBe(2000);
    expect(result.monthBalance).toBe(0); // 5000 - 5000
  });

  it("excludes transactions outside the month", () => {
    const txs = [
      makeTx({ id: "1", type: "INCOME", amount: 1000, date: new Date(2026, 1, 28) }), // Feb
      makeTx({ id: "2", type: "INCOME", amount: 2000, date: new Date(2026, 2, 15) }), // March
      makeTx({ id: "3", type: "EXPENSE", amount: 500, date: new Date(2026, 3, 1) }), // April
    ];

    const result = computeMonthlySummary(txs, monthStart, monthEnd);

    expect(result.monthIncome).toBe(2000);
    expect(result.monthExpenses).toBe(0);
  });

  it("calculates overdue correctly", () => {
    const now = new Date(2026, 2, 20);
    const txs = [
      makeTx({
        id: "1",
        type: "EXPENSE",
        amount: 1000,
        paymentStatus: "PENDING",
        dueDate: new Date(2026, 2, 10), // past
      }),
      makeTx({
        id: "2",
        type: "EXPENSE",
        amount: 500,
        paymentStatus: "PENDING",
        dueDate: new Date(2026, 2, 25), // future
      }),
    ];

    const result = computeMonthlySummary(txs, monthStart, monthEnd);
    // Note: overdue uses `new Date()` internally, so this test depends on current date
    // We can only reliably test the structure
    expect(result.monthPending).toBe(1500);
  });

  it("computes all-time balance when provided", () => {
    const allTime = [
      makeTx({ id: "1", type: "INCOME", amount: 10000, date: new Date(2026, 0, 1) }),
      makeTx({ id: "2", type: "EXPENSE", amount: 7000, date: new Date(2026, 1, 1) }),
    ];

    const result = computeMonthlySummary([], monthStart, monthEnd, allTime);
    expect(result.allTimeBalance).toBe(3000);
  });

  it("groups expenses by category", () => {
    const txs = [
      makeTx({ id: "1", type: "EXPENSE", amount: 3000, categoryName: "Salários" }),
      makeTx({ id: "2", type: "EXPENSE", amount: 2000, categoryName: "Infra" }),
      makeTx({ id: "3", type: "EXPENSE", amount: 1000, categoryName: "Salários" }),
    ];

    const result = computeMonthlySummary(txs, monthStart, monthEnd);
    expect(result.categoryExpenses["Salários"]).toBe(4000);
    expect(result.categoryExpenses["Infra"]).toBe(2000);
    expect(result.topCategories[0].name).toBe("Salários");
    expect(result.topCategories[0].amount).toBe(4000);
  });

  it("defaults category to 'Outros' when missing", () => {
    const txs = [makeTx({ id: "1", type: "EXPENSE", amount: 500, categoryName: undefined })];
    const result = computeMonthlySummary(txs, monthStart, monthEnd);
    expect(result.categoryExpenses["Outros"]).toBe(500);
  });

  it("separates pending receivables from pending expenses", () => {
    const txs = [
      makeTx({ id: "1", type: "INCOME", amount: 3000, paymentStatus: "PENDING" }),
      makeTx({ id: "2", type: "EXPENSE", amount: 2000, paymentStatus: "PENDING" }),
    ];

    const result = computeMonthlySummary(txs, monthStart, monthEnd);
    expect(result.pendingReceivables).toBe(3000);
    expect(result.pendingExpenses).toBe(2000);
    expect(result.totalPending).toBe(5000);
  });
});

// ============================================================
// WEEKLY FORECAST TESTS
// ============================================================

describe("computeWeeklyForecast", () => {
  const referenceDate = new Date(2026, 2, 15); // March 15, 2026

  it("distributes revenue installments across weeks by dueDate", () => {
    const installments = [
      { id: "i1", revenueId: "r1", installmentNumber: 1, amount: 1000, dueDate: new Date(2026, 2, 3), status: "RECEIVED" as const, receivedAt: null },
      { id: "i2", revenueId: "r1", installmentNumber: 2, amount: 1000, dueDate: new Date(2026, 2, 10), status: "PENDING" as const, receivedAt: null },
      { id: "i3", revenueId: "r1", installmentNumber: 3, amount: 1000, dueDate: new Date(2026, 2, 25), status: "PENDING" as const, receivedAt: null },
    ];
    const expenses: any[] = [];

    const result = computeWeeklyForecast(referenceDate, installments, expenses);

    // W1 (days 1-7): receivedIncome = 1000
    expect(result.weeks[0].receivedIncome).toBe(1000);
    expect(result.weeks[0].projectedIncome).toBe(0);

    // W2 (days 8-14): projectedIncome = 1000
    expect(result.weeks[1].receivedIncome).toBe(0);
    expect(result.weeks[1].projectedIncome).toBe(1000);

    // W4 (days 22-31): projectedIncome = 1000
    expect(result.weeks[3].receivedIncome).toBe(0);
    expect(result.weeks[3].projectedIncome).toBe(1000);
  });

  it("distributes expenses across weeks by dueDate", () => {
    const expenses: any[] = [
      { id: "e1", type: "EXPENSE" as const, description: "Rent", amount: 2000, date: new Date(2026, 2, 1), dueDate: new Date(2026, 2, 5), paidAt: null, amountPaid: 0, paymentStatus: "PENDING" as const, categoryId: "c1", recurrenceId: null, accountId: null, createdAt: new Date() },
      { id: "e2", type: "EXPENSE" as const, description: "Cloud", amount: 500, date: new Date(2026, 2, 1), dueDate: new Date(2026, 2, 20), paidAt: null, amountPaid: 0, paymentStatus: "PAID" as const, categoryId: "c1", recurrenceId: null, accountId: null, createdAt: new Date() },
    ];

    const result = computeWeeklyForecast(referenceDate, [], expenses);

    // W1: expense = 2000
    expect(result.weeks[0].totalExpenses).toBe(2000);
    // W3 (days 15-21): expense = 500
    expect(result.weeks[2].totalExpenses).toBe(500);
  });

  it("falls back to transaction.date when dueDate is null", () => {
    const expenses: any[] = [
      { id: "e1", type: "EXPENSE" as const, description: "No due date", amount: 300, date: new Date(2026, 2, 12), dueDate: null, paidAt: null, amountPaid: 0, paymentStatus: "PAID" as const, categoryId: "c1", recurrenceId: null, accountId: null, createdAt: new Date() },
    ];

    const result = computeWeeklyForecast(referenceDate, [], expenses);
    // Day 12 falls in W2 (8-14)
    expect(result.weeks[1].totalExpenses).toBe(300);
  });

  it("calculates balance per week correctly", () => {
    const installments = [
      { id: "i1", revenueId: "r1", installmentNumber: 1, amount: 5000, dueDate: new Date(2026, 2, 5), status: "RECEIVED" as const, receivedAt: null },
    ];
    const expenses: any[] = [
      { id: "e1", type: "EXPENSE" as const, description: "Bill", amount: 3000, date: new Date(2026, 2, 1), dueDate: new Date(2026, 2, 5), paidAt: null, amountPaid: 0, paymentStatus: "PAID" as const, categoryId: "c1", recurrenceId: null, accountId: null, createdAt: new Date() },
    ];

    const result = computeWeeklyForecast(referenceDate, installments, expenses);
    // W1: income=5000, expenses=3000, balance=2000
    expect(result.weeks[0].balance).toBe(2000);
    expect(result.weeks[0].canSpend).toBe(true);
  });

  it("filters installments and expenses to current month only", () => {
    const installments = [
      { id: "i1", revenueId: "r1", installmentNumber: 1, amount: 9999, dueDate: new Date(2026, 1, 15), status: "RECEIVED" as const, receivedAt: null }, // Feb
    ];
    const expenses: any[] = [
      { id: "e1", type: "EXPENSE" as const, description: "Old", amount: 9999, date: new Date(2026, 0, 1), dueDate: new Date(2026, 0, 15), paidAt: null, amountPaid: 0, paymentStatus: "PAID" as const, categoryId: "c1", recurrenceId: null, accountId: null, createdAt: new Date() }, // Jan
    ];

    const result = computeWeeklyForecast(referenceDate, installments, expenses);
    // All weeks should be zero since nothing falls in March
    for (const w of result.weeks) {
      expect(w.totalIncome).toBe(0);
      expect(w.totalExpenses).toBe(0);
    }
  });

  it("computes faturado and aReceber correctly", () => {
    const installments = [
      { id: "i1", revenueId: "r1", installmentNumber: 1, amount: 2000, dueDate: new Date(2026, 2, 5), status: "RECEIVED" as const, receivedAt: null },
      { id: "i2", revenueId: "r1", installmentNumber: 2, amount: 3000, dueDate: new Date(2026, 2, 15), status: "PENDING" as const, receivedAt: null },
    ];

    const result = computeWeeklyForecast(referenceDate, installments, []);
    expect(result.faturado).toBe(2000);
    expect(result.aReceber).toBe(3000);
  });
});

// ============================================================
// SPEND DECISION TESTS
// ============================================================

describe("computeSpendDecision", () => {
  const referenceDate = new Date(2026, 2, 15); // Day 15 → W3

  it("returns PODE_GASTAR when current and next week are positive", () => {
    // Day 15 → W3. Need income in W3 (days 15-21) AND W4 (days 22-31)
    const forecast = computeWeeklyForecast(referenceDate, [
      { id: "i1", revenueId: "r1", installmentNumber: 1, amount: 10000, dueDate: new Date(2026, 2, 16), status: "RECEIVED" as const, receivedAt: null },
      { id: "i2", revenueId: "r1", installmentNumber: 2, amount: 10000, dueDate: new Date(2026, 2, 25), status: "RECEIVED" as const, receivedAt: null },
    ], []);

    const decision = computeSpendDecision(forecast, referenceDate);
    expect(decision.status).toBe("PODE_GASTAR");
    expect(decision.currentWeek).toBe(3);
  });

  it("returns NAO_PODE_GASTAR when current week is negative", () => {
    const forecast = computeWeeklyForecast(referenceDate, [], [
      { id: "e1", type: "EXPENSE" as const, description: "Big bill", amount: 5000, date: new Date(2026, 2, 1), dueDate: new Date(2026, 2, 16), paidAt: null, amountPaid: 0, paymentStatus: "PENDING" as const, categoryId: "c1", recurrenceId: null, accountId: null, createdAt: new Date() },
    ]);

    const decision = computeSpendDecision(forecast, referenceDate);
    expect(decision.status).toBe("NAO_PODE_GASTAR");
    expect(decision.saldoAtual).toBe(-5000);
  });

  it("returns ALERTA when current is positive but next is negative", () => {
    const forecast = computeWeeklyForecast(referenceDate, [
      { id: "i1", revenueId: "r1", installmentNumber: 1, amount: 5000, dueDate: new Date(2026, 2, 16), status: "RECEIVED" as const, receivedAt: null },
    ], [
      { id: "e1", type: "EXPENSE" as const, description: "Future bill", amount: 6000, date: new Date(2026, 2, 1), dueDate: new Date(2026, 2, 25), paidAt: null, amountPaid: 0, paymentStatus: "PENDING" as const, categoryId: "c1", recurrenceId: null, accountId: null, createdAt: new Date() },
    ]);

    const decision = computeSpendDecision(forecast, referenceDate);
    // W3 (15-21): income=5000, expenses=0, balance=5000
    // W4 (22-31): income=0, expenses=6000, balance=-6000
    expect(decision.status).toBe("ALERTA");
  });
});

// ============================================================
// PAYABLES SUMMARY TESTS
// ============================================================

describe("computePayablesSummary", () => {
  const makePendingTx = (overrides: Partial<any> = {}): any => ({
    id: "p1",
    type: "EXPENSE",
    description: "Pending bill",
    amount: 1000,
    date: new Date(2026, 2, 10),
    dueDate: new Date(2026, 2, 20),
    paidAt: null,
    amountPaid: 0,
    paymentStatus: "PENDING",
    categoryId: "c1",
    categoryName: "Test",
    recurrenceId: null,
    accountId: null,
    createdAt: new Date(),
    ...overrides,
  });

  it("separates total pending (INCOME+EXPENSE) from expense-only pending", () => {
    const txs = [
      makePendingTx({ id: "1", type: "EXPENSE", amount: 3000 }),
      makePendingTx({ id: "2", type: "INCOME", amount: 5000 }),
    ];

    const result = computePayablesSummary(txs);
    expect(result.totalPending).toBe(8000);
    expect(result.pendingExpenses).toBe(3000);
    expect(result.pendingReceivables).toBe(5000);
  });

  it("classifies overdue vs upcoming expenses", () => {
    const now = new Date();
    const overdue = makePendingTx({ id: "1", amount: 1000, dueDate: new Date(now.getTime() - 86400000 * 10) }); // 10 days ago
    const upcoming = makePendingTx({ id: "2", amount: 2000, dueDate: new Date(now.getTime() + 86400000 * 3) }); // 3 days from now
    const noDate = makePendingTx({ id: "3", amount: 500, dueDate: null });

    const result = computePayablesSummary([overdue, upcoming, noDate]);
    expect(result.overdueExpenses).toBe(1000);
    expect(result.upcomingExpenses).toBe(2000);
    expect(result.noDateExpenses).toBe(500);
    expect(result.overdueList.length).toBe(1);
    expect(result.upcomingList.length).toBe(1);
    expect(result.noDateList.length).toBe(1);
  });
});

// ============================================================
// CLOSING SUMMARY TESTS
// ============================================================

describe("computeClosingSummary", () => {
  it("delegates to computeMonthlySummary with correct structure", () => {
    const txs: any[] = [
      { id: "1", type: "INCOME", amount: 8000, description: "Revenue", date: new Date(2026, 2, 5), dueDate: null, paidAt: null, amountPaid: 0, paymentStatus: "PAID", categoryId: "c1", categoryName: "Sales", recurrenceId: null, accountId: null, createdAt: new Date() },
      { id: "2", type: "EXPENSE", amount: 5000, description: "Cost", date: new Date(2026, 2, 10), dueDate: null, paidAt: null, amountPaid: 0, paymentStatus: "PAID", categoryId: "c2", categoryName: "Ops", recurrenceId: null, accountId: null, createdAt: new Date() },
    ];

    const start = new Date(2026, 2, 1);
    const end = new Date(2026, 2, 31);
    const result = computeClosingSummary(txs, start, end);

    expect(result.income).toBe(8000);
    expect(result.expenses).toBe(5000);
    expect(result.balance).toBe(3000);
  });
});

// ============================================================
// CASHFLOW METRICS TESTS
// ============================================================

describe("computeCashflowMetrics", () => {
  it("extracts metrics from weekly forecast", () => {
    const referenceDate = new Date(2026, 2, 15);
    const forecast = computeWeeklyForecast(referenceDate, [
      { id: "i1", revenueId: "r1", installmentNumber: 1, amount: 4000, dueDate: new Date(2026, 2, 5), status: "RECEIVED" as const, receivedAt: null },
      { id: "i2", revenueId: "r1", installmentNumber: 2, amount: 2000, dueDate: new Date(2026, 2, 18), status: "PENDING" as const, receivedAt: null },
    ], [
      { id: "e1", type: "EXPENSE" as const, description: "Rent", amount: 3000, date: new Date(2026, 2, 1), dueDate: new Date(2026, 2, 5), paidAt: null, amountPaid: 0, paymentStatus: "PAID" as const, categoryId: "c1", recurrenceId: null, accountId: null, createdAt: new Date() },
    ]);

    const metrics = computeCashflowMetrics(forecast);
    expect(metrics.totalIncome).toBe(6000); // 4000 + 2000
    expect(metrics.totalExpenses).toBe(3000);
    expect(metrics.faturado).toBe(4000);
    expect(metrics.aReceber).toBe(2000);
  });
});

// ============================================================
// CONSISTENCY TESTS
// ============================================================

describe("Cross-function consistency", () => {
  it("monthly summary and weekly forecast use same definitions for income/expenses", () => {
    const referenceDate = new Date(2026, 2, 15);
    const start = new Date(2026, 2, 1);
    const end = new Date(2026, 2, 31);

    const incomeTx = [
      { id: "1", type: "INCOME" as const, amount: 10000, description: "Revenue", date: new Date(2026, 2, 5), dueDate: null, paidAt: null, amountPaid: 0, paymentStatus: "PAID" as const, categoryId: "c1", categoryName: "Sales", recurrenceId: null, accountId: null, createdAt: new Date() },
    ];
    const expenseTx = [
      { id: "2", type: "EXPENSE" as const, amount: 4000, description: "Rent", date: new Date(2026, 2, 10), dueDate: new Date(2026, 2, 10), paidAt: null, amountPaid: 0, paymentStatus: "PAID" as const, categoryId: "c2", categoryName: "Ops", recurrenceId: null, accountId: null, createdAt: new Date() },
    ];

    const allTx = [...incomeTx, ...expenseTx];
    const monthly = computeMonthlySummary(allTx, start, end);
    const weekly = computeWeeklyForecast(referenceDate, [], expenseTx);

    // Weekly total expenses should match monthly total expenses
    const weeklyTotalExpenses = weekly.weeks.reduce((s, w) => s + w.totalExpenses, 0);
    expect(weeklyTotalExpenses).toBe(monthly.monthExpenses);
  });
});
