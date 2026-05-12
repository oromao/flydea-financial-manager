import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { RecurrenceSchema } from "@/lib/validations";
import { withRateLimit } from "@/lib/rate-limit";

type RouteParams = { params: Promise<{ id: string }> };

export const PUT = withRateLimit(async (
  request: NextRequest,
  { params }: RouteParams
) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const recurrence = await prisma.recurrence.findUnique({ where: { id } });
  if (!recurrence || recurrence.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = RecurrenceSchema.partial().safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });

  const data = parsed.data;
  const updated = await prisma.recurrence.update({
    where: { id },
    data: {
      ...(data.description !== undefined ? { description: data.description } : {}),
      ...(data.amount !== undefined ? { amount: data.amount } : {}),
      ...(data.type !== undefined ? { type: data.type } : {}),
      ...(data.frequency !== undefined ? { frequency: data.frequency } : {}),
      ...(data.startDate !== undefined ? { startDate: new Date(data.startDate) } : {}),
      ...(data.categoryId !== undefined ? { categoryId: data.categoryId } : {}),
      ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
      ...(data.startDate !== undefined ? { nextDate: new Date(data.startDate) } : {}),
      ...(data.type !== undefined || data.frequency !== undefined ? { isActive: true } : {}),
    }
  });

  await prisma.auditLog.create({
    data: {
      action: "UPDATE",
      entity: "RECURRENCE",
      entityId: id,
      details: `Recorrência atualizada: ${updated.description}`,
      userId: session.user.id,
    },
  });

  return NextResponse.json(updated);
});

export const DELETE = withRateLimit(async (
  _request: NextRequest,
  { params }: RouteParams
) => {
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
});
