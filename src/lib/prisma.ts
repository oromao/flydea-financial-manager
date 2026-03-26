import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

/**
 * Self-healing seed for PostgreSQL on Neon.
 * Ensures system categories exist (userId = null).
 */
export async function ensureBasicData() {
  try {
    const count = await prisma.category.count({ where: { userId: null } });
    if (count === 0) {
      const categories = [
        { name: "Aluguel", type: "EXPENSE" },
        { name: "Alimentação", type: "EXPENSE" },
        { name: "Salário", type: "INCOME" },
        { name: "Transporte", type: "EXPENSE" },
        { name: "Educação", type: "EXPENSE" },
        { name: "Lazer", type: "EXPENSE" },
        { name: "Saúde", type: "EXPENSE" },
        { name: "Marketing", type: "EXPENSE" },
        { name: "Vendas", type: "INCOME" },
        { name: "Serviços", type: "INCOME" },
        { name: "Outros", type: "EXPENSE" },
      ];

      for (const cat of categories) {
        await prisma.category.upsert({
          where: { name_userId: { name: cat.name, userId: null as unknown as string } },
          update: {},
          create: { name: cat.name, type: cat.type, userId: null },
        });
      }
    }
  } catch (e) {
    console.error("ensureBasicData failed:", e);
  }
}
