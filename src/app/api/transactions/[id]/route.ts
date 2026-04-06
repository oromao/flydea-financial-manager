import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TransactionSchema } from "@/lib/validations";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const existing = await prisma.transaction.findFirst({ where: { id, userId: session.user.id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await request.json();
  const parsed = TransactionSchema.partial().safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });

  const { tagIds, ...rest } = parsed.data;
  const nextAmountPaid = typeof rest.amountPaid === "number" ? rest.amountPaid : undefined;
  const nextPaymentStatus = rest.paymentStatus;
  const nextPaidAt = rest.paidAt;
  const nextDueDate = rest.dueDate;
  const amount = rest.amount;
  const currentAmountPaid = existing.amountPaid || 0;
  const resolvedAmountPaid =
    nextAmountPaid !== undefined
      ? nextAmountPaid
      : nextPaymentStatus === "PAID" && amount !== undefined
        ? amount
        : nextPaymentStatus === "PENDING"
          ? currentAmountPaid
          : undefined;

  const transaction = await prisma.transaction.update({
    where: { id },
    data: {
      ...rest,
      date: rest.date ? new Date(rest.date) : undefined,
      dueDate: rest.dueDate ? new Date(rest.dueDate) : rest.dueDate === "" ? null : undefined,
      paidAt: rest.paidAt ? new Date(rest.paidAt) : rest.paidAt === "" ? null : undefined,
      paymentStatus: rest.paymentStatus || undefined,
      amountPaid: resolvedAmountPaid,
      attachmentUrl: rest.attachmentUrl || null,
      blobUrl: rest.blobUrl || null,
      accountId: rest.accountId || null,
      ...(tagIds !== undefined ? {
        tags: {
          deleteMany: {},
          create: tagIds.map((tagId) => ({ tagId }))
        }
      } : {})
    },
    include: { category: true, account: true, tags: { include: { tag: true } } }
  });

  await prisma.auditLog.create({
    data: {
      action: "UPDATE",
      entity: "TRANSACTION",
      entityId: id,
      details: `Editada transação: ${transaction.description}`,
      userId: session.user.id
    }
  });

  return NextResponse.json(transaction);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const existing = await prisma.transaction.findFirst({ where: { id, userId: session.user.id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (session.user.role !== "ADMIN") {
    const approval = await prisma.approvalRequest.create({
      data: {
        action: "DELETE",
        entity: "TRANSACTION",
        entityId: id,
        payload: { description: existing.description, amount: existing.amount },
        requestedById: session.user.id,
        reason: "Exclusão solicitada por usuário não administrador"
      }
    });

    await prisma.auditLog.create({
      data: {
        action: "CREATE",
        entity: "APPROVAL_REQUEST",
        entityId: approval.id,
        details: `Solicitação de exclusão de transação: ${existing.description}`,
        userId: session.user.id
      }
    });

    return NextResponse.json({ approvalRequested: true, approvalId: approval.id });
  }

  await prisma.transaction.delete({ where: { id } });

  await prisma.auditLog.create({
    data: {
      action: "DELETE",
      entity: "TRANSACTION",
      entityId: id,
      details: `Removida transação: ${existing.description}`,
      userId: session.user.id
    }
  });

  return NextResponse.json({ success: true });
}
