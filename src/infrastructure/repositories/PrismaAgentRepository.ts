import { prisma } from "@/lib/prisma";
import { AIAgent } from "@/domain/agent/entities/AIAgent";
import { IAgentRepository } from "@/domain/agent/repositories/IAgentRepository";
import { AgentType } from "@/domain/agent/value-objects/AgentType";
import { AgentAction, ActionType } from "@/domain/agent/entities/AgentAction";
import type { Prisma } from "@prisma/client";

export class PrismaAgentRepository implements IAgentRepository {
  async create(agent: AIAgent): Promise<AIAgent> {
    const created = await prisma.aIAgent.create({
      data: {
        id: agent.id,
        userId: agent.userId,
        name: agent.name,
        description: agent.description,
        type: agent.type.toString(),
        schedule: agent.schedule,
        isActive: agent.isActive,
        timezone: agent.timezone,
        config: agent.config as Prisma.InputJsonValue,
        actions: {
          createMany: {
            data: agent.actions.map((action) => ({
              id: action.id,
              type: action.type,
              recipient: action.recipient,
              template: action.template,
              order: action.order,
            })),
          },
        },
      },
      include: { actions: true },
    });

    return this.toDomain(created);
  }

  async findById(id: string): Promise<AIAgent | null> {
    const agent = await prisma.aIAgent.findUnique({
      where: { id },
      include: { actions: true },
    });

    return agent ? this.toDomain(agent) : null;
  }

  async findByUserId(userId: string): Promise<AIAgent[]> {
    const agents = await prisma.aIAgent.findMany({
      where: { userId },
      include: { actions: true },
      orderBy: { createdAt: "desc" },
    });

    return agents.map((agent) => this.toDomain(agent));
  }

  async findActiveByUserId(userId: string): Promise<AIAgent[]> {
    const agents = await prisma.aIAgent.findMany({
      where: { userId, isActive: true },
      include: { actions: true },
    });

    return agents.map((agent) => this.toDomain(agent));
  }

  async update(agent: AIAgent): Promise<AIAgent> {
    const updated = await prisma.aIAgent.update({
      where: { id: agent.id },
      data: {
        name: agent.name,
        description: agent.description,
        schedule: agent.schedule,
        isActive: agent.isActive,
        timezone: agent.timezone,
        config: agent.config as Prisma.InputJsonValue,
        updatedAt: new Date(),
      },
      include: { actions: true },
    });

    return this.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await prisma.aIAgent.delete({ where: { id } });
  }

  private toDomain(raw: any): AIAgent {
    const actions = (raw.actions || []).map(
      (action: any) =>
        new AgentAction(
          action.id,
          action.agentId,
          action.type as ActionType,
          action.recipient,
          action.template,
          action.order,
          action.createdAt
        )
    );

    return AIAgent.restore(
      raw.id,
      raw.userId,
      raw.name,
      raw.description,
      AgentType.create(raw.type),
      raw.schedule,
      raw.isActive,
      raw.timezone,
      raw.config as Record<string, unknown>,
      actions,
      raw.createdAt,
      raw.updatedAt
    );
  }
}
