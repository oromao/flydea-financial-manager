import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AccountSchema } from "@/lib/validations";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const accounts = await prisma.account.findMany({
    where: { userId: session.user.id },
    include: {
      _count: { select: { transactions: true } }
    },
    orderBy: { createdAt: "asc" }
  });

  // Calculate real balance for each account based on transactions
  const accountsWithBalance = await Promise.all(
    accounts.map(async (account) => {
      const transactions = await prisma.transaction.findMany({
        where: { accountId: account.id },
        select: { type: true, amount: true }
      });

      const txBalance = transactions.reduce((sum, t) => {
        return t.type === "INCOME" ? sum + t.amount : sum - t.amount;
      }, 0);

      return {
        ...account,
        currentBalance: account.balance + txBalance
      };
    })
  );

  return NextResponse.json(accountsWithBalance);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const parsed = AccountSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const { name, type, balance, color } = parsed.data;

  const account = await prisma.account.create({
    data: { name, type, balance, color, userId: session.user.id }
  });

  await prisma.auditLog.create({
    data: {
      action: "CREATE",
      entity: "ACCOUNT",
      entityId: account.id,
      details: `Nova conta: ${name} (${type})`,
      userId: session.user.id
    }
  });

  return NextResponse.json(account);
}
