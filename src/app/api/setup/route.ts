import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { withRateLimit } from "@/lib/rate-limit";

export const GET = withRateLimit(async () => {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Setup não disponível em produção" }, { status: 403 });
  }

  try {
    // Add missing columns if they don't exist (Neon PostgreSQL)
    try {
      await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "resetToken" TEXT`);
      await prisma.$executeRawUnsafe(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "resetTokenExpires" TIMESTAMP(3)`);
    } catch {
    }

    const hashedPassword = await bcrypt.hash("flydea2026", 10);
    const e2ePassword = await bcrypt.hash("password123", 10);
    const luizPassword = await bcrypt.hash("luiz2026", 10);

    const users = [
      { email: "admin@flydea.com", name: "Administrador FLY DEA", password: hashedPassword, role: "ADMIN" },
      { email: "augusto@flydea.com", name: "Augusto Flydea", password: e2ePassword, role: "MEMBER" },
      { email: "luiz@flydea.com", name: "Luiz", password: luizPassword, role: "MEMBER" },
    ];

    for (const u of users) {
      // Upsert via raw SQL to avoid Prisma model/schema mismatch issues
      await prisma.$executeRawUnsafe(`
        UPDATE "User"
        SET "password" = '${u.password}', "name" = '${u.name}', "role" = '${u.role}'
        WHERE "email" = '${u.email}'
      `);

      await prisma.$executeRawUnsafe(`
        INSERT INTO "User" ("id", "email", "name", "password", "role", "createdAt")
        SELECT gen_random_uuid(), '${u.email}', '${u.name}', '${u.password}', '${u.role}', NOW()
        WHERE NOT EXISTS (SELECT 1 FROM "User" WHERE "email" = '${u.email}')
      `);
    }

    // Get admin id for categories
    const adminResult = await prisma.$queryRawUnsafe<{ id: string }[]>(
      `SELECT "id" FROM "User" WHERE "email" = 'admin@flydea.com' LIMIT 1`
    );
    const adminId = adminResult[0]?.id;

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

    let categoriesCreated = 0;
    if (adminId) {
      for (const cat of systemCategories) {
        try {
          await prisma.category.create({
            data: {
              name: cat.name,
              type: cat.type as "INCOME" | "EXPENSE",
              userId: adminId,
            },
          });
          categoriesCreated++;
        } catch {
          // Ignore duplicate category errors
        }
      }
    }

    return NextResponse.json({
      message: "Setup concluído! Usuários atualizados/criados.",
      users: [
        { email: "admin@flydea.com", password: "flydea2026", role: "ADMIN" },
        { email: "augusto@flydea.com", password: "password123", role: "MEMBER" },
        { email: "luiz@flydea.com", password: "luiz2026", role: "MEMBER" },
      ],
      categoriesCreated,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
});
