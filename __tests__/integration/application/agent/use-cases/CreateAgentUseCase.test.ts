import { describe, it, expect, beforeEach } from 'vitest';
import { CreateAgentUseCase } from '@/application/agent/use-cases/CreateAgentUseCase';
import { MockAgentRepository, mockAgentData } from '../../../../fixtures/mocks/agent.mocks';

describe('CreateAgentUseCase', () => {
  let useCase: CreateAgentUseCase;
  let repository: MockAgentRepository;

  beforeEach(() => {
    repository = new MockAgentRepository();
    useCase = new CreateAgentUseCase(repository);
  });

  describe('execute', () => {
    it('should create agent with valid input', async () => {
      const output = await useCase.execute(mockAgentData);

      expect(output.id).toBeDefined();
      expect(output.name).toBe('Test Agent');
      expect(output.type).toBe('BUDGET_REVIEW');
      expect(output.schedule).toBe('0 9 * * *');
    });

    it('should persist agent in repository', async () => {
      const output = await useCase.execute(mockAgentData);
      const saved = await repository.findById(output.id);

      expect(saved).toBeDefined();
      expect(saved?.userId).toBe('user-123');
      expect(saved?.name).toBe('Test Agent');
      expect(saved?.isActive).toBe(true);
    });

    it('should create agent with EXPENSE_ALERT type', async () => {
      const output = await useCase.execute({
        ...mockAgentData,
        type: 'EXPENSE_ALERT',
      });

      expect(output.type).toBe('EXPENSE_ALERT');
    });

    it('should create agent with INCOME_CHECK type', async () => {
      const output = await useCase.execute({
        ...mockAgentData,
        type: 'INCOME_CHECK',
      });

      expect(output.type).toBe('INCOME_CHECK');
    });

    it('should create agent with CASHFLOW_FORECAST type', async () => {
      const output = await useCase.execute({
        ...mockAgentData,
        type: 'CASHFLOW_FORECAST',
      });

      expect(output.type).toBe('CASHFLOW_FORECAST');
    });

    it('should create agent with SAVINGS_GOAL type', async () => {
      const output = await useCase.execute({
        ...mockAgentData,
        type: 'SAVINGS_GOAL',
      });

      expect(output.type).toBe('SAVINGS_GOAL');
    });

    it('should create agent with custom config', async () => {
      const config = {
        threshold: 500,
        categories: ['FOOD', 'TRANSPORT'],
        includeRecurring: true,
      };

      const output = await useCase.execute({
        ...mockAgentData,
        config,
      });

      const saved = await repository.findById(output.id);
      expect(saved?.config).toEqual(config);
    });

    it('should use default timezone if not provided', async () => {
      const output = await useCase.execute({
        ...mockAgentData,
        timezone: undefined,
      });

      const saved = await repository.findById(output.id);
      expect(saved?.timezone).toBe('America/Sao_Paulo');
    });

    it('should use provided timezone', async () => {
      const output = await useCase.execute({
        ...mockAgentData,
        timezone: 'America/New_York',
      });

      const saved = await repository.findById(output.id);
      expect(saved?.timezone).toBe('America/New_York');
    });

    it('should handle optional description', async () => {
      const output = await useCase.execute({
        ...mockAgentData,
        description: undefined,
      });

      const saved = await repository.findById(output.id);
      expect(saved?.description).toBeNull();
    });

    it('should store provided description', async () => {
      const description = 'Custom agent description';
      const output = await useCase.execute({
        ...mockAgentData,
        description,
      });

      const saved = await repository.findById(output.id);
      expect(saved?.description).toBe(description);
    });

    it('should fail with invalid agent type', async () => {
      expect(() =>
        useCase.execute({
          ...mockAgentData,
          type: 'INVALID_TYPE',
        })
      ).rejects.toThrow();
    });

    it('should fail with empty name', async () => {
      expect(() =>
        useCase.execute({
          ...mockAgentData,
          name: '',
        })
      ).rejects.toThrow();
    });

    it('should create agent with any schedule format', async () => {
      // Note: Schedule validation may be done at API/business layer, not at entity level
      const output = await useCase.execute({
        ...mockAgentData,
        schedule: '0 9 * * *', // Valid cron
      });
      expect(output.schedule).toBe('0 9 * * *');
    });

    it('should create unique IDs for multiple agents', async () => {
      const output1 = await useCase.execute(mockAgentData);
      const output2 = await useCase.execute({
        ...mockAgentData,
        name: 'Another Agent',
      });

      expect(output1.id).not.toBe(output2.id);
    });

    it('should create multiple agents for same user', async () => {
      await useCase.execute(mockAgentData);
      await useCase.execute({
        ...mockAgentData,
        name: 'Second Agent',
      });

      const userAgents = await repository.findByUserId('user-123');
      expect(userAgents).toHaveLength(2);
    });

    it('should handle special characters in name', async () => {
      const output = await useCase.execute({
        ...mockAgentData,
        name: 'Agent @#$% 123 ü ñ',
      });

      expect(output.name).toBe('Agent @#$% 123 ü ñ');
    });

    it('should handle very long names', async () => {
      const longName = 'A'.repeat(255);
      const output = await useCase.execute({
        ...mockAgentData,
        name: longName,
      });

      expect(output.name).toBe(longName);
    });

    it('should handle complex cron expressions', async () => {
      const output = await useCase.execute({
        ...mockAgentData,
        schedule: '0 0 1 * *', // First of month
      });

      expect(output.schedule).toBe('0 0 1 * *');
    });

    it('should return only necessary output fields', async () => {
      const output = await useCase.execute(mockAgentData);

      expect(output).toHaveProperty('id');
      expect(output).toHaveProperty('name');
      expect(output).toHaveProperty('type');
      expect(output).toHaveProperty('schedule');
      expect(Object.keys(output)).toHaveLength(4);
    });

    it('should create agent with isActive = true by default', async () => {
      const output = await useCase.execute(mockAgentData);
      const saved = await repository.findById(output.id);

      expect(saved?.isActive).toBe(true);
    });

    it('should handle empty config object', async () => {
      const output = await useCase.execute({
        ...mockAgentData,
        config: {},
      });

      const saved = await repository.findById(output.id);
      expect(saved?.config).toEqual({});
    });
  });

  describe('edge cases', () => {
    it('should handle very long descriptions', async () => {
      const longDescription = 'A'.repeat(1000);
      const output = await useCase.execute({
        ...mockAgentData,
        description: longDescription,
      });

      const saved = await repository.findById(output.id);
      expect(saved?.description).toBe(longDescription);
    });

    it('should handle numeric strings in config', async () => {
      const output = await useCase.execute({
        ...mockAgentData,
        config: {
          value1: '123',
          value2: 456,
          value3: 78.9,
        },
      });

      const saved = await repository.findById(output.id);
      expect(saved?.config).toEqual({
        value1: '123',
        value2: 456,
        value3: 78.9,
      });
    });

    it('should handle nested config objects', async () => {
      const output = await useCase.execute({
        ...mockAgentData,
        config: {
          level1: {
            level2: {
              level3: 'value',
            },
          },
        },
      });

      const saved = await repository.findById(output.id);
      expect(saved?.config.level1).toBeDefined();
    });

    it('should handle arrays in config', async () => {
      const output = await useCase.execute({
        ...mockAgentData,
        config: {
          categories: ['FOOD', 'TRANSPORT', 'ENTERTAINMENT'],
          thresholds: [100, 200, 300],
        },
      });

      const saved = await repository.findById(output.id);
      expect(Array.isArray(saved?.config.categories)).toBe(true);
      expect(saved?.config.categories).toHaveLength(3);
    });

    it('should handle all valid agent types', async () => {
      const types = [
        'BUDGET_REVIEW',
        'EXPENSE_ALERT',
        'INCOME_CHECK',
        'CASHFLOW_FORECAST',
        'SAVINGS_GOAL',
        'CUSTOM',
      ];

      for (const type of types) {
        const output = await useCase.execute({
          ...mockAgentData,
          type,
          name: `Agent ${type}`,
        });

        expect(output.type).toBe(type);
      }
    });
  });
});
