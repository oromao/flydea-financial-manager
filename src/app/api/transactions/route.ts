import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TransactionSchema } from "@/lib/validations";
import { BehavioralIntelligenceService } from "@/infrastructure/services/BehavioralIntelligenceService";
import { withRateLimit } from "@/lib/rate-limit";

function parseDateOrUndefined(value: string | null): Date | undefined {
  if (!value) return undefined;
  const d = new Date(value);
  if (isNaN(d.getTime())) return undefined;
  return d;
}

const PAGE_SIZE = 20;

export const GET = withRateLimit(async (request: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = request.nextUrl;
  const type = searchParams.get("type");
  const category = searchParams.get("category");
  const search = searchParams.get("search");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const paymentStatus = searchParams.get("paymentStatus");
  const accountId = searchParams.get("accountId");
  const tagId = searchParams.get("tagId");
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const all = searchParams.get("all") === "true";

  const where: any = {
    userId: session.user.id,
    ...(type ? { type } : {}),
    ...(category && category !== "Todos" ? { category: { name: category } } : {}),
    ...(accountId ? { accountId } : {}),
    ...(tagId ? { tags: { some: { tagId } } } : {}),
    ...(paymentStatus && paymentStatus !== "ALL" ? { paymentStatus } : {}),
    ...(search ? {
      OR: [
        { description: { contains: search, mode: "insensitive" } },
        { observations: { contains: search, mode: "insensitive" } }
      ]
    } : {}),
    ...(startDate || endDate ? {
      date: {
        ...(parseDateOrUndefined(startDate) ? { gte: parseDateOrUndefined(startDate) } : {}),
        ...(parseDateOrUndefined(endDate) ? { lte: parseDateOrUndefined(endDate) } : {})
      }
    } : {})
  };

  if (all) {
    const transactions = await prisma.transaction.findMany({
      where,
      include: { category: true, account: true, tags: { include: { tag: true } } },
      orderBy: { date: "desc" },
      take: 5000
    });
    return NextResponse.json({ data: transactions, total: transactions.length, page: 1, totalPages: 1 });
  }

  const [total, transactions] = await Promise.all([
    prisma.transaction.count({ where }),
    prisma.transaction.findMany({
      where,
      include: { category: true, account: true, tags: { include: { tag: true } } },
      orderBy: { date: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE
    })
  ]);

  return NextResponse.json({
    data: transactions,
    total,
    page,
    totalPages: Math.ceil(total / PAGE_SIZE)
  });
});

export const POST = withRateLimit(async (request: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = TransactionSchema.safeParse(body);

  if (!parsed.success) {
    const flattened = parsed.error.flatten().fieldErrors;
    const errorMsg = Object.entries(flattened)
      .map(([field, msgs]) => `${field}: ${msgs?.join(", ")}`)
      .join(" | ");
    return NextResponse.json({ error: errorMsg }, { status: 400 });
  }

  const { type, description, categoryId, amount, date, dueDate, paidAt, amountPaid, observations, frequency, paymentStatus, attachmentUrl, blobUrl, accountId, tagIds } = parsed.data;

  if (!categoryId) {
    return NextResponse.json({ error: "Categoria obrigatória" }, { status: 400 });
  }

  const transaction = await prisma.transaction.create({
    data: {
      type,
      description,
      categoryId,
      amount,
      date: new Date(date),
      dueDate: dueDate ? new Date(dueDate) : null,
      paidAt: paidAt ? new Date(paidAt) : null,
      amountPaid: amountPaid || 0,
      observations,
      frequency: frequency || "NONE",
      paymentStatus: paymentStatus || (type === "EXPENSE" ? "PAID" : "PAID"),
      attachmentUrl: attachmentUrl || null,
      blobUrl: blobUrl || null,
      accountId: accountId || null,
      userId: session.user.id,
      ...(tagIds && tagIds.length > 0 ? {
        tags: {
          create: tagIds.map((tagId) => ({ tagId }))
        }
      } : {})
    },
    include: { category: true, account: true, tags: { include: { tag: true } } }
  });

  // Background Intelligence & Audit Hooks (Non-blocking)
  void (async () => {
    try {
      const behavioralService = new BehavioralIntelligenceService();
      await behavioralService.onTransactionCreated(session.user.id, amount, categoryId);

      const auditLog = await prisma.auditLog.create({
        data: {
          action: "CREATE",
          entity: "TRANSACTION",
          entityId: transaction.id,
          details: `Nova transação: ${description}`,
          userId: session.user.id
        }
      });
    } catch (hookError) {
      console.error("[BackgroundHook] Error:", hookError);
    }
  })();

  return NextResponse.json(transaction);
});
