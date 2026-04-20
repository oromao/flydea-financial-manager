import { describe, it, expect } from "vitest";
import { cagEngine } from "@/lib/rag/cag-engine";
import { UserFinancialData } from "@/lib/financial-rag";

describe("CAGEngine Unit Tests", () => {
  const baseMock: UserFinancialData = {
    userId: "user-1",
    accounts: [{ id: "acc-1", name: "Bank", type: "CHECKING", balance: 1000 }],
    transactions: [],
    summary: {
      totalBalance: 1000,
      monthlyIncome: 3000,
      monthlyExpenses: 2000,
      netFlow: 1000,
      pendingPayments: 0,
      expensesByCategory: { "Alimentação": 500, "Moradia": 1000, "Lazer": 500 },
      incomeByCategory: { "Salário": 3000 },
    }
  };

  it("should detect high negative risk when pending payments exceed balance", () => {
    const riskData: UserFinancialData = {
      ...baseMock,
      summary: {
        ...baseMock.summary,
        totalBalance: 500,
        pendingPayments: 1000, // Higher than balance
      }
    };

    const scores = cagEngine.calculateScores(riskData);
    const insights = cagEngine.rankInsights(riskData);

    expect(scores.riskScore).toBeGreaterThanOrEqual(80);
    expect(insights[0].type).toBe("URGENTE");
    expect(insights[0].id).toBe("risk-negative");
  });

  it("should detect high category concentration", () => {
    const concentrationData: UserFinancialData = {
      ...baseMock,
      summary: {
        ...baseMock.summary,
        monthlyExpenses: 1000,
        expensesByCategory: { "Viagem": 600, "Mercado": 400 }, // Viagem is 60%
      }
    };

    const insights = cagEngine.rankInsights(concentrationData);
    const highConcentration = insights.find(i => i.id === "high-concentration");

    expect(highConcentration).toBeDefined();
    expect(highConcentration?.title).toContain("Viagem");
  });

  it("should detect negative net flow", () => {
    const negativeFlowData: UserFinancialData = {
      ...baseMock,
      summary: {
        ...baseMock.summary,
        monthlyIncome: 1000,
        monthlyExpenses: 1500,
        netFlow: -500,
      }
    };

    const insights = cagEngine.rankInsights(negativeFlowData);
    const flowInsight = insights.find(i => i.id === "negative-flow");

    expect(flowInsight).toBeDefined();
    expect(flowInsight?.type).toBe("URGENTE");
  });

  it("should detect anomalies in spending", () => {
    const anomalyData: UserFinancialData = {
      ...baseMock,
      transactions: [
        { id: "t1", description: "Compra Gigante", amount: 1500, type: "EXPENSE", date: "2026-04-20", category: "Extra", paymentStatus: "PAID" }
      ],
      summary: {
        ...baseMock.summary,
        monthlyExpenses: 2000, // Average per tx would be 2000 / tx_count
      }
    };

    const insights = cagEngine.rankInsights(anomalyData);
    const anomalyInsight = insights.find(i => i.id === "anomaly-detected");

    expect(anomalyInsight).toBeDefined();
    expect(anomalyInsight?.message).toContain("Compra Gigante");
  });

  it("should generate a positive message when everything is fine", () => {
    const healthyData: UserFinancialData = {
      ...baseMock,
      summary: {
        ...baseMock.summary,
        totalBalance: 10000,
        pendingPayments: 0,
        netFlow: 1500,
      }
    };

    const message = cagEngine.generateProactiveMessage(healthyData);
    expect(message).not.toContain("⚠️");
    expect(message).not.toContain("Cuidado");
  });
});
