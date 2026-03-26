import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TransactionSchema } from "@/lib/validations";

const PAGE_SIZE = 20;

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = request.nextUrl;
  const type = searchParams.get("type");
  const category = searchParams.get("category");
  const search = searchParams.get("search");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
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
    ...(search ? {
      OR: [
        { description: { contains: search, mode: "insensitive" } },
        { observations: { contains: search, mode: "insensitive" } }
      ]
    } : {}),
    ...(startDate || endDate ? {
      date: {
        ...(startDate ? { gte: new Date(startDate) } : {}),
        ...(endDate ? { lte: new Date(endDate) } : {})
      }
    } : {})
  };

  if (all) {
    const transactions = await prisma.transaction.findMany({
      where,
      include: { category: true, account: true, tags: { include: { tag: true } } },
      orderBy: { date: "desc" }
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
}

export async function POST(request: NextRequest) {
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

  const { type, description, categoryId, amount, date, observations, frequency, attachmentUrl, blobUrl, accountId, tagIds } = parsed.data;

  const transaction = await prisma.transaction.create({
    data: {
      type,
      description,
      categoryId,
      amount,
      date: new Date(date),
      observations,
      frequency: frequency || "NONE",
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

  await prisma.auditLog.create({
    data: {
      action: "CREATE",
      entity: "TRANSACTION",
      entityId: transaction.id,
      details: `Nova transação: ${description}`,
      userId: session.user.id
    }
  });

  return NextResponse.json(transaction);
}
