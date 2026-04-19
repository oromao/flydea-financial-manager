import { ValidationError } from '../../shared/errors/DomainError';

export enum TransactionTypeEnum {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
}

export class TransactionType {
  private readonly value: TransactionTypeEnum;

  private constructor(value: TransactionTypeEnum) {
    this.value = value;
  }

  static create(value: string): TransactionType {
    if (!Object.values(TransactionTypeEnum).includes(value as TransactionTypeEnum)) {
      throw new ValidationError(`Tipo de transação inválido: ${value}`);
    }

    return new TransactionType(value as TransactionTypeEnum);
  }

  static income(): TransactionType {
    return new TransactionType(TransactionTypeEnum.INCOME);
  }

  static expense(): TransactionType {
    return new TransactionType(TransactionTypeEnum.EXPENSE);
  }

  getValue(): TransactionTypeEnum {
    return this.value;
  }

  isIncome(): boolean {
    return this.value === TransactionTypeEnum.INCOME;
  }

  isExpense(): boolean {
    return this.value === TransactionTypeEnum.EXPENSE;
  }

  equals(other: TransactionType): boolean {
    return this.value === other.value;
  }
}
