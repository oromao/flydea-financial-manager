import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { withRateLimit } from "@/lib/rate-limit";

export const PATCH = withRateLimit(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();

  const existing = await prisma.notification.findFirst({ where: { id, userId: session.user.id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.notification.update({
    where: { id },
    data: {
      ...(body.read !== undefined ? { read: body.read, readAt: body.read ? new Date() : null } : {}),
    }
  });

  return NextResponse.json(updated);
});

export const DELETE = withRateLimit(async (
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const existing = await prisma.notification.findFirst({ where: { id, userId: session.user.id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.notification.delete({ where: { id } });
  return NextResponse.json({ success: true });
});
