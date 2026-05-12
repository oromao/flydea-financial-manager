import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { RecurrenceSchema } from "@/lib/validations";
import { addMonths, addWeeks, isBefore, format } from "date-fns";
import { withRateLimit } from "@/lib/rate-limit";

export const GET = withRateLimit(async () => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const recurrences = await prisma.recurrence.findMany({
    where: { userId: session.user.id },
    include: { category: true },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json(recurrences);
});

export const POST = withRateLimit(async (request: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = RecurrenceSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });

  const { description, amount, type, frequency, startDate, categoryId } = parsed.data;

  const recurrence = await prisma.recurrence.create({
    data: {
      description,
      amount,
      type: type || "EXPENSE",
      frequency,
      startDate: new Date(startDate),
      nextDate: new Date(startDate),
      categoryId,
      userId: session.user.id
    }
  });

  await prisma.auditLog.create({
    data: {
      action: "CREATE",
      entity: "RECURRENCE",
      entityId: recurrence.id,
      details: `Nova regra: ${description} (${frequency})`,
      userId: session.user.id
    }
  });

  // Initial trigger: create first transaction if startDate <= today
  const start = new Date(startDate);
  const today = new Date();
  if (isBefore(start, today) || format(start, "yyyy-MM-dd") === format(today, "yyyy-MM-dd")) {
    const nextDate = frequency === "WEEKLY" ? addWeeks(start, 1) : addMonths(start, 1);
    await prisma.transaction.create({
      data: {
        type: type || "EXPENSE",
        description: `${description} (Automatizado)`,
        amount,
        date: start,
        categoryId,
        userId: session.user.id,
        status: "RECURRING",
        recurrenceId: recurrence.id,
        recurrenceDate: start
      }
    });

    await prisma.recurrence.update({
      where: { id: recurrence.id },
      data: { nextDate }
    });
  }

  return NextResponse.json(recurrence);
});
