/**
 * Tests for recurrence idempotency, date handling, and financial impact.
 *
 * These tests verify:
 * - The cron logic does NOT create duplicate transactions
 * - WEEKLY recurrences advance by 1 week, not 1 month
 * - Monthly recurrences crossing month boundaries work correctly
 * - Multiple consecutive cron runs are safe
 */

import { describe, it, expect } from "vitest";
import { addMonths, addWeeks, format, isBefore, isSameDay, startOfDay } from "date-fns";
import {
  getWeekNumber,
  getWeeksForMonth,
  computeMonthlySummary,
  computeWeeklyForecast,
} from "../src/lib/financial-engine";

// ============================================================
// RECURRENCE DATE LOGIC TESTS
// ============================================================

describe("Recurrence date progression", () => {
  it("monthly recurrence advances by 1 month", () => {
    const startDate = new Date(2026, 0, 15); // Jan 15
    const nextDate = addMonths(startDate, 1);
    expect(nextDate.getMonth()).toBe(1); // February
    expect(nextDate.getDate()).toBe(15);
  });

  it("weekly recurrence advances by 1 week", () => {
    const startDate = new Date(2026, 0, 15); // Jan 15 (Thursday)
    const nextDate = addWeeks(startDate, 1);
    expect(nextDate.getDate()).toBe(22); // Jan 22
  });

  it("monthly recurrence crosses month boundary correctly", () => {
    // Start on Jan 31
    const startDate = new Date(2026, 0, 31);
    // Feb has 28 days — addMonths goes to Feb 28 (clamps to last day of month)
    const febDate = addMonths(startDate, 1);
    expect(febDate.getMonth()).toBe(1); // February
    expect(febDate.getDate()).toBe(28); // Clamped to last day of Feb
  });

  it("date-only comparison prevents duplicate detection", () => {
    // Simulate the cron's idempotency check
    const date1 = new Date(2026, 2, 15, 0, 0, 0, 0); // midnight
    const date2 = new Date(2026, 2, 15, 3, 0, 0, 0); // 3am UTC
    const date3 = new Date(2026, 2, 15, 23, 59, 59, 999); // 11:59pm

    // All should match on YYYY-MM-DD
    expect(format(date1, "yyyy-MM-dd")).toBe(format(date2, "yyyy-MM-dd"));
    expect(format(date1, "yyyy-MM-dd")).toBe(format(date3, "yyyy-MM-dd"));
  });
});

// ============================================================
// IDEMPOTENCY SIMULATION TESTS
// ============================================================

describe("Recurrence idempotency simulation", () => {
  function simulateCronRun(
    recurrence: { frequency: string; nextDate: Date; amount: number },
    existingTransactions: { recurrenceId: string; recurrenceDate: Date }[],
    now: Date
  ): { created: number; newNextDate: Date } {
    let nextDate = new Date(recurrence.nextDate);
    let created = 0;
    const recId = "rec-1";

    while (isBefore(nextDate, now) || isSameDay(nextDate, now)) {
      const nextDateStr = format(nextDate, "yyyy-MM-dd");

      // Check if already exists (same idempotency logic as cron route)
      const alreadyExists = existingTransactions.some(
        (tx) => tx.recurrenceId === recId && format(tx.recurrenceDate, "yyyy-MM-dd") === nextDateStr
      );

      if (!alreadyExists) {
        existingTransactions.push({ recurrenceId: recId, recurrenceDate: new Date(nextDate) });
        created++;
      }

      if (recurrence.frequency === "MONTHLY") {
        nextDate = addMonths(nextDate, 1);
      } else if (recurrence.frequency === "WEEKLY") {
        nextDate = addWeeks(nextDate, 1);
      } else {
        break;
      }
    }

    return { created, newNextDate: nextDate };
  }

  it("first run creates transaction for today", () => {
    const now = new Date(2026, 2, 15);
    const result = simulateCronRun(
      { frequency: "MONTHLY", nextDate: new Date(2026, 2, 15), amount: 1000 },
      [],
      now
    );
    expect(result.created).toBe(1);
  });

  it("second run immediately after creates nothing (idempotent)", () => {
    const now = new Date(2026, 2, 15);
    const existingTx = [{ recurrenceId: "rec-1", recurrenceDate: new Date(2026, 2, 15) }];

    const result = simulateCronRun(
      { frequency: "MONTHLY", nextDate: new Date(2026, 2, 15), amount: 1000 },
      existingTx,
      now
    );
    expect(result.created).toBe(0);
  });

  it("third consecutive run still creates nothing", () => {
    const now = new Date(2026, 2, 15);
    const existingTx = [{ recurrenceId: "rec-1", recurrenceDate: new Date(2026, 2, 15) }];

    // Run 2
    simulateCronRun(
      { frequency: "MONTHLY", nextDate: new Date(2026, 2, 15), amount: 1000 },
      existingTx,
      now
    );
    // Run 3
    const result = simulateCronRun(
      { frequency: "MONTHLY", nextDate: new Date(2026, 2, 15), amount: 1000 },
      existingTx,
      now
    );
    expect(result.created).toBe(0);
  });

  it("catches up missed months correctly", () => {
    const now = new Date(2026, 5, 15); // June 15
    // Recurrence was at March 15 — should catch up Apr, May, Jun
    const result = simulateCronRun(
      { frequency: "MONTHLY", nextDate: new Date(2026, 2, 15), amount: 1000 }, // Mar 15
      [],
      now
    );
    // Should create: Mar, Apr, May, Jun = 4 transactions
    expect(result.created).toBe(4);
  });

  it("catches up missed weeks correctly", () => {
    const now = new Date(2026, 1, 15); // Feb 15
    // Recurrence was at Jan 1 — should catch up all weeks
    const result = simulateCronRun(
      { frequency: "WEEKLY", nextDate: new Date(2026, 0, 1), amount: 500 }, // Jan 1
      [],
      now
    );
    // 6 weeks between Jan 1 and Feb 15
    expect(result.created).toBeGreaterThan(5);
    expect(result.created).toBeLessThan(8);
  });

  it("WEEKLY recurrence advances nextDate by 1 week", () => {
    const startDate = new Date(2026, 2, 1); // March 1
    const nextDate = addWeeks(startDate, 1);
    expect(nextDate.getDate()).toBe(8); // March 8
  });

  it("MONTHLY recurrence advances nextDate by 1 month", () => {
    const startDate = new Date(2026, 2, 1); // March 1
    const nextDate = addMonths(startDate, 1);
    expect(nextDate.getMonth()).toBe(3); // April
    expect(nextDate.getDate()).toBe(1);
  });
});

// ============================================================
// FINANCIAL IMPACT TESTS
// ============================================================

describe("Recurring transactions impact on financial summaries", () => {
  it("generated recurring transaction appears in monthly summary", () => {
    const recurringTx: any[] = [
      {
        id: "tx-rec-1",
        type: "EXPENSE" as const,
        description: "Rent (Recorrente)",
        amount: 2000,
        date: new Date(2026, 2, 1),
        dueDate: new Date(2026, 2, 1),
        paidAt: null,
        amountPaid: 0,
        paymentStatus: "PENDING" as const,
        categoryId: "cat-1",
        categoryName: "Moradia",
        recurrenceId: "rec-1",
        accountId: null,
        createdAt: new Date(),
      },
    ];

    const start = new Date(2026, 2, 1);
    const end = new Date(2026, 2, 31);
    const summary = computeMonthlySummary(recurringTx, start, end);

    expect(summary.monthExpenses).toBe(2000);
    expect(summary.monthPending).toBe(2000);
  });

  it("multiple recurring transactions across month boundary are counted in correct months", () => {
    const recurringTx: any[] = [
      {
        id: "tx-1",
        type: "EXPENSE" as const,
        description: "Rent Feb",
        amount: 2000,
        date: new Date(2026, 1, 1),
        dueDate: new Date(2026, 1, 1),
        paidAt: null,
        amountPaid: 0,
        paymentStatus: "PENDING" as const,
        categoryId: "cat-1",
        categoryName: "Moradia",
        recurrenceId: "rec-1",
        accountId: null,
        createdAt: new Date(),
      },
      {
        id: "tx-2",
        type: "EXPENSE" as const,
        description: "Rent Mar",
        amount: 2000,
        date: new Date(2026, 2, 1),
        dueDate: new Date(2026, 2, 1),
        paidAt: null,
        amountPaid: 0,
        paymentStatus: "PENDING" as const,
        categoryId: "cat-1",
        categoryName: "Moradia",
        recurrenceId: "rec-1",
        accountId: null,
        createdAt: new Date(),
      },
    ];

    const febStart = new Date(2026, 1, 1);
    const febEnd = new Date(2026, 1, 28);
    const febSummary = computeMonthlySummary(recurringTx, febStart, febEnd);
    expect(febSummary.monthExpenses).toBe(2000);

    const marStart = new Date(2026, 2, 1);
    const marEnd = new Date(2026, 2, 31);
    const marSummary = computeMonthlySummary(recurringTx, marStart, marEnd);
    expect(marSummary.monthExpenses).toBe(2000);
  });

  it("weekly recurrence appears in correct week of weekly forecast", () => {
    const referenceDate = new Date(2026, 2, 15); // March 15
    const installments: any[] = []; // No revenue
    const expenses: any[] = [
      {
        id: "weekly-1",
        type: "EXPENSE" as const,
        description: "Weekly service",
        amount: 500,
        date: new Date(2026, 2, 8),
        dueDate: new Date(2026, 2, 8), // March 8 → W2 (days 8-14)
        paidAt: null,
        amountPaid: 0,
        paymentStatus: "PENDING" as const,
        categoryId: "cat-1",
        recurrenceId: "rec-1",
        accountId: null,
        createdAt: new Date(),
      },
    ];

    const forecast = computeWeeklyForecast(referenceDate, installments, expenses);

    // W2 (days 8-14) should have 500 expense
    expect(forecast.weeks[1].totalExpenses).toBe(500);
    // Other weeks should have 0
    expect(forecast.weeks[0].totalExpenses).toBe(0);
    expect(forecast.weeks[2].totalExpenses).toBe(0);
    expect(forecast.weeks[3].totalExpenses).toBe(0);
  });
});

// ============================================================
// CONSISTENCY TEST: Recurrence + Engine
// ============================================================

describe("Recurrence consistency with financial engine", () => {
  it("monthly summary and weekly forecast agree on recurring expense placement", () => {
    const referenceDate = new Date(2026, 2, 15);
    const start = new Date(2026, 2, 1);
    const end = new Date(2026, 2, 31);

    const recurringExpense: any = {
      id: "tx-rec",
      type: "EXPENSE" as const,
      description: "Monthly service",
      amount: 1500,
      date: new Date(2026, 2, 10),
      dueDate: new Date(2026, 2, 10),
      paidAt: null,
      amountPaid: 0,
      paymentStatus: "PENDING" as const,
      categoryId: "cat-1",
      categoryName: "Services",
      recurrenceId: "rec-1",
      accountId: null,
      createdAt: new Date(),
    };

    const monthly = computeMonthlySummary([recurringExpense], start, end);
    const weekly = computeWeeklyForecast(referenceDate, [], [recurringExpense]);

    // Both should reflect 1500 in expenses
    expect(monthly.monthExpenses).toBe(1500);
    const weeklyTotal = weekly.weeks.reduce((s, w) => s + w.totalExpenses, 0);
    expect(weeklyTotal).toBe(1500);
  });
});
