import { describe, it, expect, vi, beforeEach } from "vitest";
import { PicoClawEngine, UserFinancialData } from "@/lib/ai/pico-claw";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    userIntelligence: { findUnique: vi.fn() },
    insight: { findMany: vi.fn(), createMany: vi.fn() },
    insightInteraction: { findMany: vi.fn() },
    auditLog: { findMany: vi.fn() },
  },
}));

// We're skipping the `fetchData` test or we could mock Prisma, but let's focus on logic
describe("PicoClawEngine", () => {
  let engine: PicoClawEngine;

  beforeEach(() => {
    vi.clearAllMocks();
    engine = new PicoClawEngine();
    
    vi.mocked(prisma.userIntelligence.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.insight.findMany).mockResolvedValue([]);
    vi.mocked(prisma.insightInteraction.findMany).mockResolvedValue([]);
  });

  const mockData = (overrides: Partial<UserFinancialData["summary"]> = {}): UserFinancialData => ({
    userId: "user-1",
    summary: {
      totalBalance: 1000,
      monthlyIncome: 5000,
      monthlyExpenses: 2000,
      netFlow: 3000,
      pendingPayments: 500,
      expensesByCategory: { "Alimentação": 1000, "Transporte": 1000 },
      ...overrides,
    },
  });

  describe("generateInsights", () => {
    it("should generate Risco de Caixa if pending payments > balance", async () => {
      const data = mockData({ totalBalance: 400, pendingPayments: 500 });
      const insights = await engine.generateInsights(data);

      const riskInsight = insights.find(i => i.title === "Risco de Caixa");
      expect(riskInsight).toBeDefined();
      expect(riskInsight?.priority).toBe("HIGH");
      expect(riskInsight?.message).toContain("superam seu saldo");
    });

    it("should generate Alerta de Gastos if a category > 40% of income", async () => {
      const data = mockData({ 
        monthlyIncome: 5000, 
        expensesByCategory: { "Moradia": 2500 } // 50%
      });
      const insights = await engine.generateInsights(data);

      const alertInsight = insights.find(i => i.title === "Alerta de Gastos");
      expect(alertInsight).toBeDefined();
      expect(alertInsight?.priority).toBe("MEDIUM");
      expect(alertInsight?.message).toContain("consumindo 50%");
    });

    it("should generate Oportunidade if netFlow > 20% of income", async () => {
      const data = mockData({ monthlyIncome: 5000, netFlow: 1500 }); // 30%
      const insights = await engine.generateInsights(data);

      const oppInsight = insights.find(i => i.title === "Oportunidade");
      expect(oppInsight).toBeDefined();
      expect(oppInsight?.priority).toBe("LOW");
    });

    it("should generate Déficit Mensal if expenses > income", async () => {
      const data = mockData({ monthlyIncome: 5000, monthlyExpenses: 6000 });
      const insights = await engine.generateInsights(data);

      const deficitInsight = insights.find(i => i.title === "Déficit Mensal");
      expect(deficitInsight).toBeDefined();
      expect(deficitInsight?.priority).toBe("HIGH");
    });

    it("should sort insights by priority", async () => {
      const data = mockData({ 
        totalBalance: 400, pendingPayments: 500, // HIGH
        monthlyIncome: 5000, netFlow: 1500, // LOW
      });
      const insights = await engine.generateInsights(data);
      
      expect(insights.length).toBeGreaterThanOrEqual(2);
      expect(insights[0].priority).toBe("HIGH");
      expect(insights[insights.length - 1].priority).toBe("LOW");
    });

    it("should not generate an insight if user has seen it recently", async () => {
      vi.mocked(prisma.insight.findMany).mockResolvedValue([{ type: "Risco de Caixa" } as any]);

      const data = mockData({ totalBalance: 400, pendingPayments: 500 });
      const insights = await engine.generateInsights(data);

      const riskInsight = insights.find(i => i.title === "Risco de Caixa");
      expect(riskInsight).toBeUndefined(); // Should be filtered out
    });

    it("should generate Mudança de Comportamento if intelligence detects drift", async () => {
      vi.mocked(prisma.userIntelligence.findUnique).mockResolvedValue({
        recentPatternShift: true,
        behaviorChangeScore: 50
      } as any);

      const data = mockData(); // normal data
      const insights = await engine.generateInsights(data);

      const driftInsight = insights.find(i => i.title === "Mudança de Comportamento");
      expect(driftInsight).toBeDefined();
      expect(driftInsight?.priority).toBe("HIGH");
    });
  });

  describe("getQuickSummary", () => {
    it("should format positive net flow", async () => {
      const data = mockData({ totalBalance: 1000, netFlow: 500 });
      const summary = await engine.getQuickSummary(data);
      expect(summary).toBe("Seu saldo é de R$ 1000.00. Este mês você está em dia por R$ 500.00.");
    });

    it("should format negative net flow", async () => {
      const data = mockData({ totalBalance: 1000, netFlow: -300 });
      const summary = await engine.getQuickSummary(data);
      expect(summary).toBe("Seu saldo é de R$ 1000.00. Este mês você está no vermelho por R$ 300.00.");
    });
  });
});
