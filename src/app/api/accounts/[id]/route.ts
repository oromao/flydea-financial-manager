import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AccountSchema } from "@/lib/validations";
import { withRateLimit } from "@/lib/rate-limit";

type RouteParams = { params: Promise<{ id: string }> };

export const PUT = withRateLimit(async (request: NextRequest, { params }: RouteParams) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const parsed = AccountSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const account = await prisma.account.findUnique({ where: { id } });
  if (!account || account.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { name, type, balance, color, isActive } = parsed.data;

  const updated = await prisma.account.update({
    where: { id },
    data: {
      ...(name ? { name } : {}),
      ...(type ? { type } : {}),
      ...(balance !== undefined ? { balance } : {}),
      ...(color ? { color } : {}),
      ...(isActive !== undefined ? { isActive } : {}),
    }
  });

  await prisma.auditLog.create({
    data: {
      action: "UPDATE",
      entity: "ACCOUNT",
      entityId: id,
      details: isActive !== undefined 
        ? `Conta ${isActive ? "reativada" : "arquivada"}: ${account.name}`
        : `Conta atualizada: ${account.name}`,
      userId: session.user.id
    }
  });

  return NextResponse.json(updated);
});

export const DELETE = withRateLimit(async (_request: NextRequest, { params }: RouteParams) => {
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
});