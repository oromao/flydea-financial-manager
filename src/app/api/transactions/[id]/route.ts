import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { type, description, categoryId, amount, date, observations, frequency, attachmentUrl } = body;

  const transaction = await prisma.transaction.update({
    where: { id, userId: session.user.id },
    data: {
      type,
      description,
      categoryId,
      amount: amount ? parseFloat(amount) : undefined,
      date: date ? new Date(date) : undefined,
      observations,
      frequency,
      attachmentUrl
    }
  });

  // Create Audit Log
  await prisma.auditLog.create({
    data: {
      action: "UPDATE",
      entity: "TRANSACTION",
      entityId: id,
      details: `Editada transação: ${description}`,
      userId: session.user.id
    }
  });

  return NextResponse.json(transaction);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.transaction.delete({
    where: { id, userId: session.user.id }
  });

  // Create Audit Log
  await prisma.auditLog.create({
    data: {
      action: "DELETE",
      entity: "TRANSACTION",
      entityId: id,
      details: "Removida transação",
      userId: session.user.id
    }
  });

  return NextResponse.json({ success: true });
}
