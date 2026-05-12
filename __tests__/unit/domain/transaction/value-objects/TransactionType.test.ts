import { describe, it, expect } from "vitest";
import { TransactionType, TransactionTypeEnum } from "@/domain/transaction/value-objects/TransactionType";
import { ValidationError } from "@/domain/shared/errors/DomainError";

describe("TransactionType", () => {
  it("creates INCOME type", () => {
    const type = TransactionType.create("INCOME");
    expect(type.getValue()).toBe(TransactionTypeEnum.INCOME);
    expect(type.isIncome()).toBe(true);
    expect(type.isExpense()).toBe(false);
  });

  it("creates EXPENSE type", () => {
    const type = TransactionType.create("EXPENSE");
    expect(type.getValue()).toBe(TransactionTypeEnum.EXPENSE);
    expect(type.isExpense()).toBe(true);
    expect(type.isIncome()).toBe(false);
  });

  it("uses static factory for income", () => {
    const type = TransactionType.income();
    expect(type.isIncome()).toBe(true);
  });

  it("uses static factory for expense", () => {
    const type = TransactionType.expense();
    expect(type.isExpense()).toBe(true);
  });

  it("rejects invalid type", () => {
    expect(() => TransactionType.create("INVALID")).toThrow(ValidationError);
    expect(() => TransactionType.create("INVALID")).toThrow("Tipo de transação inválido");
  });

  it("rejects empty string", () => {
    expect(() => TransactionType.create("")).toThrow(ValidationError);
  });

  it("compares equality correctly", () => {
    const a = TransactionType.create("INCOME");
    const b = TransactionType.create("INCOME");
    const c = TransactionType.create("EXPENSE");
    expect(a.equals(b)).toBe(true);
    expect(a.equals(c)).toBe(false);
  });
});
