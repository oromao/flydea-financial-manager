/**
 * Tests for shared export helpers.
 *
 * Verifies that summary totals are computed correctly
 * and consistently across all export formats.
 */

import { describe, it, expect } from "vitest";
import { computeExportSummary, formatExportValue } from "../src/lib/export-helpers";

describe("computeExportSummary", () => {
  const makeTx = (overrides: Partial<any> = {}): any => ({
    type: "EXPENSE",
    amount: 100,
    paymentStatus: "PAID",
    amountPaid: 100,
    ...overrides,
  });

  it("sums income correctly", () => {
    const txs = [
      makeTx({ type: "INCOME", amount: 5000 }),
      makeTx({ type: "INCOME", amount: 3000 }),
    ];
    const summary = computeExportSummary(txs);
    expect(summary.totalIncome).toBe(8000);
  });

  it("sums expenses correctly", () => {
    const txs = [
      makeTx({ type: "EXPENSE", amount: 2000 }),
      makeTx({ type: "EXPENSE", amount: 1500 }),
    ];
    const summary = computeExportSummary(txs);
    expect(summary.totalExpenses).toBe(3500);
  });

  it("separates paid from pending expenses", () => {
    const txs = [
      makeTx({ type: "EXPENSE", amount: 1000, paymentStatus: "PAID", amountPaid: 1000 }),
      makeTx({ type: "EXPENSE", amount: 2000, paymentStatus: "PENDING", amountPaid: 0 }),
      makeTx({ type: "EXPENSE", amount: 500, paymentStatus: "PAID", amountPaid: 500 }),
    ];
    const summary = computeExportSummary(txs);
    expect(summary.totalPaid).toBe(1500);
    expect(summary.totalPending).toBe(2000);
  });

  it("calculates balance correctly", () => {
    const txs = [
      makeTx({ type: "INCOME", amount: 10000 }),
      makeTx({ type: "EXPENSE", amount: 6000, paymentStatus: "PAID", amountPaid: 6000 }),
    ];
    const summary = computeExportSummary(txs);
    expect(summary.balance).toBe(4000);
  });

  it("handles empty transaction list", () => {
    const summary = computeExportSummary([]);
    expect(summary.totalIncome).toBe(0);
    expect(summary.totalExpenses).toBe(0);
    expect(summary.totalPaid).toBe(0);
    expect(summary.totalPending).toBe(0);
    expect(summary.balance).toBe(0);
  });

  it("handles mixed income and expenses", () => {
    const txs = [
      makeTx({ type: "INCOME", amount: 5000 }),
      makeTx({ type: "EXPENSE", amount: 3000, paymentStatus: "PAID", amountPaid: 3000 }),
      makeTx({ type: "INCOME", amount: 2000 }),
      makeTx({ type: "EXPENSE", amount: 1000, paymentStatus: "PENDING", amountPaid: 0 }),
    ];
    const summary = computeExportSummary(txs);
    expect(summary.totalIncome).toBe(7000);
    expect(summary.totalExpenses).toBe(4000);
    expect(summary.totalPaid).toBe(3000);
    expect(summary.totalPending).toBe(1000);
    expect(summary.balance).toBe(3000);
  });

  it("tracks amountPaid correctly", () => {
    const txs = [
      makeTx({ type: "EXPENSE", amount: 1000, paymentStatus: "PAID", amountPaid: 400 }),
      makeTx({ type: "EXPENSE", amount: 2000, paymentStatus: "PENDING", amountPaid: 0 }),
    ];
    const summary = computeExportSummary(txs);
    expect(summary.totalAmountPaid).toBe(400);
  });
});

describe("formatExportValue", () => {
  it("formats positive value", () => {
    const result = formatExportValue(1234.56);
    expect(result).toContain("1.234");
    expect(result).toContain("56");
  });

  it("formats negative value", () => {
    const result = formatExportValue(-500);
    expect(result).toContain("-");
    expect(result).toContain("500");
  });

  it("formats zero", () => {
    const result = formatExportValue(0);
    expect(result).toBe("R$\u00A00,00");
  });
});
