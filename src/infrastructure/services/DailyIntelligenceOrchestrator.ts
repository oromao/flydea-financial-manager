import { prisma } from "@/lib/prisma";
import { AgentQueue } from "@/infrastructure/services/AgentQueue";
import { BehavioralIntelligenceService } from "./BehavioralIntelligenceService";
import { startOfMonth, endOfMonth, subMonths, addDays } from "date-fns";

export class DailyIntelligenceOrchestrator {
  private behavioralService = new BehavioralIntelligenceService();

  /**
   * Main Pipeline for the 09:00 Daily Job
   */
  async runDailyPipeline() {
    const executionStartTime = Date.now();
    const log = {
      status: "RUNNING",
      usersProcessed: 0,
      usersFailed: 0,
      insightsGenerated: 0,
      agentsExecuted: 0,
      errors: {} as Record<string, string>,
    };

    try {
      const users = await prisma.user.findMany({
        include: {
          intelligence: true,
        },
      });

      for (const user of users) {
        try {
          console.log(`[DailyOrchestrator] Processing user ${user.id}`);

          // 1. Run Agents
          const agentQueue = new AgentQueue();
          const userAgents = await prisma.aIAgent.findMany({
            where: { isActive: true, userId: user.id },
            include: { actions: true },
          });

          if (userAgents.length > 0) {
            const queueItems = userAgents.map((agent) => ({
              agentId: agent.id,
              userId: user.id,
              scheduledTime: new Date(),
              retries: 0,
              maxRetries: 3,
            }));
            const agentResults = await agentQueue.processQueue(queueItems);
            log.agentsExecuted += agentResults.executed.length;
          }

          // 2. Feature Evolution (Behavior & Intelligence)
          const intelligence = await this.recalculateUserIntelligence(user.id, user.intelligence);

          // 3. Auto-Correct Predictions (Improved Accuracy)
          await this.autoCorrectPredictions(user.id, intelligence);
          
          // 4. Learning Loop (Template Scoring Aggregation)
          await this.processInsightFeedback(user.id);

          // 5. Generate Insights (Advanced Ranking)
          const generatedInsights = await this.generateDailyInsights(user.id, intelligence);
          log.insightsGenerated += generatedInsights.length;

          log.usersProcessed++;
        } catch (userError) {
          log.usersFailed++;
          log.errors[user.id] = userError instanceof Error ? userError.message : String(userError);
          console.error(`[DailyOrchestrator] Error processing user ${user.id}`, userError);
        }
      }

      log.status = log.usersFailed > 0 ? "PARTIAL_SUCCESS" : "SUCCESS";
    } catch (globalError) {
      log.status = "FAILED";
      log.errors["global"] = globalError instanceof Error ? globalError.message : String(globalError);
      console.error("[DailyOrchestrator] Global pipeline error", globalError);
    } finally {
      await prisma.dailyExecutionLog.create({
        data: {
          status: log.status,
          usersProcessed: log.usersProcessed,
          usersFailed: log.usersFailed,
          insightsGenerated: log.insightsGenerated,
          agentsExecuted: log.agentsExecuted,
          executionTimeMs: Date.now() - executionStartTime,
          errors: log.errors as object,
        },
      });
    }

    return log;
  }

  /**
   * Recalculates user behavioral features (Feature Evolution Engine)
   */
  private async recalculateUserIntelligence(userId: string, currentIntel: any) {
    const today = new Date();
    const monthStart = startOfMonth(today);
    const lastMonthStart = startOfMonth(subMonths(today, 1));
    const lastMonthEnd = endOfMonth(subMonths(today, 1));

    // Aggregate Transactions
    const expenses = await prisma.transaction.aggregate({
      where: { userId, type: "EXPENSE", date: { gte: monthStart } },
      _sum: { amount: true },
      _count: { id: true }
    });
    
    const incomes = await prisma.transaction.aggregate({
      where: { userId, type: "INCOME", date: { gte: monthStart } },
      _sum: { amount: true },
    });

    const lastMonthExpenses = await prisma.transaction.aggregate({
      where: { userId, type: "EXPENSE", date: { gte: lastMonthStart, lte: lastMonthEnd } },
      _sum: { amount: true },
    });

    const currentExpense = expenses._sum.amount || 0;
    const currentIncome = incomes._sum.amount || 0;
    const pastExpense = lastMonthExpenses._sum.amount || 0;

    // Advanced Intelligence Logic
    let riskScore = currentIntel?.riskScore || 50;
    const savingsRate = currentIncome > 0 ? ((currentIncome - currentExpense) / currentIncome) * 100 : 0;
    const predictabilityScore = currentIntel?.predictabilityScore || 50;
    let impulsivityScore = currentIntel?.impulsivityScore || 50;
    let behaviorChangeScore = currentIntel?.behaviorChangeScore || 0;
    const impactScore = currentIntel?.impactScore || 50;

    // 1. Risk Evolution
    if (currentExpense > currentIncome * 0.9) riskScore = Math.min(100, riskScore + 8);
    else if (savingsRate > 15) riskScore = Math.max(0, riskScore - 4);

    // 2. Behavior Change Detection
    if (pastExpense > 0 && currentExpense > pastExpense * 1.2) {
      behaviorChangeScore = Math.min(100, behaviorChangeScore + 15);
      impulsivityScore = Math.min(100, impulsivityScore + 5);
      await this.logBehaviorChange(userId, "SPENDING_INCREASE", `Gasto subiu ${Math.round((currentExpense/pastExpense - 1)*100)}% em relação ao mês passado.`, 15);
    }

    const updateData = {
      riskScore,
      savingsRate,
      predictabilityScore,
      impulsivityScore,
      behaviorChangeScore,
      cashflowStability: savingsRate > 0 ? Math.min(100, 50 + savingsRate) : Math.max(0, 50 + savingsRate),
      impactScore,
      recentPatternShift: behaviorChangeScore > 30,
      lastCalculatedAt: today,
    };

    return await prisma.userIntelligence.upsert({
      where: { userId },
      update: updateData,
      create: { userId, ...updateData },
    });
  }

  private async logBehaviorChange(userId: string, type: string, description: string, severity: number) {
    await prisma.userBehavioralLog.create({
      data: { userId, changeType: type, description, severity }
    });
  }

  /**
   * Auto-correct predictions with improved windows and accuracy tracking
   */
  private async autoCorrectPredictions(userId: string, intel: any) {
    const today = new Date();
    const pendingPredictions = await prisma.prediction.findMany({
      where: { userId, status: "PENDING", predictedDate: { lte: today } },
    });

    for (const pred of pendingPredictions) {
      const accs = await prisma.account.findMany({ where: { userId } });
      const totalBalance = accs.reduce((sum, acc) => sum + acc.balance, 0);
      
      let error = 0;
      if (pred.type === "CASHFLOW_NEGATIVE") {
        // Did the user actually hit negative balance in the window of predictedDate +/- 2 days?
        // For simplicity, we check if today is negative or if any transaction made it negative.
        error = totalBalance < 0 ? 0 : 100;
      }

      await prisma.prediction.update({
        where: { id: pred.id },
        data: {
          actualDate: today,
          actualAmount: totalBalance,
          errorMargin: error,
          status: "VERIFIED",
          verifiedAt: today,
        },
      });

      const newAccuracy = (intel.predictionAccuracyScore || 50) * 0.8 + (100 - error) * 0.2;
      await prisma.userIntelligence.update({
        where: { userId },
        data: { predictionAccuracyScore: newAccuracy }
      });
    }
  }

  /**
   * Advanced Insight Generation with Smart Ranking and Recurrence Awareness
   */
  private async generateDailyInsights(userId: string, intel: any) {
    const generated = [];
    const today = new Date();
    
    // 1. Fetch active templates
    const templates = await prisma.insightTemplate.findMany({
      orderBy: { performanceScore: "desc" },
    });

    // 2. Fetch Recurrences for cashflow forecasting
    const recurrences = await prisma.recurrence.findMany({
      where: { userId, isActive: true }
    });

    const pendingBillsTotal = recurrences
      .filter(r => r.type === "EXPENSE" && r.nextDate && r.nextDate <= addDays(today, 7))
      .reduce((sum, r) => sum + r.amount, 0);

    const accounts = await prisma.account.findMany({ where: { userId } });
    const currentBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

    const projectedRisk = currentBalance < pendingBillsTotal;
    const actionRate = (intel.impactScore || 50);

    // 3. Potential Insights
    const candidates = [
      { 
        type: "CASHFLOW_RISK", 
        baseScore: projectedRisk ? 100 : intel.riskScore, 
        trigger: projectedRisk || intel.riskScore > 70,
        content: projectedRisk 
          ? `Suas contas fixas nos próximos 7 dias (R$ ${pendingBillsTotal.toFixed(2)}) superam seu saldo atual.`
          : undefined
      },
      { 
        type: "EXPENSE_WARNING", 
        baseScore: intel.behaviorChangeScore, 
        trigger: intel.behaviorChangeScore > 30 
      },
      { 
        type: "SAVINGS_OPP", 
        baseScore: intel.savingsRate, 
        trigger: intel.savingsRate > 20 && !projectedRisk
      },
    ];

    for (const candidate of candidates) {
      if (!candidate.trigger) continue;

      const template = templates.find((t) => t.type === candidate.type) || await this.createFallbackTemplate(candidate.type);
      
      const finalScore = this.behavioralService.calculateFinalScore(
        candidate.baseScore,
        template.performanceScore,
        intel.riskScore,
        actionRate
      );

      const insight = await prisma.insight.create({
        data: {
          userId,
          type: candidate.type,
          content: candidate.content || template.content,
          templateId: template.id,
          score: finalScore,
          priority: finalScore > 80 ? "HIGH" : (finalScore > 50 ? "MEDIUM" : "LOW"),
          expectedEffect: candidate.type === "SAVINGS_OPP" ? "INVEST" : "REDUCE",
        }
      });
      generated.push(insight);

      // Create a prediction if it's a cashflow risk
      if (candidate.type === "CASHFLOW_RISK" && projectedRisk) {
         await prisma.prediction.create({
           data: {
             userId,
             type: "CASHFLOW_NEGATIVE",
             predictedDate: addDays(today, 7),
             predictedAmount: currentBalance - pendingBillsTotal,
             status: "PENDING"
           }
         });
      }
    }

    return generated;
  }

  private async processInsightFeedback(userId: string) {
     await prisma.insight.updateMany({
       where: { userId, status: { in: ["GENERATED", "SHOWN"] }, createdAt: { lt: subDays(new Date(), 3) } },
       data: { status: "IGNORED" }
     });
  }

  private async createFallbackTemplate(type: string) {
    const contents: Record<string, string> = {
      CASHFLOW_RISK: "Atenção: Seu fluxo de caixa pode ficar negativo em breve.",
      EXPENSE_WARNING: "Notamos um aumento incomum nos seus gastos recentes.",
      SAVINGS_OPP: "Parabéns! Você tem um saldo excedente que pode ser poupado.",
    };
    return await prisma.insightTemplate.create({
      data: { type, content: contents[type] || "Insight importante.", performanceScore: 50 }
    });
  }
}

function subDays(date: Date, amount: number) {
  return new Date(date.getTime() - (amount * 24 * 60 * 60 * 1000));
}
