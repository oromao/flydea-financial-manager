/**
 * Shared export helpers — ensures all exports (CSV, PDF, XLSX)
 * compute summary totals consistently with the financial engine.
 */

import { Transaction } from "@prisma/client";

/**
 * Compute summary totals from a list of transactions.
 * Used by all export endpoints to add summary footer rows.
 */
export function computeExportSummary(transactions: Transaction[]) {
  let totalIncome = 0;
  let totalExpenses = 0;
  let totalPaid = 0;
  let totalPending = 0;
  let totalAmountPaid = 0;

  for (const t of transactions) {
    if (t.type === "INCOME") {
      totalIncome += t.amount;
    } else {
      totalExpenses += t.amount;
      if (t.paymentStatus === "PAID") {
        totalPaid += t.amount;
      } else {
        totalPending += t.amount;
      }
      totalAmountPaid += t.amountPaid || 0;
    }
  }

  return {
    totalIncome,
    totalExpenses,
    totalPaid,
    totalPending,
    totalAmountPaid,
    balance: totalIncome - totalExpenses,
  };
}

/**
 * Format a BRL value for export (always positive, with sign prefix for context).
 */
export function formatExportValue(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}
