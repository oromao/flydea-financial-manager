import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { intentEngine, UserIntent } from "./intent-engine";
import { reasoningEngineV2, UserIntel } from "./reasoning-v2";
import { knowledgeService } from "./knowledge-base/service";
import { memoryManager } from "./memory-manager";
import { financialScorer, FinancialScore } from "./behavior/financial-scorer";
import { behaviorDetector, BehaviorInsight } from "./behavior/detector";
import { PicoClawInsight } from "./pico-claw";

export interface PicoClawResponse {
  intent: UserIntent;
  confidence: number;
  message: string;
  insights: PicoClawInsight[];
  financialScore?: FinancialScore;
  behavior?: BehaviorInsight;
  suggestedAction?: {
    label: string;
    url: string;
  };
  sources?: string[];
}

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

class PicoClawOrchestrator {
  /**
   * Processa consulta do usuário e retorna resposta contextualizada
   */
  async processQuery(userId: string, query: string): Promise<PicoClawResponse> {
    try {
      // 1. Classify intent
      const intentResult = intentEngine.classify(query);
      logger.info("PicoClaw: Intent classified", { userId, intent: intentResult.intent });

      // 2. Fetch user financial data
      const data = await this.fetchUserData(userId);

      // 3. Get user intelligence for personalization
      const intel = await this.getUserIntel(userId);

      // 4. Get recent insights (for anti-repetition)
      const recentInsights = await this.getRecentInsights(userId);

      // 5. Generate insights using Reasoning Engine v2 (20+ rules)
      const insights = await reasoningEngineV2.evaluate(data, intel, recentInsights.map(i => i.id));
      logger.info("PicoClaw: Generated insights", { count: insights.length });

      // 6. Get knowledge base augmentation
      const knowledge = await knowledgeService.getRelevantNodes(query, 2);

      // 7. Calculate financial score
      const financialScore = await financialScorer.calculate(userId, data);

      // 8. Detect behavior changes
      const behavior = await behaviorDetector.detect(userId, data);

      // 9. Build response
      const response = this.buildResponse({
        intentResult,
        insights,
        knowledge,
        financialScore,
        behavior,
        data
      });

      // 10. Log interaction
      await this.logInteraction(userId, query, intentResult.intent);

      return response;
    } catch (error) {
      logger.error("PicoClaw: Error processing query", { error, userId });
      return this.buildErrorResponse();
    }
  }

  /**
   * Busca dados financeiros do usuário
   */
  private async fetchUserData(userId: string): Promise<UserFinancialData> {
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
    const monthlyIncome = transactions
      .filter(t => t.type === "INCOME")
      .reduce((sum, t) => sum + t.amount, 0);
    const monthlyExpenses = transactions
      .filter(t => t.type === "EXPENSE")
      .reduce((sum, t) => sum + t.amount, 0);

    const expensesByCategory: Record<string, number> = {};
    transactions
      .filter(t => t.type === "EXPENSE")
      .forEach(t => {
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
   * Carrega inteligência do usuário
   */
  private async getUserIntel(userId: string): Promise<UserIntel> {
    const [intel, recentInsights, transactions] = await Promise.all([
      prisma.userIntelligence.findUnique({ where: { userId } }),
      prisma.insight.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 20
      }),
      prisma.transaction.findMany({
        where: {
          userId,
          date: { gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) }
        },
        select: { amount: true, type: true, date: true }
      })
    ]);

    // Calculate monthly averages
    const last3Months = this.calculateLast3Months(transactions);

    return {
      riskScore: intel?.riskScore || 50,
      financialScore: intel?.financialScore,
      recentPatternShift: intel?.recentPatternShift || false,
      behaviorChangeScore: intel?.behaviorChangeScore || 0,
      recentMonths: last3Months
    };
  }

  private calculateLast3Months(transactions: Array<{ amount: number; type: string; date: Date }>) {
    const months: Record<string, { income: number; expenses: number; categories: Record<string, number> }> = {};

    transactions.forEach(t => {
      const month = t.date.toISOString().slice(0, 7);
      if (!months[month]) {
        months[month] = { income: 0, expenses: 0, categories: {} };
      }
      if (t.type === "INCOME") {
        months[month].income += t.amount;
      } else {
        months[month].expenses += t.amount;
      }
    });

    return Object.entries(months)
      .sort(([a], [b]) => b.localeCompare(a))
      .slice(0, 3)
      .map(([month, data]) => ({
        month,
        income: data.income,
        expenses: data.expenses,
        savings: data.income - data.expenses,
        categories: data.categories
      }));
  }

  /**
   * Busca insights recentes (para anti-repetição)
   */
  private async getRecentInsights(userId: string) {
    return prisma.insight.findMany({
      where: {
        userId,
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      },
      select: { id: true },
      take: 5
    });
  }

  /**
   * Constrói resposta final
   */
  private buildResponse({
    intentResult,
    insights,
    knowledge,
    financialScore,
    behavior,
    data
  }: {
    intentResult: { intent: UserIntent; confidence: number };
    insights: PicoClawInsight[];
    knowledge: { title: string }[];
    financialScore: FinancialScore;
    behavior?: BehaviorInsight | null;
    data: UserFinancialData;
  }): PicoClawResponse {
    let message = "";

    switch (intentResult.intent) {
      case "QUERY":
        message = this.buildQueryResponse(data);
        break;
      case "INSIGHT":
        message = insights.length > 0
          ? insights[0].message
          : `Score financeiro: ${financialScore.overall}/100 (${financialScore.category})`;
        break;
      case "ACTION":
        message = "Vá para a seção de Transações ou use o botão + para adicionar.";
        break;
      case "HELP":
        message = this.buildHelpResponse();
        break;
      default:
        message = this.buildDefaultResponse(data);
    }

    const suggestedAction = insights.length > 0 && insights[0].actionUrl
      ? { label: insights[0].actionLabel || "Ação", url: insights[0].actionUrl }
      : undefined;

    return {
      intent: intentResult.intent,
      confidence: intentResult.confidence,
      message,
      insights: insights.slice(0, 3),
      financialScore,
      behavior: behavior || undefined,
      suggestedAction,
      sources: knowledge.map(k => k.title)
    };
  }

  private buildQueryResponse(data: UserFinancialData): string {
    const { summary } = data;
    const netFlow = summary.netFlow;
    const status = netFlow >= 0 ? "positivo" : "negativo";
    return `Saldo total: R$ ${summary.totalBalance.toFixed(2)}. Este mês: ${status} R$ ${Math.abs(netFlow).toFixed(2)}.`;
  }

  private buildHelpResponse(): string {
    return `Posso ajudar com: saldos, análises, controle de gastos, orçamentos e insights. O que você precisa?`;
  }

  private buildDefaultResponse(data: UserFinancialData): string {
    const { summary } = data;
    return `Seu saldo é R$ ${summary.totalBalance.toFixed(2)}. Deseja algo específico?`;
  }

  private buildErrorResponse(): PicoClawResponse {
    return {
      intent: "UNKNOWN",
      confidence: 0,
      message: "Desculpe, tuvimos um problema. Tente novamente.",
      insights: []
    };
  }

  /**
   * Loga interação para aprendizado
   */
  private async logInteraction(userId: string, query: string, intent: UserIntent) {
    try {
      await prisma.auditLog.create({
        data: {
          userId,
          action: "AI_QUERY",
          entity: "pico-claw",
          entityId: userId,
          details: query,
          metadata: { intent }
        }
      });
    } catch (e) {
      logger.error("Error logging interaction", { error: e });
    }
  }

  /**
   * Get quick summary for dashboard
   */
  async getQuickSummary(userId: string) {
    const data = await this.fetchUserData(userId);
    const score = await financialScorer.calculate(userId, data);

    return {
      totalBalance: data.summary.totalBalance,
      monthlyNetFlow: data.summary.netFlow,
      financialScore: score.overall,
      scoreCategory: score.category
    };
  }
}

export const picoClawV2 = new PicoClawOrchestrator();
export { PicoClawOrchestrator as PicoClawEngine };