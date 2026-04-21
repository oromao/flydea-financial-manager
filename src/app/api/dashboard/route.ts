import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { startOfMonth, endOfMonth, addMonths } from "date-fns";
import { computeMonthlySummary } from "@/lib/financial-engine";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const now = new Date();
  const startDate = startOfMonth(now);
  const endDate = endOfMonth(now);

  // 1. Fetch DB Intelligence (Replacement for in-memory CAG Engine)
  const intel = await prisma.userIntelligence.findUnique({
    where: { userId: session.user.id }
  });

  const dbInsights = await prisma.insight.findMany({
    where: { 
      userId: session.user.id,
      status: { in: ["GENERATED", "SHOWN"] }
    },
    orderBy: { score: "desc" },
    take: 3
  });

  // Calculate AI Level based on impactScore
  const impact = intel?.impactScore || 50;
  const accuracy = intel?.predictionAccuracyScore || 50;
  
  let aiLevel = "Iniciante";
  if (impact > 80) aiLevel = "Consultor Sênior";
  else if (impact > 60) aiLevel = "Analista";

  // Dynamic greeting based on evolution
  let proactiveMessage = "Sua vida financeira parece estar em ordem! Continue acompanhando seus gastos diariamente.";
  if (dbInsights.length > 0) {
    const top = dbInsights[0];
    if (top.type === "CASHFLOW_RISK") proactiveMessage = `Atenção aqui: ${top.content}`;
    else if (top.type === "EXPENSE_WARNING") proactiveMessage = `💡 Insight: ${top.content}`;
    else proactiveMessage = `Sabia que... ${top.content}`;
  }

  // If AI accuracy is remarkably high, showcase it!
  if (accuracy > 80) {
    proactiveMessage = `Evoluímos! Minha precisão de previsões subiu para ${accuracy.toFixed(0)}%. ${proactiveMessage}`;
  }

  // Fetch current month transactions + all-time for balance
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

  // Map month transactions for financial engine
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

  // Compute using centralized engine
  const summary = computeMonthlySummary(
    mappedMonthTx,
    startDate,
    endDate,
    allTransactions
  );

  // Budget alerts
  const budgetAlerts = await Promise.all(
    budgets.map(async (budget) => {
      const spent = await prisma.transaction.aggregate({
        where: {
          userId: session.user.id,
          categoryId: budget.categoryId,
          type: "EXPENSE",
          date: { gte: startDate, lte: endDate },
        },
        _sum: { amount: true },
      });
      const spentAmount = spent._sum.amount || 0;
      const percentage = (spentAmount / budget.amount) * 100;
      return {
        ...budget,
        spent: spentAmount,
        percentage,
        isAlert: percentage >= budget.alertAt,
      };
    })
  );

  const activeAlerts = budgetAlerts.filter((b) => b.isAlert);

  // Chart data
  const chartData = Object.entries(summary.transactionsByDay)
    .map(([day, data]) => ({ day: Number(day), ...data }))
    .sort((a, b) => a.day - b.day);

  // Next 3 months projection
  const projectedExpenses = recurrences
    .filter((r) => r.type === "EXPENSE" || !r.type)
    .reduce((sum, r) => sum + r.amount, 0);
  const projectedIncome = recurrences
    .filter((r) => r.type === "INCOME")
    .reduce((sum, r) => sum + r.amount, 0);

  const nextMonths = [1, 2, 3].map((offset) => {
    const d = addMonths(now, offset);
    return {
      month: d.toLocaleDateString("pt-BR", {
        month: "short",
        year: "numeric",
      }),
      projected: projectedIncome - projectedExpenses,
    };
  });

  return NextResponse.json({
    // All-time balance
    balance: summary.allTimeBalance,
    // Current month
    income: summary.monthIncome,
    expenses: summary.monthExpenses,
    pendingExpenses: summary.pendingExpenses,
    pendingReceivables: summary.pendingReceivables,
    totalPending: summary.totalPending,
    chartData,
    topCategories: summary.topCategories,
    projectedExpenses,
    projectedIncome,
    nextMonths,
    budgetAlerts: activeAlerts,
    savingsRate:
      summary.monthIncome > 0
        ? ((summary.monthIncome - summary.monthExpenses) / summary.monthIncome) * 100
        : 0,
    copilot: {
      proactiveMessage,
      insights: dbInsights.map(i => ({
        id: i.id,
        type: i.priority === "HIGH" ? "URGENTE" : (i.priority === "MEDIUM" ? "IMPACTO" : "INFORMAÇÃO"),
        title: i.type === "CASHFLOW_RISK" ? "Risco Detectado" : (i.type === "EXPENSE_WARNING" ? "Aviso de Gasto" : "Oportunidade"),
        message: i.content,
        actionLabel: i.expectedEffect === "REDUCE_SPENDING" ? "Revisar Gastos" : "Ver Detalhes",
        actionUrl: i.expectedEffect === "REDUCE_SPENDING" ? "/movimentacoes" : "/insights",
      })),
      healthScore: intel ? (100 - (intel.riskScore * 0.5) + (intel.savingsRate > 20 ? 10 : 0)) : 80,
      aiStats: {
        accuracy: accuracy,
        level: aiLevel
      }
    },
  });
}
