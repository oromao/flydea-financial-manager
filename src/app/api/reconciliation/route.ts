import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { withValidation } from "@/lib/api-helpers";
import { withRateLimit } from "@/lib/rate-limit";

const ReconciliationSchema = z.object({
  transactionId: z.string().min(1, "ID da transação obrigatório"),
  amount: z.number().positive("Valor deve ser positivo"),
  note: z.string().optional(),
});

export const POST = withRateLimit(
  withValidation(ReconciliationSchema, async (body, request) => {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { transactionId, amount, note } = body;

  const transaction = await prisma.transaction.findFirst({
    where: { id: transactionId, userId: session.user.id },
  });
  if (!transaction) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (transaction.type !== "EXPENSE") {
    return NextResponse.json({ error: "Somente despesas podem receber baixa parcial" }, { status: 400 });
  }

  const currentPaid = transaction.amountPaid || 0;
  const nextPaid = Math.min(transaction.amount, currentPaid + amount);
  const nextStatus = nextPaid >= transaction.amount ? "PAID" : "PENDING";

  const updated = await prisma.transaction.update({
    where: { id: transactionId },
    data: {
      amountPaid: nextPaid,
      paymentStatus: nextStatus,
      paidAt: nextStatus === "PAID" ? new Date() : transaction.paidAt,
      observations: note ? [transaction.observations, note].filter(Boolean).join(" | ") : transaction.observations,
    },
  });

  await prisma.auditLog.create({
    data: {
      action: "UPDATE",
      entity: "TRANSACTION",
      entityId: transactionId,
      details: `Baixa parcial aplicada: ${amount}`,
      userId: session.user.id,
    },
  });

  return NextResponse.json(updated);
  })
);
