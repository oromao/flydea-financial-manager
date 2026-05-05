import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import type { UserFinancialData } from "../pico-claw";

export type BehaviorChange = "IMPROVING" | "STABLE" | "DECLINING" | "SPIKE" | "CRASH";

export interface BehaviorInsight {
  change: BehaviorChange;
  description: string;
  details: {
    spendingTrend: number;
    frequencyTrend: number;
    avgTransactionChange: number;
    categoryShifts: Record<string, number>;
  };
  severity: "LOW" | "MEDIUM" | "HIGH";
}

export class BehaviorDetector {
  /**
   * Detecta mudanças de padrão financeiro do usuário
   */
  async detect(userId: string, data: UserFinancialData): Promise<BehaviorInsight | null> {
    try {
      const last3Months = await this.getMonthlySummaries(userId, 3);
      
      if (last3Months.length < 2) {
        return null;
      }

      const spendingTrend = this.calculateSpendingTrend(last3Months);
      const frequencyTrend = this.calculateFrequencyTrend(last3Months);
      const avgTransactionChange = this.calculateAvgTransactionTrend(last3Months);
      const categoryShifts = this.detectCategoryShifts(last3Months);

      // Determine behavior type
      let change: BehaviorChange = "STABLE";
      let severity: "LOW" | "MEDIUM" | "HIGH" = "LOW";
      let description = "";

      if (spendingTrend < -0.3 && avgTransactionChange < -0.2) {
        change = "IMPROVING";
        severity = avgTransactionChange < -0.4 ? "HIGH" : "MEDIUM";
        description = "Seus gastos estão diminuindo consistentemente.";
      } else if (spendingTrend > 0.5 || avgTransactionChange > 0.5) {
        change = "SPIKE";
        severity = spendingTrend > 0.8 ? "HIGH" : "MEDIUM";
        description = "Detectamos pico de gastos neste mês.";
      } else if (spendingTrend > 0.3 && spendingTrend <= 0.5) {
        change = "DECLINING";
        severity = "MEDIUM";
        description = "Seus gastos aumentaram nos últimos meses.";
      } else if (spendingTrend < -0.1 && spendingTrend > -0.3) {
        change = "IMPROVING";
        description = "Você está estável e controles.";
      } else if (avgTransactionChange < -0.5) {
        change = "CRASH";
        severity = "HIGH";
        description = "Queda abrupta nos gastos pode indicar emergência.";
      }

      // Persist behavior change if significant
      if (change !== "STABLE" && severity !== "LOW") {
        await this.persistBehaviorChange(userId, change, severity);
      }

      return {
        change,
        description,
        details: {
          spendingTrend,
          frequencyTrend,
          avgTransactionChange,
          categoryShifts
        },
        severity
      };
    } catch (error) {
      logger.error("Behavior detection error", { error });
      return null;
    }
  }

  private async getMonthlySummaries(userId: string, months: number) {
    const summary: Array<{
      month: string;
      total: number;
      count: number;
      avgTransaction: number;
      categories: Record<string, number>;
    }> = [];

    for (let i = 0; i < months; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const transactions = await prisma.transaction.findMany({
        where: {
          userId,
          date: { gte: monthStart, lte: monthEnd },
          type: "EXPENSE"
        },
        select: { amount: true, category: true }
      });

      if (transactions.length > 0) {
        const categories: Record<string, number> = {};
        let total = 0;

        transactions.forEach(t => {
          const cat = t.category?.name || "Outros";
          categories[cat] = (categories[cat] || 0) + t.amount;
          total += t.amount;
        });

        summary.push({
          month: monthStart.toISOString().slice(0, 7),
          total,
          count: transactions.length,
          avgTransaction: total / transactions.length,
          categories
        });
      } else {
        summary.push({
          month: monthStart.toISOString().slice(0, 7),
          total: 0,
          count: 0,
          avgTransaction: 0,
          categories: {}
        });
      }
    }

    return summary;
  }

  private calculateSpendingTrend(months: Array<{ total: number }>): number {
    if (months.length < 2) return 0;
    
    const current = months[0].total;
    const previous = months[1].total || 1;
    
    return (current - previous) / previous;
  }

  private calculateFrequencyTrend(months: Array<{ count: number }>): number {
    if (months.length < 2) return 0;
    
    const current = months[0].count;
    const previous = months[1].count || 1;
    
    return (current - previous) / previous;
  }

  private calculateAvgTransactionTrend(months: Array<{ avgTransaction: number }>): number {
    if (months.length < 2) return 0;
    
    const current = months[0].avgTransaction;
    const previous = months[1].avgTransaction || 1;
    
    return (current - previous) / previous;
  }

  private detectCategoryShifts(
    months: Array<{ categories: Record<string, number>; total: number }>
  ): Record<string, number> {
    const shifts: Record<string, number> = {};
    
    if (months.length < 2) return shifts;

    const current = months[0].categories;
    const previous = months[1].categories;

    const allCats = new Set([
      ...Object.keys(current),
      ...Object.keys(previous)
    ]);

    for (const cat of allCats) {
      const curr = current[cat] || 0;
      const prev = previous[cat] || 0;
      const prevTotal = months[1].total || 1;
      const currTotal = months[0].total || 1;

      if (prev > 0 || curr > 0) {
        const currPct = curr / currTotal;
        const prevPct = prev / prevTotal;
        shifts[cat] = currPct - prevPct;
      }
    }

    return shifts;
  }

  private async persistBehaviorChange(
    userId: string,
    change: BehaviorChange,
    severity: "LOW" | "MEDIUM" | "HIGH"
  ) {
    try {
      const intel = await prisma.userIntelligence.findUnique({
        where: { userId }
      });

      if (intel) {
        await prisma.userIntelligence.update({
          where: { userId },
          data: {
            recentPatternShift: change !== "STABLE",
            behaviorChangeScore: severity === "HIGH" ? 80 : severity === "MEDIUM" ? 50 : 20
          }
        });
      } else {
        await prisma.userIntelligence.create({
          data: {
            userId,
            recentPatternShift: change !== "STABLE",
            behaviorChangeScore: severity === "HIGH" ? 80 : severity === "MEDIUM" ? 50 : 20
          }
        });
      }
    } catch (e) {
      logger.error("Error persisting behavior change", { error: e });
    }
  }

  /**
   * Get recent behavior history
   */
  async getHistory(userId: string, days = 30) {
    const interactions = await prisma.insightInteraction.findMany({
      where: {
        insight: { userId },
        createdAt: { gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) }
      },
      orderBy: { createdAt: "desc" },
      take: 50
    });

    return interactions;
  }
}

export const behaviorDetector = new BehaviorDetector();