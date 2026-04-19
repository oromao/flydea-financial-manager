import { prisma } from "@/lib/prisma";
import { ExecuteAgentUseCase } from "@/application/agent/use-cases/ExecuteAgentUseCase";
import { PrismaAgentRepository } from "@/infrastructure/repositories/PrismaAgentRepository";
import { PrismaAgentExecutionRepository } from "@/infrastructure/repositories/PrismaAgentExecutionRepository";

interface QueueItem {
  agentId: string;
  userId: string;
  scheduledTime: Date;
  retries: number;
  maxRetries: number;
}

interface ProcessResult {
  executed: string[];
  failed: string[];
  queued: string[];
  errors: Record<string, string>;
}

export class AgentQueue {
  private agentRepository = new PrismaAgentRepository();
  private executionRepository = new PrismaAgentExecutionRepository();
  private maxRetries = 3;
  private maxConcurrent = 5; // Processar até 5 agentes em paralelo

  /**
   * Enqueue all active agents for processing
   * Called once per day by Vercel cron
   */
  async enqueueAllActive(): Promise<QueueItem[]> {
    const allActiveAgents = await prisma.aIAgent.findMany({
      where: { isActive: true },
      include: { actions: true },
    });

    const queue: QueueItem[] = [];

    for (const agent of allActiveAgents) {
      queue.push({
        agentId: agent.id,
        userId: agent.userId,
        scheduledTime: new Date(),
        retries: 0,
        maxRetries: this.maxRetries,
      });
    }

    console.log(
      `[AgentQueue] Enqueued ${queue.length} active agents for processing`
    );
    return queue;
  }

  /**
   * Process all agents in queue with retry logic
   */
  async processQueue(queue: QueueItem[]): Promise<ProcessResult> {
    const executed: string[] = [];
    const failed: string[] = [];
    const queued: string[] = [];
    const errors: Record<string, string> = {};

    // Process in batches to avoid overwhelming the system
    for (let i = 0; i < queue.length; i += this.maxConcurrent) {
      const batch = queue.slice(i, i + this.maxConcurrent);
      const batchResults = await Promise.allSettled(
        batch.map((item) => this.executeAgent(item))
      );

      for (let j = 0; j < batchResults.length; j++) {
        const result = batchResults[j];
        const item = batch[j];

        if (result.status === "fulfilled") {
          if (result.value.success) {
            executed.push(item.agentId);
          } else {
            if (item.retries < item.maxRetries) {
              item.retries++;
              queued.push(item.agentId);
            } else {
              failed.push(item.agentId);
              errors[item.agentId] = result.value.error || "Max retries exceeded";
            }
          }
        } else {
          const error = result.reason;
          if (item.retries < item.maxRetries) {
            item.retries++;
            queued.push(item.agentId);
          } else {
            failed.push(item.agentId);
            errors[item.agentId] = error instanceof Error ? error.message : String(error);
          }
        }
      }
    }

    return { executed, failed, queued, errors };
  }

  /**
   * Execute a single agent
   */
  private async executeAgent(item: QueueItem): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const useCase = new ExecuteAgentUseCase(
        this.agentRepository,
        this.executionRepository
      );

      const startTime = Date.now();
      await useCase.execute(item.agentId, item.userId);
      const duration = Date.now() - startTime;

      console.log(
        `[AgentQueue] Agent ${item.agentId} executed successfully in ${duration}ms`
      );

      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(
        `[AgentQueue] Error executing agent ${item.agentId} (retry ${item.retries}/${item.maxRetries}):`,
        message
      );

      return {
        success: false,
        error: message,
      };
    }
  }

  /**
   * Get queue health metrics
   */
  async getMetrics(): Promise<{
    totalActive: number;
    totalExecutions: number;
    lastExecutionTime?: Date;
  }> {
    const totalActive = await prisma.aIAgent.count({ where: { isActive: true } });
    const totalExecutions = await prisma.agentExecution.count();
    const lastExecution = await prisma.agentExecution.findFirst({
      orderBy: { completedAt: "desc" },
      select: { completedAt: true },
    });

    return {
      totalActive,
      totalExecutions,
      lastExecutionTime: lastExecution?.completedAt || undefined,
    };
  }
}
