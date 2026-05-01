import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    // Ensure schema is up to date (add missing columns if not present)
    try {
      await prisma.$executeRawUnsafe(`
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'User' AND column_name = 'resetToken'
          ) THEN
            ALTER TABLE "User" ADD COLUMN "resetToken" TEXT;
          END IF;

          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'User' AND column_name = 'resetTokenExpires'
          ) THEN
            ALTER TABLE "User" ADD COLUMN "resetTokenExpires" TIMESTAMP(3);
          END IF;
        END $$;
      `);
    } catch (schemaError) {
      console.warn("Schema update warning (may already be correct):", schemaError);
    }

    const hashedPassword = await bcrypt.hash("flydea2026", 10);
    const e2ePassword = await bcrypt.hash("password123", 10);
    const luizPassword = await bcrypt.hash("luiz2026", 10);

    const admin = await prisma.user.upsert({
      where: { email: "admin@flydea.com" },
      update: { password: hashedPassword, name: "Administrador FLY DEA", role: "ADMIN" },
      create: {
        email: "admin@flydea.com",
        name: "Administrador FLY DEA",
        password: hashedPassword,
        role: "ADMIN",
      },
    });

    await prisma.user.upsert({
      where: { email: "augusto@flydea.com" },
      update: { password: e2ePassword, name: "Augusto Flydea", role: "MEMBER" },
      create: {
        email: "augusto@flydea.com",
        name: "Augusto Flydea",
        password: e2ePassword,
        role: "MEMBER",
      },
    });

    await prisma.user.upsert({
      where: { email: "luiz@flydea.com" },
      update: { password: luizPassword, name: "Luiz", role: "MEMBER" },
      create: {
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
      try {
        await prisma.category.create({
          data: {
            name: cat.name,
            type: cat.type as any,
            userId: admin.id,
          },
        });
      } catch {
        // Ignore duplicate category errors
      }
    }

    return NextResponse.json({
      message: "Setup concluído! Usuários e categorias criados/atualizados.",
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
