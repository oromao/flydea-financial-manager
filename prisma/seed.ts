
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('flydea2026', 10)
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@flydea.com' },
    update: {},
    create: {
      email: 'admin@flydea.com',
      name: 'Administrador FLY DEA',
      password: hashedPassword,
    },
  })

  console.log({ admin })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
