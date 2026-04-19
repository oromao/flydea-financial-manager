import { AIAgent } from "../entities/AIAgent";

export interface IAgentRepository {
  create(agent: AIAgent): Promise<AIAgent>;
  findById(id: string): Promise<AIAgent | null>;
  findByUserId(userId: string): Promise<AIAgent[]>;
  update(agent: AIAgent): Promise<AIAgent>;
  delete(id: string): Promise<void>;
  findActiveByUserId(userId: string): Promise<AIAgent[]>;
}
