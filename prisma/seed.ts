import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('flydea2026', 10)
  const e2ePassword = await bcrypt.hash('password123', 10) // Must match Playwright tests

  // Seed Users
  const admin = await prisma.user.upsert({
    where: { email: 'admin@flydea.com' },
    update: {},
    create: {
      email: 'admin@flydea.com',
      name: 'Administrador FLY DEA',
      password: hashedPassword,
      role: 'ADMIN',
    },
  })

  const testUser = await prisma.user.upsert({
    where: { email: 'augusto@flydea.com' },
    update: {},
    create: {
      email: 'augusto@flydea.com',
      name: 'Augusto Flydea',
      password: e2ePassword,
      role: 'MEMBER',
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
      role: 'MEMBER',
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
    const existing = await prisma.category.findFirst({
      where: { name: cat.name, userId: null }
    })

    if (existing) {
      await prisma.category.update({
        where: { id: existing.id },
        data: { type: cat.type }
      })
    } else {
      await prisma.category.create({
        data: { name: cat.name, type: cat.type, userId: null }
      })
    }
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
