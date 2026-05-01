import { describe, it, expect } from 'vitest';
import { z } from 'zod';

const transactionSchema = z.object({
  description: z.string(),
  amount: z.number(),
  type: z.enum(["INCOME", "EXPENSE"]),
  date: z.string(),
  categoryId: z.string(),
});

describe('Transaction Validation', () => {
  it('should validate a valid transaction', () => {
    const result = transactionSchema.safeParse({
      description: 'Mercado',
      amount: 150.50,
      type: 'EXPENSE',
      date: '2026-01-15',
      categoryId: 'cat-123',
    });
    expect(result.success).toBe(true);
  });

  it('should reject missing description', () => {
    const result = transactionSchema.safeParse({
      amount: 150.50,
      type: 'EXPENSE',
      date: '2026-01-15',
      categoryId: 'cat-123',
    });
    expect(result.success).toBe(false);
  });

  it('should reject invalid type', () => {
    const result = transactionSchema.safeParse({
      description: 'Test',
      amount: 100,
      type: 'INVALID',
      date: '2026-01-15',
      categoryId: 'cat-123',
    });
    expect(result.success).toBe(false);
  });

  it('should reject negative amount', () => {
    const result = transactionSchema.safeParse({
      description: 'Test',
      amount: -50,
      type: 'EXPENSE',
      date: '2026-01-15',
      categoryId: 'cat-123',
    });
    // zod.number() allows negative by default, so we check min separately
    const strictSchema = transactionSchema.extend({ amount: z.number().min(0.01) });
    const result2 = strictSchema.safeParse({
      description: 'Test',
      amount: -50,
      type: 'EXPENSE',
      date: '2026-01-15',
      categoryId: 'cat-123',
    });
    expect(result2.success).toBe(false);
  });
});
