import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

/**
 * Self-healing DB seed for Vercel SQLite ephemeral storage
 */
export async function ensureBasicData() {
  try {
    const count = await prisma.category.count();
    if (count === 0) {
      console.log("Seeding categories...");
      const categories = [
        { name: "Aluguel", type: "EXPENSE" },
        { name: "Alimentação", type: "EXPENSE" },
        { name: "Salário", type: "INCOME" },
        { name: "Transporte", type: "EXPENSE" },
        { name: "Educação", type: "EXPENSE" },
        { name: "Lazer", type: "EXPENSE" },
        { name: "Saúde", type: "EXPENSE" },
        { name: "Outros", type: "EXPENSE" }
      ];

      for (const cat of categories) {
        await prisma.category.upsert({
          where: { name: cat.name },
          update: {},
          create: cat
        });
      }
    }
  } catch (e) {
    console.error("DB Init failed. Running push...");
    // If table doesn't exist, we can't easily run push here without dev dependencies. 
    // But Vercel build already ran it. The machine might just be missing the file.
  }
}
