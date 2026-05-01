import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { withRateLimit } from "@/lib/rate-limit";

export const GET = withRateLimit(async (request: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "25");
  const action = searchParams.get("action");
  const entity = searchParams.get("entity");
  const query = searchParams.get("query");

  const where: any = {};
  if (action && action !== "ALL") where.action = action;
  if (entity && entity !== "ALL") where.entity = entity;
  if (query) {
    where.OR = [
      { details: { contains: query, mode: "insensitive" } },
      { entity: { contains: query, mode: "insensitive" } },
      { action: { contains: query, mode: "insensitive" } },
      { user: { name: { contains: query, mode: "insensitive" } } }
    ];
  }

  const [total, logs] = await Promise.all([
    prisma.auditLog.count({ where }),
    prisma.auditLog.findMany({
      where,
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit
    })
  ]);

  return NextResponse.json({
    data: logs,
    total,
    page,
    totalPages: Math.ceil(total / limit)
  });
});
