import { PicoClawInsight, UserFinancialData } from "./pico-claw";

export type InsightPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type InsightCategory = 
  | "CASHFLOW" 
  | "BUDGET" 
  | "DEBT" 
  | "SAVINGS" 
  | "BEHAVIOR"
  | "INVESTMENT"
  | "SEASONAL"
  | "GOAL";

export interface KnowledgeRule {
  id: string;
  category: InsightCategory;
  name: string;
  description: string;
  condition: (data: UserFinancialData, intel?: UserIntel) => boolean;
  generate: (data: UserFinancialData) => PicoClawInsight;
  baseWeight: number;
  cooldownDays: number;
  minUserScore?: number;
}

export interface UserIntel {
  riskScore?: number;
  behaviorChangeScore?: number;
  recentPatternShift?: boolean;
  financialScore?: number;
  debtLevel?: number;
  savingsRate?: number;
  stabilityScore?: number;
  recentMonths?: MonthlySummary[];
}

export interface MonthlySummary {
  month: string;
  income: number;
  expenses: number;
  savings: number;
  categories: Record<string, number>;
}

class ReasoningEngineV2 {
  private rules: KnowledgeRule[] = [
    // ═══════════════════════════════════════════════════════════════
    // CASHFLOW - Fluxo de Caixa
    // ═══════════════════════════════════════════════════════════════
    {
      id: "CASHFLOW_RISK",
      category: "CASHFLOW",
      name: "Risco de Caixa",
      description: "Saldo disponível menor que pendências",
      baseWeight: 95,
      cooldownDays: 3,
      condition: (data) => data.summary.totalBalance < data.summary.pendingPayments,
      generate: (data) => ({
        title: "Risco de Caixa",
        message: `Suas contas a pagar (R$ ${data.summary.pendingPayments.toFixed(2)}) superam seu saldo de R$ ${data.summary.totalBalance.toFixed(2)}.`,
        priority: "HIGH",
        actionLabel: "Ver contas a pagar",
        actionUrl: "/contas-a-pagar"
      })
    },
    {
      id: "CASHFLOW_CRITICAL",
      category: "CASHFLOW",
      name: "Caixa Crítico",
      description: "Saldo negativo ou zero",
      baseWeight: 100,
      cooldownDays: 1,
      condition: (data) => data.summary.totalBalance <= 0,
      generate: (data) => ({
        title: "Caixa Crítico",
        message: "Seu saldo está negativo ou zero. Evite novas despesas até normalizar.",
        priority: "HIGH",
        actionLabel: "Ver contas",
        actionUrl: "/contas"
      })
    },
    {
      id: "CASHFLOW_POSITIVE",
      category: "CASHFLOW",
      name: "Fluxo Positivo",
      description: "Mais receitas que despesas",
      baseWeight: 60,
      cooldownDays: 7,
      condition: (data) => data.summary.netFlow > 0 && data.summary.monthlyIncome > 0,
      generate: (data) => ({
        title: "Fluxo Positivo",
        message: `Parabéns! Você fechou o mês com saldo positivo de R$ ${data.summary.netFlow.toFixed(2)}.`,
        priority: "LOW",
        actionLabel: "Ver detalhes",
        actionUrl: "/fluxo-caixa"
      })
    },
    {
      id: "CASHFLOW_PROJECTED_DEFICIT",
      category: "CASHFLOW",
      name: "Déficit Projetado",
      description: "Projeção de saldo negativo nos próximos 30 dias",
      baseWeight: 85,
      cooldownDays: 5,
      condition: (data, intel) => {
        if (!intel?.recentMonths) return false;
        const recent = intel.recentMonths.slice(-3);
        if (recent.length < 3) return false;
        return recent.every(m => m.expenses > m.income);
      },
      generate: () => ({
        title: "Atenção: Déficit Projetado",
        message: "Nos últimos meses seus gastos superaram receitas. Revise seus lançamentos.",
        priority: "HIGH",
        actionLabel: "Ver fluxo",
        actionUrl: "/fluxo-caixa"
      })
    },

    // ═══════════════════════════════════════════════════════════════
    // BUDGET - Orçamento
    // ═══════════════════════════════════════════════════════════════
    {
      id: "BUDGET_OVERRUN_40",
      category: "BUDGET",
      name: "Orçamento Estourado",
      description: "Categoria consume >40% da renda",
      baseWeight: 75,
      cooldownDays: 7,
      condition: (data) => {
        const topCat = Object.entries(data.summary.expensesByCategory).sort(([, a], [, b]) => b - a)[0];
        return !!(topCat && topCat[1] > (data.summary.monthlyIncome * 0.4) && data.summary.monthlyIncome > 0);
      },
      generate: (data) => {
        const sorted = Object.entries(data.summary.expensesByCategory).sort(([, a], [, b]) => b - a);
        const topCat = sorted[0];
        const percentage = ((topCat[1] / data.summary.monthlyIncome) * 100).toFixed(0);
        return {
          title: "GastoElevado",
          message: `${topCat[0]} representa ${percentage}% da sua renda mensal. Considere ajustar.`,
          priority: "MEDIUM",
          actionLabel: "Ver relatórios",
          actionUrl: "/relatorios"
        };
      }
    },
    {
      id: "BUDGET_OVERRUN_50",
      category: "BUDGET",
      name: "Orçamento Crítico",
      description: "Categoria consume >50% da renda",
      baseWeight: 90,
      cooldownDays: 3,
      condition: (data) => {
        const topCat = Object.entries(data.summary.expensesByCategory).sort(([, a], [, b]) => b - a)[0];
        return !!(topCat && topCat[1] > (data.summary.monthlyIncome * 0.5) && data.summary.monthlyIncome > 0);
      },
      generate: (data) => {
        const sorted = Object.entries(data.summary.expensesByCategory).sort(([, a], [, b]) => b - a);
        const topCat = sorted[0];
        const percentage = ((topCat[1] / data.summary.monthlyIncome) * 100).toFixed(0);
        return {
          title: "Gasto Crítico",
          message: `${topCat[0]} consome ${percentage}% da renda! Ação recomendada.`,
          priority: "HIGH",
          actionLabel: "Criar orçamento",
          actionUrl: "/orcamentos"
        };
      }
    },
    {
      id: "BUDGET_ALL_CATEGORIES",
      category: "BUDGET",
      name: "Todas Categorias Estouradas",
      description: "Mais de 3 categorias acima de 80% do limite",
      baseWeight: 80,
      cooldownDays: 5,
      condition: (data, intel) => {
        if (!intel?.recentMonths || intel.recentMonths.length === 0) return false;
        const lastMonth = intel.recentMonths[intel.recentMonths.length - 1];
        const categories = Object.entries(lastMonth.categories);
        const overBudget = categories.filter(([, amount]) => {
          const budgetLimit = data.summary.monthlyIncome * 0.3;
          return amount > budgetLimit * 0.8;
        });
        return overBudget.length > 3;
      },
      generate: () => ({
        title: "Múltiplos Gastos Elevados",
        message: "Várias categorias estão acima do limite recomendado. Revise seus orçamentos.",
        priority: "HIGH",
        actionLabel: "Ver orçamentos",
        actionUrl: "/orcamentos"
      })
    },
    {
      id: "BUDGET_MONTHLY_TREND",
      category: "BUDGET",
      name: "Tendência de Crescimento",
      description: "Gastos cresceram 3 meses consecutivos",
      baseWeight: 75,
      cooldownDays: 14,
      condition: (data, intel) => {
        if (!intel?.recentMonths || intel.recentMonths.length < 3) return false;
        const last3 = intel.recentMonths.slice(-3);
        const expenses = last3.map(m => m.expenses);
        return expenses[2] > expenses[1] && expenses[1] > expenses[0];
      },
      generate: () => ({
        title: "Gastos em Crescimento",
        message: "Seus gastos cresceram nos últimos 3 meses. Vamos conter?",
        priority: "MEDIUM",
        actionLabel: "Ver análise",
        actionUrl: "/relatorios"
      })
    },

    // ═══════════════════════════════════════════════════════════════
    // DEBT - Dívidas
    // ═══════════════════════════════════════════════════════════════
    {
      id: "DEBT_HIGH_INTEREST",
      category: "DEBT",
      name: "Dívida de Alto Juros",
      description: "Em中使用 cheque especial或 cartão parcelado",
      baseWeight: 90,
      cooldownDays: 3,
      condition: (data, intel) => (intel?.debtLevel || 0) > 50,
      generate: (data) => ({
        title: "Atenção: Dívida Ativa",
        message: "Você tem dívidas ativas com juros altos. Priorize quitá-las.",
        priority: "HIGH",
        actionLabel: "Ver dívidas",
        actionUrl: "/contas-a-pagar"
      })
    },
    {
      id: "DEBT_CRESCENDO",
      category: "DEBT",
      name: "Dívida Crescendo",
      description: "Dívida aumentou nos últimos meses",
      baseWeight: 85,
      cooldownDays: 7,
      condition: (data, intel) => {
        if (!intel?.recentMonths || intel.recentMonths.length < 2) return false;
        const last2 = intel.recentMonths.slice(-2);
        return last2[1].expenses > last2[0].expenses;
      },
      generate: () => ({
        title: "Dívida Crescendo",
        message: "Suas despesas com dívidas aumentaram. Considere uma estratégia.",
        priority: "HIGH",
        actionLabel: "Ver fluxo",
        actionUrl: "/fluxo-caixa"
      })
    },
    {
      id: "DEBT_CREDIT_CARD",
      category: "DEBT",
      name: "依赖 de Crédito",
      description: "Usando cartão parcelado frequentemente",
      baseWeight: 80,
      cooldownDays: 14,
      condition: (data, intel) => intel?.stabilityScore ? intel.stabilityScore < 50 : false,
      generate: () => ({
        title: "Dependency de Crédito",
        message: "Você está usando muito crédito. Pague o total para evitar juros.",
        priority: "MEDIUM",
        actionLabel: "Ver contas",
        actionUrl: "/contas"
      })
    },
    {
      id: "DEBT_SNOWBALL_OPPORTUNITY",
      category: "DEBT",
      name: "Oportunidade Bola de Neve",
      description: "Tem condições de quitar dívida pequena",
      baseWeight: 50,
      cooldownDays: 30,
      condition: (data, intel) => {
        if (!intel || data.summary.pendingPayments < 1000) return false;
        return data.summary.netFlow > 500;
      },
      generate: (data) => ({
        title: "Oportunidade: Quitar Dívida",
        message: `Você pode quitar uma dívida de R$ 1.000 com seu fluxo atual.`,
        priority: "LOW",
        actionLabel: "Ver contas",
        actionUrl: "/contas-a-pagar"
      })
    },

    // ═══════════════════════════════════════════════════════════════
    // SAVINGS - Poupança
    // ═══════════════════════════════════════════════════════════════
    {
      id: "SAVINGS_RATE_LOW",
      category: "SAVINGS",
      name: "Taxa de Poupança Baixa",
      description: "Poupando menos de 10%",
      baseWeight: 50,
      cooldownDays: 14,
      condition: (data) => {
        const rate = data.summary.monthlyIncome > 0 
          ? (data.summary.netFlow / data.summary.monthlyIncome) 
          : 0;
        return rate > 0 && rate < 0.1 && data.summary.netFlow > 0;
      },
      generate: () => ({
        title: "Poupança Baixa",
        message: "Você está poupando menos de 10%. O ideal é >20%.",
        priority: "LOW",
        actionLabel: "Ver metas",
        actionUrl: "/orcamentos"
      })
    },
    {
      id: "SAVINGS_RATE_GOOD",
      category: "SAVINGS",
      name: "Boa Taxa de Poupança",
      description: "Poupando >20%",
      baseWeight: 70,
      cooldownDays: 14,
      condition: (data) => {
        const rate = data.summary.monthlyIncome > 0 
          ? (data.summary.netFlow / data.summary.monthlyIncome) 
          : 0;
        return rate >= 0.2;
      },
      generate: (data) => ({
        title: "Parabéns: Boa Poupança!",
        message: `Você está poupando ${((data.summary.netFlow / data.summary.monthlyIncome) * 100).toFixed(0)}%!`,
        priority: "LOW",
        actionLabel: "Investir",
        actionUrl: "/insights"
      })
    },
    {
      id: "SAVINGS_OPPORTUNITY",
      category: "SAVINGS",
      name: "Oportunidade de Economia",
      description: "Sobrou no mês, pode investir",
      baseWeight: 45,
      cooldownDays: 7,
      condition: (data) => data.summary.netFlow > (data.summary.monthlyIncome * 0.15) && data.summary.monthlyIncome > 0,
      generate: () => ({
        title: "Oportunidade de Investir",
        message: "Você tem folga este mês. Que tal investir o excedente?",
        priority: "LOW",
        actionLabel: "Ver investimentos",
        actionUrl: "/insights"
      })
    },
    {
      id: "SAVINGS_EMERGENCY FUND",
      category: "SAVINGS",
      name: "Reserva de Emergência",
      description: "Não tem reserva suficiente",
      baseWeight: 85,
      cooldownDays: 30,
      condition: (data, intel) => {
        if (!intel) return true;
        const recommended = data.summary.monthlyExpenses * 3;
        return data.summary.totalBalance < recommended;
      },
      generate: (data) => ({
        title: "Reserva de Emergência",
        message: `Recomendo ter R$ ${(data.summary.monthlyExpenses * 3).toFixed(2)} guardados.`,
        priority: "MEDIUM",
        actionLabel: "Criar reserva",
        actionUrl: "/insights"
      })
    },

    // ═══════════════════════════════════════════════════════════════
    // BEHAVIOR - Comportamento
    // ═══════════════════════════════════════════════════════════════
    {
      id: "BEHAVIOR_SPIKE",
      category: "BEHAVIOR",
      name: "Pico de Gastos",
      description: "Gasto acima do normal",
      baseWeight: 70,
      cooldownDays: 10,
      condition: (data, intel) => {
        if (!intel?.recentMonths || intel.recentMonths.length < 2) return false;
        const avg = intel.recentMonths.slice(-3).reduce((s, m) => s + m.expenses, 0) / 3;
        const current = data.summary.monthlyExpenses;
        return current > avg * 1.5;
      },
      generate: () => ({
        title: "Pico de Gastos",
        message: "Seus gastos este mês estão 50% acima da média. Algo anormal?",
        priority: "MEDIUM",
        actionLabel: "Ver detalhes",
        actionUrl: "/movimentacoes"
      })
    },
    {
      id: "BEHAVIOR_SHIFT",
      category: "BEHAVIOR",
      name: "Mudança de Padrão",
      description: "Mudança significativa no comportamento",
      baseWeight: 75,
      cooldownDays: 14,
      condition: (_data, intel) => !!(intel?.recentPatternShift && (intel?.behaviorChangeScore || 0) > 40),
      generate: () => ({
        title: "Mudança de Comportamento",
        message: "Notei mudanças nos seus padrões. Está tudo bem?",
        priority: "MEDIUM",
        actionLabel: "Ver relatórios",
        actionUrl: "/relatorios"
      })
    },
    {
      id: "BEHAVIOR_IMPROVING",
      category: "BEHAVIOR",
      name: "Melhorando",
      description: "Melhora consistente",
      baseWeight: 60,
      cooldownDays: 21,
      condition: (data, intel) => {
        if (!intel?.recentMonths || intel.recentMonths.length < 3) return false;
        const last3 = intel.recentMonths.slice(-3);
        return last3.every(m => m.expenses < m.income);
      },
      generate: () => ({
        title: "Melhoria Constante",
        message: "Você está mantendo boas práticas há 3 meses. Continue!",
        priority: "LOW",
        actionLabel: "Ver evolução",
        actionUrl: "/relatorios"
      })
    },

    // ═══════════════════════════════════════════════════════════════
    // SEASONAL - Sazonalidade
    // ═══════════════════════════════════════════════════════════════
    {
      id: "SEASONAL_END_YEAR",
      category: "SEASONAL",
      name: "Fim de Ano",
      description: " повышенные gastos em fim de ano",
      baseWeight: 65,
      cooldownDays: 60,
      condition: (data) => {
        const now = new Date();
        const month = now.getMonth();
        return month === 11 || month === 0;
      },
      generate: () => ({
        title: "Atenção: Fim de Ano",
        message: "Prepare-se para gastos natalinos. Planeje-se com antecedência.",
        priority: "MEDIUM",
        actionLabel: "Planejar",
        actionUrl: "/orcamentos"
      })
    },
    {
      id: "SEASONAL_TAX",
      category: "SEASONAL",
      name: "Imposto",
      description: "emporada de IPTU/IR",
      baseWeight: 70,
      cooldownDays: 90,
      condition: () => {
        const now = new Date();
        const month = now.getMonth();
        return month === 2 || month === 3 || month === 8;
      },
      generate: () => ({
        title: "Atenção: Impostos",
        message: "Lembre-se de separar para IPTU/IR. Planeje-se antecipadamente.",
        priority: "MEDIUM",
        actionLabel: "Ver metas",
        actionUrl: "/orcamentos"
      })
    },

    // ═══════════════════════════════════════════════════════════════
    // GOAL - Metas
    // ═══════════════════════════════════════════════════════════════
    {
      id: "GOAL_ON_TRACK",
      category: "GOAL",
      name: "Meta no Caminho",
      description: "Meta de economia está no caminho",
      baseWeight: 55,
      cooldownDays: 14,
      condition: (data, intel) => {
        if (!intel?.recentMonths || intel.recentMonths.length === 0) return false;
        const lastMonth = intel.recentMonths[intel.recentMonths.length - 1];
        return lastMonth.savings > data.summary.monthlyIncome * 0.15;
      },
      generate: () => ({
        title: "Meta no Caminho",
        message: "Você está no caminho certo para sua meta de economia!",
        priority: "LOW",
        actionLabel: "Ver metas",
        actionUrl: "/orcamentos"
      })
    },
    {
      id: "GOAL_BEHIND",
      category: "GOAL",
      name: "Meta Atrasada",
      description: "Não atingiu meta de economia",
      baseWeight: 65,
      cooldownDays: 7,
      condition: (data, intel) => {
        if (!intel || !intel.recentMonths || intel.recentMonths.length === 0) return false;
        const lastMonth = intel.recentMonths[intel.recentMonths.length - 1];
        return lastMonth.savings < data.summary.monthlyIncome * 0.1;
      },
      generate: () => ({
        title: "Meta Atrasada",
        message: "Você está abaixo da meta de economia este mês. Próximo mês tenta novamente?",
        priority: "MEDIUM",
        actionLabel: "Ver relatórios",
        actionUrl: "/relatorios"
      })
    }
  ];

  async evaluate(
    data: UserFinancialData, 
    intel?: UserIntel, 
    recentInsightIds: string[] = []
  ): Promise<PicoClawInsight[]> {
    const triggeredRules: Array<{ rule: KnowledgeRule; score: number }> = [];

    for (const rule of this.rules) {
      if (recentInsightIds.includes(rule.id)) continue;
      
      if (rule.condition(data, intel)) {
        let score = rule.baseWeight;
        
        if (intel) {
          if (rule.id.includes("DEBT") && (intel.debtLevel || 0) > 70) score += 15;
          if (rule.id.includes("CASHFLOW") && (intel.riskScore || 0) > 80) score += 10;
          if (rule.id.includes("SAVINGS") && (intel.savingsRate || 0) < 0.1) score += 10;
        }
        
        triggeredRules.push({ rule, score });
      }
    }

    return triggeredRules
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(r => r.rule.generate(data));
  }

  getRulesCount(): number {
    return this.rules.length;
  }

  getRulesByCategory(category: InsightCategory): KnowledgeRule[] {
    return this.rules.filter(r => r.category === category);
  }
}

export const reasoningEngineV2 = new ReasoningEngineV2();
export { ReasoningEngineV2 as ReasoningEngine };