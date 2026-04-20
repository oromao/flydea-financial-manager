import { prisma } from "@/lib/prisma";
import { startOfMonth, subDays } from "date-fns";

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
    
    // Check for behavior changes
    // A) Recent spending frequency (Velocity)
    const recentTransactionsCount = await prisma.transaction.count({
      where: { 
        userId, 
        date: { gte: subDays(today, 7) } 
      }
    });

    // B) Category spending shift
    const categoryTotal = await prisma.transaction.aggregate({
      where: { userId, categoryId, date: { gte: monthStart } },
      _sum: { amount: true }
    });

    const intel = await prisma.userIntelligence.findUnique({ where: { userId } });
    if (!intel) return;

    let behaviorChangeScore = intel.behaviorChangeScore;
    let impulsivityScore = intel.impulsivityScore;

    // Detect high frequency
    if (recentTransactionsCount > 15) { // More than 2 transactions per day on average
      behaviorChangeScore = Math.min(100, behaviorChangeScore + 5);
      impulsivityScore = Math.min(100, impulsivityScore + 2);
    }

    // Update Intelligence incrementally
    await prisma.userIntelligence.update({
      where: { userId },
      data: {
        behaviorChangeScore,
        impulsivityScore,
        lastCalculatedAt: new Date()
      }
    });

    // C) Automatic action detection
    // If there was a recent insight for this category/risk and user created a transaction 
    // we might check if it matches the 'expectedEffect'
    const recentInsights = await prisma.insight.findMany({
      where: { 
        userId, 
        status: { in: ["GENERATED", "SHOWN"] },
        createdAt: { gte: subDays(today, 1) }
      }
    });

    for (const insight of recentInsights) {
       // Logic to detect if this transaction "fulfilled" the insight's goal
       // This is complex and depends on insight type.
       // For now, if user acts on any warning, we bump the impact.
    }
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
