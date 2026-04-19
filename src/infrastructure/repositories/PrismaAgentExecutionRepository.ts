import { prisma } from "@/lib/prisma";
import { AgentExecution, ExecutionStatus } from "@/domain/agent/entities/AgentExecution";
import { IAgentExecutionRepository } from "@/domain/agent/repositories/IAgentExecutionRepository";

export class PrismaAgentExecutionRepository implements IAgentExecutionRepository {
  async create(execution: AgentExecution): Promise<AgentExecution> {
    const created = await prisma.agentExecution.create({
      data: {
        id: execution.id,
        agentId: execution.agentId,
        status: execution.status,
        output: execution.output || undefined,
        actionResults: execution.actionResults || undefined,
        error: execution.error || undefined,
        scheduledAt: execution.scheduledAt,
        startedAt: execution.startedAt,
        completedAt: execution.completedAt,
      },
    });

    return this.toDomain(created);
  }

  async findById(id: string): Promise<AgentExecution | null> {
    const execution = await prisma.agentExecution.findUnique({
      where: { id },
    });

    return execution ? this.toDomain(execution) : null;
  }

  async findByAgentId(agentId: string, limit = 10): Promise<AgentExecution[]> {
    const executions = await prisma.agentExecution.findMany({
      where: { agentId },
      orderBy: { scheduledAt: "desc" },
      take: limit,
    });

    return executions.map((e) => this.toDomain(e));
  }

  async findPending(): Promise<AgentExecution[]> {
    const executions = await prisma.agentExecution.findMany({
      where: { status: ExecutionStatus.PENDING },
      orderBy: { scheduledAt: "asc" },
    });

    return executions.map((e) => this.toDomain(e));
  }

  async update(execution: AgentExecution): Promise<AgentExecution> {
    const updated = await prisma.agentExecution.update({
      where: { id: execution.id },
      data: {
        status: execution.status,
        output: execution.output || undefined,
        actionResults: execution.actionResults || undefined,
        error: execution.error || undefined,
        startedAt: execution.startedAt,
        completedAt: execution.completedAt,
      },
    });

    return this.toDomain(updated);
  }

  private toDomain(raw: any): AgentExecution {
    return new AgentExecution(
      raw.id,
      raw.agentId,
      raw.status as ExecutionStatus,
      raw.output,
      raw.actionResults,
      raw.error,
      raw.scheduledAt,
      raw.startedAt,
      raw.completedAt,
      raw.createdAt
    );
  }
}
