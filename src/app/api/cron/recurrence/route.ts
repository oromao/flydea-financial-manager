import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { isBefore, isSameDay, addMonths, addWeeks, addDays, startOfDay, format } from "date-fns";
import { sendRecurrenceNotification, sendDueSoonAlert } from "@/lib/email";

/**
 * Recurrence Cron Job — generates recurring transactions.
 *
 * Idempotency strategy:
 * - Checks for existing transaction by (userId, recurrenceId, recurrenceDate)
 * - recurrenceDate is stored as a Date but we compare using YYYY-MM-DD string
 *   to avoid false negatives from time component differences
 *
 * Safe to run multiple times — will not create duplicates.
 */
export async function GET(request: NextRequest) {
  // Protect cron endpoint with secret token
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret) {
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const now = startOfDay(new Date());
  const dueSoonLimit = addDays(now, 7);
  const recurrences = await prisma.recurrence.findMany({
    where: { isActive: true },
    include: { user: true }
  });

  const dueSoonTransactions = await prisma.transaction.findMany({
    where: {
      userId: { in: recurrences.map((r) => r.userId) },
      type: "EXPENSE",
      paymentStatus: "PENDING",
      dueDate: { gte: now, lte: dueSoonLimit },
    },
    include: { user: true }
  });

  let generatedCount = 0;

  const recurrencePromises: Promise<any>[] = [];

  for (const rec of recurrences) {
    let nextDate = rec.nextDate ? new Date(rec.nextDate) : new Date(rec.startDate);

    while (isBefore(nextDate, now) || isSameDay(nextDate, now)) {
      // Compare using date string to avoid time-component false negatives
      const nextDateStr = format(nextDate, "yyyy-MM-dd");
      const existing = await prisma.transaction.findFirst({
        where: {
          userId: rec.userId,
          recurrenceId: rec.id,
        }
      });

      // If a transaction exists for this recurrence on the same date, skip
      const alreadyExists = existing && format(existing.recurrenceDate!, "yyyy-MM-dd") === nextDateStr;

      if (!alreadyExists) {
        await prisma.transaction.create({
          data: {
            type: rec.type || "EXPENSE",
            description: `${rec.description} (Recorrente)`,
            amount: rec.amount,
            date: nextDate,
            categoryId: rec.categoryId,
            userId: rec.userId,
            status: "RECURRING",
            recurrenceId: rec.id,
            recurrenceDate: nextDate,
            paymentStatus: "PENDING",
            dueDate: nextDate,
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

        // Send email notification (Fire and forget or collect)
        if (rec.user?.email) {
          recurrencePromises.push(
            sendRecurrenceNotification({
              to: rec.user.email,
              userName: rec.user.name || "Usuário",
              description: rec.description,
              amount: rec.amount,
              date: nextDate,
            }).catch((e) => console.error("[CronRecurrence] Email error:", e))
          );
        }

        generatedCount++;
      }

      if (rec.frequency === "MONTHLY") {
        nextDate = addMonths(nextDate, 1);
      } else if (rec.frequency === "WEEKLY") {
        nextDate = addWeeks(nextDate, 1);
      } else {
        break;
      }
    }

    await prisma.recurrence.update({
      where: { id: rec.id },
      data: { nextDate }
    });
  }

  // Wait for all emails to be dispatched (non-blocking for the loop, but ensures completion before route ends)
  if (recurrencePromises.length > 0) {
    await Promise.allSettled(recurrencePromises);
  }

  const dueSoonPromises: Promise<any>[] = [];
  for (const tx of dueSoonTransactions) {
    if (tx.user?.email) {
      const notificationExists = await prisma.notification.findFirst({
        where: {
          userId: tx.userId,
          relatedId: tx.id,
          relatedType: "TRANSACTION",
          title: "Vencimento próximo",
        }
      });

      if (!notificationExists) {
        await prisma.notification.create({
          data: {
            userId: tx.userId,
            title: "Vencimento próximo",
            message: `${tx.description} vence em ${tx.dueDate?.toLocaleDateString("pt-BR") || "breve"}.`,
            type: "warning",
            relatedId: tx.id,
            relatedType: "TRANSACTION",
            expiresAt: addDays(now, 30),
          }
        });

        dueSoonPromises.push(
          sendDueSoonAlert({
            to: tx.user.email,
            userName: tx.user.name || "Usuário",
            description: tx.description,
            amount: tx.amount,
            dueDate: tx.dueDate || now,
          }).catch((e) => console.error("[CronDueSoon] Email error:", e))
        );
      }
    }
  }

  if (dueSoonPromises.length > 0) {
    await Promise.allSettled(dueSoonPromises);
  }

  return NextResponse.json({ success: true, generated: generatedCount });
}
