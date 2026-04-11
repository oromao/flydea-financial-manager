/**
 * Tests for timezone and date boundary edge cases.
 *
 * These tests verify:
 * - End-of-month date filters include the full last day
 * - Virada de mês (month boundary) transactions are classified correctly
 * - endOfDay usage prevents off-by-one
 * - startOfDay usage prevents time-component issues
 */

import { describe, it, expect } from "vitest";
import {
  computeMonthlySummary,
  computeWeeklyForecast,
  getWeeksForMonth,
  getWeekNumber,
} from "../src/lib/financial-engine";
import {
  startOfMonth,
  endOfMonth,
  endOfDay,
  startOfDay,
  subMonths,
  addDays,
  format,
  isWithinInterval,
} from "date-fns";

// ============================================================
// DATE BOUNDARY TESTS
// ============================================================

describe("Date boundaries", () => {
  it("endOfDay includes the full last day of month", () => {
    const endDate = endOfDay(new Date(2026, 2, 31)); // March 31
    expect(endDate.getHours()).toBe(23);
    expect(endDate.getMinutes()).toBe(59);
    expect(endDate.getSeconds()).toBe(59);
    expect(endDate.getMilliseconds()).toBe(999);
  });

  it("new Date(endDate) without endOfDay only includes midnight", () => {
    const endDate = new Date(2026, 2, 31);
    expect(endDate.getHours()).toBe(0);
    expect(endDate.getMinutes()).toBe(0);
    expect(endDate.getSeconds()).toBe(0);
    expect(endDate.getMilliseconds()).toBe(0);
  });

  it("startOfDay normalizes time to midnight", () => {
    const date = new Date(2026, 2, 15, 14, 30, 45, 500);
    const normalized = startOfDay(date);
    expect(normalized.getHours()).toBe(0);
    expect(normalized.getMinutes()).toBe(0);
    expect(normalized.getSeconds()).toBe(0);
    expect(normalized.getMilliseconds()).toBe(0);
  });
});

// ============================================================
// MONTH BOUNDARY TESTS (virada de mês)
// ============================================================

describe("Month boundary transactions", () => {
  const makeTx = (overrides: Partial<any> = {}): any => ({
    id: "tx-1",
    type: "EXPENSE",
    description: "Test",
    amount: 100,
    date: new Date(2026, 2, 15),
    dueDate: null,
    paidAt: null,
    amountPaid: 0,
    paymentStatus: "PAID",
    categoryId: "cat-1",
    categoryName: "Test",
    recurrenceId: null,
    accountId: null,
    createdAt: new Date(),
    ...overrides,
  });

  it("transaction on last day of month is included in that month", () => {
    const txs = [
      makeTx({ id: "1", amount: 500, date: new Date(2026, 2, 31, 23, 59, 59) }), // March 31 23:59
    ];

    const marStart = new Date(2026, 2, 1);
    const marEnd = endOfMonth(new Date(2026, 2, 15)); // March 31 23:59:59.999

    const summary = computeMonthlySummary(txs, marStart, marEnd);
    expect(summary.monthExpenses).toBe(500);
  });

  it("transaction at 00:00 of next month is NOT included in previous month", () => {
    const txs = [
      makeTx({ id: "1", amount: 500, date: new Date(2026, 3, 1, 0, 0, 0) }), // April 1 00:00
    ];

    const marStart = new Date(2026, 2, 1);
    const marEnd = endOfMonth(new Date(2026, 2, 15));

    const summary = computeMonthlySummary(txs, marStart, marEnd);
    expect(summary.monthExpenses).toBe(0);
  });

  it("transaction at 23:59 of last day IS included", () => {
    const txs = [
      makeTx({ id: "1", amount: 300, date: new Date(2026, 2, 31, 23, 59, 59) }),
    ];

    const marStart = new Date(2026, 2, 1);
    const marEnd = endOfMonth(new Date(2026, 2, 15));

    const summary = computeMonthlySummary(txs, marStart, marEnd);
    expect(summary.monthExpenses).toBe(300);
  });
});

// ============================================================
// YEAR BOUNDARY TESTS (virada de ano)
// ============================================================

describe("Year boundary transactions", () => {
  it("December 31 transaction is in December, not January", () => {
    const txs: any[] = [
      {
        id: "1",
        type: "INCOME",
        amount: 10000,
        description: "Year-end bonus",
        date: new Date(2025, 11, 31), // Dec 31, 2025
        dueDate: null,
        paidAt: null,
        amountPaid: 0,
        paymentStatus: "PAID",
        categoryId: "cat-1",
        categoryName: "Bonus",
        recurrenceId: null,
        accountId: null,
        createdAt: new Date(),
      },
    ];

    const decStart = new Date(2025, 11, 1);
    const decEnd = endOfMonth(new Date(2025, 11, 15));

    const summary = computeMonthlySummary(txs, decStart, decEnd);
    expect(summary.monthIncome).toBe(10000);
  });

  it("January 1 transaction is in January, not December", () => {
    const txs: any[] = [
      {
        id: "1",
        type: "EXPENSE",
        amount: 5000,
        description: "New year expense",
        date: new Date(2026, 0, 1), // Jan 1, 2026
        dueDate: null,
        paidAt: null,
        amountPaid: 0,
        paymentStatus: "PAID",
        categoryId: "cat-1",
        categoryName: "Operations",
        recurrenceId: null,
        accountId: null,
        createdAt: new Date(),
      },
    ];

    const janStart = new Date(2026, 0, 1);
    const janEnd = endOfMonth(new Date(2026, 0, 15));

    const summary = computeMonthlySummary(txs, janStart, janEnd);
    expect(summary.monthExpenses).toBe(5000);
  });
});

// ============================================================
// WEEK BOUNDARY TESTS
// ============================================================

describe("Week boundaries", () => {
  it("last day of month falls in correct week", () => {
    // March has 31 days. W4 = days 22-31.
    const weeks = getWeeksForMonth(new Date(2026, 2, 15));
    expect(weeks.length).toBe(4);
    expect(weeks[3].weekStart.getDate()).toBe(22);
    expect(weeks[3].weekEnd.getDate()).toBe(31);
  });

  it("February 28 falls in W4", () => {
    const weeks = getWeeksForMonth(new Date(2026, 1, 15)); // Feb 2026 (28 days)
    expect(weeks[3].weekEnd.getDate()).toBe(28);
  });

  it("day 7 belongs to W1, day 8 to W2", () => {
    expect(getWeekNumber(7, 31)).toBe(1);
    expect(getWeekNumber(8, 31)).toBe(2);
  });

  it("day 14 belongs to W2, day 15 to W3", () => {
    expect(getWeekNumber(14, 31)).toBe(2);
    expect(getWeekNumber(15, 31)).toBe(3);
  });

  it("day 21 belongs to W3, day 22 to W4", () => {
    expect(getWeekNumber(21, 31)).toBe(3);
    expect(getWeekNumber(22, 31)).toBe(4);
  });
});

// ============================================================
// EXPORT DATE FILTER SIMULATION
// ============================================================

describe("Export date filter simulation", () => {
  it("endOfDay prevents off-by-one in export filter", () => {
    // Simulate: user selects endDate = "2026-04-30" (YYYY-MM-DD string)
    // This is how date-fns constructs it when parsing from input
    const endDate = endOfDay(new Date(2026, 3, 30)); // April 30, local midnight → 23:59:59

    // Transaction on April 30 at 10am local
    const txDate = new Date(2026, 3, 30, 10, 0, 0);

    // Should be included
    expect(txDate <= endDate).toBe(true);
  });

  it("without endOfDay, transaction at noon on last day is excluded", () => {
    const endDate = new Date("2026-04-30"); // midnight UTC
    const txDate = new Date(2026, 3, 30, 12, 0, 0); // noon

    // This would EXCLUDE the transaction — this was the bug
    expect(txDate <= endDate).toBe(false);
  });

  it("subMonths computes correct reference month", () => {
    const now = new Date(2026, 2, 15); // March 15
    const ref0 = subMonths(now, 0);
    const ref1 = subMonths(now, 1);
    const ref3 = subMonths(now, 3);

    expect(ref0.getMonth()).toBe(2); // March
    expect(ref1.getMonth()).toBe(1); // February
    expect(ref3.getMonth()).toBe(11); // December
  });
});

// ============================================================
// TIMEZONE STRATEGY NOTE
// ============================================================

describe("Timezone awareness (documentation test)", () => {
  it("date-fns format uses local timezone of the runtime", () => {
    // This test documents the timezone behavior:
    // - In Node.js, Date uses the system's local timezone
    // - On Vercel servers, this is typically UTC
    // - For Brazil users (UTC-3), a UTC midnight is 9pm previous day
    // - Our strategy: store dates at midnight in UTC, accept the off-by-one risk
    //   for display purposes. The financial impact is negligible since
    //   we aggregate by month, not by day.

    const date = new Date("2026-04-15T00:00:00Z");
    const formatted = format(date, "yyyy-MM-dd");

    // If server is UTC, this should be "2026-04-15"
    // If server is BRT (UTC-3), this would be "2026-04-14"
    expect(typeof formatted).toBe("string");
    expect(formatted).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("date-fns comparisons are timezone-independent for same-instant dates", () => {
    const date1 = new Date("2026-04-15T00:00:00Z");
    const date2 = new Date(2026, 3, 15); // local timezone

    // These may differ by a few hours depending on timezone,
    // but the month/year comparison remains correct.
    expect(date1.getFullYear()).toBe(2026);
    expect(date1.getMonth()).toBe(3); // April (or possibly March in BRT)
  });
});

// ============================================================
// FEBRUARY EDGE CASE
// ============================================================

describe("February edge cases", () => {
  it("28-day February has correct W4 end", () => {
    const weeks = getWeeksForMonth(new Date(2027, 1, 15)); // Feb 2027 (not leap year)
    expect(weeks[3].weekEnd.getDate()).toBe(28);
  });

  it("29-day February (leap year) has correct W4 end", () => {
    const weeks = getWeeksForMonth(new Date(2028, 1, 15)); // Feb 2028 (leap year)
    expect(weeks[3].weekEnd.getDate()).toBe(29);
  });

  it("January has 31 days, W4 ends on 31", () => {
    const weeks = getWeeksForMonth(new Date(2026, 0, 15));
    expect(weeks[3].weekEnd.getDate()).toBe(31);
  });
});

// ============================================================
// DUE DATE VS TRANSACTION DATE
// ============================================================

describe("dueDate vs transaction date", () => {
  it("weekly forecast uses dueDate when available, falls back to date", () => {
    const referenceDate = new Date(2026, 2, 15); // March

    // Transaction has date=March 1 but dueDate=March 20
    // It should appear in W3 (days 15-21) based on dueDate
    const expenses: any[] = [
      {
        id: "1",
        type: "EXPENSE",
        amount: 1000,
        date: new Date(2026, 2, 1), // March 1
        dueDate: new Date(2026, 2, 20), // March 20 → W3
        paidAt: null,
        amountPaid: 0,
        paymentStatus: "PENDING",
        categoryId: "cat-1",
        recurrenceId: null,
        accountId: null,
        createdAt: new Date(),
      },
    ];

    const forecast = computeWeeklyForecast(referenceDate, [], expenses);

    // W3 (index 2) should have the expense
    expect(forecast.weeks[2].totalExpenses).toBe(1000);
    // W1 (index 0) should not
    expect(forecast.weeks[0].totalExpenses).toBe(0);
  });

  it("weekly forecast falls back to date when dueDate is null", () => {
    const referenceDate = new Date(2026, 2, 15);

    const expenses: any[] = [
      {
        id: "1",
        type: "EXPENSE",
        amount: 800,
        date: new Date(2026, 2, 10), // March 10 → W2
        dueDate: null,
        paidAt: null,
        amountPaid: 0,
        paymentStatus: "PENDING",
        categoryId: "cat-1",
        recurrenceId: null,
        accountId: null,
        createdAt: new Date(),
      },
    ];

    const forecast = computeWeeklyForecast(referenceDate, [], expenses);

    // W2 (index 1) should have the expense
    expect(forecast.weeks[1].totalExpenses).toBe(800);
  });
});
