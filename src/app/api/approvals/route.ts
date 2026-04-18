import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const approvals = await prisma.approvalRequest.findMany({
    include: {
      requestedBy: { select: { name: true, email: true } },
      reviewedBy: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(approvals);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json().catch(() => ({}));
  const approvalId = typeof body.approvalId === "string" ? body.approvalId : "";
  const action = typeof body.action === "string" ? body.action : "";

  if (!approvalId || !["APPROVE", "REJECT"].includes(action)) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const approval = await prisma.approvalRequest.findUnique({ where: { id: approvalId } });
  if (!approval || approval.status !== "PENDING") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (action === "APPROVE") {
    if (approval.entity === "TRANSACTION") {
      await prisma.transaction.delete({ where: { id: approval.entityId } }).catch(() => null);
    }
    if (approval.entity === "ACCOUNT") {
      await prisma.transaction.updateMany({ where: { accountId: approval.entityId }, data: { accountId: null } });
      await prisma.account.delete({ where: { id: approval.entityId } }).catch(() => null);
    }
  }

  const updated = await prisma.approvalRequest.update({
    where: { id: approvalId },
    data: {
      status: action === "APPROVE" ? "APPROVED" : "REJECTED",
      reviewedById: session.user.id,
      reviewedAt: new Date(),
    }
  });

  await prisma.auditLog.create({
    data: {
      action: "UPDATE",
      entity: "APPROVAL_REQUEST",
      entityId: approvalId,
      details: `${action === "APPROVE" ? "Aprovada" : "Rejeitada"} solicitação de deletar ${approval.entity}`,
      userId: session.user.id,
    }
  });

  return NextResponse.json(updated);
}
