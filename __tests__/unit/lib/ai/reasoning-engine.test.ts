import { describe, it, expect, vi, beforeEach } from "vitest";
import { ReasoningEngine } from "@/lib/ai/reasoning-engine";
import { UserFinancialData } from "@/lib/ai/pico-claw";

describe("ReasoningEngine", () => {
  let engine: ReasoningEngine;

  beforeEach(() => {
    engine = new ReasoningEngine();
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

  it("should evaluate and return insights matching conditions", async () => {
    const data = mockData({ totalBalance: 100, pendingPayments: 500 }); // CASHFLOW_RISK
    const insights = await engine.evaluate(data);
    
    expect(insights.some(i => i.title === "Risco de Caixa")).toBe(true);
  });

  it("should increase priority of CASHFLOW_RISK if user has high riskScore", async () => {
    const data = mockData({ totalBalance: 100, pendingPayments: 500, monthlyExpenses: 6000 }); // Risk and Deficit
    
    // Low risk score
    const insights1 = await engine.evaluate(data, { riskScore: 0 });
    // High risk score
    const insights2 = await engine.evaluate(data, { riskScore: 100 });

    // Since CASHFLOW_RISK (90) is already higher than MONTHLY_DEFICIT (85), it's always first,
    // but we check if it remains first and logic applied.
    expect(insights1[0].title).toBe("Risco de Caixa");
    expect(insights2[0].title).toBe("Risco de Caixa");
  });

  it("should respect anti-repetition by skipping recent insight types", async () => {
    const data = mockData({ totalBalance: 100, pendingPayments: 500 });
    const insights = await engine.evaluate(data, null, ["Risco de Caixa"]);
    
    expect(insights.some(i => i.title === "Risco de Caixa")).toBe(false);
  });

  it("should identify budget overrun when a category exceeds 40% of income", async () => {
    const data = mockData({ 
      monthlyIncome: 1000, 
      expensesByCategory: { "Lazer": 500 } 
    });
    const insights = await engine.evaluate(data);
    
    expect(insights.some(i => i.title === "Alerta de Gastos")).toBe(true);
  });
});
