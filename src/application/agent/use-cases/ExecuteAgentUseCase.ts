import { randomUUID } from "crypto";
import { AgentExecution } from "@/domain/agent/entities/AgentExecution";
import { IAgentRepository } from "@/domain/agent/repositories/IAgentRepository";
import { IAgentExecutionRepository } from "@/domain/agent/repositories/IAgentExecutionRepository";
import { ragQueryEngine } from "@/lib/rag/query-engine";
import { getUserFinancialData } from "@/lib/financial-rag";
import { EmailService } from "@/infrastructure/services/EmailService";

export interface ExecuteAgentOutput {
  executionId: string;
  status: string;
}

export class ExecuteAgentUseCase {
  constructor(
    private agentRepository: IAgentRepository,
    private executionRepository: IAgentExecutionRepository
  ) {}

  async execute(agentId: string, userId: string): Promise<ExecuteAgentOutput> {
    const agent = await this.agentRepository.findById(agentId);
    if (!agent || agent.userId !== userId) {
      throw new Error("Agent not found");
    }

    const execution = AgentExecution.create(randomUUID(), agentId, new Date());
    await this.executionRepository.create(execution);

    try {
      execution.markRunning();

      // Get user financial data
      const financialData = await getUserFinancialData(userId);

      // Generate insights based on agent type
      const query = this.buildQueryForAgent(agent.type.toString(), financialData);
      const result = ragQueryEngine.processQuery(query, financialData, 3);

      // Execute actions
      const actionResults: Record<string, unknown> = {};
      const emailService = new EmailService();

      for (const action of agent.actions) {
        if (action.type === "EMAIL" && action.recipient) {
          try {
            const sent = await emailService.sendAgentNotification({
              recipient: action.recipient,
              agentName: agent.name,
              agentType: agent.type.toString(),
              executionStatus: "SUCCESS",
              output: result.relevantMetrics,
            });
            actionResults[action.id] = {
              type: "EMAIL",
              status: sent ? "SUCCESS" : "FAILED",
              recipient: action.recipient,
            };
          } catch (error) {
            actionResults[action.id] = {
              type: "EMAIL",
              status: "FAILED",
              error: error instanceof Error ? error.message : "Unknown error",
            };
          }
        }
      }

      execution.markSuccess(result.relevantMetrics || {}, actionResults);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      execution.markFailed(message);
    }

    await this.executionRepository.update(execution);

    return {
      executionId: execution.id,
      status: execution.status,
    };
  }

  private buildQueryForAgent(
    agentType: string,
    financialData: any
  ): string {
    switch (agentType) {
      case "BUDGET_REVIEW":
        return "Revise os orçamentos e me diga se algum está acima do limite";
      case "EXPENSE_ALERT":
        return "Quais foram meus gastos anormais este mês?";
      case "INCOME_CHECK":
        return "Qual foi minha receita total e como está se comparado ao mês anterior?";
      case "CASHFLOW_FORECAST":
        return "Qual é minha projeção de fluxo de caixa para os próximos 30 dias?";
      default:
        return "Analise minha situação financeira atual";
    }
  }
}
