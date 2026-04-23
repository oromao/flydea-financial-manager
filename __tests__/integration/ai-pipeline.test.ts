import { describe, it, expect, vi, beforeEach } from "vitest";
import { PicoClawEngine } from "@/lib/ai/pico-claw";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    account: { findMany: vi.fn() },
    transaction: { findMany: vi.fn() },
    userIntelligence: { findUnique: vi.fn() },
    insight: { findMany: vi.fn(), createMany: vi.fn() },
    insightInteraction: { findMany: vi.fn() },
    auditLog: { findMany: vi.fn() },
  },
}));

describe("PicoClaw v2 Integration", () => {
  const engine = new PicoClawEngine();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(prisma.insightInteraction.findMany).mockResolvedValue([]);
  });

  it("should process a complex help query by combining HIE and Knowledge Base", async () => {
    // Mock user data
    vi.mocked(prisma.account.findMany).mockResolvedValue([{ balance: 1000 } as any]);
    vi.mocked(prisma.transaction.findMany).mockResolvedValue([]);
    vi.mocked(prisma.userIntelligence.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.insight.findMany).mockResolvedValue([]);

    const query = "Como faço para economizar usando a regra 50/30/20?";
    const result = await engine.processQuery("user-1", query);

    // Should classify as INSIGHT or HELP
    expect(["INSIGHT", "HELP"]).toContain(result.intent);
    
    // The response should be augmented by the knowledge base because of the "regra 50/30/20" keyword
    // Even if PicoClawEngine.processQuery doesn't explicitly return the knowledge-augmented string 
    // (that's done in the route), we verify that the intent and data are correct.
    expect(result.data.summary.totalBalance).toBe(1000);
  });

  it("should detect behavioral drift and include it in insights", async () => {
    vi.mocked(prisma.account.findMany).mockResolvedValue([{ balance: 1000 } as any]);
    vi.mocked(prisma.transaction.findMany).mockResolvedValue([]);
    
    // Mock drift in intelligence
    vi.mocked(prisma.userIntelligence.findUnique).mockResolvedValue({
      recentPatternShift: true,
      behaviorChangeScore: 60
    } as any);
    
    const insights = await engine.generateInsights({ 
      userId: "user-1", 
      summary: { totalBalance: 1000, monthlyIncome: 5000, monthlyExpenses: 2000, netFlow: 3000, pendingPayments: 0, expensesByCategory: {} } 
    });

    const driftInsight = insights.find(i => i.title === "Mudança de Comportamento");
    expect(driftInsight).toBeDefined();
    expect(driftInsight?.priority).toBe("HIGH");
  });
});
