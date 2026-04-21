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
    const { summary } = data;
    const insights: PicoClawInsight[] = [];

    logger.info("PicoClaw: generating insights", { userId: data.userId });

    // Rule 1: Immediate Cashflow Risk
    if (summary.totalBalance < summary.pendingPayments) {
      insights.push({
        title: "Risco de Caixa",
        message: `Suas pendências (R$ ${summary.pendingPayments.toFixed(2)}) superam seu saldo disponível.`,
        priority: "HIGH",
        actionLabel: "Pagar agora",
        actionUrl: "/contas-a-pagar"
      });
    }

    // Rule 2: Budget Overrun
    const topCat = Object.entries(summary.expensesByCategory)
      .sort(([, a], [, b]) => b - a)[0];
    
    if (topCat && topCat[1] > (summary.monthlyIncome * 0.4)) {
      insights.push({
        title: "Alerta de Gastos",
        message: `A categoria ${topCat[0]} está consumindo ${((topCat[1] / summary.monthlyIncome) * 100).toFixed(0)}% da sua renda.`,
        priority: "MEDIUM",
        actionLabel: "Ver detalhes",
        actionUrl: "/relatorios"
      });
    }

    // Rule 3: Savings Opportunity
    if (summary.netFlow > (summary.monthlyIncome * 0.2)) {
      insights.push({
        title: "Oportunidade",
        message: "Você poupou mais de 20% este mês. Que tal investir o excedente?",
        priority: "LOW",
        actionLabel: "Investir",
        actionUrl: "/insights"
      });
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
