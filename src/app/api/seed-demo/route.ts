import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const userId = session.user.id;

  const existingTx = await prisma.transaction.findFirst({ where: { userId } });
  if (existingTx) {
    return NextResponse.json({ error: "Usuário já possui dados" }, { status: 400 });
  }

  const categories = await Promise.all([
    prisma.category.create({ data: { name: "Salário", type: "INCOME", userId } }),
    prisma.category.create({ data: { name: "Freelance", type: "INCOME", userId } }),
    prisma.category.create({ data: { name: "Investimentos", type: "INCOME", userId } }),
    prisma.category.create({ data: { name: "Alimentação", type: "EXPENSE", userId } }),
    prisma.category.create({ data: { name: "Transporte", type: "EXPENSE", userId } }),
    prisma.category.create({ data: { name: "Moradia", type: "EXPENSE", userId } }),
    prisma.category.create({ data: { name: "Lazer", type: "EXPENSE", userId } }),
    prisma.category.create({ data: { name: "Saúde", type: "EXPENSE", userId } }),
    prisma.category.create({ data: { name: "Educação", type: "EXPENSE", userId } }),
    prisma.category.create({ data: { name: "Assinaturas", type: "EXPENSE", userId } }),
  ]);

  const account = await prisma.account.create({
    data: { name: "Conta Corrente", type: "CHECKING", balance: 0, color: "#059669", userId },
  });

  const now = new Date();
  const transactions: {
    description: string;
    amount: number;
    date: Date;
    dueDate: Date;
    type: "INCOME" | "EXPENSE";
    paymentStatus: "PAID" | "PENDING";
    categoryId: string;
    accountId: string;
    userId: string;
  }[] = [];

  for (let monthOffset = 2; monthOffset >= 0; monthOffset--) {
    const baseDate = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1);

    transactions.push({
      description: "Salário",
      amount: 8500,
      date: new Date(baseDate.getFullYear(), baseDate.getMonth(), 5),
      dueDate: new Date(baseDate.getFullYear(), baseDate.getMonth(), 5),
      type: "INCOME",
      paymentStatus: "PAID",
      categoryId: categories[0].id,
      accountId: account.id,
      userId,
    });

    const expenses = [
      { desc: "Aluguel", amount: 2200, cat: 5, day: 10 },
      { desc: "Supermercado", amount: 850, cat: 3, day: 8 },
      { desc: "Internet", amount: 129, cat: 9, day: 15 },
      { desc: "Streaming", amount: 55, cat: 9, day: 20 },
      { desc: "Academia", amount: 120, cat: 7, day: 1 },
      { desc: "Transporte", amount: 350, cat: 4, day: 3 },
    ];

    for (const exp of expenses) {
      transactions.push({
        description: exp.desc,
        amount: exp.amount,
        date: new Date(baseDate.getFullYear(), baseDate.getMonth(), exp.day),
        dueDate: new Date(baseDate.getFullYear(), baseDate.getMonth(), exp.day),
        type: "EXPENSE",
        paymentStatus: "PAID",
        categoryId: categories[exp.cat].id,
        accountId: account.id,
        userId,
      });
    }

    transactions.push({
      description: "Restaurante",
      amount: 180,
      date: new Date(baseDate.getFullYear(), baseDate.getMonth(), 12),
      dueDate: new Date(baseDate.getFullYear(), baseDate.getMonth(), 12),
      type: "EXPENSE",
      paymentStatus: "PAID",
      categoryId: categories[3].id,
      accountId: account.id,
      userId,
    });
    transactions.push({
      description: "Uber",
      amount: 45,
      date: new Date(baseDate.getFullYear(), baseDate.getMonth(), 18),
      dueDate: new Date(baseDate.getFullYear(), baseDate.getMonth(), 18),
      type: "EXPENSE",
      paymentStatus: "PAID",
      categoryId: categories[4].id,
      accountId: account.id,
      userId,
    });
    transactions.push({
      description: "Farmácia",
      amount: 95,
      date: new Date(baseDate.getFullYear(), baseDate.getMonth(), 7),
      dueDate: new Date(baseDate.getFullYear(), baseDate.getMonth(), 7),
      type: "EXPENSE",
      paymentStatus: "PAID",
      categoryId: categories[7].id,
      accountId: account.id,
      userId,
    });

    if (monthOffset === 0) {
      transactions.push({
        description: "Curso Online",
        amount: 450,
        date: new Date(baseDate.getFullYear(), baseDate.getMonth(), 25),
        dueDate: new Date(baseDate.getFullYear(), baseDate.getMonth(), 25),
        type: "EXPENSE",
        paymentStatus: "PENDING",
        categoryId: categories[8].id,
        accountId: account.id,
        userId,
      });
    }
  }

  await prisma.transaction.createMany({ data: transactions });

  const expenseCategories = categories.filter(c => c.type === "EXPENSE");
  await Promise.all(
    expenseCategories.slice(0, 5).map(cat =>
      prisma.budget.create({
        data: {
          categoryId: cat.id,
          amount: cat.name === "Alimentação" ? 1200 : cat.name === "Moradia" ? 2500 : cat.name === "Transporte" ? 500 : cat.name === "Lazer" ? 400 : 300,
          period: "MONTHLY",
          alertAt: 80,
          userId,
        },
      })
    )
  );

  await prisma.recurrence.create({
    data: {
      description: "Aluguel",
      amount: 2200,
      type: "EXPENSE",
      frequency: "MONTHLY",
      dayOfMonth: 10,
      startDate: new Date(now.getFullYear(), now.getMonth(), 10),
      categoryId: categories[5].id,
      userId,
    },
  });

  return NextResponse.json({
    success: true,
    stats: {
      transactions: transactions.length,
      categories: categories.length,
      accounts: 1,
      budgets: 5,
      recurrences: 1,
    },
  });
}
