#!/bin/bash

# Deploy Manual para Vercel
# Use: bash deploy.sh

set -e

echo "🚀 Iniciando Deploy para Vercel..."
echo ""

# Verificar se está na main
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "❌ Você não está na branch 'main'"
    echo "Branch atual: $CURRENT_BRANCH"
    exit 1
fi

echo "✅ Você está na branch main"
echo ""

# Verificar se Vercel CLI está instalado
if ! command -v vercel &> /dev/null; then
    echo "📦 Instalando Vercel CLI..."
    npm install -g vercel
fi

echo "✅ Vercel CLI encontrado"
echo ""

# Build local para testar
echo "🔨 Testando build local..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build falhou! Verifique os erros acima."
    exit 1
fi

echo "✅ Build OK"
echo ""

# Deploy para Vercel
echo "📤 Enviando para Vercel..."
echo ""

if [ -z "$VERCEL_TOKEN" ]; then
    echo "⚠️  VERCEL_TOKEN não configurada"
    echo ""
    echo "Para deploy automático, configure:"
    echo "export VERCEL_TOKEN=seu_token_aqui"
    echo ""
    echo "Ou use a CLI interativa:"
    vercel deploy --prod
else
    echo "✅ VERCEL_TOKEN detectada"
    vercel deploy --prod --token "$VERCEL_TOKEN"
fi

echo ""
echo "✅ Deploy completo!"
echo "🌐 Acesse: https://flydea-financial-manager.vercel.app"
