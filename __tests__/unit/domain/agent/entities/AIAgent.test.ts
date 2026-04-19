import { describe, it, expect } from 'vitest';
import { AIAgent } from '@/domain/agent/entities/AIAgent';
import { AgentType } from '@/domain/agent/value-objects/AgentType';
import { AgentAction, ActionType } from '@/domain/agent/entities/AgentAction';

describe('AIAgent Entity', () => {
  const createValidAgent = () =>
    AIAgent.create(
      'agent-123',
      'user-456',
      'Test Agent',
      'A test agent',
      AgentType.create('BUDGET_REVIEW'),
      '0 9 * * *',
      true,
      'America/Sao_Paulo',
      { threshold: 100 }
    );

  it('should create agent with all properties', () => {
    const agent = createValidAgent();

    expect(agent.id).toBe('agent-123');
    expect(agent.userId).toBe('user-456');
    expect(agent.name).toBe('Test Agent');
    expect(agent.description).toBe('A test agent');
    expect(agent.type.isBudgetReview()).toBe(true);
    expect(agent.schedule).toBe('0 9 * * *');
    expect(agent.isActive).toBe(true);
    expect(agent.timezone).toBe('America/Sao_Paulo');
    expect(agent.config).toEqual({ threshold: 100 });
    expect(agent.createdAt).toBeInstanceOf(Date);
    expect(agent.updatedAt).toBeInstanceOf(Date);
  });

  it('should fail with empty name', () => {
    expect(() =>
      AIAgent.create(
        'agent-123',
        'user-456',
        '',
        'A test agent',
        AgentType.create('BUDGET_REVIEW'),
        '0 9 * * *',
        true,
        'America/Sao_Paulo',
        { threshold: 100 }
      )
    ).toThrow('Agent name cannot be empty');
  });

  it('should fail with whitespace-only name', () => {
    expect(() =>
      AIAgent.create(
        'agent-123',
        'user-456',
        '   ',
        'A test agent',
        AgentType.create('BUDGET_REVIEW'),
        '0 9 * * *',
        true,
        'America/Sao_Paulo',
        { threshold: 100 }
      )
    ).toThrow('Agent name cannot be empty');
  });

  it('should fail with empty schedule', () => {
    expect(() =>
      AIAgent.create(
        'agent-123',
        'user-456',
        'Test Agent',
        'A test agent',
        AgentType.create('BUDGET_REVIEW'),
        '',
        true,
        'America/Sao_Paulo',
        { threshold: 100 }
      )
    ).toThrow('Agent schedule cannot be empty');
  });

  it('should create with default empty actions', () => {
    const agent = createValidAgent();
    expect(agent.actions).toEqual([]);
  });

  it('should create with provided actions', () => {
    const action = new AgentAction(
      'action-123',
      'agent-123',
      ActionType.EMAIL,
      'test@example.com',
      'template',
      1,
      new Date()
    );

    const agent = AIAgent.create(
      'agent-123',
      'user-456',
      'Test Agent',
      'A test agent',
      AgentType.create('BUDGET_REVIEW'),
      '0 9 * * *',
      true,
      'America/Sao_Paulo',
      { threshold: 100 },
      [action]
    );

    expect(agent.actions).toHaveLength(1);
    expect(agent.actions[0]).toBe(action);
  });

  describe('activate/deactivate', () => {
    it('should deactivate active agent', () => {
      const agent = createValidAgent();
      expect(agent.isActive).toBe(true);

      agent.deactivate();
      expect(agent.isActive).toBe(false);
    });

    it('should activate inactive agent', () => {
      const agent = AIAgent.create(
        'agent-123',
        'user-456',
        'Test Agent',
        'A test agent',
        AgentType.create('BUDGET_REVIEW'),
        '0 9 * * *',
        false,
        'America/Sao_Paulo',
        { threshold: 100 }
      );
      expect(agent.isActive).toBe(false);

      agent.activate();
      expect(agent.isActive).toBe(true);
    });

    it('should not fail when deactivating already inactive', () => {
      const agent = AIAgent.create(
        'agent-123',
        'user-456',
        'Test Agent',
        'A test agent',
        AgentType.create('BUDGET_REVIEW'),
        '0 9 * * *',
        false,
        'America/Sao_Paulo',
        { threshold: 100 }
      );

      expect(() => agent.deactivate()).not.toThrow();
      expect(agent.isActive).toBe(false);
    });

    it('should not fail when activating already active', () => {
      const agent = createValidAgent();

      expect(() => agent.activate()).not.toThrow();
      expect(agent.isActive).toBe(true);
    });
  });

  describe('restore factory method', () => {
    it('should restore agent from database with all properties', () => {
      const now = new Date();
      const createdAt = new Date(now.getTime() - 10000);

      const agent = AIAgent.restore(
        'agent-123',
        'user-456',
        'Restored Agent',
        'A restored agent',
        AgentType.create('EXPENSE_ALERT'),
        '0 10 * * *',
        false,
        'America/New_York',
        { alert_threshold: 50 },
        [],
        createdAt,
        now
      );

      expect(agent.id).toBe('agent-123');
      expect(agent.userId).toBe('user-456');
      expect(agent.name).toBe('Restored Agent');
      expect(agent.description).toBe('A restored agent');
      expect(agent.type.isExpenseAlert()).toBe(true);
      expect(agent.isActive).toBe(false);
      expect(agent.createdAt).toBe(createdAt);
      expect(agent.updatedAt).toBe(now);
    });
  });

  describe('updateConfig', () => {
    it('should update config and updatedAt', () => {
      const agent = createValidAgent();
      const originalUpdatedAt = agent.updatedAt;

      const newConfig = { threshold: 200, enabled: true };
      agent.updateConfig(newConfig);

      expect(agent.config).toEqual(newConfig);
      expect(agent.updatedAt.getTime()).toBeGreaterThanOrEqual(
        originalUpdatedAt.getTime()
      );
    });
  });

  describe('action management', () => {
    it('should add action to agent', () => {
      const agent = createValidAgent();
      const action = new AgentAction(
        'action-123',
        'agent-123',
        ActionType.SMS,
        '555-1234',
        'template',
        1,
        new Date()
      );

      agent.addAction(action);
      expect(agent.actions).toHaveLength(1);
      expect(agent.actions[0]).toBe(action);
    });

    it('should remove action by id', () => {
      const agent = createValidAgent();
      const action1 = new AgentAction(
        'action-1',
        'agent-123',
        ActionType.EMAIL,
        'test@example.com',
        'template',
        1,
        new Date()
      );
      const action2 = new AgentAction(
        'action-2',
        'agent-123',
        ActionType.SMS,
        '555-1234',
        'template',
        2,
        new Date()
      );

      agent.addAction(action1);
      agent.addAction(action2);
      expect(agent.actions).toHaveLength(2);

      agent.removeAction('action-1');
      expect(agent.actions).toHaveLength(1);
      expect(agent.actions[0]).toBe(action2);
    });

    it('should not fail when removing non-existent action', () => {
      const agent = createValidAgent();
      expect(() => agent.removeAction('non-existent')).not.toThrow();
      expect(agent.actions).toHaveLength(0);
    });
  });

  describe('different agent types', () => {
    it('should work with INCOME_CHECK type', () => {
      const agent = AIAgent.create(
        'agent-123',
        'user-456',
        'Income Checker',
        null,
        AgentType.create('INCOME_CHECK'),
        '0 12 * * *',
        true,
        'America/Sao_Paulo',
        {}
      );

      expect(agent.type.isIncomeCheck()).toBe(true);
    });

    it('should work with CASHFLOW_FORECAST type', () => {
      const agent = AIAgent.create(
        'agent-123',
        'user-456',
        'Cashflow Forecaster',
        null,
        AgentType.create('CASHFLOW_FORECAST'),
        '0 6 * * MON',
        true,
        'America/Sao_Paulo',
        {}
      );

      expect(agent.type.isCashflowForecast()).toBe(true);
    });

    it('should work with SAVINGS_GOAL type', () => {
      const agent = AIAgent.create(
        'agent-123',
        'user-456',
        'Savings Goal Monitor',
        null,
        AgentType.create('SAVINGS_GOAL'),
        '0 0 1 * *',
        true,
        'America/Sao_Paulo',
        {}
      );

      expect(agent.type.isSavingsGoal()).toBe(true);
    });

    it('should work with CUSTOM type', () => {
      const agent = AIAgent.create(
        'agent-123',
        'user-456',
        'Custom Agent',
        null,
        AgentType.create('CUSTOM'),
        '*/30 * * * *',
        true,
        'America/Sao_Paulo',
        { customLogic: 'test' }
      );

      expect(agent.type.equals(AgentType.create('CUSTOM'))).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle null description', () => {
      const agent = AIAgent.create(
        'agent-123',
        'user-456',
        'Agent Without Description',
        null,
        AgentType.create('BUDGET_REVIEW'),
        '0 9 * * *',
        true,
        'America/Sao_Paulo',
        {}
      );

      expect(agent.description).toBeNull();
    });

    it('should handle special characters in name', () => {
      const agent = AIAgent.create(
        'agent-123',
        'user-456',
        'Agent @#$% 123 ü ñ',
        'Description with émojis 🎯',
        AgentType.create('BUDGET_REVIEW'),
        '0 9 * * *',
        true,
        'America/Sao_Paulo',
        {}
      );

      expect(agent.name).toBe('Agent @#$% 123 ü ñ');
      expect(agent.description).toBe('Description with émojis 🎯');
    });

    it('should preserve complex config object', () => {
      const config = {
        threshold: 100,
        categories: ['FOOD', 'TRANSPORT'],
        nested: {
          level2: {
            value: 'test',
          },
        },
      };

      const agent = AIAgent.create(
        'agent-123',
        'user-456',
        'Test Agent',
        'A test agent',
        AgentType.create('BUDGET_REVIEW'),
        '0 9 * * *',
        true,
        'America/Sao_Paulo',
        config
      );

      expect(agent.config).toEqual(config);
    });
  });
});
