#!/bin/bash

# Setup GitHub Secrets for Vercel Deployment
# Usage: bash scripts/setup-github-secrets.sh

set -e

echo "🔐 Configurando GitHub Secrets para Deploy do Vercel..."
echo ""

# Solicitar informações
read -p "🔑 Cole o VERCEL_TOKEN: " VERCEL_TOKEN
read -p "📝 Cole o VERCEL_PROJECT_ID: " VERCEL_PROJECT_ID
read -p "📝 Cole o VERCEL_ORG_ID: " VERCEL_ORG_ID

echo ""
echo "✅ Valores recebidos:"
echo "  VERCEL_TOKEN: ${VERCEL_TOKEN:0:20}..."
echo "  VERCEL_PROJECT_ID: $VERCEL_PROJECT_ID"
echo "  VERCEL_ORG_ID: $VERCEL_ORG_ID"
echo ""

# Verificar se gh CLI está instalado
if ! command -v gh &> /dev/null; then
    echo "📦 Instalando GitHub CLI..."
    # Instruções para instalar gh
    echo "Por favor, instale o GitHub CLI: https://cli.github.com"
    echo "Depois execute este script novamente."
    exit 1
fi

echo "🔑 Adicionando secrets no GitHub..."
echo ""

# Adicionar secrets
echo "⏳ Adicionando VERCEL_TOKEN..."
gh secret set VERCEL_TOKEN --body "$VERCEL_TOKEN"
echo "✅ VERCEL_TOKEN adicionado!"

echo "⏳ Adicionando VERCEL_PROJECT_ID..."
gh secret set VERCEL_PROJECT_ID --body "$VERCEL_PROJECT_ID"
echo "✅ VERCEL_PROJECT_ID adicionado!"

echo "⏳ Adicionando VERCEL_ORG_ID..."
gh secret set VERCEL_ORG_ID --body "$VERCEL_ORG_ID"
echo "✅ VERCEL_ORG_ID adicionado!"

echo ""
echo "✅ Todos os secrets foram configurados!"
echo ""
echo "🚀 Disparando deploy..."
gh workflow run deploy-vercel.yml --ref main

echo ""
echo "✅ Deploy foi disparado!"
echo "📊 Veja o progresso em: https://github.com/oromao/flydea-financial-manager/actions"
echo ""
echo "Seu app estará disponível em: https://flydea-financial-manager.vercel.app"
