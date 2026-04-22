import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { startOfMonth, endOfMonth, addMonths } from "date-fns";
import { computeMonthlySummary } from "@/lib/financial-engine";
import { picoClaw } from "@/lib/ai/pico-claw";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const now = new Date();
  const startDate = startOfMonth(now);
  const endDate = endOfMonth(now);

  // 1. Fetch data for Tiny AI (PicoClaw) - Replaced RAG/CAG
  const financialData = await picoClaw.fetchData(session.user.id);
  const aiInsights = await picoClaw.generateInsights(financialData);
  const proactiveMessage = await picoClaw.getQuickSummary(financialData);

  // 2. Fetch User Intelligence and other system components
  const intel = await prisma.userIntelligence.findUnique({
    where: { userId: session.user.id }
  });

  const accuracy = intel?.predictionAccuracyScore || 50;
  const impact = intel?.impactScore || 50;

  const [monthTransactions, allTransactions, recurrences, budgets] =
    await Promise.all([
      prisma.transaction.findMany({
        where: {
          userId: session.user.id,
          date: { gte: startDate, lte: endDate },
        },
        include: { category: true },
      }),
      prisma.transaction.findMany({
        where: { userId: session.user.id },
        select: {
          id: true,
          type: true,
          description: true,
          amount: true,
          date: true,
          dueDate: true,
          paidAt: true,
          amountPaid: true,
          paymentStatus: true,
          categoryId: true,
          recurrenceId: true,
          accountId: true,
          createdAt: true,
        },
      }),
      prisma.recurrence.findMany({
        where: { userId: session.user.id, isActive: true },
        include: { category: true },
      }),
      prisma.budget.findMany({
        where: { userId: session.user.id },
        include: { category: true },
      }),
    ]);

  const mappedMonthTx = monthTransactions.map((t) => ({
    id: t.id,
    type: t.type as "INCOME" | "EXPENSE",
    description: t.description,
    amount: t.amount,
    date: t.date,
    dueDate: t.dueDate,
    paidAt: t.paidAt,
    amountPaid: t.amountPaid,
    paymentStatus: t.paymentStatus as "PAID" | "PENDING",
    categoryId: t.categoryId,
    categoryName: t.category?.name,
    recurrenceId: t.recurrenceId,
    accountId: t.accountId,
    createdAt: t.createdAt,
  }));

  const summary = computeMonthlySummary(
    mappedMonthTx,
    startDate,
    endDate,
    allTransactions
  );

  // Calculate global pending (regardless of month)
  const globalPending = allTransactions
    .filter(t => t.paymentStatus === "PENDING")
    .reduce((sum, t) => sum + (t.type === "EXPENSE" ? t.amount : 0), 0);
  
  const globalReceivables = allTransactions
    .filter(t => t.paymentStatus === "PENDING" && t.type === "INCOME")
    .reduce((sum, t) => sum + t.amount, 0);

  return NextResponse.json({
    balance: summary.allTimeBalance,
    income: summary.monthIncome,
    expenses: summary.monthExpenses,
    pendingExpenses: globalPending,
    pendingReceivables: globalReceivables,
    totalPending: globalPending + globalReceivables,
    chartData,
    topCategories: summary.topCategories,
    projectedExpenses,
    projectedIncome,
    nextMonths,
    budgetAlerts: budgetAlerts.filter(b => b.isAlert),
    savingsRate: summary.monthIncome > 0 ? ((summary.monthIncome - summary.monthExpenses) / summary.monthIncome) * 100 : 0,
    copilot: {
      proactiveMessage,
      insights: aiInsights.map((i, idx) => ({
        id: `pico-${idx}`,
        type: i.priority === "HIGH" ? "URGENTE" : (i.priority === "MEDIUM" ? "IMPACTO" : "INFORMAÇÃO"),
        title: i.title,
        message: i.message,
        actionLabel: i.actionLabel,
        actionUrl: i.actionUrl,
      })),
      healthScore: intel ? (100 - (intel.riskScore * 0.5) + (intel.savingsRate > 20 ? 10 : 0)) : 80,
      aiStats: {
        accuracy,
        level: impact > 80 ? "Especialista" : (impact > 60 ? "Analista" : "Aprendiz")
      }
    },
  });
}
