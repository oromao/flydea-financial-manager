import { NextResponse, NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";
import { isBefore, isSameDay, addMonths, addWeeks } from "date-fns";

const prisma = new PrismaClient();

export async function GET() {
  const now = new Date();
  const recurrences = await prisma.recurrence.findMany({
    where: { isActive: true }
  });

  let generatedCount = 0;

  for (const rec of recurrences) {
    let nextDate = rec.nextDate ? new Date(rec.nextDate) : new Date(rec.startDate);
    
    while (isBefore(nextDate, now) || isSameDay(nextDate, now)) {
      // Create transaction
      await prisma.transaction.create({
        data: {
          type: "EXPENSE",
          description: `${rec.description} (Recorrente)`,
          amount: rec.amount,
          date: new Date(nextDate),
          categoryId: rec.categoryId,
          userId: rec.userId,
          status: "RECURRING"
        }
      });

      // Log action
      await prisma.auditLog.create({
        data: {
          action: "RECURRENCE",
          entity: "TRANSACTION",
          entityId: rec.id,
          details: `Gerada transação automática para ${rec.description}`,
          userId: rec.userId
        }
      });

      // Advance nextDate
      if (rec.frequency === "MONTHLY") {
        nextDate = addMonths(nextDate, 1);
      } else if (rec.frequency === "WEEKLY") {
        nextDate = addWeeks(nextDate, 1);
      }
      
      generatedCount++;
    }

    // Update recurrence nextDate
    await prisma.recurrence.update({
      where: { id: rec.id },
      data: { nextDate }
    });
  }

  return NextResponse.json({ success: true, generated: generatedCount });
}
