#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createLuizUser() {
  try {
    const hashedPassword = await bcrypt.hash('luiz2026', 10);

    const luizUser = await prisma.user.upsert({
      where: { email: 'luiz@flydea.com' },
      update: {},
      create: {
        email: 'luiz@flydea.com',
        name: 'Luiz',
        password: hashedPassword,
      },
    });

    console.log('✅ Usuário Luiz criado com sucesso!');
    console.log(`📧 Email: ${luizUser.email}`);
    console.log(`👤 Nome: ${luizUser.name}`);
    console.log(`🔑 Senha: luiz2026`);
    console.log(`🆔 ID: ${luizUser.id}`);

  } catch (error) {
    console.error('❌ Erro ao criar usuário:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createLuizUser();
