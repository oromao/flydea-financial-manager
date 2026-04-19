import { describe, it, expect, beforeEach } from 'vitest';
import { Transaction } from '@/domain/transaction/entities/Transaction';
import { Money } from '@/domain/shared/value-objects/Money';
import { UserId } from '@/domain/shared/value-objects/UserId';
import { TransactionType } from '@/domain/transaction/value-objects/TransactionType';
import { PaymentStatus } from '@/domain/transaction/value-objects/PaymentStatus';

describe('Transaction Entity', () => {
  let userId: UserId;
  let categoryId: string;
  let txId: string;

  beforeEach(() => {
    userId = UserId.create('user-123');
    categoryId = 'cat-456';
    txId = 'tx-' + Date.now();
  });

  it('should create a new transaction', () => {
    const transaction = Transaction.create(
      txId,
      userId,
      TransactionType.expense(),
      'Test transaction',
      Money.create(100),
      categoryId,
      new Date(),
      PaymentStatus.pending()
    );

    expect(transaction.getId()).toBe(txId);
    expect(transaction.getDescription()).toBe('Test transaction');
    expect(transaction.getAmount().getValue()).toBe(100);
    expect(transaction.getType()).toEqual(TransactionType.expense());
    expect(transaction.getPaymentStatus().isPending()).toBe(true);
  });

  it('should reject empty description', () => {
    expect(() =>
      Transaction.create(
        txId,
        userId,
        TransactionType.expense(),
        '',
        Money.create(100),
        categoryId,
        new Date(),
        PaymentStatus.pending()
      )
    ).toThrow('Descrição é obrigatória');
  });

  it('should reject empty category', () => {
    expect(() =>
      Transaction.create(
        txId,
        userId,
        TransactionType.expense(),
        'Valid description',
        Money.create(100),
        '',
        new Date(),
        PaymentStatus.pending()
      )
    ).toThrow('Categoria é obrigatória');
  });

  it('should create with PAID status and auto-set amountPaid', () => {
    const amount = Money.create(100);
    const transaction = Transaction.create(
      txId,
      userId,
      TransactionType.expense(),
      'Test',
      amount,
      categoryId,
      new Date(),
      PaymentStatus.paid()
    );

    expect(transaction.getPaymentStatus().isPaid()).toBe(true);
    expect(transaction.getAmountPaid().getValue()).toBe(100);
  });

  it('should create with PENDING status and zero amountPaid', () => {
    const transaction = Transaction.create(
      txId,
      userId,
      TransactionType.expense(),
      'Test',
      Money.create(100),
      categoryId,
      new Date(),
      PaymentStatus.pending()
    );

    expect(transaction.getPaymentStatus().isPending()).toBe(true);
    expect(transaction.getAmountPaid().getValue()).toBe(0);
  });

  it('should validate ownership', () => {
    const transaction = Transaction.create(
      txId,
      userId,
      TransactionType.expense(),
      'Test',
      Money.create(100),
      categoryId,
      new Date(),
      PaymentStatus.pending()
    );

    expect(transaction.isOwnedBy(userId)).toBe(true);
    expect(transaction.isOwnedBy(UserId.create('user-999'))).toBe(false);
  });

  it('should restore transaction from database', () => {
    const amount = Money.create(100);
    const amountPaid = Money.create(100);
    const now = new Date();

    const transaction = Transaction.restore(
      'tx-123',
      userId,
      TransactionType.income(),
      'Restored',
      amount,
      categoryId,
      now,
      PaymentStatus.paid(),
      amountPaid,
      now,
      now
    );

    expect(transaction.getId()).toBe('tx-123');
    expect(transaction.getDescription()).toBe('Restored');
    expect(transaction.getPaymentStatus().isPaid()).toBe(true);
    expect(transaction.getAmountPaid().getValue()).toBe(100);
  });

  it('should compare amount values correctly', () => {
    const transaction = Transaction.create(
      txId,
      userId,
      TransactionType.expense(),
      'Test',
      Money.create(100),
      categoryId,
      new Date(),
      PaymentStatus.pending()
    );

    const amount100 = Money.create(100);
    const amount50 = Money.create(50);

    expect(transaction.getAmount().equals(amount100)).toBe(true);
    expect(transaction.getAmount().isGreaterThan(amount50)).toBe(true);
    expect(transaction.getAmount().isLessThan(Money.create(150))).toBe(true);
  });
});
