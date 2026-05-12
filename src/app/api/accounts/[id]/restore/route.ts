import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { withRateLimit } from "@/lib/rate-limit";

type RouteParams = { params: Promise<{ id: string }> };

export const PATCH = withRateLimit(async (_request: NextRequest, { params }: RouteParams) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const account = await prisma.account.findUnique({ where: { id } });
  if (!account || account.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (account.isActive) {
    return NextResponse.json({ error: "Conta já está ativa" }, { status: 409 });
  }

  const updated = await prisma.account.update({
    where: { id },
    data: { isActive: true },
  });

  await prisma.auditLog.create({
    data: {
      action: "UPDATE",
      entity: "ACCOUNT",
      entityId: id,
      details: `Conta reativada: ${account.name}`,
      userId: session.user.id,
    },
  });

  return NextResponse.json(updated);
});
