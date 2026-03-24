const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const categories = [
    { name: "Receita", type: "INCOME" },
    { name: "Despesa", type: "EXPENSE" },
    { name: "Operacional", type: "EXPENSE" },
    { name: "Impostos", type: "EXPENSE" },
    { name: "Marketing", type: "EXPENSE" },
    { name: "Outros", type: "EXPENSE" },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    });
  }
  console.log("Categorias semeadas com sucesso!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
