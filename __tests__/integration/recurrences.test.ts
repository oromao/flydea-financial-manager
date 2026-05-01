import { describe, it, expect } from 'vitest';
import { z } from 'zod';

const recurrenceSchema = z.object({
  description: z.string().min(1),
  amount: z.number().min(0.01),
  type: z.enum(["INCOME", "EXPENSE"]),
  frequency: z.enum(["MONTHLY", "WEEKLY", "BIWEEKLY", "YEARLY"]),
  startDate: z.string().min(1),
  dayOfMonth: z.number().int().min(1).max(31).optional(),
  categoryId: z.string().min(1),
  isActive: z.boolean().default(true),
});

describe('Recurrence Validation', () => {
  it('should validate monthly recurrence', () => {
    const result = recurrenceSchema.safeParse({
      description: 'Aluguel',
      amount: 1200,
      type: 'EXPENSE',
      frequency: 'MONTHLY',
      startDate: '2026-02-01',
      dayOfMonth: 5,
      categoryId: 'cat-123',
    });
    expect(result.success).toBe(true);
  });

  it('should validate weekly recurrence', () => {
    const result = recurrenceSchema.safeParse({
      description: 'Feira',
      amount: 200,
      type: 'EXPENSE',
      frequency: 'WEEKLY',
      startDate: '2026-02-01',
      categoryId: 'cat-123',
    });
    expect(result.success).toBe(true);
  });

  it('should reject invalid frequency', () => {
    const result = recurrenceSchema.safeParse({
      description: 'Test',
      amount: 100,
      type: 'EXPENSE',
      frequency: 'DAILY',
      startDate: '2026-02-01',
      categoryId: 'cat-123',
    });
    expect(result.success).toBe(false);
  });

  it('should reject dayOfMonth > 31', () => {
    const result = recurrenceSchema.safeParse({
      description: 'Test',
      amount: 100,
      type: 'EXPENSE',
      frequency: 'MONTHLY',
      startDate: '2026-02-01',
      dayOfMonth: 32,
      categoryId: 'cat-123',
    });
    expect(result.success).toBe(false);
  });
});
