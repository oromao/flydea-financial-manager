import { vi } from 'vitest';
import { AIAgent } from '@/domain/agent/entities/AIAgent';
import { AgentType } from '@/domain/agent/value-objects/AgentType';
import { AgentExecution } from '@/domain/agent/entities/AgentExecution';
import { IAgentRepository } from '@/domain/agent/repositories/IAgentRepository';
import { IAgentExecutionRepository } from '@/domain/agent/repositories/IAgentExecutionRepository';

/**
 * Mock Agent Data
 */
export const mockAgentData = {
  userId: 'user-123',
  name: 'Test Agent',
  description: 'Test agent for testing',
  type: 'BUDGET_REVIEW',
  schedule: '0 9 * * *',
  timezone: 'America/Sao_Paulo',
  config: { threshold: 100 },
};

/**
 * Create Mock AIAgent Entity
 */
export function createMockAgent(overrides?: Partial<typeof mockAgentData>) {
  const data = { ...mockAgentData, ...overrides };
  return AIAgent.create(
    'agent-123',
    data.userId,
    data.name,
    data.description || null,
    AgentType.create(data.type),
    data.schedule,
    true,
    data.timezone,
    data.config
  );
}

/**
 * Create Mock Agent Execution
 */
export function createMockExecution(agentId: string = 'agent-123') {
  return AgentExecution.create('exec-123', agentId, new Date());
}

/**
 * Mock Agent Repository
 */
export class MockAgentRepository implements IAgentRepository {
  private agents: Map<string, AIAgent> = new Map();

  async create(agent: AIAgent): Promise<AIAgent> {
    this.agents.set(agent.id, agent);
    return agent;
  }

  async update(agent: AIAgent): Promise<AIAgent> {
    this.agents.set(agent.id, agent);
    return agent;
  }

  async findById(id: string): Promise<AIAgent | null> {
    return this.agents.get(id) || null;
  }

  async findByUserId(userId: string): Promise<AIAgent[]> {
    return Array.from(this.agents.values()).filter((a) => a.userId === userId);
  }

  async delete(id: string): Promise<void> {
    this.agents.delete(id);
  }

  async findActive(): Promise<AIAgent[]> {
    return Array.from(this.agents.values()).filter((a) => a.isActive);
  }

  async findByUserIdAndActive(userId: string): Promise<AIAgent[]> {
    return Array.from(this.agents.values()).filter(
      (a) => a.userId === userId && a.isActive
    );
  }

  // Helper for testing
  clear() {
    this.agents.clear();
  }

  getAll() {
    return Array.from(this.agents.values());
  }
}

/**
 * Mock Agent Execution Repository
 */
export class MockAgentExecutionRepository implements IAgentExecutionRepository {
  private executions: Map<string, AgentExecution> = new Map();

  async create(execution: AgentExecution): Promise<AgentExecution> {
    this.executions.set(execution.id, execution);
    return execution;
  }

  async update(execution: AgentExecution): Promise<AgentExecution> {
    this.executions.set(execution.id, execution);
    return execution;
  }

  async findById(id: string): Promise<AgentExecution | null> {
    return this.executions.get(id) || null;
  }

  async findByAgentId(agentId: string): Promise<AgentExecution[]> {
    return Array.from(this.executions.values()).filter(
      (e) => e.agentId === agentId
    );
  }

  async findRecent(agentId: string, limit: number): Promise<AgentExecution[]> {
    return Array.from(this.executions.values())
      .filter((e) => e.agentId === agentId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  // Helper for testing
  clear() {
    this.executions.clear();
  }

  getAll() {
    return Array.from(this.executions.values());
  }
}

/**
 * Mock EmailService
 */
export class MockEmailService {
  sendAgentNotification = vi.fn().mockResolvedValue(true);
  sendNotification = vi.fn().mockResolvedValue(true);
}

/**
 * Mock RAG Query Engine
 */
export const mockRagQueryEngine = {
  processQuery: vi.fn().mockReturnValue({
    relevantMetrics: {
      totalExpenses: 1000,
      budgetStatus: 'OK',
      anomalies: [],
    },
    confidence: 0.95,
  }),
};

/**
 * Mock Financial Data
 */
export function createMockFinancialData() {
  return {
    userId: 'user-123',
    totalIncome: 5000,
    totalExpenses: 1500,
    accountBalance: 3500,
    budgets: [
      { category: 'Food', limit: 300, spent: 250 },
      { category: 'Transport', limit: 200, spent: 180 },
    ],
    recentTransactions: [
      {
        id: 'trans-1',
        amount: 50,
        category: 'Food',
        date: new Date(),
      },
    ],
  };
}
