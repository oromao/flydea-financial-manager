import cronParser from "cron-parser";
import { PrismaAgentRepository } from "@/infrastructure/repositories/PrismaAgentRepository";
import { PrismaAgentExecutionRepository } from "@/infrastructure/repositories/PrismaAgentExecutionRepository";
import { ExecuteAgentUseCase } from "@/application/agent/use-cases/ExecuteAgentUseCase";

export class AgentScheduler {
  private agentRepository = new PrismaAgentRepository();
  private executionRepository = new PrismaAgentExecutionRepository();

  async runDueAgents(): Promise<{
    executed: string[];
    failed: string[];
    error?: string;
  }> {
    const executed: string[] = [];
    const failed: string[] = [];

    try {
      // Get all active agents
      const agents = await this.agentRepository.findActiveByUserId("*"); // This will need to be adapted based on repo implementation

      // Instead, we need to query directly from prisma for all active agents
      const { prisma } = await import("@/lib/prisma");
      const allActiveAgents = await prisma.aIAgent.findMany({
        where: { isActive: true },
        include: { actions: true },
      });

      for (const agentData of allActiveAgents) {
        try {
          if (this.shouldRunAgent(agentData.schedule, agentData.timezone)) {
            const useCase = new ExecuteAgentUseCase(
              this.agentRepository,
              this.executionRepository
            );

            await useCase.execute(agentData.id, agentData.userId);
            executed.push(agentData.id);
          }
        } catch (error) {
          failed.push(agentData.id);
          console.error(
            `Error executing agent ${agentData.id}:`,
            error instanceof Error ? error.message : error
          );
        }
      }

      return { executed, failed };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error("Error in agent scheduler:", message);
      return {
        executed,
        failed,
        error: message,
      };
    }
  }

  private shouldRunAgent(cronExpression: string, timezone: string): boolean {
    try {
      const interval = (cronParser as any).parseExpression(cronExpression, {
        tz: timezone,
      });

      // Get the next and previous execution times
      const nextExecution = interval.next().toDate();
      const previousExecution = interval.prev().toDate();

      const now = new Date();

      // Agent should run if:
      // 1. The previous execution time is in the past (within last minute)
      // 2. The next execution time is in the future
      const timeSincePrevious = now.getTime() - previousExecution.getTime();
      const timeUntilNext = nextExecution.getTime() - now.getTime();

      // Run if last execution was less than 2 minutes ago and next is in future
      // This prevents duplicate executions within the same minute
      return timeSincePrevious < 120000 && timeUntilNext > 0;
    } catch (error) {
      console.error(
        `Invalid cron expression "${cronExpression}":`,
        error instanceof Error ? error.message : error
      );
      return false;
    }
  }
}
