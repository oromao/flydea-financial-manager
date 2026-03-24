import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = request.nextUrl;
  const type = searchParams.get("type");
  const category = searchParams.get("category");
  const search = searchParams.get("search");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  
  const transactions = await prisma.transaction.findMany({
    where: {
      userId: session.user.id,
      ...(type ? { type } : {}),
      ...(category && category !== "Todos" ? { category: { name: category } } : {}),
      ...(search ? {
        OR: [
          { description: { contains: search } },
          { observations: { contains: search } }
        ]
      } : {}),
      ...(startDate || endDate ? {
        date: {
          ...(startDate ? { gte: new Date(startDate) } : {}),
          ...(endDate ? { lte: new Date(endDate) } : {})
        }
      } : {})
    },
    include: { category: true },
    orderBy: { date: "desc" }
  });

  return NextResponse.json(transactions);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { type, description, categoryId, amount, date, observations, frequency, attachmentUrl, blobUrl } = body;

  if (!type || !description || !categoryId || !amount || !date) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const transaction = await prisma.transaction.create({
    data: {
      type,
      description,
      categoryId,
      amount: parseFloat(amount),
      date: new Date(date),
      observations,
      frequency: frequency || "NONE",
      attachmentUrl,
      blobUrl,
      userId: session.user.id
    }
  });

  // Create Audit Log
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
