import { describe, it, expect } from "vitest";
import { Money } from "@/domain/shared/value-objects/Money";
import { ValidationError } from "@/domain/shared/errors/DomainError";

describe("Money - additional edge cases", () => {
  it("rejects NaN", () => {
    expect(() => Money.create(NaN)).toThrow(ValidationError);
    expect(() => Money.create(NaN)).toThrow("Valor inválido");
  });

  it("rejects non-number values", () => {
    expect(() => Money.create("abc" as any)).toThrow(ValidationError);
  });

  it("handles decimal amounts", () => {
    const money = Money.create(99.99);
    expect(money.getValue()).toBe(99.99);
  });

  it("add handles decimals correctly", () => {
    const result = Money.create(0.1).add(Money.create(0.2));
    expect(result.getValue()).toBeCloseTo(0.3);
  });

  it("subtract handles decimals correctly", () => {
    const result = Money.create(1.0).subtract(Money.create(0.33));
    expect(result.getValue()).toBeCloseTo(0.67);
  });

  it("multiply handles decimals correctly", () => {
    const result = Money.create(10.50).multiply(3);
    expect(result.getValue()).toBeCloseTo(31.50);
  });

  it("multiply by zero returns zero", () => {
    const result = Money.create(100).multiply(0);
    expect(result.getValue()).toBe(0);
    expect(result.isZero()).toBe(true);
  });

  it("equals returns false for different amounts", () => {
    expect(Money.create(100).equals(Money.create(100))).toBe(true);
    expect(Money.create(100).equals(Money.create(101))).toBe(false);
  });

  it("isPositive returns true only for positive amounts", () => {
    expect(Money.create(1).isPositive()).toBe(true);
    expect(Money.create(100).isPositive()).toBe(true);
    expect(Money.zero().isPositive()).toBe(false);
  });

  it("isZero returns true only for zero amounts", () => {
    expect(Money.zero().isZero()).toBe(true);
    expect(Money.create(0).isZero()).toBe(true);
    expect(Money.create(1).isZero()).toBe(false);
  });

  it("isGreaterThan works correctly", () => {
    expect(Money.create(200).isGreaterThan(Money.create(100))).toBe(true);
    expect(Money.create(100).isGreaterThan(Money.create(100))).toBe(false);
    expect(Money.create(50).isGreaterThan(Money.create(100))).toBe(false);
  });

  it("isLessThan works correctly", () => {
    expect(Money.create(50).isLessThan(Money.create(100))).toBe(true);
    expect(Money.create(100).isLessThan(Money.create(100))).toBe(false);
    expect(Money.create(200).isLessThan(Money.create(100))).toBe(false);
  });
});
