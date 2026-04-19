import { randomUUID } from "crypto";
import { AIAgent } from "@/domain/agent/entities/AIAgent";
import { AgentType } from "@/domain/agent/value-objects/AgentType";
import { IAgentRepository } from "@/domain/agent/repositories/IAgentRepository";

export interface CreateAgentInput {
  userId: string;
  name: string;
  description?: string;
  type: string;
  schedule: string;
  timezone?: string;
  config: Record<string, unknown>;
}

export interface CreateAgentOutput {
  id: string;
  name: string;
  type: string;
  schedule: string;
}

export class CreateAgentUseCase {
  constructor(private agentRepository: IAgentRepository) {}

  async execute(input: CreateAgentInput): Promise<CreateAgentOutput> {
    const agentType = AgentType.create(input.type);

    const agent = AIAgent.create(
      randomUUID(),
      input.userId,
      input.name,
      input.description || null,
      agentType,
      input.schedule,
      true,
      input.timezone || "America/Sao_Paulo",
      input.config
    );

    const created = await this.agentRepository.create(agent);

    return {
      id: created.id,
      name: created.name,
      type: created.type.toString(),
      schedule: created.schedule,
    };
  }
}
