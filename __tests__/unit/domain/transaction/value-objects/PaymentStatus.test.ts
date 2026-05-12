import { describe, it, expect } from "vitest";
import { PaymentStatus, PaymentStatusEnum } from "@/domain/transaction/value-objects/PaymentStatus";
import { ValidationError } from "@/domain/shared/errors/DomainError";

describe("PaymentStatus", () => {
  it("creates PAID status", () => {
    const status = PaymentStatus.create("PAID");
    expect(status.getValue()).toBe(PaymentStatusEnum.PAID);
    expect(status.isPaid()).toBe(true);
    expect(status.isPending()).toBe(false);
  });

  it("creates PENDING status", () => {
    const status = PaymentStatus.create("PENDING");
    expect(status.getValue()).toBe(PaymentStatusEnum.PENDING);
    expect(status.isPending()).toBe(true);
    expect(status.isPaid()).toBe(false);
  });

  it("uses static factory for paid", () => {
    const status = PaymentStatus.paid();
    expect(status.isPaid()).toBe(true);
  });

  it("uses static factory for pending", () => {
    const status = PaymentStatus.pending();
    expect(status.isPending()).toBe(true);
  });

  it("rejects invalid status", () => {
    expect(() => PaymentStatus.create("OVERDUE")).toThrow(ValidationError);
    expect(() => PaymentStatus.create("OVERDUE")).toThrow("Status de pagamento inválido");
  });

  it("rejects empty string", () => {
    expect(() => PaymentStatus.create("")).toThrow(ValidationError);
  });

  it("compares equality correctly", () => {
    const a = PaymentStatus.create("PAID");
    const b = PaymentStatus.create("PAID");
    const c = PaymentStatus.create("PENDING");
    expect(a.equals(b)).toBe(true);
    expect(a.equals(c)).toBe(false);
  });
});
