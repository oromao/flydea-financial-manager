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

  const luizPassword = await bcrypt.hash('luiz2026', 10)
  const luizUser = await prisma.user.upsert({
    where: { email: 'luiz@flydea.com' },
    update: {},
    create: {
      email: 'luiz@flydea.com',
      name: 'Luiz',
      password: luizPassword,
    },
  })

  // Seed system categories (userId = null → available to all users)
  const systemCategories = [
    { name: 'Vendas', type: 'INCOME' },
    { name: 'Serviços', type: 'INCOME' },
    { name: 'Salário', type: 'INCOME' },
    { name: 'Aluguel', type: 'EXPENSE' },
    { name: 'Salários', type: 'EXPENSE' },
    { name: 'Marketing', type: 'EXPENSE' },
    { name: 'Alimentação', type: 'EXPENSE' },
    { name: 'Transporte', type: 'EXPENSE' },
    { name: 'Educação', type: 'EXPENSE' },
    { name: 'Lazer', type: 'EXPENSE' },
    { name: 'Saúde', type: 'EXPENSE' },
    { name: 'Outros', type: 'EXPENSE' },
  ]

  for (const cat of systemCategories) {
    await prisma.category.upsert({
      where: { name_userId: { name: cat.name, userId: null as unknown as string } },
      update: { type: cat.type },
      create: { name: cat.name, type: cat.type, userId: null },
    })
  }

  console.log({ admin: admin.email, testUser: testUser.email, luizUser: luizUser.email, systemCategories: systemCategories.length })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
