import { describe, it, expect, vi, beforeEach } from "vitest";
import { DailyIntelligenceOrchestrator } from "@/infrastructure/services/DailyIntelligenceOrchestrator";
import { BehavioralIntelligenceService } from "@/infrastructure/services/BehavioralIntelligenceService";
import { prisma } from "@/lib/prisma";

// Mock prisma
vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findMany: vi.fn(),
    },
    aIAgent: {
      findMany: vi.fn(),
    },
    transaction: {
      aggregate: vi.fn(),
      count: vi.fn(),
    },
    userIntelligence: {
      upsert: vi.fn(),
      update: vi.fn(),
      findUnique: vi.fn(),
    },
    userBehavioralLog: {
      create: vi.fn(),
    },
    insightInteraction: {
      create: vi.fn(),
    },
    prediction: {
      findMany: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
    },
    account: {
      findMany: vi.fn(),
    },
    insightTemplate: {
      findMany: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
    },
    insight: {
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      count: vi.fn(),
      findUnique: vi.fn(),
    },
    recurrence: {
      findMany: vi.fn(),
    },
    dailyExecutionLog: {
      create: vi.fn(),
    },
  },
}));

// Mock AgentQueue
vi.mock("@/infrastructure/services/AgentQueue", () => {
  return {
    AgentQueue: class {
      async processQueue() {
        return {
          executed: ["agent-1"],
          failed: [],
          queued: [],
          errors: {},
        };
      }
    }
  };
});

describe("DailyIntelligenceOrchestrator", () => {
  let orchestrator: DailyIntelligenceOrchestrator;

  beforeEach(() => {
    vi.clearAllMocks();
    orchestrator = new DailyIntelligenceOrchestrator();
  });

  it("should process users and return SUCCESS status", async () => {
    (prisma.user.findMany as any).mockResolvedValue([{ id: "user-1", intelligence: null }]);
    (prisma.aIAgent.findMany as any).mockResolvedValue([]);
    (prisma.transaction.aggregate as any).mockResolvedValue({ _sum: { amount: 1000 }, _count: { id: 10 } });
    (prisma.userIntelligence.upsert as any).mockResolvedValue({ userId: "user-1", riskScore: 60 });
    (prisma.prediction.findMany as any).mockResolvedValue([]);
    (prisma.insightTemplate.findMany as any).mockResolvedValue([]);
    (prisma.insight.updateMany as any).mockResolvedValue({ count: 0 });
    (prisma.recurrence.findMany as any).mockResolvedValue([]);
    (prisma.account.findMany as any).mockResolvedValue([]);

    const result = await orchestrator.runDailyPipeline();

    expect(result.status).toBe("SUCCESS");
    expect(prisma.dailyExecutionLog.create).toHaveBeenCalled();
  });

  it("should detect behavior change (SPENDING_INCREASE)", async () => {
    (prisma.user.findMany as any).mockResolvedValue([{ id: "user-b", intelligence: { riskScore: 50 } }]);
    (prisma.aIAgent.findMany as any).mockResolvedValue([]);
    
    // Aggregates: current = 1500, lastMonth = 1000 (30% increase)
    (prisma.transaction.aggregate as any).mockImplementation((args: any) => {
       if (args.where.date?.gte && args.where.date?.lte) return { _sum: { amount: 1000 } }; // last month
       return { _sum: { amount: 1500 }, _count: { id: 10 } }; // current
    });
    
    (prisma.prediction.findMany as any).mockResolvedValue([]);
    (prisma.insightTemplate.findMany as any).mockResolvedValue([]);
    (prisma.userIntelligence.upsert as any).mockResolvedValue({ userId: "user-b", behaviorChangeScore: 40 });
    (prisma.recurrence.findMany as any).mockResolvedValue([]);
    (prisma.account.findMany as any).mockResolvedValue([]);

    await orchestrator.runDailyPipeline();

    expect(prisma.userBehavioralLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ changeType: "SPENDING_INCREASE" })
      })
    );
  });
});

describe("BehavioralIntelligenceService", () => {
  let service: BehavioralIntelligenceService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new BehavioralIntelligenceService();
  });

  it("should reinforce template score on ACTED interaction", async () => {
    const mockInsight = { 
      id: "ins-1", 
      userId: "u1", 
      templateId: "tpl-1", 
      template: { id: "tpl-1", performanceScore: 50 } 
    };
    (prisma.insight.findUnique as any).mockResolvedValue(mockInsight);
    
    await service.trackInteraction("ins-1", "ACTED");

    expect(prisma.insightInteraction.create).toHaveBeenCalled();
    expect(prisma.insightTemplate.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "tpl-1" },
        data: expect.objectContaining({ performanceScore: 52 })
      })
    );
    expect(prisma.userIntelligence.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: "u1" },
        data: expect.objectContaining({ impactScore: { increment: 0.5 } })
      })
    );
  });
});
