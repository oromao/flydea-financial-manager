import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BudgetSchema } from "@/lib/validations";
import { sendBudgetAlert } from "@/lib/email";
import { startOfMonth, endOfMonth } from "date-fns";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const budgets = await prisma.budget.findMany({
    where: { userId: session.user.id },
    include: { category: true },
    orderBy: { createdAt: "asc" }
  });

  // Calculate spending for each budget category this month
  const budgetsWithSpending = await Promise.all(
    budgets.map(async (budget) => {
      const spent = await prisma.transaction.aggregate({
        where: {
          userId: session.user.id,
          categoryId: budget.categoryId,
          type: "EXPENSE",
          date: { gte: monthStart, lte: monthEnd }
        },
        _sum: { amount: true }
      });

      const spentAmount = spent._sum.amount || 0;
      const percentage = (spentAmount / budget.amount) * 100;

      return { ...budget, spent: spentAmount, percentage };
    })
  );

  return NextResponse.json(budgetsWithSpending);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = BudgetSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });

  const { categoryId, amount, period, alertAt } = parsed.data;

  // Prevent duplicate budget for same category/period
  const existing = await prisma.budget.findFirst({
    where: { userId: session.user.id, categoryId, period }
  });
  if (existing) {
    return NextResponse.json({ error: "Já existe um orçamento para esta categoria neste período" }, { status: 409 });
  }

  const budget = await prisma.budget.create({
    data: { categoryId, amount, period, alertAt, userId: session.user.id },
    include: { category: true }
  });

  await prisma.auditLog.create({
    data: {
      action: "CREATE",
      entity: "BUDGET",
      entityId: budget.id,
      details: `Novo orçamento: ${budget.category.name} - R$${amount}`,
      userId: session.user.id
    }
  });

  return NextResponse.json(budget);
}
