import { prisma } from "@/lib/prisma";
import { startOfMonth, subDays, subMonths } from "date-fns";

export class BehavioralIntelligenceService {
  /**
   * Tracks an interaction with an insight and triggers incremental learning
   */
  async trackInteraction(insightId: string, interactionType: "VIEWED" | "CLICKED" | "DISMISSED" | "ACTED", metadata?: any) {
    const insight = await prisma.insight.findUnique({
      where: { id: insightId },
      include: { template: true },
    });

    if (!insight) return;

    // 1. Record the interaction
    await prisma.insightInteraction.create({
      data: {
        insightId,
        interactionType,
        metadata,
      },
    });

    // 2. Update insight status
    const status = interactionType === "ACTED" ? "ACTED" : (interactionType === "DISMISSED" ? "IGNORED" : "SHOWN");
    await prisma.insight.update({
      where: { id: insightId },
      data: { 
        status, 
        actedAt: interactionType === "ACTED" ? new Date() : undefined 
      },
    });

    // 3. Incremental learning for the template
    if (insight.templateId) {
      const template = insight.template!;
      const incrementField = interactionType === "ACTED" ? "actionCount" : (interactionType === "DISMISSED" ? "ignoreCount" : null);
      
      if (incrementField) {
        const currentScore = template.performanceScore;
        // Reinforcement: +2 for action, -1 for ignore
        const scoreAdjustment = interactionType === "ACTED" ? 2 : -1;
        const newScore = Math.min(100, Math.max(0, currentScore + scoreAdjustment));

        await prisma.insightTemplate.update({
          where: { id: insight.templateId },
          data: {
            [incrementField]: { increment: 1 },
            performanceScore: newScore,
          },
        });
      }
    }

    // 4. Update user profile based on responsiveness (implied learning)
    if (interactionType === "ACTED") {
      await prisma.userIntelligence.update({
        where: { userId: insight.userId },
        data: {
          impactScore: { increment: 0.5 }, // System is working!
          riskScore: { decrement: 0.2 },  // User is taking action to manage risk
        },
      });
    }
  }

  /**
   * Called when a transaction is created to detect behavior changes in real-time
   */
  async onTransactionCreated(userId: string, amount: number, categoryId: string) {
    const today = new Date();
    const monthStart = startOfMonth(today);
    const threeMonthsAgo = subMonths(today, 3);
    
    // 1. Fetch Category Baseline (Last 3 Months)
    const categoryStats = await prisma.transaction.aggregate({
      where: { 
        userId, 
        categoryId, 
        type: "EXPENSE",
        date: { gte: threeMonthsAgo, lt: monthStart } 
      },
      _sum: { amount: true },
      _count: { id: true }
    });

    const avgMonthlyCategorySpending = (categoryStats._sum.amount || 0) / 3;
    
    // 2. Current Month Category Spending
    const currentCategoryTotal = await prisma.transaction.aggregate({
      where: { userId, categoryId, type: "EXPENSE", date: { gte: monthStart } },
      _sum: { amount: true }
    });

    const currentSpent = (currentCategoryTotal._sum.amount || 0) + amount;

    // 3. Behavior Change Detection
    const intel = await prisma.userIntelligence.findUnique({ where: { userId } });
    if (!intel) return;

    let behaviorChangeScore = intel.behaviorChangeScore;
    let impulsivityScore = intel.impulsivityScore;
    let driftDetected = false;

    // Detection Rule: Current spent in category > 50% of 3-month average within first 10 days
    // or Current spent > 120% of average overall.
    if (avgMonthlyCategorySpending > 0 && currentSpent > avgMonthlyCategorySpending * 1.2) {
      behaviorChangeScore = Math.min(100, behaviorChangeScore + 10);
      impulsivityScore = Math.min(100, impulsivityScore + 5);
      driftDetected = true;
      
      await prisma.userBehavioralLog.create({
        data: {
          userId,
          changeType: "FREQUENCY_SHIFT",
          description: `Gasto na categoria atual superou em 20% a média dos últimos 3 meses.`,
          severity: 10
        }
      });
    }

    // 4. Global Velocity Check (Recent frequency)
    const recentCount = await prisma.transaction.count({
      where: { userId, date: { gte: subDays(today, 7) } }
    });

    if (recentCount > 20) {
      behaviorChangeScore = Math.min(100, behaviorChangeScore + 5);
      driftDetected = true;
    }

    // 5. Update Intelligence incrementally
    await prisma.userIntelligence.update({
      where: { userId },
      data: {
        behaviorChangeScore,
        impulsivityScore,
        recentPatternShift: driftDetected || behaviorChangeScore > 40,
        lastCalculatedAt: new Date()
      }
    });
  }

  /**
   * Calculates the Final Insight Score (Advanced Ranking)
   */
  calculateFinalScore(baseScore: number, templatePerformance: number, userRisk: number, actionRate: number) {
    // Weighting:
    // 40% User Current Risk (Urgencia)
    // 30% Template Historical Success (Confiança)
    // 20% Base heuristic score (Contexto)
    // 10% User Action Rate (Personalização)
    
    return (userRisk * 0.4) + (templatePerformance * 0.3) + (baseScore * 0.2) + (actionRate * 0.1);
  }

  /**
   * Visible proof of evolution
   */
  async getEvolutionHistory(userId: string) {
    const logs = await prisma.userBehavioralLog.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 10
    });

    const intel = await prisma.userIntelligence.findUnique({
      where: { userId }
    });

    const predictions = await prisma.prediction.findMany({
      where: { userId, status: "VERIFIED" },
      orderBy: { verifiedAt: "desc" },
      take: 5
    });

    return {
      currentStatus: intel,
      recentChanges: logs,
      accuracy: intel?.predictionAccuracyScore || 0,
      recentPredictions: predictions
    };
  }
}
