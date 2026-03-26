import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { isBefore, isSameDay, addMonths, addWeeks } from "date-fns";
import { sendRecurrenceNotification } from "@/lib/email";

export async function GET(request: NextRequest) {
  // Protect cron endpoint with secret token
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret) {
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const now = new Date();
  const recurrences = await prisma.recurrence.findMany({
    where: { isActive: true },
    include: { user: true }
  });

  let generatedCount = 0;

  for (const rec of recurrences) {
    let nextDate = rec.nextDate ? new Date(rec.nextDate) : new Date(rec.startDate);

    while (isBefore(nextDate, now) || isSameDay(nextDate, now)) {
      await prisma.transaction.create({
        data: {
          type: rec.type || "EXPENSE",
          description: `${rec.description} (Recorrente)`,
          amount: rec.amount,
          date: new Date(nextDate),
          categoryId: rec.categoryId,
          userId: rec.userId,
          status: "RECURRING"
        }
      });

      await prisma.auditLog.create({
        data: {
          action: "RECURRENCE",
          entity: "TRANSACTION",
          entityId: rec.id,
          details: `Gerada transação automática para ${rec.description}`,
          userId: rec.userId
        }
      });

      // Send email notification
      if (rec.user?.email) {
        await sendRecurrenceNotification({
          to: rec.user.email,
          userName: rec.user.name || "Usuário",
          description: rec.description,
          amount: rec.amount,
          date: new Date(nextDate),
        }).catch(() => {}); // non-blocking
      }

      if (rec.frequency === "MONTHLY") {
        nextDate = addMonths(nextDate, 1);
      } else if (rec.frequency === "WEEKLY") {
        nextDate = addWeeks(nextDate, 1);
      } else {
        break;
      }

      generatedCount++;
    }

    await prisma.recurrence.update({
      where: { id: rec.id },
      data: { nextDate }
    });
  }

  return NextResponse.json({ success: true, generated: generatedCount });
}
