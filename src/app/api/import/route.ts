import { NextResponse, NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { transactions } = await request.json();

  if (!Array.isArray(transactions) || transactions.length === 0) {
    return NextResponse.json({ error: "Nenhuma transação enviada" }, { status: 400 });
  }

  // Get default category "Outros"
  const defaultCategory = await prisma.category.findUnique({
    where: { name: "Outros" }
  });

  const results = await prisma.$transaction(
    transactions.map((t: any) => 
      prisma.transaction.create({
        data: {
          type: t.amount < 0 ? "EXPENSE" : "INCOME",
          description: t.description,
          categoryId: t.categoryId || defaultCategory?.id || "",
          amount: Math.abs(t.amount),
          date: new Date(t.date),
          userId: session.user.id
        }
      })
    )
  );

  // Log the import action
  await prisma.auditLog.create({
    data: {
      action: "IMPORT",
      entity: "TRANSACTION",
      entityId: "BATCH",
      details: `Importadas ${results.length} transações via arquivo`,
      userId: session.user.id
    }
  });

  return NextResponse.json({ success: true, count: results.length });
}
