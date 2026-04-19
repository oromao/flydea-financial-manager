import { AIAgent } from '@/domain/agent/entities/AIAgent';
import { AgentType } from '@/domain/agent/value-objects/AgentType';
import { AgentExecution } from '@/domain/agent/entities/AgentExecution';
import { IAgentRepository } from '@/domain/agent/repositories/IAgentRepository';
import { IAgentExecutionRepository } from '@/domain/agent/repositories/IAgentExecutionRepository';
import { vi } from 'vitest';

export interface CreateAgentInput {
  userId?: string;
  name?: string;
  description?: string;
  type?: string;
  schedule?: string;
  timezone?: string;
  config?: Record<string, unknown>;
}

export const mockAgentData: CreateAgentInput = {
  userId: 'user-123',
  name: 'Test Agent',
  type: 'BUDGET_REVIEW',
  schedule: '0 9 * * *',
  timezone: 'America/Sao_Paulo',
  config: {},
};

export function createMockAgent(overrides: CreateAgentInput = {}): AIAgent {
  const data = { ...mockAgentData, ...overrides };
  const type = AgentType.create(data.type || 'BUDGET_REVIEW');

  return AIAgent.create(
    `agent-${Math.random().toString(36).substr(2, 9)}`,
    data.userId || 'user-123',
    data.name || 'Test Agent',
    data.description || null,
    type,
    data.schedule || '0 9 * * *',
    true,
    data.timezone || 'America/Sao_Paulo',
    data.config || {}
  );
}

export function createMockExecution(
  agentId: string = 'agent-123',
  overrides: Partial<AgentExecution> = {}
): AgentExecution {
  const execution = AgentExecution.create(
    `execution-${Math.random().toString(36).substr(2, 9)}`,
    agentId,
    new Date()
  );
  return { ...execution, ...overrides };
}

export function createMockFinancialData(): Record<string, unknown> {
  return {
    totalIncome: 5000,
    totalExpenses: 3000,
    balance: 2000,
    budgets: [
      { category: 'Food', limit: 500, spent: 450 },
      { category: 'Transport', limit: 300, spent: 280 },
    ],
    transactions: [
      { date: '2024-01-15', amount: 100, category: 'Food', type: 'expense' },
      { date: '2024-01-16', amount: 2000, category: 'Salary', type: 'income' },
    ],
  };
}

export class MockAgentRepository implements IAgentRepository {
  private agents: Map<string, AIAgent> = new Map();

  async create(agent: AIAgent): Promise<AIAgent> {
    this.agents.set(agent.id, agent);
    return agent;
  }

  async findById(id: string): Promise<AIAgent | null> {
    return this.agents.get(id) || null;
  }

  async findByUserId(userId: string): Promise<AIAgent[]> {
    return Array.from(this.agents.values()).filter((a) => a.userId === userId);
  }

  async update(agent: AIAgent): Promise<AIAgent> {
    this.agents.set(agent.id, agent);
    return agent;
  }

  async delete(id: string): Promise<void> {
    this.agents.delete(id);
  }

  async findActiveByUserId(userId: string): Promise<AIAgent[]> {
    return Array.from(this.agents.values()).filter(
      (a) => a.userId === userId && a.isActive
    );
  }
}

export class MockAgentExecutionRepository implements IAgentExecutionRepository {
  private executions: Map<string, AgentExecution> = new Map();

  async create(execution: AgentExecution): Promise<AgentExecution> {
    this.executions.set(execution.id, execution);
    return execution;
  }

  async findById(id: string): Promise<AgentExecution | null> {
    return this.executions.get(id) || null;
  }

  async findByAgentId(agentId: string, limit?: number): Promise<AgentExecution[]> {
    let results = Array.from(this.executions.values()).filter(
      (e) => e.agentId === agentId
    );
    if (limit) {
      results = results.slice(0, limit);
    }
    return results;
  }

  async findPending(): Promise<AgentExecution[]> {
    return Array.from(this.executions.values()).filter(
      (e) => e.status === 'RUNNING' || e.status === 'PENDING'
    );
  }

  async update(execution: AgentExecution): Promise<AgentExecution> {
    this.executions.set(execution.id, execution);
    return execution;
  }
}

export const MockEmailService = {
  sendAgentNotification: vi.fn().mockResolvedValue(true),
  sendAlert: vi.fn().mockResolvedValue(true),
};
