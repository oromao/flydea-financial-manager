import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('senha123', 10)
  
  const user = await prisma.user.upsert({
    where: { email: 'paulo@oroma.dev' },
    update: {},
    create: {
      email: 'paulo@oroma.dev',
      name: 'Paulo Junior',
      password: hashedPassword,
    },
  })
  
  console.log('Admin user created:', user.email)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
