import { NextResponse, NextRequest } from "next/server";
import { cagEngine } from "@/lib/rag/cag-engine";
import { UserFinancialData } from "@/lib/financial-rag";

export async function GET(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV === "production" && !request.nextUrl.searchParams.get("force")) {
    return NextResponse.json({ error: "Only available in development" }, { status: 403 });
  }

  const scenarios = [
    {
      id: "scenario-1-critical-risk",
      name: "Risco Crítico (Saldo Baixo + Contas Altas)",
      data: {
        userId: "test",
        accounts: [{ id: "1", balance: 500 }],
        summary: {
          totalBalance: 500,
          monthlyIncome: 2000,
          monthlyExpenses: 1800,
          netFlow: 200,
          pendingPayments: 1200,
          expensesByCategory: { "Geral": 1800 },
          incomeByCategory: { "Salário": 2000 },
        },
        transactions: []
      } as unknown as UserFinancialData,
      expectations: (insights: any[]) => {
        const top = insights[0];
        return top.type === "URGENTE" && top.id === "risk-negative";
      }
    },
    {
      id: "scenario-2-trend-up",
      name: "Tendência de Alta em Categoria",
      data: {
        userId: "test",
        accounts: [{ id: "1", balance: 5000 }],
        summary: {
          totalBalance: 5000,
          monthlyIncome: 5000,
          monthlyExpenses: 4000,
          netFlow: 1000,
          pendingPayments: 0,
          expensesByCategory: { "Restaurante": 2000, "Outros": 2000 },
          incomeByCategory: { "Salário": 5000 },
        },
        transactions: []
      } as unknown as UserFinancialData,
      expectations: (insights: any[]) => {
        const concentration = insights.find(i => i.id === "high-concentration");
        return !!concentration && concentration.category === "Restaurante";
      }
    },
    {
      id: "scenario-3-healthy",
      name: "Saúde Financeira Boa",
      data: {
        userId: "test",
        accounts: [{ id: "1", balance: 10000 }],
        summary: {
          totalBalance: 10000,
          monthlyIncome: 8000,
          monthlyExpenses: 4000,
          netFlow: 4000,
          pendingPayments: 0,
          expensesByCategory: { "Geral": 4000 },
          incomeByCategory: { "Salário": 8000 },
        },
        transactions: []
      } as unknown as UserFinancialData,
      expectations: (insights: any[]) => {
        const savings = insights.find(i => i.id === "good-savings");
        return !!savings && savings.type === "INFORMAÇÃO";
      }
    }
  ];

  const results = scenarios.map(s => {
    const insights = cagEngine.rankInsights(s.data);
    const scores = cagEngine.calculateScores(s.data);
    const proactive = cagEngine.generateProactiveMessage(s.data);
    const passed = s.expectations(insights);

    return {
      id: s.id,
      name: s.name,
      passed,
      insightsCount: insights.length,
      topInsight: insights[0]?.title,
      proactive,
      healthScore: scores.healthScore,
    };
  });

  const summary = {
    total: scenarios.length,
    passed: results.filter(r => r.passed).length,
    failed: results.filter(r => !r.passed).length,
    score: (results.filter(r => r.passed).length / scenarios.length) * 100
  };

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    summary,
    results
  });
}
