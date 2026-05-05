import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Skip seed in production
  if (process.env.NODE_ENV === 'production') {
    console.log('Seed skipped: NODE_ENV is production')
    return
  }

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

  // Seed account for test user
  const account = await prisma.account.upsert({
    where: { id: testUser.id },
    update: {},
    create: {
      id: testUser.id,
      name: 'Conta Principal',
      type: 'CHECKING',
      balance: 500000, // R$ 5.000,00
      userId: testUser.id,
      color: '#1E3A5F',
    },
  })

  // Seed transactions for the current month
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const prefix = `${year}-${month}-`

  const transactionSeed = [
    { description: 'Salário', amount: 850000, type: 'INCOME', day: 5, category: 'Salário', paymentStatus: 'PAID' },
    { description: 'Freela Design', amount: 350000, type: 'INCOME', day: 10, category: 'Serviços', paymentStatus: 'PAID' },
    { description: 'Aluguel', amount: 220000, type: 'EXPENSE', day: 1, category: 'Aluguel', paymentStatus: 'PAID' },
    { description: 'Supermercado', amount: 85600, type: 'EXPENSE', day: 3, category: 'Alimentação', paymentStatus: 'PAID' },
    { description: 'Uber', amount: 4590, type: 'EXPENSE', day: 4, category: 'Transporte', paymentStatus: 'PAID' },
    { description: 'Internet', amount: 12990, type: 'EXPENSE', day: 5, category: 'Outros', paymentStatus: 'PAID' },
    { description: 'Curso Online', amount: 49700, type: 'EXPENSE', day: 12, category: 'Educação', paymentStatus: 'PENDING' },
    { description: 'Academia', amount: 11990, type: 'EXPENSE', day: 15, category: 'Saúde', paymentStatus: 'PAID' },
    { description: 'Cinema', amount: 6400, type: 'EXPENSE', day: 18, category: 'Lazer', paymentStatus: 'PENDING' },
    { description: 'Venda Produto', amount: 150000, type: 'INCOME', day: 20, category: 'Vendas', paymentStatus: 'PENDING' },
    { description: 'Gasolina', amount: 18500, type: 'EXPENSE', day: 22, category: 'Transporte', paymentStatus: 'PAID' },
    { description: 'Restaurante', amount: 12300, type: 'EXPENSE', day: 25, category: 'Alimentação', paymentStatus: 'PENDING' },
  ]

  // Get category IDs
  const categoryMap = new Map<string, string>()
  for (const cat of systemCategories) {
    const dbCat = await prisma.category.findFirst({ where: { name: cat.name, userId: null } })
    if (dbCat) categoryMap.set(cat.name, dbCat.id)
  }

  for (const tx of transactionSeed) {
    const catId = categoryMap.get(tx.category)
    if (!catId) continue
    const existing = await prisma.transaction.findFirst({
      where: { userId: testUser.id, description: tx.description }
    })
    if (!existing) {
      await prisma.transaction.create({
        data: {
          description: tx.description,
          amount: tx.amount,
          type: tx.type,
          date: new Date(now.getFullYear(), now.getMonth(), tx.day),
          categoryId: catId,
          userId: testUser.id,
          accountId: testUser.id,
          paymentStatus: tx.paymentStatus,
        }
      })
    }
  }

  // Seed budget for test user
  const existingBudget = await prisma.budget.findFirst({ where: { userId: testUser.id } })
  if (!existingBudget && categoryMap.has('Lazer')) {
    await prisma.budget.create({
      data: {
        userId: testUser.id,
        categoryId: categoryMap.get('Lazer')!,
        amount: 50000,
        period: `${year}-${month}`,
        alertAt: 80,
      }
    })
    // Also create an Alimentação budget
    if (categoryMap.has('Alimentação')) {
      await prisma.budget.create({
        data: {
          userId: testUser.id,
          categoryId: categoryMap.get('Alimentação')!,
          amount: 100000,
          period: `${year}-${month}`,
          alertAt: 80,
        }
      })
    }
  }

  console.log('Seed completo com transações e orçamentos de exemplo')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
