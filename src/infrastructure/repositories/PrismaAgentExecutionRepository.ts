import { prisma } from "@/lib/prisma";
import { AgentExecution, ExecutionStatus } from "@/domain/agent/entities/AgentExecution";
import { IAgentExecutionRepository } from "@/domain/agent/repositories/IAgentExecutionRepository";
import type { Prisma } from "@prisma/client";

export class PrismaAgentExecutionRepository implements IAgentExecutionRepository {
  async create(execution: AgentExecution): Promise<AgentExecution> {
    const created = await prisma.agentExecution.create({
      data: {
        id: execution.id,
        agentId: execution.agentId,
        status: execution.status,
        output: execution.output ? (execution.output as Prisma.InputJsonValue) : undefined,
        actionResults: execution.actionResults ? (execution.actionResults as Prisma.InputJsonValue) : undefined,
        error: execution.error || null,
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
        output: execution.output ? (execution.output as Prisma.InputJsonValue) : undefined,
        actionResults: execution.actionResults ? (execution.actionResults as Prisma.InputJsonValue) : undefined,
        error: execution.error || null,
        startedAt: execution.startedAt,
        completedAt: execution.completedAt,
      },
    });

    return this.toDomain(updated);
  }

  private toDomain(raw: Prisma.AgentExecutionGetPayload<{}>): AgentExecution {
    return new AgentExecution(
      raw.id,
      raw.agentId,
      raw.status as ExecutionStatus,
      raw.output as Record<string, unknown> | null,
      raw.actionResults as Record<string, unknown> | null,
      raw.error as string | null,
      raw.scheduledAt,
      raw.startedAt,
      raw.completedAt,
      raw.createdAt
    );
  }
}
