import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export interface UserFinancialData {
  userId: string;
  summary: {
    totalBalance: number;
    monthlyIncome: number;
    monthlyExpenses: number;
    netFlow: number;
    pendingPayments: number;
    expensesByCategory: Record<string, number>;
  };
}

export interface PicoClawInsight {
  title: string;
  message: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  actionLabel?: string;
  actionUrl?: string;
}

export class PicoClawEngine {
  /**
   * Pragmatic data fetcher - No RAG, no complex memory.
   */
  async fetchData(userId: string): Promise<UserFinancialData> {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [accounts, transactions] = await Promise.all([
      prisma.account.findMany({ where: { userId } }),
      prisma.transaction.findMany({ where: { userId, date: { gte: monthStart } }, include: { category: true } })
    ]);

    const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);
    const monthlyIncome = transactions.filter(t => t.type === "INCOME").reduce((sum, t) => sum + t.amount, 0);
    const monthlyExpenses = transactions.filter(t => t.type === "EXPENSE").reduce((sum, t) => sum + t.amount, 0);
    
    const expensesByCategory: Record<string, number> = {};
    transactions.filter(t => t.type === "EXPENSE").forEach(t => {
      const name = t.category?.name || "Outros";
      expensesByCategory[name] = (expensesByCategory[name] || 0) + t.amount;
    });

    const pendingPayments = transactions.filter(t => t.type === "EXPENSE" && t.paymentStatus === "PENDING").reduce((sum, t) => sum + t.amount, 0);

    return {
      userId,
      summary: {
        totalBalance,
        monthlyIncome,
        monthlyExpenses,
        netFlow: monthlyIncome - monthlyExpenses,
        pendingPayments,
        expensesByCategory
      }
    };
  }

  async generateInsights(data: UserFinancialData): Promise<PicoClawInsight[]> {
    const { summary, userId } = data;
    const insights: PicoClawInsight[] = [];

    logger.info("PicoClaw: generating evolutive insights", { userId });

    // 0. Fetch user intelligence & recent insights (Evolution)
    const [intel, recentInsights] = await Promise.all([
      prisma.userIntelligence.findUnique({ where: { userId } }),
      prisma.insight.findMany({
        where: { userId, createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }, // Last 7 days
        select: { type: true, content: true }
      })
    ]);

    const hasSeenInsight = (title: string) => recentInsights.some(i => i.type === title);

    // 1. Immediate Cashflow Risk
    if (summary.totalBalance < summary.pendingPayments && !hasSeenInsight("Risco de Caixa")) {
      insights.push({
        title: "Risco de Caixa",
        message: `Suas pendências (R$ ${summary.pendingPayments.toFixed(2)}) superam seu saldo disponível.`,
        priority: "HIGH",
        actionLabel: "Pagar agora",
        actionUrl: "/contas-a-pagar"
      });
    }

    // 2. Budget Overrun & Concentration
    const topCat = Object.entries(summary.expensesByCategory)
      .sort(([, a], [, b]) => b - a)[0];
    
    if (topCat && topCat[1] > (summary.monthlyIncome * 0.4) && summary.monthlyIncome > 0 && !hasSeenInsight("Alerta de Gastos")) {
      insights.push({
        title: "Alerta de Gastos",
        message: `A categoria ${topCat[0]} está consumindo ${((topCat[1] / summary.monthlyIncome) * 100).toFixed(0)}% da sua renda.`,
        priority: "MEDIUM",
        actionLabel: "Ver detalhes",
        actionUrl: "/relatorios"
      });
    }

    // 3. Savings Opportunity
    if (summary.netFlow > (summary.monthlyIncome * 0.2) && summary.monthlyIncome > 0 && !hasSeenInsight("Oportunidade")) {
      insights.push({
        title: "Oportunidade",
        message: "Você poupou mais de 20% este mês. Que tal investir o excedente?",
        priority: "LOW",
        actionLabel: "Investir",
        actionUrl: "/insights"
      });
    }

    // 4. Pattern Shift (Déficit)
    if (summary.monthlyExpenses > summary.monthlyIncome && summary.monthlyIncome > 0 && !hasSeenInsight("Déficit Mensal")) {
       insights.push({
         title: "Déficit Mensal",
         message: "Seus gastos este mês superaram suas receitas. Revise seus lançamentos.",
         priority: "HIGH",
         actionLabel: "Revisar",
         actionUrl: "/movimentacoes"
       });
    }

    // 5. Behavioral Evolution Insight (If intelligence detected drift)
    if (intel && intel.recentPatternShift && intel.behaviorChangeScore > 40 && !hasSeenInsight("Mudança de Comportamento")) {
       insights.push({
         title: "Mudança de Comportamento",
         message: "Notei um aumento recente na frequência e volume dos seus gastos comparado aos meses anteriores. Cuidado com compras impulsivas.",
         priority: "HIGH",
         actionLabel: "Ver Orçamentos",
         actionUrl: "/orcamentos"
       });
    }

    // Persist new insights so they aren't repeated tomorrow
    if (insights.length > 0) {
      // Run this asynchronously so it doesn't block the return
      void (async () => {
        try {
          await prisma.insight.createMany({
            data: insights.map(i => ({
              userId,
              type: i.title,
              content: i.message,
              priority: i.priority,
              status: "SHOWN"
            }))
          });
        } catch (e) {
          logger.error("Error persisting PicoClaw insights", { error: e });
        }
      })();
    }

    return insights.sort((a, b) => {
      const p = { HIGH: 3, MEDIUM: 2, LOW: 1 };
      return p[b.priority] - p[a.priority];
    });
  }

  /**
   * Quick summary of financial health
   */
  async getQuickSummary(data: UserFinancialData): Promise<string> {
    const { summary } = data;
    const status = summary.netFlow >= 0 ? "em dia" : "no vermelho";
    return `Seu saldo é de R$ ${summary.totalBalance.toFixed(2)}. Este mês você está ${status} por R$ ${Math.abs(summary.netFlow).toFixed(2)}.`;
  }
}

export const picoClaw = new PicoClawEngine();
