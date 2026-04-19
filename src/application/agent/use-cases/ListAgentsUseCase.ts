import { IAgentRepository } from "@/domain/agent/repositories/IAgentRepository";

export interface ListAgentsOutput {
  id: string;
  name: string;
  type: string;
  schedule: string;
  isActive: boolean;
  createdAt: Date;
}

export class ListAgentsUseCase {
  constructor(private agentRepository: IAgentRepository) {}

  async execute(userId: string): Promise<ListAgentsOutput[]> {
    const agents = await this.agentRepository.findByUserId(userId);

    return agents.map((agent) => ({
      id: agent.id,
      name: agent.name,
      type: agent.type.toString(),
      schedule: agent.schedule,
      isActive: agent.isActive,
      createdAt: agent.createdAt,
    }));
  }
}
