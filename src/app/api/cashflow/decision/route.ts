import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { withRateLimit } from "@/lib/rate-limit";
import {
  computeWeeklyForecast,
  computeSpendDecision,
} from "@/lib/financial-engine";

export const GET = withRateLimit(async (request: Request) => {
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

    // Fetch revenue installments and expenses
    const revenueInstallments = await prisma.revenueInstallment.findMany({
      where: { revenue: { userId: user.id } },
    });

    const expenses = await prisma.transaction.findMany({
      where: { userId: user.id, type: "EXPENSE" },
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

    const decision = computeSpendDecision(weeklyForecast, referenceDate);

    return new Response(
      JSON.stringify({
        currentWeek: decision.currentWeek,
        decision: {
          status: decision.status,
          motivo: decision.motivo,
          saldoAtual: decision.saldoAtual,
          saldoProximaSemana: decision.saldoProximaSemana,
        },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    logger.error("Error calculating spend decision", { error: error instanceof Error ? error.message : String(error) });
    return new Response(
      JSON.stringify({
        error: "Failed to calculate spend decision",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});
