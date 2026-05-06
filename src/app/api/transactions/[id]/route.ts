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
      dueDate: rest.dueDate ? new Date(rest.dueDate) : rest.dueDate === "" ? undefined : undefined,
      paidAt: rest.paidAt ? new Date(rest.paidAt) : rest.paidAt === "" ? undefined : undefined,
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

  // Background Audit (Non-blocking)
  void (async () => {
    try {
      const auditLog = await prisma.auditLog.create({
        data: {
          action: "UPDATE",
          entity: "TRANSACTION",
          entityId: id,
          details: `Editada transação: ${transaction.description}`,
          userId: session.user.id
        }
      });
    } catch (e) {
      console.error("[AuditHook] Error:", e);
    }
  })();

  return NextResponse.json(transaction);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const existing = await prisma.transaction.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isOwner = existing.userId === session.user.id;
  const isAdmin = session.user.role === "ADMIN";

  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: "Você não tem permissão para deletar esta transação" }, { status: 403 });
  }

  try {
    await prisma.transaction.delete({ where: { id } });
    
    // Background Audit (Non-blocking)
    void (async () => {
      try {
        const auditLog = await prisma.auditLog.create({
          data: {
            action: "DELETE",
            entity: "TRANSACTION",
            entityId: id,
            details: `Removida transação: ${existing.description}`,
            userId: session.user.id
          }
        });
      } catch (e) {
        console.error("[AuditHook] Error:", e);
      }
    })();
    
    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Erro ao excluir";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
