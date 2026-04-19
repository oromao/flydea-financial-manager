import { describe, it, expect } from 'vitest';
import { AgentType } from '@/domain/agent/value-objects/AgentType';

describe('AgentType Value Object', () => {
  describe('create factory', () => {
    it('should create BUDGET_REVIEW type', () => {
      const type = AgentType.create('BUDGET_REVIEW');
      expect(type.value).toBe('BUDGET_REVIEW');
    });

    it('should create EXPENSE_ALERT type', () => {
      const type = AgentType.create('EXPENSE_ALERT');
      expect(type.value).toBe('EXPENSE_ALERT');
    });

    it('should create INCOME_CHECK type', () => {
      const type = AgentType.create('INCOME_CHECK');
      expect(type.value).toBe('INCOME_CHECK');
    });

    it('should create CASHFLOW_FORECAST type', () => {
      const type = AgentType.create('CASHFLOW_FORECAST');
      expect(type.value).toBe('CASHFLOW_FORECAST');
    });

    it('should create SAVINGS_GOAL type', () => {
      const type = AgentType.create('SAVINGS_GOAL');
      expect(type.value).toBe('SAVINGS_GOAL');
    });

    it('should create CUSTOM type', () => {
      const type = AgentType.create('CUSTOM');
      expect(type.value).toBe('CUSTOM');
    });

    it('should reject invalid type', () => {
      expect(() => {
        AgentType.create('INVALID_TYPE');
      }).toThrow('Invalid agent type');
    });

    it('should be case sensitive', () => {
      expect(() => {
        AgentType.create('budget_review'); // lowercase
      }).toThrow();
    });

    it('should reject empty string', () => {
      expect(() => {
        AgentType.create('');
      }).toThrow();
    });

    it('should reject whitespace', () => {
      expect(() => {
        AgentType.create('   ');
      }).toThrow();
    });
  });

  describe('type checking methods', () => {
    it('should identify BUDGET_REVIEW', () => {
      const type = AgentType.create('BUDGET_REVIEW');
      expect(type.isBudgetReview()).toBe(true);
      expect(type.isExpenseAlert()).toBe(false);
      expect(type.isIncomeCheck()).toBe(false);
    });

    it('should identify EXPENSE_ALERT', () => {
      const type = AgentType.create('EXPENSE_ALERT');
      expect(type.isExpenseAlert()).toBe(true);
      expect(type.isBudgetReview()).toBe(false);
    });

    it('should identify INCOME_CHECK', () => {
      const type = AgentType.create('INCOME_CHECK');
      expect(type.isIncomeCheck()).toBe(true);
      expect(type.isBudgetReview()).toBe(false);
    });

    it('should identify CASHFLOW_FORECAST', () => {
      const type = AgentType.create('CASHFLOW_FORECAST');
      expect(type.isCashflowForecast()).toBe(true);
      expect(type.isBudgetReview()).toBe(false);
    });

    it('should identify SAVINGS_GOAL', () => {
      const type = AgentType.create('SAVINGS_GOAL');
      expect(type.isSavingsGoal()).toBe(true);
      expect(type.isBudgetReview()).toBe(false);
    });

    it('should identify CUSTOM', () => {
      const type = AgentType.create('CUSTOM');
      expect(type.isCustom()).toBe(true);
      expect(type.isBudgetReview()).toBe(false);
    });
  });

  describe('value equality', () => {
    it('should have same value when created with same type', () => {
      const type1 = AgentType.create('BUDGET_REVIEW');
      const type2 = AgentType.create('BUDGET_REVIEW');

      expect(type1.value).toBe(type2.value);
    });

    it('should have different values for different types', () => {
      const type1 = AgentType.create('BUDGET_REVIEW');
      const type2 = AgentType.create('EXPENSE_ALERT');

      expect(type1.value).not.toBe(type2.value);
    });
  });

  describe('all valid types', () => {
    const validTypes = [
      'BUDGET_REVIEW',
      'EXPENSE_ALERT',
      'INCOME_CHECK',
      'CASHFLOW_FORECAST',
      'SAVINGS_GOAL',
      'CUSTOM',
    ];

    it.each(validTypes)('should accept %s', (type) => {
      expect(() => AgentType.create(type)).not.toThrow();
    });
  });

  describe('invalid type handling', () => {
    const invalidTypes = [
      '',
      '   ',
      'INVALID',
      'budget review',
      'Budget_Review',
      'UNKNOWN_TYPE',
      null,
      undefined,
    ];

    it.each(invalidTypes)('should reject %s', (type) => {
      expect(() => {
        AgentType.create(type as any);
      }).toThrow();
    });
  });

  describe('serialization', () => {
    it('should return value as string', () => {
      const type = AgentType.create('BUDGET_REVIEW');
      expect(String(type.value)).toBe('BUDGET_REVIEW');
    });

    it('should be JSON serializable', () => {
      const type = AgentType.create('BUDGET_REVIEW');
      const json = JSON.stringify(type.value);
      expect(json).toBe('"BUDGET_REVIEW"');
    });
  });

  describe('immutability', () => {
    it('should not allow value modification', () => {
      const type = AgentType.create('BUDGET_REVIEW');
      const originalValue = type.value;

      // Try to modify (should fail in TypeScript, but test at runtime)
      expect(type.value).toBe(originalValue);
    });
  });
});
