import { describe, it, expect, vi, beforeEach } from "vitest";
import { BehavioralIntelligenceService } from "@/infrastructure/services/BehavioralIntelligenceService";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    insight: { findUnique: vi.fn(), update: vi.fn(), findMany: vi.fn(), createMany: vi.fn() },
    insightInteraction: { create: vi.fn() },
    insightTemplate: { update: vi.fn() },
    userIntelligence: { update: vi.fn(), findUnique: vi.fn() },
    transaction: { aggregate: vi.fn(), count: vi.fn() },
    userBehavioralLog: { create: vi.fn(), findMany: vi.fn() },
    prediction: { findMany: vi.fn() },
  },
}));

describe("BehavioralIntelligenceService", () => {
  let service: BehavioralIntelligenceService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new BehavioralIntelligenceService();
  });

  describe("trackInteraction", () => {
    it("should record interaction and update insight status", async () => {
      vi.mocked(prisma.insight.findUnique).mockResolvedValue({ 
        id: "insight-1", userId: "user-1", templateId: "temp-1",
        template: { performanceScore: 50 } 
      } as any);

      await service.trackInteraction("insight-1", "ACTED");

      expect(prisma.insightInteraction.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ interactionType: "ACTED" })
      }));
      expect(prisma.insight.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: "insight-1" },
        data: expect.objectContaining({ status: "ACTED" })
      }));
    });

    it("should update user intelligence on ACTED interaction", async () => {
      vi.mocked(prisma.insight.findUnique).mockResolvedValue({ 
        id: "insight-1", userId: "user-1" 
      } as any);

      await service.trackInteraction("insight-1", "ACTED");

      expect(prisma.userIntelligence.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { userId: "user-1" }
      }));
    });
  });

  describe("onTransactionCreated", () => {
    it("should detect spending increase and log behavioral change", async () => {
      vi.mocked(prisma.transaction.aggregate)
        .mockResolvedValueOnce({ _sum: { amount: 3000 }, _count: { id: 30 } } as any) // Baseline: 1000/mo
        .mockResolvedValueOnce({ _sum: { amount: 1500 } } as any); // Current: 1500

      vi.mocked(prisma.userIntelligence.findUnique).mockResolvedValue({ 
        userId: "user-1", behaviorChangeScore: 10, impulsivityScore: 10 
      } as any);

      await service.onTransactionCreated("user-1", 100, "cat-1");

      expect(prisma.userBehavioralLog.create).toHaveBeenCalled();
      expect(prisma.userIntelligence.update).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ recentPatternShift: true })
      }));
    });
  });

  describe("getEvolutionHistory", () => {
    it("should aggregate data for the UI", async () => {
      vi.mocked(prisma.userBehavioralLog.findMany).mockResolvedValue([]);
      vi.mocked(prisma.userIntelligence.findUnique).mockResolvedValue({} as any);
      vi.mocked(prisma.prediction.findMany).mockResolvedValue([]);
      vi.mocked(prisma.insight.findMany).mockResolvedValue([
        { id: "i1", status: "ACTED", priority: "HIGH" } as any
      ]);

      const history = await service.getEvolutionHistory("user-1");
      expect(history).toHaveProperty("topInsights");
      expect(history.topInsights[0].relevanceScore).toBe(100);
    });
  });
});
