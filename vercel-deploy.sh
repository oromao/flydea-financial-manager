#!/bin/bash

# Deploy automático - Vercel
# Requisitos: npm, node, git

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 VERCEL DEPLOYMENT SCRIPT${NC}"
echo ""

# 1. Verificar dependências
echo "📋 Verificando pré-requisitos..."

if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm não está instalado${NC}"
    exit 1
fi
echo -e "${GREEN}✅ npm OK${NC}"

if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ git não está instalado${NC}"
    exit 1
fi
echo -e "${GREEN}✅ git OK${NC}"

# 2. Verificar branch
echo ""
echo "🌿 Verificando branch..."
BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$BRANCH" != "main" ]; then
    echo -e "${RED}❌ Você deve estar na branch 'main', atualmente em: $BRANCH${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Branch main OK${NC}"

# 3. Verificar status git
echo ""
echo "📦 Verificando status git..."
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}⚠️  Há mudanças não commitadas!${NC}"
    echo "Commite antes de fazer deploy:"
    echo "  git add ."
    echo "  git commit -m 'Suas mudanças'"
    exit 1
fi
echo -e "${GREEN}✅ Sem mudanças pendentes${NC}"

# 4. Instalar Vercel CLI se necessário
echo ""
echo "🔧 Configurando Vercel CLI..."
if ! command -v vercel &> /dev/null; then
    echo "📥 Instalando Vercel CLI globalmente..."
    npm install -g vercel@latest
fi
echo -e "${GREEN}✅ Vercel CLI pronto${NC}"

# 5. Build
echo ""
echo "🔨 Fazendo build..."
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build falhou!${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Build OK${NC}"

# 6. Deploy
echo ""
echo "📤 Iniciando deploy para Vercel..."
echo ""

if [ -n "$VERCEL_TOKEN" ]; then
    echo -e "${YELLOW}Usando VERCEL_TOKEN do ambiente...${NC}"
    vercel deploy --prod --token "$VERCEL_TOKEN"
else
    echo -e "${YELLOW}Login interativo do Vercel...${NC}"
    vercel login
    vercel deploy --prod
fi

echo ""
echo -e "${GREEN}✅ Deploy concluído com sucesso!${NC}"
echo ""
echo "🌐 App URL: https://flydea-financial-manager.vercel.app"
echo ""
echo "⏳ Aguarde 2-5 minutos para a página ficar disponível"
