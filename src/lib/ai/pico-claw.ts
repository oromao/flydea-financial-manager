import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { intentEngine, UserIntent } from "./intent-engine";
import { reasoningEngine } from "./reasoning-engine";

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
   * Pragmatic data fetcher - Aggregates data for the reasoning engine.
   */
  async fetchData(userId: string): Promise<UserFinancialData> {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const [accounts, transactions] = await Promise.all([
      prisma.account.findMany({ where: { userId } }),
      prisma.transaction.findMany({ 
        where: { userId, date: { gte: monthStart } }, 
        include: { category: true } 
      })
    ]);

    const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);
    const monthlyIncome = transactions.filter(t => t.type === "INCOME").reduce((sum, t) => sum + t.amount, 0);
    const monthlyExpenses = transactions.filter(t => t.type === "EXPENSE").reduce((sum, t) => sum + t.amount, 0);
    
    const expensesByCategory: Record<string, number> = {};
    transactions.filter(t => t.type === "EXPENSE").forEach(t => {
      const name = t.category?.name || "Outros";
      expensesByCategory[name] = (expensesByCategory[name] || 0) + t.amount;
    });

    const pendingPayments = transactions
      .filter(t => t.type === "EXPENSE" && t.paymentStatus === "PENDING")
      .reduce((sum, t) => sum + t.amount, 0);

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

  /**
   * Classifies user query into intent and generates contextual response.
   */
  async processQuery(userId: string, query: string) {
    const match = intentEngine.classify(query);
    const data = await this.fetchData(userId);
    
    let response = "";
    const summary = await this.getQuickSummary(data);

    switch (match.intent) {
      case "QUERY":
        response = `Analisando seus dados: ${summary}`;
        break;
      case "INSIGHT":
        const insights = await this.generateInsights(data);
        response = insights.length > 0 
          ? `Tenho alguns insights para você. ${insights[0].title}: ${insights[0].message}`
          : `Suas finanças parecem saudáveis! ${summary}`;
        break;
      case "ACTION":
        response = "Você pode gerenciar seus lançamentos na aba de Movimentações ou usar o botão 'Novo' no topo da página.";
        break;
      case "HELP":
        response = "Eu sou o PicoClaw, sua mini IA financeira. Posso te ajudar a consultar saldos, gerar insights de economia e navegar pelo sistema.";
        break;
      default:
        response = `Não tenho certeza se entendi, mas aqui está um resumo: ${summary}`;
    }

    return {
      intent: match.intent,
      confidence: match.confidence,
      response,
      data
    };
  }

  async generateInsights(data: UserFinancialData): Promise<PicoClawInsight[]> {
    const { userId } = data;
    logger.info("PicoClaw: evaluating reasoning engine", { userId });

    // 0. Fetch user intelligence & recent insights (Memory Engine)
    const [intel, recentInsights] = await Promise.all([
      prisma.userIntelligence.findUnique({ where: { userId } }),
      prisma.insight.findMany({
        where: { 
          userId, 
          createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } 
        },
        select: { type: true }
      })
    ]);

    const recentTypes = recentInsights.map(i => i.type);
    
    // 1. Core Reasoning Engine Evaluation
    const insights = await reasoningEngine.evaluate(data, intel, recentTypes);

    // 2. Persist new insights asynchronously
    if (insights.length > 0) {
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

    return insights;
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

