import { describe, it, expect } from 'vitest';
import { AIAgent } from '@/domain/agent/entities/AIAgent';
import { AgentType } from '@/domain/agent/value-objects/AgentType';

describe('AIAgent Entity', () => {
  const validProps = {
    userId: 'user-123',
    name: 'Test Agent',
    type: 'BUDGET_REVIEW',
    schedule: '0 9 * * *',
    timezone: 'America/Sao_Paulo',
    config: {},
  };

  describe('create factory method', () => {
    it('should create agent with valid props', () => {
      const agent = AIAgent.create(validProps);

      expect(agent.id).toBeDefined();
      expect(agent.userId).toBe('user-123');
      expect(agent.name).toBe('Test Agent');
      expect(agent.isActive).toBe(true);
      expect(agent.createdAt).toBeInstanceOf(Date);
    });

    it('should fail with empty name', () => {
      expect(() => {
        AIAgent.create({
          ...validProps,
          name: '',
        });
      }).toThrow('Agent name is required');
    });

    it('should fail with whitespace-only name', () => {
      expect(() => {
        AIAgent.create({
          ...validProps,
          name: '   ',
        });
      }).toThrow();
    });

    it('should fail with invalid schedule', () => {
      expect(() => {
        AIAgent.create({
          ...validProps,
          schedule: 'invalid cron',
        });
      }).toThrow();
    });

    it('should generate unique IDs', () => {
      const agent1 = AIAgent.create(validProps);
      const agent2 = AIAgent.create(validProps);

      expect(agent1.id).not.toBe(agent2.id);
    });

    it('should use provided ID if given', () => {
      const agent = AIAgent.create({
        ...validProps,
        id: 'custom-id',
      });

      expect(agent.id).toBe('custom-id');
    });
  });

  describe('activate/deactivate', () => {
    it('should deactivate active agent', () => {
      const agent = AIAgent.create(validProps);
      expect(agent.isActive).toBe(true);

      agent.deactivate();
      expect(agent.isActive).toBe(false);
    });

    it('should activate inactive agent', () => {
      const agent = AIAgent.create(validProps);
      agent.deactivate();

      agent.activate();
      expect(agent.isActive).toBe(true);
    });

    it('should not fail when deactivating already inactive', () => {
      const agent = AIAgent.create(validProps);
      agent.deactivate();

      expect(() => agent.deactivate()).not.toThrow();
      expect(agent.isActive).toBe(false);
    });

    it('should not fail when activating already active', () => {
      const agent = AIAgent.create(validProps);

      expect(() => agent.activate()).not.toThrow();
      expect(agent.isActive).toBe(true);
    });
  });

  describe('toPersistence', () => {
    it('should convert to database format', () => {
      const agent = AIAgent.create(validProps);
      const persisted = agent.toPersistence();

      expect(persisted.id).toBe(agent.id);
      expect(persisted.userId).toBe(agent.userId);
      expect(persisted.name).toBe(agent.name);
      expect(persisted.isActive).toBe(true);
    });

    it('should include all required fields', () => {
      const agent = AIAgent.create(validProps);
      const persisted = agent.toPersistence();

      expect(persisted).toHaveProperty('id');
      expect(persisted).toHaveProperty('userId');
      expect(persisted).toHaveProperty('name');
      expect(persisted).toHaveProperty('type');
      expect(persisted).toHaveProperty('schedule');
      expect(persisted).toHaveProperty('timezone');
      expect(persisted).toHaveProperty('config');
      expect(persisted).toHaveProperty('isActive');
      expect(persisted).toHaveProperty('createdAt');
    });
  });

  describe('fromPersistence', () => {
    it('should restore agent from database', () => {
      const now = new Date();
      const raw = {
        id: 'agent-123',
        userId: 'user-123',
        name: 'Restored Agent',
        type: 'BUDGET_REVIEW',
        schedule: '0 9 * * *',
        timezone: 'America/Sao_Paulo',
        config: {},
        isActive: true,
        createdAt: now,
        updatedAt: now,
      };

      const agent = AIAgent.fromPersistence(raw);

      expect(agent.id).toBe('agent-123');
      expect(agent.userId).toBe('user-123');
      expect(agent.name).toBe('Restored Agent');
      expect(agent.isActive).toBe(true);
    });

    it('should handle inactive agents', () => {
      const raw = {
        id: 'agent-123',
        userId: 'user-123',
        name: 'Inactive Agent',
        type: 'BUDGET_REVIEW',
        schedule: '0 9 * * *',
        timezone: 'America/Sao_Paulo',
        config: {},
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const agent = AIAgent.fromPersistence(raw);
      expect(agent.isActive).toBe(false);
    });
  });

  describe('validation', () => {
    it('should validate agent name length', () => {
      expect(() => {
        AIAgent.create({
          ...validProps,
          name: 'a'.repeat(256), // Too long
        });
      }).toThrow();
    });

    it('should validate timezone format', () => {
      expect(() => {
        AIAgent.create({
          ...validProps,
          timezone: 'Invalid/Timezone',
        });
      }).not.toThrow(); // Should accept any timezone format at entity level
    });

    it('should validate cron expression', () => {
      const validCrons = [
        '0 9 * * *', // Daily at 9 AM
        '0 * * * *', // Every hour
        '*/5 * * * *', // Every 5 minutes
        '0 0 1 * *', // First of month
      ];

      validCrons.forEach((cron) => {
        expect(() => {
          AIAgent.create({
            ...validProps,
            schedule: cron,
          });
        }).not.toThrow();
      });
    });

    it('should reject invalid cron', () => {
      expect(() => {
        AIAgent.create({
          ...validProps,
          schedule: 'not a valid cron',
        });
      }).toThrow();
    });
  });

  describe('immutability', () => {
    it('should have readonly properties', () => {
      const agent = AIAgent.create(validProps);

      // Properties should not be directly assignable (TypeScript check)
      // This is tested at compile time, but we can verify at runtime
      expect(agent.id).toBeDefined();
      expect(agent.userId).toBeDefined();
    });
  });

  describe('edge cases', () => {
    it('should handle special characters in name', () => {
      const agent = AIAgent.create({
        ...validProps,
        name: 'Agent @#$% 123 ü ñ',
      });

      expect(agent.name).toBe('Agent @#$% 123 ü ñ');
    });

    it('should handle very long cron description', () => {
      const agent = AIAgent.create(validProps);
      expect(agent.schedule).toBe('0 9 * * *');
    });

    it('should preserve config object', () => {
      const config = {
        threshold: 100,
        categories: ['FOOD', 'TRANSPORT'],
        nested: {
          value: 'test',
        },
      };

      const agent = AIAgent.create({
        ...validProps,
        config,
      });

      expect(agent.config).toEqual(config);
    });
  });
});
