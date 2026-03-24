import { NextResponse, NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { startOfMonth, addMonths, isBefore, format } from "date-fns";

const prisma = new PrismaClient();

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const recurrences = await prisma.recurrence.findMany({
    where: { userId: session.user.id },
    include: { category: true },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json(recurrences);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { description, amount, frequency, startDate, categoryId } = body;

  if (!description || !amount || !frequency || !startDate || !categoryId) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const recurrence = await prisma.recurrence.create({
    data: {
      description,
      amount: parseFloat(amount),
      frequency,
      startDate: new Date(startDate),
      nextDate: new Date(startDate),
      categoryId,
      userId: session.user.id
    }
  });

  // Log action
  await prisma.auditLog.create({
    data: {
      action: "CREATE",
      entity: "RECURRENCE",
      entityId: recurrence.id,
      details: `Nova regra: ${description} (${frequency})`,
      userId: session.user.id
    }
  });

  // Initial trigger: Create the first transaction if startDate is <= today
  if (isBefore(new Date(startDate), new Date()) || format(new Date(startDate), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')) {
    await prisma.transaction.create({
      data: {
        type: "EXPENSE", // Default for recurrence for now
        description: `${description} (Automatizado)`,
        amount: parseFloat(amount),
        date: new Date(startDate),
        categoryId,
        userId: session.user.id,
        status: "RECURRING"
      }
    });
    
    // Update nextDate
    await prisma.recurrence.update({
      where: { id: recurrence.id },
      data: { nextDate: addMonths(new Date(startDate), 1) }
    });
  }

  return NextResponse.json(recurrence);
}
