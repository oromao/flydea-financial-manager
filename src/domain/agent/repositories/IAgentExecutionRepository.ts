import { AgentExecution } from "../entities/AgentExecution";

export interface IAgentExecutionRepository {
  create(execution: AgentExecution): Promise<AgentExecution>;
  findById(id: string): Promise<AgentExecution | null>;
  findByAgentId(agentId: string, limit?: number): Promise<AgentExecution[]>;
  findPending(): Promise<AgentExecution[]>;
  update(execution: AgentExecution): Promise<AgentExecution>;
}
