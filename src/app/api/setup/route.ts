import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const existingUsers = await prisma.user.count();

    if (existingUsers > 0) {
      return NextResponse.json({
        message: "Usuários já existem no banco. Setup já foi executado.",
        userCount: existingUsers,
      });
    }

    const hashedPassword = await bcrypt.hash("flydea2026", 10);
    const e2ePassword = await bcrypt.hash("password123", 10);
    const luizPassword = await bcrypt.hash("luiz2026", 10);

    const admin = await prisma.user.create({
      data: {
        email: "admin@flydea.com",
        name: "Administrador FLY DEA",
        password: hashedPassword,
        role: "ADMIN",
      },
    });

    await prisma.user.create({
      data: {
        email: "augusto@flydea.com",
        name: "Augusto Flydea",
        password: e2ePassword,
        role: "MEMBER",
      },
    });

    await prisma.user.create({
      data: {
        email: "luiz@flydea.com",
        name: "Luiz",
        password: luizPassword,
        role: "MEMBER",
      },
    });

    // Seed system categories
    const systemCategories = [
      { name: "Vendas", type: "INCOME" },
      { name: "Serviços", type: "INCOME" },
      { name: "Salário", type: "INCOME" },
      { name: "Aluguel", type: "EXPENSE" },
      { name: "Alimentação", type: "EXPENSE" },
      { name: "Transporte", type: "EXPENSE" },
      { name: "Saúde", type: "EXPENSE" },
      { name: "Educação", type: "EXPENSE" },
      { name: "Lazer", type: "EXPENSE" },
      { name: "Assinaturas", type: "EXPENSE" },
      { name: "Moradia", type: "EXPENSE" },
      { name: "Outros", type: "EXPENSE" },
    ];

    for (const cat of systemCategories) {
      await prisma.category.create({
        data: {
          name: cat.name,
          type: cat.type as any,
          userId: admin.id,
        },
      });
    }

    return NextResponse.json({
      message: "Setup concluído! Usuários e categorias criados.",
      users: [
        { email: "admin@flydea.com", password: "flydea2026", role: "ADMIN" },
        { email: "augusto@flydea.com", password: "password123", role: "MEMBER" },
        { email: "luiz@flydea.com", password: "luiz2026", role: "MEMBER" },
      ],
      categories: systemCategories.length,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
