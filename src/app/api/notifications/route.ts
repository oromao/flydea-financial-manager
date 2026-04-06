import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 100
  });

  return NextResponse.json(notifications);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const notification = await prisma.notification.create({
    data: {
      userId: session.user.id,
      title: body.title,
      message: body.message,
      type: body.type || "info",
      relatedId: body.relatedId || null,
      relatedType: body.relatedType || null,
      metadata: body.metadata || undefined,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
    }
  });

  return NextResponse.json(notification);
}
