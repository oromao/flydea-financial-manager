import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { withValidation } from "@/lib/api-helpers";
import { withRateLimit } from "@/lib/rate-limit";

export const GET = withRateLimit(async () => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, avatarUrl: true, role: true, createdAt: true },
  });

  return NextResponse.json({ user });
});

const putSchema = z.object({
  name: z.string().min(1).optional(),
  avatarUrl: z.string().optional(),
});

export const PUT = withRateLimit(
  withValidation(putSchema, async (body, request) => {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const name = typeof body.name === "string" ? body.name.trim() : undefined;
    const avatarUrl = typeof body.avatarUrl === "string" ? body.avatarUrl.trim() : undefined;

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      ...(name !== undefined ? { name: name || null } : {}),
      ...(avatarUrl !== undefined ? { avatarUrl: avatarUrl || null } : {}),
    },
    select: { id: true, name: true, email: true, avatarUrl: true, role: true, createdAt: true },
  });

  return NextResponse.json({ user });
  }));
