#!/bin/bash

# Setup Vercel Environment Variables and Deploy
# Usage: bash scripts/setup-vercel.sh

set -e

echo "🚀 Configurando Vercel para Flydea Financial Manager..."
echo ""

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Instalando Vercel CLI..."
    npm install -g vercel
fi

# Database URL
DATABASE_URL="postgresql://neondb_owner:npg_LhFS0qK7rkaZ@ep-lucky-truth-antd5lhh-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

DIRECT_URL="postgresql://neondb_owner:npg_LhFS0qK7rkaZ@ep-lucky-truth-antd5lhh-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require"

NEXTAUTH_URL="https://flydea-financial-manager.vercel.app"

# Generate or use existing NEXTAUTH_SECRET
echo "🔐 Gerando NEXTAUTH_SECRET..."
NEXTAUTH_SECRET=$(openssl rand -base64 32)

echo ""
echo "✅ Variáveis de Ambiente:"
echo "  DATABASE_URL: ${DATABASE_URL:0:50}..."
echo "  DIRECT_URL: ${DIRECT_URL:0:50}..."
echo "  NEXTAUTH_URL: $NEXTAUTH_URL"
echo "  NEXTAUTH_SECRET: $NEXTAUTH_SECRET"
echo ""

echo "📡 Configurando no Vercel..."
echo ""

# Link to Vercel project
vercel link --yes

# Set environment variables
echo "Adicionando DATABASE_URL..."
vercel env add DATABASE_URL <<< "$DATABASE_URL"

echo "Adicionando DIRECT_URL..."
vercel env add DIRECT_URL <<< "$DIRECT_URL"

echo "Adicionando NEXTAUTH_URL..."
vercel env add NEXTAUTH_URL <<< "$NEXTAUTH_URL"

echo "Adicionando NEXTAUTH_SECRET..."
vercel env add NEXTAUTH_SECRET <<< "$NEXTAUTH_SECRET"

echo ""
echo "🚀 Deploy em andamento..."
vercel deploy --prod

echo ""
echo "✅ Deploy completo!"
echo "Acesse: https://flydea-financial-manager.vercel.app"
