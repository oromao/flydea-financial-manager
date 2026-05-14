import { PicoClawInsight, UserFinancialData } from "./pico-claw";

export interface IntelData {
  riskScore?: number;
  behaviorChangeScore?: number;
  recentPatternShift?: boolean;
  [key: string]: unknown;
}

export interface KnowledgeRule {
  id: string;
  condition: (data: UserFinancialData, intel?: IntelData) => boolean;
  generate: (data: UserFinancialData) => PicoClawInsight;
  baseWeight: number; // 0-100
}

export class ReasoningEngine {
  private rules: KnowledgeRule[] = [
    {
      id: "CASHFLOW_RISK",
      baseWeight: 90,
      condition: (data) => data.summary.totalBalance < data.summary.pendingPayments,
      generate: (data) => ({
        title: "Risco de Caixa",
        message: `Suas pendências (R$ ${data.summary.pendingPayments.toFixed(2)}) superam seu saldo disponível.`,
        priority: "HIGH",
        actionLabel: "Pagar agora",
        actionUrl: "/contas-a-pagar"
      })
    },
    {
      id: "BUDGET_OVERRUN",
      baseWeight: 70,
      condition: (data) => {
        const topCat = Object.entries(data.summary.expensesByCategory).sort(([, a], [, b]) => b - a)[0];
        return !!(topCat && topCat[1] > (data.summary.monthlyIncome * 0.4) && data.summary.monthlyIncome > 0);
      },
      generate: (data) => {
        const sorted = Object.entries(data.summary.expensesByCategory).sort(([, a], [, b]) => b - a);
        const topCat = sorted[0];
        return {
          title: "Alerta de Gastos",
          message: topCat 
            ? `A categoria ${topCat[0]} está consumindo ${((topCat[1] / data.summary.monthlyIncome) * 100).toFixed(0)}% da sua renda.`
            : "Você tem uma categoria com gastos elevados este mês.",
          priority: "MEDIUM",
          actionLabel: "Ver detalhes",
          actionUrl: "/relatorios"
        };
      }
    },
    {
      id: "SAVINGS_OPPORTUNITY",
      baseWeight: 40,
      condition: (data) => data.summary.netFlow > (data.summary.monthlyIncome * 0.2) && data.summary.monthlyIncome > 0,
      generate: () => ({
        title: "Oportunidade",
        message: "Você poupou mais de 20% este mês. Que tal investir o excedente?",
        priority: "LOW",
        actionLabel: "Investir",
        actionUrl: "/insights"
      })
    },
    {
      id: "MONTHLY_DEFICIT",
      baseWeight: 85,
      condition: (data) => data.summary.monthlyExpenses > data.summary.monthlyIncome && data.summary.monthlyIncome > 0,
      generate: () => ({
        title: "Déficit Mensal",
        message: "Seus gastos este mês superaram suas receitas. Revise seus lançamentos.",
        priority: "HIGH",
        actionLabel: "Revisar",
        actionUrl: "/movimentacoes"
      })
    },
    {
      id: "BEHAVIOR_SHIFT",
      baseWeight: 80,
      condition: (_data, intel) => !!intel?.recentPatternShift && (intel?.behaviorChangeScore ?? 0) > 40,
      generate: () => ({
        title: "Mudança de Comportamento",
        message: "Notei um aumento recente na frequência e volume dos seus gastos. Cuidado com compras impulsivas.",
        priority: "HIGH",
        actionLabel: "Ver Orçamentos",
        actionUrl: "/orcamentos"
      })
    }
  ];

  /**
   * Evaluates rules and ranks results based on weighted scoring.
   */
  async evaluate(data: UserFinancialData, intel?: IntelData | null, recentInsightTypes: string[] = []): Promise<PicoClawInsight[]> {
    const results: Array<{ insight: PicoClawInsight; score: number }> = [];

    for (const rule of this.rules) {
      // Skip if seen recently (Anti-repetition)
      if (recentInsightTypes.includes(rule.id) || recentInsightTypes.includes(rule.generate(data).title)) {
        continue;
      }

      if (rule.condition(data, intel ?? undefined)) {
        const insight = rule.generate(data);
        
        // Dynamic Scoring
        let score = rule.baseWeight;
        
        // Personalization: Increase weight if user has high risk or behavioral shifts
        if (intel) {
          if (rule.id === "CASHFLOW_RISK" && (intel?.riskScore ?? 0) > 70) score += 10;
          if (rule.id === "BUDGET_OVERRUN" && (intel?.behaviorChangeScore ?? 0) > 50) score += 15;
        }

        results.push({ insight, score });
      }
    }

    // Sort by final score and return top insights
    return results
      .sort((a, b) => b.score - a.score)
      .map(r => r.insight);
  }
}

export const reasoningEngine = new ReasoningEngine();
