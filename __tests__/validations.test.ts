import { describe, it, expect } from "vitest";
import {
  TransactionSchema,
  AccountSchema,
  BudgetSchema,
  TagSchema,
  CategorySchema,
  RecurrenceSchema,
  InvoiceInstallmentSchema,
  InvoiceSchema,
} from "../src/lib/validations";

// ── TransactionSchema ──────────────────────────────────────────────────────────

describe("TransactionSchema", () => {
  const baseValid = {
    type: "EXPENSE",
    description: "Test transaction",
    amount: 100,
    date: "2025-01-15",
  };

  it("accepts a minimal valid expense", () => {
    const result = TransactionSchema.safeParse({
      ...baseValid,
      categoryId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    });
    expect(result.success).toBe(true);
  });

  it("accepts a minimal valid income", () => {
    const result = TransactionSchema.safeParse({
      type: "INCOME",
      description: "Salary",
      amount: 5000,
      date: "2025-01-01",
      categoryId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing description", () => {
    const result = TransactionSchema.safeParse({ ...baseValid, description: "" });
    expect(result.success).toBe(false);
  });

  it("rejects negative amount", () => {
    const result = TransactionSchema.safeParse({ ...baseValid, amount: -50 });
    expect(result.success).toBe(false);
  });

  it("rejects zero amount", () => {
    const result = TransactionSchema.safeParse({ ...baseValid, amount: 0 });
    expect(result.success).toBe(false);
  });

  it("accepts undefined categoryId (optional)", () => {
    const result = TransactionSchema.safeParse(baseValid);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.categoryId).toBeUndefined();
  });

  it("transforms null categoryId to undefined", () => {
    const result = TransactionSchema.safeParse({ ...baseValid, categoryId: null });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.categoryId).toBeUndefined();
  });

  it("transforms empty string categoryId to undefined", () => {
    const result = TransactionSchema.safeParse({ ...baseValid, categoryId: "" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.categoryId).toBeUndefined();
  });

  it("rejects invalid UUID for categoryId", () => {
    const result = TransactionSchema.safeParse({ ...baseValid, categoryId: "not-a-uuid" });
    expect(result.success).toBe(false);
  });

  it("accepts null dueDate and transforms to undefined", () => {
    const result = TransactionSchema.safeParse({ ...baseValid, dueDate: null });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.dueDate).toBeUndefined();
  });

  it("accepts empty string dueDate and transforms to undefined", () => {
    const result = TransactionSchema.safeParse({ ...baseValid, dueDate: "" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.dueDate).toBeUndefined();
  });

  it("accepts valid ISO date string for dueDate", () => {
    const result = TransactionSchema.safeParse({ ...baseValid, dueDate: "2025-02-28" });
    expect(result.success).toBe(true);
  });

  it("rejects invalid date string for dueDate", () => {
    const result = TransactionSchema.safeParse({ ...baseValid, dueDate: "not-a-date" });
    expect(result.success).toBe(false);
  });

  it("accepts null accountId and transforms to undefined", () => {
    const result = TransactionSchema.safeParse({ ...baseValid, accountId: null });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.accountId).toBeUndefined();
  });

  it("accepts valid accountId UUID", () => {
    const uuid = "b2c3d4e5-f6a7-8901-bcde-f12345678901";
    const result = TransactionSchema.safeParse({ ...baseValid, accountId: uuid });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.accountId).toBe(uuid);
  });

  it("defaults paymentStatus to PAID", () => {
    const result = TransactionSchema.safeParse(baseValid);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.paymentStatus).toBe("PAID");
  });

  it("defaults frequency to NONE", () => {
    const result = TransactionSchema.safeParse(baseValid);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.frequency).toBe("NONE");
  });

  it("accepts tagIds array of UUIDs", () => {
    const result = TransactionSchema.safeParse({
      ...baseValid,
      tagIds: ["a1b2c3d4-e5f6-7890-abcd-ef1234567890"],
    });
    expect(result.success).toBe(true);
  });

  it("rejects tagIds with invalid UUID", () => {
    const result = TransactionSchema.safeParse({ ...baseValid, tagIds: ["bad-id"] });
    expect(result.success).toBe(false);
  });

  it("accepts empty string attachmentUrl (nullable)", () => {
    const result = TransactionSchema.safeParse({ ...baseValid, attachmentUrl: "" });
    expect(result.success).toBe(true);
  });

  it("accepts null attachmentUrl", () => {
    const result = TransactionSchema.safeParse({ ...baseValid, attachmentUrl: null });
    expect(result.success).toBe(true);
  });

  it("partial schema allows omitting required fields", () => {
    const result = TransactionSchema.partial().safeParse({ amount: 200 });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.amount).toBe(200);
  });
});

// ── AccountSchema ──────────────────────────────────────────────────────────────

describe("AccountSchema", () => {
  it("accepts a valid account", () => {
    const result = AccountSchema.safeParse({ name: "Nubank", type: "CHECKING", balance: 1000 });
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = AccountSchema.safeParse({ name: "", type: "SAVINGS" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid account type", () => {
    const result = AccountSchema.safeParse({ name: "Bank", type: "INVALID" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid color hex", () => {
    const result = AccountSchema.safeParse({ name: "Bank", type: "CASH", color: "red" });
    expect(result.success).toBe(false);
  });

  it("accepts valid hex color", () => {
    const result = AccountSchema.safeParse({ name: "Bank", type: "CASH", color: "#3B82F6" });
    expect(result.success).toBe(true);
  });

  it("defaults balance to 0", () => {
    const result = AccountSchema.safeParse({ name: "Bank", type: "CREDIT" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.balance).toBe(0);
  });
});

// ── BudgetSchema ───────────────────────────────────────────────────────────────

describe("BudgetSchema", () => {
  const validBudget = {
    categoryId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    amount: 1000,
  };

  it("accepts a valid budget", () => {
    const result = BudgetSchema.safeParse(validBudget);
    expect(result.success).toBe(true);
  });

  it("rejects zero amount", () => {
    const result = BudgetSchema.safeParse({ ...validBudget, amount: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects negative amount", () => {
    const result = BudgetSchema.safeParse({ ...validBudget, amount: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects alertAt below 1", () => {
    const result = BudgetSchema.safeParse({ ...validBudget, alertAt: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects alertAt above 100", () => {
    const result = BudgetSchema.safeParse({ ...validBudget, alertAt: 101 });
    expect(result.success).toBe(false);
  });

  it("defaults period to MONTHLY", () => {
    const result = BudgetSchema.safeParse(validBudget);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.period).toBe("MONTHLY");
  });

  it("defaults alertAt to 80", () => {
    const result = BudgetSchema.safeParse(validBudget);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.alertAt).toBe(80);
  });
});

// ── TagSchema ──────────────────────────────────────────────────────────────────

describe("TagSchema", () => {
  it("accepts a valid tag", () => {
    const result = TagSchema.safeParse({ name: "Work", color: "#FF5733" });
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = TagSchema.safeParse({ name: "", color: "#000000" });
    expect(result.success).toBe(false);
  });

  it("rejects name over 50 chars", () => {
    const result = TagSchema.safeParse({ name: "x".repeat(51), color: "#000000" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid color", () => {
    const result = TagSchema.safeParse({ name: "Work", color: "blue" });
    expect(result.success).toBe(false);
  });

  it("defaults color to #3B82F6", () => {
    const result = TagSchema.safeParse({ name: "Work" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.color).toBe("#3B82F6");
  });
});

// ── RecurrenceSchema ───────────────────────────────────────────────────────────

describe("RecurrenceSchema", () => {
  const validRecurrence = {
    description: "Netflix",
    amount: 39.9,
    frequency: "MONTHLY",
    startDate: "2025-01-01",
    categoryId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  };

  it("accepts a valid monthly recurrence", () => {
    const result = RecurrenceSchema.safeParse(validRecurrence);
    expect(result.success).toBe(true);
  });

  it("accepts a weekly recurrence", () => {
    const result = RecurrenceSchema.safeParse({ ...validRecurrence, frequency: "WEEKLY" });
    expect(result.success).toBe(true);
  });

  it("defaults type to EXPENSE", () => {
    const result = RecurrenceSchema.safeParse(validRecurrence);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.type).toBe("EXPENSE");
  });

  it("accepts INCOME type", () => {
    const result = RecurrenceSchema.safeParse({ ...validRecurrence, type: "INCOME" });
    expect(result.success).toBe(true);
  });

  it("rejects empty description", () => {
    const result = RecurrenceSchema.safeParse({ ...validRecurrence, description: "" });
    expect(result.success).toBe(false);
  });

  it("rejects negative amount", () => {
    const result = RecurrenceSchema.safeParse({ ...validRecurrence, amount: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects invalid startDate", () => {
    const result = RecurrenceSchema.safeParse({ ...validRecurrence, startDate: "not-a-date" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid categoryId", () => {
    const result = RecurrenceSchema.safeParse({ ...validRecurrence, categoryId: "bad-id" });
    expect(result.success).toBe(false);
  });

  it("accepts optional isActive field", () => {
    const result = RecurrenceSchema.safeParse({ ...validRecurrence, isActive: false });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.isActive).toBe(false);
  });
});

// ── InvoiceInstallmentSchema ───────────────────────────────────────────────────

describe("InvoiceInstallmentSchema", () => {
  const validInstallment = {
    installmentNumber: 1,
    amount: 500,
    dueDate: "2025-03-01",
  };

  it("accepts a valid installment", () => {
    const result = InvoiceInstallmentSchema.safeParse(validInstallment);
    expect(result.success).toBe(true);
  });

  it("defaults status to PENDING", () => {
    const result = InvoiceInstallmentSchema.safeParse(validInstallment);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.status).toBe("PENDING");
  });

  it("accepts RECEIVED status", () => {
    const result = InvoiceInstallmentSchema.safeParse({ ...validInstallment, status: "RECEIVED" });
    expect(result.success).toBe(true);
  });

  it("rejects installmentNumber 0", () => {
    const result = InvoiceInstallmentSchema.safeParse({ ...validInstallment, installmentNumber: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects negative amount", () => {
    const result = InvoiceInstallmentSchema.safeParse({ ...validInstallment, amount: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects invalid dueDate", () => {
    const result = InvoiceInstallmentSchema.safeParse({ ...validInstallment, dueDate: "bad" });
    expect(result.success).toBe(false);
  });
});

// ── InvoiceSchema ──────────────────────────────────────────────────────────────

describe("InvoiceSchema", () => {
  const validInvoice = {
    invoiceNumber: "NF-001",
    clientName: "ACME Corp",
    totalAmount: 1500,
    emissionDate: "2025-01-15",
    installments: [{ installmentNumber: 1, amount: 1500, dueDate: "2025-02-15" }],
  };

  it("accepts a valid invoice", () => {
    const result = InvoiceSchema.safeParse(validInvoice);
    expect(result.success).toBe(true);
  });

  it("accepts optional clientEmail", () => {
    const result = InvoiceSchema.safeParse({ ...validInvoice, clientEmail: "client@test.com" });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = InvoiceSchema.safeParse({ ...validInvoice, clientEmail: "not-an-email" });
    expect(result.success).toBe(false);
  });

  it("rejects empty invoiceNumber", () => {
    const result = InvoiceSchema.safeParse({ ...validInvoice, invoiceNumber: "" });
    expect(result.success).toBe(false);
  });

  it("rejects empty clientName", () => {
    const result = InvoiceSchema.safeParse({ ...validInvoice, clientName: "" });
    expect(result.success).toBe(false);
  });

  it("rejects zero totalAmount", () => {
    const result = InvoiceSchema.safeParse({ ...validInvoice, totalAmount: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects invalid emissionDate", () => {
    const result = InvoiceSchema.safeParse({ ...validInvoice, emissionDate: "bad-date" });
    expect(result.success).toBe(false);
  });

  it("rejects empty installments array", () => {
    const result = InvoiceSchema.safeParse({ ...validInvoice, installments: [] });
    expect(result.success).toBe(false);
  });

  it("accepts optional dueDate", () => {
    const result = InvoiceSchema.safeParse({ ...validInvoice, dueDate: "2025-03-01" });
    expect(result.success).toBe(true);
  });

  it("rejects invalid optional dueDate", () => {
    const result = InvoiceSchema.safeParse({ ...validInvoice, dueDate: "bad" });
    expect(result.success).toBe(false);
  });
});

// ── CategorySchema ─────────────────────────────────────────────────────────────

describe("CategorySchema", () => {
  it("accepts valid income category", () => {
    const result = CategorySchema.safeParse({ name: "Salary", type: "INCOME" });
    expect(result.success).toBe(true);
  });

  it("accepts valid expense category", () => {
    const result = CategorySchema.safeParse({ name: "Food", type: "EXPENSE" });
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = CategorySchema.safeParse({ name: "", type: "EXPENSE" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid type", () => {
    const result = CategorySchema.safeParse({ name: "Test", type: "OTHER" });
    expect(result.success).toBe(false);
  });
});
