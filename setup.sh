#!/bin/bash
# =============================================================================
# FLY DEA — Setup script para deploy em produção
# Rode: bash setup.sh
# =============================================================================

set -e

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║          FLY DEA — Setup de Produção                 ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""

# Verificar se vercel CLI está instalado
if ! command -v vercel &> /dev/null; then
  echo "→ Instalando Vercel CLI..."
  npm install -g vercel
fi

# Verificar se existe .env.local
if [ ! -f ".env.local" ]; then
  echo ""
  echo "⚠  .env.local não encontrado."
  echo "   Copie .env.example para .env.local e preencha:"
  echo "   cp .env.example .env.local"
  echo ""
  echo "   Variáveis OBRIGATÓRIAS:"
  echo "   DATABASE_URL  → Neon: https://neon.tech (gratuito)"
  echo "   DIRECT_URL    → mesma URL do DATABASE_URL"
  echo "   NEXTAUTH_SECRET → rode: openssl rand -base64 32"
  echo ""
  exit 1
fi

# Carregar variáveis
export $(grep -v '^#' .env.local | xargs)

echo "✓ .env.local encontrado"

# Gerar cliente Prisma
echo "→ Gerando cliente Prisma..."
npx prisma generate

# Push schema para o banco
echo "→ Sincronizando schema com banco de dados..."
npx prisma db push

# Rodar seed
echo "→ Populando banco com dados iniciais..."
npx tsx prisma/seed.ts

echo ""
echo "✓ Banco configurado com sucesso!"
echo ""
echo "→ Fazendo login na Vercel..."
vercel login

echo ""
echo "→ Fazendo deploy para produção..."
vercel --prod --yes

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║  ✓ Deploy concluído! Acesse a URL acima.             ║"
echo "║                                                      ║"
echo "║  Lembre de configurar as env vars na Vercel:         ║"
echo "║  vercel env add DATABASE_URL                         ║"
echo "║  vercel env add DIRECT_URL                           ║"
echo "║  vercel env add NEXTAUTH_SECRET                      ║"
echo "║  vercel env add NEXTAUTH_URL                         ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""
