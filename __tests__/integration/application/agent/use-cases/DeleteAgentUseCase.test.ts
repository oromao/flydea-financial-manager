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
      await expect(
        useCase.execute({
          agentId: 'non-existent-id',
          userId: 'user-123',
        })
      ).rejects.toThrow('Agent not found');
    });

    it('should throw error if user is not agent owner', async () => {
      const agent = createMockAgent({ userId: 'user-123' } as any);
      await repository.create(agent);

      await expect(
        useCase.execute({
          agentId: agent.id,
          userId: 'user-456',
        })
      ).rejects.toThrow('Unauthorized');
    });

    it('should delete only specified agent', async () => {
      const agent1 = createMockAgent({ name: 'Agent 1' } as any);
      const agent2 = createMockAgent({ name: 'Agent 2' } as any);

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
      const agent1 = createMockAgent({ userId: 'user-123' } as any);
      const agent2 = createMockAgent({ userId: 'user-456' } as any);

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

      await expect(
        useCase.execute({
          agentId: agent.id,
          userId: 'user-123',
        })
      ).rejects.toThrow('Agent not found');
    });

    it('should handle user IDs with special characters', async () => {
      const agent = createMockAgent({ userId: 'user-123-special-@' } as any);
      await repository.create(agent);

      await useCase.execute({
        agentId: agent.id,
        userId: 'user-123-special-@',
      });

      expect(await repository.findById(agent.id)).toBeNull();
    });

    it('should require exact userId match', async () => {
      const agent = createMockAgent({ userId: 'user-123' } as any);
      await repository.create(agent);

      await expect(
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
        const agent = createMockAgent({ type } as any);
        await repository.create(agent);

        await useCase.execute({
          agentId: agent.id,
          userId: 'user-123',
        });

        expect(await repository.findById(agent.id)).toBeNull();
      }
    });
  });

  describe('error handling', () => {
    it('should throw with message "Agent not found" when agent does not exist', async () => {
      await expect(
        useCase.execute({
          agentId: 'fake-id',
          userId: 'user-123',
        })
      ).rejects.toThrow('Agent not found');
    });

    it('should throw with message "Unauthorized" when user is not owner', async () => {
      const agent = createMockAgent({ userId: 'user-123' } as any);
      await repository.create(agent);

      await expect(
        useCase.execute({
          agentId: agent.id,
          userId: 'attacker-user',
        })
      ).rejects.toThrow('Unauthorized');
    });
  });
});
