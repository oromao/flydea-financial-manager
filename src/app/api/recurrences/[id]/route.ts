import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const recurrence = await prisma.recurrence.findUnique({ where: { id } });
  if (!recurrence || recurrence.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.recurrence.delete({ where: { id } });

  await prisma.auditLog.create({
    data: {
      action: "DELETE",
      entity: "RECURRENCE",
      entityId: id,
      details: `Recorrência removida: ${recurrence.description}`,
      userId: session.user.id,
    },
  });

  return NextResponse.json({ ok: true });
}
