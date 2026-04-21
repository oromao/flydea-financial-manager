import { describe, it, expect, beforeEach } from 'vitest';
import { ListAgentsUseCase } from '@/application/agent/use-cases/ListAgentsUseCase';
import {
  MockAgentRepository,
  createMockAgent,
} from '../../../../fixtures/mocks/agent.mocks';

describe('ListAgentsUseCase', () => {
  let useCase: ListAgentsUseCase;
  let repository: MockAgentRepository;

  beforeEach(() => {
    repository = new MockAgentRepository();
    useCase = new ListAgentsUseCase(repository);
  });

  describe('execute', () => {
    it('should return empty array for user with no agents', async () => {
      const result = await useCase.execute('user-123');
      expect(result).toEqual([]);
    });

    it('should return single agent', async () => {
      const agent = createMockAgent();
      await repository.create(agent);

      const result = await useCase.execute('user-123');

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(agent.id);
      expect(result[0].name).toBe('Test Agent');
      expect(result[0].type).toBe('BUDGET_REVIEW');
      expect(result[0].schedule).toBe('0 9 * * *');
      expect(result[0].isActive).toBe(true);
      expect(result[0].createdAt).toBeInstanceOf(Date);
    });

    it('should return multiple agents for user', async () => {
      const agent1 = createMockAgent({ name: 'Agent 1' } as any);
      const agent2 = createMockAgent({ name: 'Agent 2' } as any);
      const agent3 = createMockAgent({ name: 'Agent 3' } as any);

      await repository.create(agent1);
      await repository.create(agent2);
      await repository.create(agent3);

      const result = await useCase.execute('user-123');

      expect(result).toHaveLength(3);
      expect(result.map((a) => a.name)).toEqual(['Agent 1', 'Agent 2', 'Agent 3']);
    });

    it('should not return agents from other users', async () => {
      const agent1 = createMockAgent({ userId: 'user-123', name: 'User 123 Agent' } as any);
      const agent2 = createMockAgent({ userId: 'user-456', name: 'User 456 Agent' } as any);

      await repository.create(agent1);
      await repository.create(agent2);

      const result = await useCase.execute('user-123');

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('User 123 Agent');
    });

    it('should return correct properties for each agent', async () => {
      const agent = createMockAgent({
        userId: 'user-123',
        name: 'Test Agent',
        type: 'EXPENSE_ALERT',
        schedule: '0 18 * * *',
      } as any);
      await repository.create(agent);

      const result = await useCase.execute('user-123');

      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('name');
      expect(result[0]).toHaveProperty('type');
      expect(result[0]).toHaveProperty('schedule');
      expect(result[0]).toHaveProperty('isActive');
      expect(result[0]).toHaveProperty('createdAt');
    });

    it('should include inactive agents', async () => {
      const agent1 = createMockAgent({ name: 'Active Agent' } as any);
      const agent2 = createMockAgent({ name: 'Inactive Agent' } as any);
      agent2.deactivate();

      await repository.create(agent1);
      await repository.create(agent2);

      const result = await useCase.execute('user-123');

      expect(result).toHaveLength(2);
      expect(result.find((a) => a.name === 'Active Agent')?.isActive).toBe(true);
      expect(result.find((a) => a.name === 'Inactive Agent')?.isActive).toBe(false);
    });

    it('should handle user ID with special characters', async () => {
      const agent = createMockAgent({ userId: 'user-123-special-@' } as any);
      await repository.create(agent);

      const result = await useCase.execute('user-123-special-@');

      expect(result).toHaveLength(1);
    });

    it('should handle non-existent user ID gracefully', async () => {
      const result = await useCase.execute('non-existent-user');
      expect(result).toEqual([]);
    });
  });
});
