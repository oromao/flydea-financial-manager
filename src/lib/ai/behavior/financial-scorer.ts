import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import type { UserFinancialData } from "../pico-claw";

export type FinancialScoreCategory = 
  | "EXCELLENT" 
  | "GOOD" 
  | "FAIR" 
  | "POOR" 
  | "CRITICAL";

export interface FinancialScore {
  overall: number;
  category: FinancialScoreCategory;
  components: {
    control: number;
    debt: number;
    stability: number;
    savings: number;
    behavior: number;
  };
  recommendation: string;
}

export class FinancialScorer {
  /**
   * Calculates comprehensive financial score (0-100)
   */
  async calculate(userId: string, data: UserFinancialData): Promise<FinancialScore> {
    // 1. Spending Control Score (0-25)
    const control = this.calculateControlScore(data);

    // 2. Debt Level Score (0-20)
    const debt = await this.calculateDebtScore(userId);

    // 3. Stability Score (0-20)
    const stability = await this.calculateStabilityScore(userId);

    // 4. Savings Rate Score (0-20)
    const savings = this.calculateSavingsScore(data);

    // 5. Behavior Score (0-15)
    const behavior = await this.calculateBehaviorScore(userId);

    const overall = control + debt + stability + savings + behavior;
    const category = this.categorizeScore(overall);
    const recommendation = this.generateRecommendation(overall, category);

    // Persist score
    try {
      await prisma.userIntelligence.upsert({
        where: { userId },
        create: {
          userId,
          riskScore: 100 - overall,
          financialScore: overall
        },
        update: {
          riskScore: 100 - overall,
          financialScore: overall
        }
      });
    } catch (e) {
      logger.error("Error persisting financial score", { error: e });
    }

    return {
      overall,
      category,
      components: { control, debt, stability, savings, behavior },
      recommendation
    };
  }

  private calculateControlScore(data: UserFinancialData): number {
    let score = 25;
    const income = data.summary.monthlyIncome || 1;
    const expenses = data.summary.monthlyExpenses;
    const ratio = expenses / income;

    if (ratio > 1.0) score = 0;
    else if (ratio > 0.9) score = 5;
    else if (ratio > 0.8) score = 10;
    else if (ratio > 0.7) score = 15;
    else if (ratio > 0.5) score = 20;
    else score = 25;

    return score;
  }

  private async calculateDebtScore(userId: string): Promise<number> {
    let score = 20;
    
    const pending = await prisma.transaction.findMany({
      where: {
        userId,
        type: "EXPENSE",
        paymentStatus: "PENDING"
      },
      select: { amount: true }
    });
    
    const pendingTotal = pending.reduce((sum, t) => sum + t.amount, 0);
    const transactions = await prisma.transaction.findMany({
      where: { userId },
      select: { amount: true, type: true }
    });
    
    const income = transactions
      .filter(t => t.type === "INCOME")
      .reduce((sum, t) => sum + t.amount, 0);
    
    if (income === 0) return 10;
    
    const debtRatio = pendingTotal / income;
    
    if (debtRatio > 1.0) score = 0;
    else if (debtRatio > 0.7) score = 5;
    else if (debtRatio > 0.5) score = 10;
    else if (debtRatio > 0.3) score = 15;
    
    return score;
  }

  private async calculateStabilityScore(userId: string): Promise<number> {
    let score = 20;
    
    const recentTransactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: { gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) }
      },
      select: { amount: true, type: true, date: true }
    });
    
    if (recentTransactions.length < 5) return 15;
    
    const incomeMonths: Record<string, number> = {};
    recentTransactions
      .filter(t => t.type === "INCOME")
      .forEach(t => {
        const month = t.date.toISOString().slice(0, 7);
        incomeMonths[month] = (incomeMonths[month] || 0) + t.amount;
      });
    
    const months = Object.values(incomeMonths);
    if (months.length < 2) return score;
    
    const avg = months.reduce((a, b) => a + b, 0) / months.length;
    const variance = months.reduce((sum, m) => sum + Math.abs(m - avg), 0) / avg;
    
    if (variance > 0.5) score = 5;
    else if (variance > 0.3) score = 10;
    else if (variance > 0.15) score = 15;
    
    return score;
  }

  private calculateSavingsScore(data: UserFinancialData): number {
    let score = 20;
    const income = data.summary.monthlyIncome || 1;
    const netFlow = data.summary.netFlow;
    
    const savingsRate = netFlow / income;
    
    if (savingsRate >= 0.2) score = 20;
    else if (savingsRate >= 0.15) score = 15;
    else if (savingsRate >= 0.1) score = 10;
    else if (savingsRate >= 0.05) score = 5;
    else score = 0;
    
    return score;
  }

  private async calculateBehaviorScore(userId: string): Promise<number> {
    let score = 15;
    
    const recentIns = await prisma.insight.findMany({
      where: {
        userId,
        createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      },
      select: { priority: true }
    });
    
    const actedCount = await prisma.insightInteraction.count({
      where: {
        insight: { userId },
        interactionType: { in: ["ACTED", "CLICKED"] },
        createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      }
    });
    
    if (recentIns.length === 0) return 10;
    
    const engagement = actedCount / recentIns.length;
    
    if (engagement > 0.5) score = 15;
    else if (engagement > 0.3) score = 10;
    else if (engagement > 0.1) score = 5;
    
    return score;
  }

  private categorizeScore(score: number): FinancialScoreCategory {
    if (score >= 80) return "EXCELLENT";
    if (score >= 60) return "GOOD";
    if (score >= 40) return "FAIR";
    if (score >= 20) return "POOR";
    return "CRITICAL";
  }

  private generateRecommendation(score: number, category: FinancialScoreCategory): string {
    switch (category) {
      case "EXCELLENT":
        return "Continue assim! Considere diversificar investimentos.";
      case "GOOD":
        return "Bom controle. Foque em aumentar reserva de emergência.";
      case "FAIR":
        return "Atenção necessário. Revise categorias de gastos.";
      case "POOR":
        return " Ação imediata necessária. Priorize quitar dívidas.";
      case "CRITICAL":
        return "Procure apoio financeiro. Comece por pequenas vitórias.";
      default:
        return "Mantenha o foco e controle.";
    }
  }
}

export const financialScorer = new FinancialScorer();