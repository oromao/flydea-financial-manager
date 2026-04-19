import { describe, it, expect } from "vitest";
import { RAGQueryEngine } from "@/lib/rag/query-engine";
import type { UserFinancialData } from "@/lib/financial-rag";

describe("RAG Query Engine", () => {
  const engine = new RAGQueryEngine();

  const mockFinancialData: UserFinancialData = {
    userId: "user-123",
    accounts: [
      {
        id: "acc-1",
        name: "Conta Corrente",
        type: "CHECKING",
        balance: 5000,
      },
      {
        id: "acc-2",
        name: "Poupança",
        type: "SAVINGS",
        balance: 10000,
      },
    ],
    transactions: [
      {
        id: "t1",
        description: "Salário",
        amount: 5000,
        type: "INCOME",
        date: new Date().toISOString().split("T")[0],
        category: "Salário",
        paymentStatus: "PAID",
      },
      {
        id: "t2",
        description: "Aluguel",
        amount: 1500,
        type: "EXPENSE",
        date: new Date().toISOString().split("T")[0],
        category: "Moradia",
        paymentStatus: "PAID",
      },
      {
        id: "t3",
        description: "Alimentação",
        amount: 500,
        type: "EXPENSE",
        date: new Date().toISOString().split("T")[0],
        category: "Alimentação",
        paymentStatus: "PAID",
      },
    ],
    summary: {
      totalBalance: 15000,
      monthlyIncome: 5000,
      monthlyExpenses: 2000,
      netFlow: 3000,
      pendingPayments: 0,
      expensesByCategory: {
        Moradia: 1500,
        Alimentação: 500,
      },
      incomeByCategory: {
        Salário: 5000,
      },
    },
  };

  describe("processQuery", () => {
    it("should return response with required structure", () => {
      const response = engine.processQuery(
        "Como economizar mais?",
        mockFinancialData
      );

      expect(response).toHaveProperty("response");
      expect(response).toHaveProperty("sources");
      expect(response).toHaveProperty("relevantMetrics");
      expect(typeof response.response).toBe("string");
      expect(Array.isArray(response.sources)).toBe(true);
    });

    it("should include financial metrics in response", () => {
      const response = engine.processQuery(
        "Qual é minha saúde financeira?",
        mockFinancialData
      );

      expect(response.relevantMetrics).toHaveProperty("totalBalance");
      expect(response.relevantMetrics).toHaveProperty("monthlyIncome");
      expect(response.relevantMetrics).toHaveProperty("monthlyExpenses");
      expect(response.relevantMetrics).toHaveProperty("netFlow");
      expect(response.relevantMetrics?.totalBalance).toBe(15000);
      expect(response.relevantMetrics?.monthlyIncome).toBe(5000);
    });

    it("should find relevant sources", () => {
      const response = engine.processQuery(
        "Como economizar em despesas?",
        mockFinancialData
      );

      expect(response.sources.length).toBeGreaterThan(0);
      expect(response.sources.length).toBeLessThanOrEqual(3);
    });

    it("should detect expense optimization intent", () => {
      const response = engine.processQuery(
        "Como posso reduzir despesas?",
        mockFinancialData
      );

      expect(response.response).toContain("Economia");
      expect(response.response.toLowerCase()).toContain("despesa");
    });

    it("should detect income optimization intent", () => {
      const response = engine.processQuery(
        "Como aumentar minha receita?",
        mockFinancialData
      );

      expect(response.response.toLowerCase()).toContain("receita");
    });

    it("should detect cash flow intent", () => {
      const response = engine.processQuery(
        "Como está meu fluxo de caixa?",
        mockFinancialData
      );

      expect(response.response).toContain("Fluxo");
    });

    it("should detect spending pattern intent", () => {
      const response = engine.processQuery(
        "Qual é meu padrão de gastos?",
        mockFinancialData
      );

      expect(response.response).toContain("Padrão");
    });

    it("should detect debt intent", () => {
      const response = engine.processQuery(
        "Como está minha dívida?",
        mockFinancialData
      );

      expect(response.response).toContain("Dívida");
    });

    it("should detect health check intent", () => {
      const response = engine.processQuery(
        "Como está minha saúde financeira?",
        mockFinancialData
      );

      expect(response.response).toContain("Saúde");
    });

    it("should handle negative cash flow", () => {
      const negativeFlowData: UserFinancialData = {
        ...mockFinancialData,
        summary: {
          ...mockFinancialData.summary,
          monthlyExpenses: 6000,
          netFlow: -1000,
        },
      };

      const response = engine.processQuery(
        "Como economizar?",
        negativeFlowData
      );

      expect(response.response).toContain("Economia");
    });

    it("should handle zero pending payments", () => {
      const response = engine.processQuery(
        "Como estão minhas dívidas e contas a pagar?",
        mockFinancialData
      );

      expect(response.response).toContain("Dívida");
    });

    it("should include top expense category in metrics", () => {
      const response = engine.processQuery(
        "Minhas despesas?",
        mockFinancialData
      );

      expect(response.relevantMetrics?.topExpenseCategory).toBe("Moradia");
    });

    it("should use topK parameter", () => {
      const response1 = engine.processQuery("test", mockFinancialData, 1);
      const response2 = engine.processQuery("test", mockFinancialData, 3);

      expect(response1.sources.length).toBeLessThanOrEqual(1);
      expect(response2.sources.length).toBeLessThanOrEqual(3);
    });

    it("should return non-empty response text", () => {
      const response = engine.processQuery(
        "Alguma sugestão financeira?",
        mockFinancialData
      );

      expect(response.response.length).toBeGreaterThan(100);
    });
  });

  describe("intent detection", () => {
    it("should handle Portuguese terms correctly", () => {
      const queries = [
        "Como economizar?",
        "Como reduzir despesas?",
        "Dicas de economia?",
      ];

      queries.forEach((query) => {
        const response = engine.processQuery(query, mockFinancialData);
        expect(response.response.length).toBeGreaterThan(0);
      });
    });

    it("should default to general response for unknown intent", () => {
      const response = engine.processQuery(
        "Qual é a capital da França?",
        mockFinancialData
      );

      expect(response.response).toContain("Insights");
    });

    it("should be case insensitive", () => {
      const response1 = engine.processQuery(
        "COMO ECONOMIZAR?",
        mockFinancialData
      );
      const response2 = engine.processQuery(
        "como economizar?",
        mockFinancialData
      );

      expect(response1.response).toContain("Economia");
      expect(response2.response).toContain("Economia");
    });
  });

  describe("financial data integration", () => {
    it("should incorporate user's actual expenses", () => {
      const response = engine.processQuery(
        "Como economizar?",
        mockFinancialData
      );

      expect(response.response).toContain("Moradia");
      expect(response.response).toContain("1500");
    });

    it("should calculate percentages correctly", () => {
      const response = engine.processQuery(
        "Qual meu padrão?",
        mockFinancialData
      );

      expect(response.response).toContain("%");
    });

    it("should handle multiple accounts", () => {
      const response = engine.processQuery(
        "Como está meu saldo?",
        mockFinancialData
      );

      expect(response.relevantMetrics?.totalBalance).toBe(15000);
    });
  });
});
