import { randomUUID } from "crypto";
import { AgentExecution } from "@/domain/agent/entities/AgentExecution";
import { IAgentRepository } from "@/domain/agent/repositories/IAgentRepository";
import { IAgentExecutionRepository } from "@/domain/agent/repositories/IAgentExecutionRepository";
import { picoClaw } from "@/lib/ai/pico-claw";
import { EmailService } from "@/infrastructure/services/EmailService";
import { prisma } from "@/lib/prisma";

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

      // Get user financial data via PicoClaw fetcher
      const financialData = await picoClaw.fetchData(userId);

      // Generate insights using PicoClaw Engine
      const insights = await picoClaw.generateInsights(financialData);
      const topInsight = insights[0] || {
        title: "Tudo em ordem",
        message: "Não identifiquei riscos imediatos na sua conta.",
        priority: "LOW"
      };

      // Map output metrics
      const output = {
        insight: topInsight,
        metrics: {
          balance: financialData.summary.totalBalance,
          netFlow: financialData.summary.netFlow,
          pending: financialData.summary.pendingPayments,
          healthScore: 100 - (financialData.summary.pendingPayments / (financialData.summary.totalBalance + 1) * 100)
        }
      };

      // Execute actions
      const actionResults: Record<string, unknown> = {};
      const emailService = new EmailService();

      for (const action of agent.actions) {
        // 1. EMAIL ACTION
        if (action.type === "EMAIL" && action.recipient) {
          try {
            const sent = await emailService.sendAgentNotification({
              recipient: action.recipient,
              agentName: agent.name,
              agentType: agent.type.toString(),
              executionStatus: "SUCCESS",
              output,
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

        // 2. IN_APP_NOTIFICATION ACTION
        if (action.type === "IN_APP_NOTIFICATION") {
          try {
            await prisma.notification.create({
              data: {
                userId,
                title: `Agente: ${agent.name}`,
                message: topInsight.message,
                type: topInsight.priority === "HIGH" ? "ALERT" : "INFO",
                relatedId: agentId,
                relatedType: "AGENT_EXECUTION",
                metadata: output as any,
              }
            });
            actionResults[action.id] = {
              type: "IN_APP_NOTIFICATION",
              status: "SUCCESS"
            };
          } catch (error) {
            actionResults[action.id] = {
              type: "IN_APP_NOTIFICATION",
              status: "FAILED",
              error: error instanceof Error ? error.message : "Unknown error",
            };
          }
        }
      }

      execution.markSuccess(output, actionResults);
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
}
