import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const transactionId = typeof body.transactionId === "string" ? body.transactionId : "";
  const amount = Number(body.amount);
  const note = typeof body.note === "string" ? body.note : "";

  if (!transactionId || !Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

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
}
