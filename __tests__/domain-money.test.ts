import { describe, it, expect } from 'vitest';
import { Money } from '@/domain/shared/value-objects/Money';

describe('Money Value Object', () => {
  it('should create a valid Money instance', () => {
    const money = Money.create(100.50);
    expect(money.getValue()).toBe(100.50);
  });

  it('should reject negative amounts', () => {
    expect(() => Money.create(-50)).toThrow('Valor não pode ser negativo');
  });

  it('should allow zero amount', () => {
    const money = Money.create(0);
    expect(money.getValue()).toBe(0);
  });

  it('should create zero Money using factory', () => {
    const money = Money.zero();
    expect(money.getValue()).toBe(0);
    expect(money.isZero()).toBe(true);
  });

  it('should add two Money instances correctly', () => {
    const money1 = Money.create(100);
    const money2 = Money.create(50);
    const result = money1.add(money2);
    expect(result.getValue()).toBe(150);
  });

  it('should subtract two Money instances correctly', () => {
    const money1 = Money.create(100);
    const money2 = Money.create(30);
    const result = money1.subtract(money2);
    expect(result.getValue()).toBe(70);
  });

  it('should throw error when subtracting more than available', () => {
    const money1 = Money.create(50);
    const money2 = Money.create(100);
    expect(() => money1.subtract(money2)).toThrow('Valor não pode ser negativo');
  });

  it('should multiply correctly', () => {
    const money = Money.create(100);
    const result = money.multiply(2);
    expect(result.getValue()).toBe(200);
  });

  it('should check if money is positive', () => {
    const positive = Money.create(100);
    const zero = Money.zero();

    expect(positive.isPositive()).toBe(true);
    expect(zero.isPositive()).toBe(false);
  });

  it('should compare money amounts', () => {
    const money1 = Money.create(100);
    const money2 = Money.create(100);
    const money3 = Money.create(50);

    expect(money1.equals(money2)).toBe(true);
    expect(money1.equals(money3)).toBe(false);
  });

  it('should identify greater amounts', () => {
    const money1 = Money.create(100);
    const money2 = Money.create(50);

    expect(money1.isGreaterThan(money2)).toBe(true);
    expect(money2.isGreaterThan(money1)).toBe(false);
  });

  it('should identify lesser amounts', () => {
    const money1 = Money.create(50);
    const money2 = Money.create(100);

    expect(money1.isLessThan(money2)).toBe(true);
    expect(money2.isLessThan(money1)).toBe(false);
  });
});
