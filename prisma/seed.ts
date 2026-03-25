import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('flydea2026', 10)
  const testPassword = await bcrypt.hash('flydea2024', 10)
  
  // Seed Users
  const admin = await prisma.user.upsert({
    where: { email: 'admin@flydea.com' },
    update: {},
    create: {
      email: 'admin@flydea.com',
      name: 'Administrador FLY DEA',
      password: hashedPassword,
    },
  })

  const testUser = await prisma.user.upsert({
    where: { email: 'augusto@flydea.com' },
    update: {},
    create: {
      email: 'augusto@flydea.com',
      name: 'Augusto Flydea',
      password: testPassword,
    },
  })

  // Seed Categories
  const categories = [
    { name: 'Vendas', type: 'INCOME' },
    { name: 'Serviços', type: 'INCOME' },
    { name: 'Aluguel', type: 'EXPENSE' },
    { name: 'Salários', type: 'EXPENSE' },
    { name: 'Marketing', type: 'EXPENSE' },
    { name: 'Outros', type: 'EXPENSE' },
  ]

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: { type: cat.type },
      create: cat,
    })
  }

  console.log({ admin, testUser, categoryCount: categories.length })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
