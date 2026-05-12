import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { startOfMonth, endOfMonth, addMonths } from "date-fns";
import { computeMonthlySummary, TransactionType, PaymentStatus } from "@/lib/financial-engine";
import { picoClaw } from "@/lib/ai/pico-claw";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const now = new Date();
    const startDate = startOfMonth(now);
    const endDate = endOfMonth(now);

    // AI features optional
    let aiInsights = null;
    let proactiveMessage = null;
    try {
      const financialData = await picoClaw.fetchData(session.user.id);
      const [insights, msg] = await Promise.all([
        picoClaw.generateInsights(financialData).catch(() => null),
        picoClaw.getQuickSummary(financialData).catch(() => null),
      ]);
      aiInsights = insights;
      proactiveMessage = msg;
    } catch {}

    const intel = await prisma.userIntelligence.findUnique({
      where: { userId: session.user.id },
      select: { predictionAccuracyScore: true, impactScore: true, riskScore: true, savingsRate: true },
    });

    const accuracy = intel?.predictionAccuracyScore || 50;
    const impact = intel?.impactScore || 50;

    const [monthTransactions, allTransactions, recurrences, budgets] = await Promise.all([
      prisma.transaction.findMany({
        where: { userId: session.user.id, date: { gte: startDate, lte: endDate } },
        include: { category: true },
      }),
      prisma.transaction.findMany({
        where: { userId: session.user.id },
        select: {
          id: true, type: true, amount: true, date: true, dueDate: true,
          paymentStatus: true, categoryId: true, accountId: true,
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
      type: t.type as TransactionType,
      description: t.description,
      amount: t.amount,
      date: t.date,
      dueDate: t.dueDate,
      paidAt: t.paidAt,
      amountPaid: t.amountPaid,
      paymentStatus: t.paymentStatus as PaymentStatus,
      categoryId: t.categoryId,
      categoryName: t.category?.name ?? null,
      recurrenceId: t.recurrenceId,
      accountId: t.accountId,
      createdAt: t.createdAt,
    }));

    const summary = computeMonthlySummary(mappedMonthTx, startDate, endDate, allTransactions);

    const budgetAlerts = budgets.map((budget) => {
      const monthExpenses = mappedMonthTx
        .filter((t) => t.type === "EXPENSE" && t.categoryId === budget.categoryId)
        .reduce((sum, t) => sum + t.amount, 0);
      const percentage = budget.amount > 0 ? (monthExpenses / budget.amount) * 100 : 0;
      return { ...budget, spent: monthExpenses, percentage, isAlert: percentage >= (budget.alertAt || 80) };
    });

    const chartData = Object.entries(summary.transactionsByDay)
      .map(([day, data]) => ({ day: Number(day), ...data }))
      .sort((a, b) => a.day - b.day);

    const projectedExpenses = recurrences
      .filter((r) => r.type === "EXPENSE" || !r.type)
      .reduce((sum, r) => sum + r.amount, 0);
    const projectedIncome = recurrences
      .filter((r) => r.type === "INCOME")
      .reduce((sum, r) => sum + r.amount, 0);

    const projectedBalance = allTransactions.reduce((sum, t) => {
      return t.type === "INCOME" ? sum + t.amount : sum - t.amount;
    }, 0);

    return NextResponse.json({
      balance: projectedBalance,
      realizedBalance: summary.allTimeBalance,
      income: summary.monthIncome,
      expenses: summary.monthExpenses,
      monthIncome: summary.monthIncome,
      monthExpenses: summary.monthExpenses,
      pendingExpenses: summary.monthPending,
      chartData,
      topCategories: summary.topCategories,
      projectedExpenses,
      projectedIncome,
      budgetAlerts: budgetAlerts.filter((b) => b.isAlert),
      savingsRate: summary.monthIncome > 0
        ? ((summary.monthIncome - summary.monthExpenses) / summary.monthIncome) * 100
        : 0,
    });

  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Erro desconhecido";
    return NextResponse.json({
      error: "Erro interno ao carregar dashboard",
      detail: msg
    }, { status: 500 });
  }
}
