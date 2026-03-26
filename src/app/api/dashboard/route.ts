import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { addMonths, startOfMonth, endOfMonth } from "date-fns";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const now = new Date();
  const startDate = startOfMonth(now);
  const endDate = endOfMonth(now);

  const [transactions, recurrences, budgets] = await Promise.all([
    prisma.transaction.findMany({
      where: { userId: session.user.id, date: { gte: startDate, lte: endDate } },
      include: { category: true }
    }),
    prisma.recurrence.findMany({
      where: { userId: session.user.id, isActive: true },
      include: { category: true }
    }),
    prisma.budget.findMany({
      where: { userId: session.user.id },
      include: { category: true }
    })
  ]);

  let balance = 0;
  let income = 0;
  let expenses = 0;
  const chartDataMap: Record<number, { day: number; income: number; expenses: number }> = {};
  const categoryExpenses: Record<string, number> = {};

  for (let d = 1; d <= endDate.getDate(); d++) {
    chartDataMap[d] = { day: d, income: 0, expenses: 0 };
  }

  transactions.forEach((t) => {
    const day = new Date(t.date).getDate();
    if (t.type === "INCOME") {
      balance += t.amount;
      income += t.amount;
      chartDataMap[day].income += t.amount;
    } else {
      balance -= t.amount;
      expenses += t.amount;
      chartDataMap[day].expenses += t.amount;
      const catName = t.category?.name || "Outros";
      categoryExpenses[catName] = (categoryExpenses[catName] || 0) + t.amount;
    }
  });

  const chartData = Object.values(chartDataMap).sort((a, b) => a.day - b.day);

  // Top 5 expense categories
  const topCategories = Object.entries(categoryExpenses)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name, amount]) => ({ name, amount }));

  // Upcoming recurrences (next 3 months projection)
  const projectedExpenses = recurrences
    .filter((r) => r.type === "EXPENSE" || !r.type)
    .reduce((sum, r) => sum + r.amount, 0);
  const projectedIncome = recurrences
    .filter((r) => r.type === "INCOME")
    .reduce((sum, r) => sum + r.amount, 0);

  // Budget alerts: budgets exceeding alertAt threshold
  const budgetAlerts = await Promise.all(
    budgets.map(async (budget) => {
      const spent = await prisma.transaction.aggregate({
        where: {
          userId: session.user.id,
          categoryId: budget.categoryId,
          type: "EXPENSE",
          date: { gte: startDate, lte: endDate }
        },
        _sum: { amount: true }
      });
      const spentAmount = spent._sum.amount || 0;
      const percentage = (spentAmount / budget.amount) * 100;
      return { ...budget, spent: spentAmount, percentage, isAlert: percentage >= budget.alertAt };
    })
  );

  const activeAlerts = budgetAlerts.filter((b) => b.isAlert);

  // Next 3 months recurrence projection
  const nextMonths = [1, 2, 3].map((offset) => {
    const d = addMonths(now, offset);
    return {
      month: d.toLocaleDateString("pt-BR", { month: "short", year: "numeric" }),
      projected: projectedIncome - projectedExpenses
    };
  });

  return NextResponse.json({
    balance,
    income,
    expenses,
    chartData,
    topCategories,
    projectedExpenses,
    projectedIncome,
    nextMonths,
    budgetAlerts: activeAlerts,
    savingsRate: income > 0 ? ((income - expenses) / income) * 100 : 0
  });
}
