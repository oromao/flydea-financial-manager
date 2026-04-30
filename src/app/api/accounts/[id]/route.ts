import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RouteParams = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();

  const account = await prisma.account.findUnique({ where: { id } });
  if (!account || account.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await prisma.account.update({
    where: { id },
    data: {
      ...(body.name && { name: body.name }),
      ...(body.type && { type: body.type }),
      ...(body.balance !== undefined && { balance: body.balance }),
      ...(body.color && { color: body.color }),
      ...(body.isActive !== undefined && { isActive: body.isActive }),
    }
  });

  await prisma.auditLog.create({
    data: {
      action: "UPDATE",
      entity: "ACCOUNT",
      entityId: id,
      details: body.isActive !== undefined 
        ? `Conta ${body.isActive ? "reativada" : "arquivada"}: ${account.name}`
        : `Conta atualizada: ${account.name}`,
      userId: session.user.id
    }
  });

  return NextResponse.json(updated);
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const account = await prisma.account.findUnique({ where: { id } });
  if (!account || account.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.account.delete({ where: { id } });

  await prisma.auditLog.create({
    data: {
      action: "DELETE",
      entity: "ACCOUNT",
      entityId: id,
      details: `Conta excluída: ${account.name}`,
      userId: session.user.id
    }
  });

  return NextResponse.json({ ok: true });
}