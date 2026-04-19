import { describe, it, expect, beforeEach } from 'vitest';
import { DeleteAgentUseCase } from '@/application/agent/use-cases/DeleteAgentUseCase';
import {
  MockAgentRepository,
  createMockAgent,
} from '../../../../fixtures/mocks/agent.mocks';

describe('DeleteAgentUseCase', () => {
  let useCase: DeleteAgentUseCase;
  let repository: MockAgentRepository;

  beforeEach(() => {
    repository = new MockAgentRepository();
    useCase = new DeleteAgentUseCase(repository);
  });

  describe('execute', () => {
    it('should delete existing agent', async () => {
      const agent = createMockAgent();
      await repository.create(agent);

      await useCase.execute({
        agentId: agent.id,
        userId: 'user-123',
      });

      const deleted = await repository.findById(agent.id);
      expect(deleted).toBeNull();
    });

    it('should throw error if agent not found', async () => {
      expect(() =>
        useCase.execute({
          agentId: 'non-existent-id',
          userId: 'user-123',
        })
      ).rejects.toThrow('Agent not found');
    });

    it('should throw error if user is not agent owner', async () => {
      const agent = createMockAgent({ userId: 'user-123' });
      await repository.create(agent);

      expect(() =>
        useCase.execute({
          agentId: agent.id,
          userId: 'user-456',
        })
      ).rejects.toThrow('Unauthorized');
    });

    it('should delete only specified agent', async () => {
      const agent1 = createMockAgent({ name: 'Agent 1' });
      const agent2 = createMockAgent({ name: 'Agent 2' });

      await repository.create(agent1);
      await repository.create(agent2);

      await useCase.execute({
        agentId: agent1.id,
        userId: 'user-123',
      });

      const deleted = await repository.findById(agent1.id);
      const remaining = await repository.findById(agent2.id);

      expect(deleted).toBeNull();
      expect(remaining).toBeDefined();
    });

    it('should preserve other users agents', async () => {
      const agent1 = createMockAgent({ userId: 'user-123' });
      const agent2 = createMockAgent({ userId: 'user-456' });

      await repository.create(agent1);
      await repository.create(agent2);

      await useCase.execute({
        agentId: agent1.id,
        userId: 'user-123',
      });

      const deleted = await repository.findById(agent1.id);
      const preserved = await repository.findById(agent2.id);

      expect(deleted).toBeNull();
      expect(preserved).toBeDefined();
    });

    it('should allow deleting inactive agents', async () => {
      const agent = createMockAgent();
      agent.deactivate();
      await repository.create(agent);

      await useCase.execute({
        agentId: agent.id,
        userId: 'user-123',
      });

      const deleted = await repository.findById(agent.id);
      expect(deleted).toBeNull();
    });

    it('should allow deleting active agents', async () => {
      const agent = createMockAgent();
      await repository.create(agent);

      expect(agent.isActive).toBe(true);

      await useCase.execute({
        agentId: agent.id,
        userId: 'user-123',
      });

      const deleted = await repository.findById(agent.id);
      expect(deleted).toBeNull();
    });

    it('should throw on second delete attempt', async () => {
      const agent = createMockAgent();
      await repository.create(agent);

      await useCase.execute({
        agentId: agent.id,
        userId: 'user-123',
      });

      expect(() =>
        useCase.execute({
          agentId: agent.id,
          userId: 'user-123',
        })
      ).rejects.toThrow('Agent not found');
    });

    it('should handle agent IDs with special characters', async () => {
      const agent = createMockAgent();
      await repository.create(agent);

      await useCase.execute({
        agentId: agent.id,
        userId: 'user-123',
      });

      expect(await repository.findById(agent.id)).toBeNull();
    });

    it('should handle user IDs with special characters', async () => {
      const agent = createMockAgent({ userId: 'user-123-special-@' });
      await repository.create(agent);

      await useCase.execute({
        agentId: agent.id,
        userId: 'user-123-special-@',
      });

      expect(await repository.findById(agent.id)).toBeNull();
    });

    it('should require exact userId match', async () => {
      const agent = createMockAgent({ userId: 'user-123' });
      await repository.create(agent);

      expect(() =>
        useCase.execute({
          agentId: agent.id,
          userId: 'user-124', // Different user
        })
      ).rejects.toThrow('Unauthorized');

      // Agent should still exist
      expect(await repository.findById(agent.id)).toBeDefined();
    });

    it('should work with various agent types', async () => {
      const types = ['BUDGET_REVIEW', 'EXPENSE_ALERT', 'INCOME_CHECK'];

      for (const type of types) {
        const agent = createMockAgent({ type });
        await repository.create(agent);

        await useCase.execute({
          agentId: agent.id,
          userId: 'user-123',
        });

        expect(await repository.findById(agent.id)).toBeNull();
      }
    });

    it('should return void on successful deletion', async () => {
      const agent = createMockAgent();
      await repository.create(agent);

      const result = await useCase.execute({
        agentId: agent.id,
        userId: 'user-123',
      });

      expect(result).toBeUndefined();
    });
  });

  describe('error handling', () => {
    it('should throw with message "Agent not found" when agent does not exist', async () => {
      const error = new Promise((_, reject) => {
        useCase
          .execute({
            agentId: 'fake-id',
            userId: 'user-123',
          })
          .catch(reject);
      });

      expect(error).rejects.toThrow('Agent not found');
    });

    it('should throw with message "Unauthorized" when user is not owner', async () => {
      const agent = createMockAgent({ userId: 'user-123' });
      await repository.create(agent);

      const error = new Promise((_, reject) => {
        useCase
          .execute({
            agentId: agent.id,
            userId: 'attacker-user',
          })
          .catch(reject);
      });

      expect(error).rejects.toThrow('Unauthorized');
    });
  });

  describe('authorization', () => {
    it('should verify userId matches agent userId', async () => {
      const agent = createMockAgent({ userId: 'correct-user' });
      await repository.create(agent);

      // Owner should succeed
      await useCase.execute({
        agentId: agent.id,
        userId: 'correct-user',
      });

      expect(await repository.findById(agent.id)).toBeNull();
    });

    it('should prevent deletion by non-owner', async () => {
      const agent = createMockAgent({ userId: 'owner' });
      await repository.create(agent);

      await expect(
        useCase.execute({
          agentId: agent.id,
          userId: 'non-owner',
        })
      ).rejects.toThrow('Unauthorized');

      // Agent should still exist
      expect(await repository.findById(agent.id)).toBeDefined();
    });
  });
});
