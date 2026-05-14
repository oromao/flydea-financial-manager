import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { withValidation } from "@/lib/api-helpers";

const VALID_EVENTS = [
  "transaction.created",
  "transaction.updated",
  "recurrence.generated",
  "budget.exceeded",
  "balance.low",
];

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const webhooks = await prisma.webhook.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json(webhooks);
}

const postSchema = z.object({
  url: z.string().url(),
  events: z.array(z.string()),
  name: z.string(),
  secret: z.string().optional(),
});

export const POST = withValidation(postSchema, async (body, request) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { url, events, name, secret } = body;

  if (!url || !Array.isArray(events) || events.length === 0 || !name) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const invalidEvents = events.filter((e: string) => !VALID_EVENTS.includes(e));
  if (invalidEvents.length > 0) {
    return NextResponse.json({ error: `Invalid events: ${invalidEvents.join(", ")}` }, { status: 400 });
  }

  const webhook = await prisma.webhook.create({
    data: {
      url,
      events,
      name,
      secret,
      userId: session.user.id,
      isActive: true,
    }
  });

  return NextResponse.json(webhook);
});

const deleteSchema = z.object({ id: z.string() });

export const DELETE = withValidation(deleteSchema, async (body, request) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const webhook = await prisma.webhook.findUnique({ where: { id } });
  if (!webhook || webhook.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.webhook.delete({ where: { id } });

  return NextResponse.json({ ok: true });
});