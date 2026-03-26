import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AccountSchema } from "@/lib/validations";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await prisma.account.findFirst({ where: { id, userId: session.user.id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await request.json();
  const parsed = AccountSchema.partial().safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });

  const account = await prisma.account.update({ where: { id }, data: parsed.data });

  await prisma.auditLog.create({
    data: {
      action: "UPDATE",
      entity: "ACCOUNT",
      entityId: id,
      details: `Conta atualizada: ${account.name}`,
      userId: session.user.id
    }
  });

  return NextResponse.json(account);
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await prisma.account.findFirst({ where: { id, userId: session.user.id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Unlink transactions from this account before deleting
  await prisma.transaction.updateMany({
    where: { accountId: id },
    data: { accountId: null }
  });

  await prisma.account.delete({ where: { id } });

  await prisma.auditLog.create({
    data: {
      action: "DELETE",
      entity: "ACCOUNT",
      entityId: id,
      details: `Conta removida: ${existing.name}`,
      userId: session.user.id
    }
  });

  return NextResponse.json({ success: true });
}
