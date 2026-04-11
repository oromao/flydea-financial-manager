import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  computeWeeklyForecast,
  computeCashflowMetrics,
} from "@/lib/financial-engine";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const referenceDate = new Date();

    // Fetch ALL revenue installments (engine will filter by month)
    const revenueInstallments = await prisma.revenueInstallment.findMany({
      where: {
        revenue: {
          userId: user.id,
        },
      },
    });

    // Fetch ALL expense transactions (engine will filter by month)
    const expenses = await prisma.transaction.findMany({
      where: {
        userId: user.id,
        type: "EXPENSE",
      },
    });

    const mappedInstallments = revenueInstallments.map((inst) => ({
      id: inst.id,
      revenueId: inst.revenueId,
      installmentNumber: inst.installmentNumber,
      amount: inst.amount,
      dueDate: inst.dueDate,
      status: inst.status as "PENDING" | "RECEIVED",
      receivedAt: inst.receivedAt,
    }));

    const mappedExpenses = expenses.map((t) => ({
      id: t.id,
      type: t.type as "EXPENSE",
      description: t.description,
      amount: t.amount,
      date: t.date,
      dueDate: t.dueDate || null,
      paidAt: t.paidAt || null,
      amountPaid: t.amountPaid,
      paymentStatus: t.paymentStatus as "PAID" | "PENDING",
      categoryId: t.categoryId,
      recurrenceId: t.recurrenceId,
      accountId: t.accountId,
      createdAt: t.createdAt,
    }));

    const weeklyForecast = computeWeeklyForecast(
      referenceDate,
      mappedInstallments,
      mappedExpenses
    );

    const metrics = computeCashflowMetrics(weeklyForecast);

    // Format weeks for client — convert dates to ISO strings
    const formattedWeeks = weeklyForecast.weeks.map((w) => ({
      week: w.weekNumber,
      weekStart: w.weekStart.toISOString().split("T")[0],
      weekEnd: w.weekEnd.toISOString().split("T")[0],
      totalIncome: w.totalIncome,
      projectedIncome: w.projectedIncome,
      totalExpenses: w.totalExpenses,
      balance: w.balance,
      canSpend: w.canSpend,
    }));

    return new Response(
      JSON.stringify({
        data: formattedWeeks,
        metrics,
        referenceDate: referenceDate.toISOString().split("T")[0],
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error fetching weekly cashflow:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to fetch weekly cashflow",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
