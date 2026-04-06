import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  calculateWeeklyCashflow,
  canSpendThisWeek,
} from "@/lib/cashflow-calculator";
import { getDate } from "date-fns";

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
    const dayOfMonth = getDate(referenceDate);

    let currentWeek = 1;
    if (dayOfMonth <= 7) currentWeek = 1;
    else if (dayOfMonth <= 14) currentWeek = 2;
    else if (dayOfMonth <= 21) currentWeek = 3;
    else currentWeek = 4;

    const revenueInstallments = await prisma.revenueInstallment.findMany({
      where: {
        revenue: {
          userId: user.id,
        },
      },
      include: {
        revenue: true,
      },
    });

    const expenses = await prisma.transaction.findMany({
      where: {
        userId: user.id,
        type: "EXPENSE",
      },
    });

    const mappedInstallments = revenueInstallments.map((inst) => ({
      id: inst.id,
      amount: inst.amount,
      dueDate: inst.dueDate,
      status: inst.status as "PENDING" | "RECEIVED",
    }));

    const mappedExpenses = expenses.map((exp) => ({
      id: exp.id,
      amount: exp.amount,
      dueDate: exp.dueDate || new Date(),
      paymentStatus: exp.paymentStatus,
    }));

    const weeklyCashflow = calculateWeeklyCashflow(
      referenceDate,
      mappedInstallments,
      mappedExpenses
    );

    const decision = canSpendThisWeek(currentWeek, weeklyCashflow);

    return new Response(
      JSON.stringify({
        currentWeek,
        dayOfMonth,
        decision,
        weeklyCashflow,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error calculating spend decision:", error);
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
}
