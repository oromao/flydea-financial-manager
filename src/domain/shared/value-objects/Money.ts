import { ValidationError } from '../errors/DomainError';

export class Money {
  private readonly amount: number;

  private constructor(amount: number) {
    this.amount = amount;
  }

  static create(amount: number): Money {
    if (typeof amount !== 'number' || isNaN(amount)) {
      throw new ValidationError('Valor inválido');
    }

    if (amount < 0) {
      throw new ValidationError('Valor não pode ser negativo');
    }

    return new Money(amount);
  }

  static zero(): Money {
    return new Money(0);
  }

  getValue(): number {
    return this.amount;
  }

  add(other: Money): Money {
    return Money.create(this.amount + other.amount);
  }

  subtract(other: Money): Money {
    return Money.create(this.amount - other.amount);
  }

  multiply(factor: number): Money {
    return Money.create(this.amount * factor);
  }

  isPositive(): boolean {
    return this.amount > 0;
  }

  isZero(): boolean {
    return this.amount === 0;
  }

  equals(other: Money): boolean {
    return this.amount === other.amount;
  }

  isGreaterThan(other: Money): boolean {
    return this.amount > other.amount;
  }

  isLessThan(other: Money): boolean {
    return this.amount < other.amount;
  }
}
