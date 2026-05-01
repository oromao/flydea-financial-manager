import { describe, it, expect } from 'vitest';
import { z } from 'zod';

const budgetSchema = z.object({
  categoryId: z.string().min(1),
  amount: z.number().min(0.01),
  period: z.enum(["MONTHLY", "YEARLY"]).default("MONTHLY"),
  alertAt: z.number().min(1).max(100).default(80),
});

describe('Budget Validation', () => {
  it('should validate a valid budget', () => {
    const result = budgetSchema.safeParse({
      categoryId: 'cat-123',
      amount: 500,
      period: 'MONTHLY',
      alertAt: 80,
    });
    expect(result.success).toBe(true);
  });

  it('should reject invalid alertAt (> 100)', () => {
    const result = budgetSchema.safeParse({
      categoryId: 'cat-123',
      amount: 500,
      alertAt: 150,
    });
    expect(result.success).toBe(false);
  });

  it('should use defaults', () => {
    const result = budgetSchema.safeParse({
      categoryId: 'cat-123',
      amount: 500,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.period).toBe('MONTHLY');
      expect(result.data.alertAt).toBe(80);
    }
  });
});
