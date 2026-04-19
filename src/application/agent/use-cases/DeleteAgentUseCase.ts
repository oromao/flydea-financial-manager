import { IAgentRepository } from "@/domain/agent/repositories/IAgentRepository";

export interface DeleteAgentInput {
  agentId: string;
  userId: string;
}

export class DeleteAgentUseCase {
  constructor(private agentRepository: IAgentRepository) {}

  async execute(input: DeleteAgentInput): Promise<void> {
    const agent = await this.agentRepository.findById(input.agentId);

    if (!agent) {
      throw new Error("Agent not found");
    }

    if (agent.userId !== input.userId) {
      throw new Error("Unauthorized");
    }

    await this.agentRepository.delete(input.agentId);
  }
}
