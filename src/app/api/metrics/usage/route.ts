import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { withRateLimit } from "@/lib/rate-limit";

const UsageEventSchema = z.object({
  event: z.enum([
    "import_file", "import_success", "import_review",
    "quick_add", "category_correct", "budget_create",
    "close_month", "view_insight", "use_copilot", "export_data",
  ]),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const POST = withRateLimit(async (request: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = UsageEventSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos", fields: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const { event, metadata } = parsed.data;

  try {
    await prisma.auditLog.create({
      data: {
        action: "USAGE_EVENT",
        entity: event,
        entityId: session.user.id,
        details: JSON.stringify(metadata || {}),
        userId: session.user.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("Metrics error", { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
});

export const GET = withRateLimit(async (request: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const days = parseInt(searchParams.get("days") || "30", 10);

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  const isAdmin = user?.role === "ADMIN";

  if (isAdmin) {
    try {
      const twelveMonthsAgo = new Date();
      twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

      const dauRaw = await prisma.$queryRaw<Array<{ date: Date; count: bigint }>>`
        SELECT DATE("createdAt") as "date", COUNT(DISTINCT "userId") as "count"
        FROM "AuditLog"
        WHERE "action" = 'USAGE_EVENT' AND "createdAt" >= ${startDate}
        GROUP BY DATE("createdAt")
        ORDER BY "date" ASC
      `;

      const mauRaw = await prisma.$queryRaw<Array<{ month: Date; count: bigint }>>`
        SELECT DATE_TRUNC('month', "createdAt") as "month", COUNT(DISTINCT "userId") as "count"
        FROM "AuditLog"
        WHERE "action" = 'USAGE_EVENT' AND "createdAt" >= ${twelveMonthsAgo}
        GROUP BY DATE_TRUNC('month', "createdAt")
        ORDER BY "month" ASC
      `;

      const featuresRaw = await prisma.$queryRaw<Array<{ entity: string; count: bigint }>>`
        SELECT "entity", COUNT(*) as "count"
        FROM "AuditLog"
        WHERE "action" = 'USAGE_EVENT' AND "createdAt" >= ${startDate}
        GROUP BY "entity"
        ORDER BY "count" DESC
      `;

      const pageViewsRaw = await prisma.$queryRaw<Array<{ entity: string; count: bigint }>>`
        SELECT "entity", COUNT(*) as "count"
        FROM "AuditLog"
        WHERE "action" = 'USAGE_EVENT' AND "entity" LIKE 'page_view_%' AND "createdAt" >= ${startDate}
        GROUP BY "entity"
        ORDER BY "count" DESC
      `;

      const totalUsers = await prisma.user.count();

      return NextResponse.json({
        dau: dauRaw.map(d => ({ date: new Date(d.date).toISOString().split("T")[0], count: Number(d.count) })),
        mau: mauRaw.map(m => ({ month: new Date(m.month).toISOString().slice(0, 7), count: Number(m.count) })),
        features: featuresRaw.map(f => ({ name: f.entity, count: Number(f.count) })),
        pageViews: pageViewsRaw.map(pv => ({ path: pv.entity, count: Number(pv.count) })),
        totalUsers,
        period: days,
      });
    } catch (error) {
      logger.error("Metrics error", { error: error instanceof Error ? error.message : String(error) });
      return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
  }

  try {
    const events = await prisma.auditLog.findMany({
      where: {
        userId: session.user.id,
        action: "USAGE_EVENT",
        createdAt: { gte: startDate },
      },
      orderBy: { createdAt: "desc" },
      take: 500,
    });

    const eventCounts = events.reduce((acc, event) => {
      const eventType = event.entity;
      acc[eventType] = (acc[eventType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      totalEvents: events.length,
      eventCounts,
      period: days,
    });
  } catch (error) {
    logger.error("Metrics error", { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
});
