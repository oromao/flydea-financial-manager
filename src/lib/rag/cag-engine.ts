import { UserFinancialData } from "@/lib/financial-rag";

export interface FinancialInsight {
  id: string;
  type: "URGENTE" | "IMPACTO" | "INFORMAÇÃO";
  title: string;
  message: string;
  score: number;
  category?: string;
  actionLabel?: string;
  actionUrl?: string;
}

export interface FinancialScores {
  riskScore: number; // 0-100, higher is worse
  expenseRatio: number; // expenses / income
  concentrationScore: number; // top category / total
  savingsRate: number; // (income - expenses) / income
  healthScore: number; // 0-100, higher is better
}

export class CAGEngine {
  /**
   * Calculates key financial scores based on user data
   */
  calculateScores(data: UserFinancialData): FinancialScores {
    const { summary } = data;
    const { monthlyIncome, monthlyExpenses, totalBalance, netFlow, expensesByCategory } = summary;

    const income = monthlyIncome || 1; // Avoid division by zero
    const expenseRatio = monthlyExpenses / income;
    const savingsRate = netFlow / income;

    // Risk score: projected balance < 0 in 7 days?
    // Simplified: if current balance < pending + 25% of avg expenses
    const avgDailyExpense = monthlyExpenses / 30;
    const threshold = summary.pendingPayments + (avgDailyExpense * 7);
    let riskScore = totalBalance < threshold ? 80 : 20;
    if (totalBalance < summary.pendingPayments) riskScore = 100;
    if (netFlow < 0 && totalBalance < Math.abs(netFlow)) riskScore = 90;

    // Concentration: % of top category
    const sortedCategories = Object.entries(expensesByCategory).sort(([, a], [, b]) => b - a);
    const topCatValue = sortedCategories[0]?.[1] || 0;
    const concentrationScore = (topCatValue / (monthlyExpenses || 1)) * 100;

    // Health Score: inverse of risk + savings weight
    let healthScore = 100 - (riskScore * 0.5);
    if (savingsRate > 0.2) healthScore += 20;
    if (expenseRatio > 0.9) healthScore -= 30;
    healthScore = Math.max(0, Math.min(100, healthScore));

    return {
      riskScore,
      expenseRatio,
      concentrationScore,
      savingsRate,
      healthScore,
    };
  }

  /**
   * Extracts meaningful features and anomalies
   */
  extractFeatures(data: UserFinancialData) {
    const { summary, transactions } = data;
    const topExpenses = Object.entries(summary.expensesByCategory)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);

    // Detect anomalies (transactions > 2x average of that category or overall)
    const avgTransaction = summary.monthlyExpenses / (transactions.length || 1);
    const anomalies = transactions.filter(t => t.type === "EXPENSE" && t.amount > avgTransaction * 2.5);

    // Detect trends (mocked for now, needs historical data)
    const trend = summary.netFlow > 0 ? "POSITIVE" : "NEGATIVE";

    return {
      topExpenses,
      anomalies,
      trend,
    };
  }

  /**
   * Generates and ranks insights based on scores and features
   */
  rankInsights(data: UserFinancialData): FinancialInsight[] {
    const scores = this.calculateScores(data);
    const features = this.extractFeatures(data);
    const insights: FinancialInsight[] = [];

    const { summary } = data;

    // 1. Negative Risk (URGENTE)
    if (scores.riskScore >= 80) {
      insights.push({
        id: "risk-negative",
        type: "URGENTE",
        title: "Risco de saldo negativo",
        message: scores.riskScore === 100 
          ? `Atenção! Suas contas pendentes (R$ ${summary.pendingPayments.toFixed(2)}) superam seu saldo atual.` 
          : `Cuidado! Se mantiver o ritmo, seu saldo pode ficar negativo nos próximos 7 dias.`,
        score: scores.riskScore,
        actionLabel: "Ver pendências",
        actionUrl: "/contas-a-pagar",
      });
    }

    // 2. High Concentration (IMPACTO)
    if (scores.concentrationScore > 40 && features.topExpenses[0]) {
      const [name, value] = features.topExpenses[0];
      insights.push({
        id: "high-concentration",
        type: "IMPACTO",
        title: `Gasto alto em ${name}`,
        message: `A categoria ${name} representa ${scores.concentrationScore.toFixed(0)}% do seu gasto total (R$ ${value.toFixed(2)}). Que tal revisar?`,
        score: scores.concentrationScore,
        category: name,
        actionLabel: "Analisar categoria",
        actionUrl: "/relatorios",
      });
    }

    // 3. Negative Flow (URGENTE/IMPACTO)
    if (summary.netFlow < 0) {
      insights.push({
        id: "negative-flow",
        type: "URGENTE",
        title: "Despesas superando receitas",
        message: `Este mês você gastou R$ ${Math.abs(summary.netFlow).toFixed(2)} a mais do que recebeu.`,
        score: 90,
        actionLabel: "Onde cortar?",
        actionUrl: "/insights",
      });
    }

    // 4. Anomalies (INFORMAÇÃO)
    if (features.anomalies.length > 0) {
      const biggest = features.anomalies[0];
      insights.push({
        id: "anomaly-detected",
        type: "INFORMAÇÃO",
        title: "Gasto atípico detectado",
        message: `Identifiquei um gasto acima da sua média: ${biggest.description} (R$ ${biggest.amount.toFixed(2)}).`,
        score: 50,
        actionLabel: "Ver detalhes",
        actionUrl: "/movimentacoes",
      });
    }

    // 5. Positive Savings (INFORMAÇÃO)
    if (scores.savingsRate > 0.1) {
      insights.push({
        id: "good-savings",
        type: "INFORMAÇÃO",
        title: "Ótimo trabalho!",
        message: `Você está poupando ${(scores.savingsRate * 100).toFixed(0)}% da sua renda. Que tal investir esse excedente?`,
        score: 70,
        actionLabel: "Ver opções",
        actionUrl: "/insights",
      });
    }

    // Sort by type priority and then score
    const typePriority = { URGENTE: 3, IMPACTO: 2, INFORMAÇÃO: 1 };
    return insights.sort((a, b) => {
      if (typePriority[a.type] !== typePriority[b.type]) {
        return typePriority[b.type] - typePriority[a.type];
      }
      return b.score - a.score;
    });
  }

  /**
   * Generates a proactive dynamic message for the hero/home
   */
  generateProactiveMessage(data: UserFinancialData): string {
    const ranked = this.rankInsights(data);
    if (ranked.length === 0) {
      return "Sua vida financeira parece estar em ordem! Continue acompanhando seus gastos diariamente.";
    }

    const top = ranked[0];
    const variations: Record<string, string[]> = {
      URGENTE: [
        `⚠️ Alerta: ${top.message}`,
        `Atenção aqui: ${top.message}`,
        `Precisamos falar sobre isso: ${top.message}`
      ],
      IMPACTO: [
        `💡 Insight: ${top.message}`,
        `Você sabia? ${top.message}`,
        `Olha isso: ${top.message}`
      ],
      INFORMAÇÃO: [
        `ℹ️ Sabia que... ${top.message}`,
        `Dica do dia: ${top.message}`,
        `Status: ${top.message}`
      ]
    };

    const options = variations[top.type] || variations.INFORMAÇÃO;
    return options[Math.floor(Math.random() * options.length)];
  }
}

export const cagEngine = new CAGEngine();
