import { NextResponse, NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { withRateLimit } from "@/lib/rate-limit";
import { z } from "zod";
import { withValidation } from "@/lib/api-helpers";

const prisma = new PrismaClient();

const ImportSchema = z.object({
  transactions: z.array(z.object({
    description: z.string().min(1),
    amount: z.number(),
    date: z.string().refine((d) => !isNaN(Date.parse(d)), "Data inválida"),
    categoryId: z.string().optional(),
  })).min(1, "Mínimo 1 transação"),
});

export const POST = withRateLimit(
  withValidation(ImportSchema, async (body, request) => {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { transactions } = body;

    // Get default category "Outros"
    const defaultCategory = await prisma.category.findFirst({
      where: { name: "Outros", userId: null }
    });

    const results = await prisma.$transaction(
      transactions.map((t) => 
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
  })
);
