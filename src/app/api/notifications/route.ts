import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { withValidation } from "@/lib/api-helpers";
import { withRateLimit } from "@/lib/rate-limit";

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

const postSchema = z.object({
  type: z.string(),
  title: z.string(),
  message: z.string(),
  userId: z.string(),
});

export const POST = withRateLimit(
  withValidation(postSchema, async (body, request) => {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const notification = await prisma.notification.create({
      data: {
        userId: session.user.id,
        title: body.title,
        message: body.message,
        type: body.type || "info",
        relatedId: (body as any).relatedId || null,
        relatedType: (body as any).relatedType || null,
        metadata: (body as any).metadata || undefined,
        expiresAt: (body as any).expiresAt ? new Date((body as any).expiresAt) : null,
      }
    });

    return NextResponse.json(notification);
  })
);

const patchSchema = z.object({ ids: z.array(z.string()) });

export const PATCH = withRateLimit(
  withValidation(patchSchema, async (body, request) => {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await prisma.notification.updateMany({
      where: { id: { in: body.ids }, userId: session.user.id },
      data: { readAt: new Date() },
    });

    return NextResponse.json({ ok: true });
  })
);
