import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const startDate = new Date(currentYear, currentMonth, 1);
  const endDate = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);

  const transactions = await prisma.transaction.findMany({
    where: {
      userId: session.user.id,
      date: {
        gte: startDate,
        lte: endDate
      }
    }
  });

  let balance = 0;
  let income = 0;
  let expenses = 0;

  // Aggregate by day for the chart
  const chartDataMap: Record<number, { day: number, income: number, expenses: number }> = {};
  
  // Fill in all days of the month to ensure a continuous line/bar chart
  for (let d = 1; d <= endDate.getDate(); d++) {
    chartDataMap[d] = { day: d, income: 0, expenses: 0 };
  }

  transactions.forEach(t => {
    const day = t.date.getDate();
    if (t.type === "INCOME") {
      balance += t.amount;
      income += t.amount;
      chartDataMap[day].income += t.amount;
    } else {
      balance -= t.amount;
      expenses += t.amount;
      chartDataMap[day].expenses += t.amount;
    }
  });

  const chartData = Object.values(chartDataMap).sort((a, b) => a.day - b.day);

  return NextResponse.json({ balance, income, expenses, chartData });
}
