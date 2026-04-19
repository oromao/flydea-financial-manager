# 🚀 DEPLOY MANUAL NO VERCEL

## ⚠️ Status Atual
- ✅ Código está na **main** branch
- ✅ Workflow do GitHub Actions configurado
- ❌ Secrets do Vercel não estão configurados

---

## 🔧 OPÇÃO 1: Deploy via CLI (Mais Fácil)

### Pré-requisitos
```bash
# Instale o Vercel CLI
npm install -g vercel

# Faça login
vercel login
```

### Deploy
```bash
# Na pasta do projeto
cd /home/user/flydea-financial-manager

# Deploy de produção
vercel deploy --prod

# OU use
npm run deploy
```

---

## 🔑 OPÇÃO 2: Configurar Secrets no GitHub (Para CI/CD)

### Step 1: Obter Secrets do Vercel
```bash
# 1. Acesse https://vercel.com/account/tokens
# 2. Crie um novo token → copie o valor

# 3. Acesse seu projeto no Vercel
# 4. Settings → General → copie Project ID

# 5. Na organização do Vercel
# 6. Settings → General → copie Org ID
```

### Step 2: Adicionar ao GitHub
```bash
# No repositório GitHub:
# 1. Settings → Secrets and variables → Actions
# 2. Crie 3 novos secrets:

VERCEL_TOKEN = seu_token_aqui
VERCEL_PROJECT_ID = seu_project_id
VERCEL_ORG_ID = sua_org_id

# Depois, qualquer push na main vai fazer deploy automático!
```

---

## 📋 CHECKLIST PRÉ-DEPLOY

Antes de fazer deploy, verifique:

### Variáveis de Ambiente
- [ ] `DATABASE_URL` configurada
- [ ] `NEXTAUTH_SECRET` configurada
- [ ] `NEXTAUTH_URL` configurada (ex: https://flydea.vercel.app)
- [ ] `RESEND_API_KEY` configurada (opcional, para email)
- [ ] `VERCEL_BLOB_READ_WRITE_TOKEN` configurada

### Código
- [ ] Nenhum `console.log` importante deixado
- [ ] TypeScript compila sem erros
- [ ] Prisma schema sincronizado

### Build
```bash
# Teste o build localmente
npm run build

# Teste a produção
npm run start
```

---

## 🔄 PROCESSO DE DEPLOY

### Via CLI Manual
```bash
$ vercel deploy --prod

> vercel login
# (faz login)

Vercel CLI 33.0.0
? Set up ~/flydea-financial-manager? [Y/n] y
? Which scope do you want to deploy to? (your-username)
? Link to existing project? [y/N] y
? What's the name of your existing project? flydea-financial-manager

🔍 Inspect: vercel.json
...
> npm run build
...
✅ Build successful
✅ Upload complete
✅ Deployment ready

🔗 Production: https://flydea-financial-manager.vercel.app
```

### Via GitHub Actions (Automático)
```
1. Push para main
2. GitHub Actions dispara automaticamente
3. Workflow roda o deploy
4. App aparece no Vercel em ~2 minutos
```

---

## ✅ VERIFICAR DEPOIS DO DEPLOY

```bash
# 1. Acesse
https://flydea-financial-manager.vercel.app

# 2. Teste:
- ✅ Login funciona?
- ✅ Dashboard carrega?
- ✅ Copiloto button aparece? (canto inferior direito)
- ✅ Cards novos aparecem?
- ✅ /agents acessa?
- ✅ /movimentacoes acessa?
- ✅ /insights acessa?

# 3. Verifique os logs
vercel logs --prod
```

---

## 🚨 SE DER ERRO

### Build falha
```bash
# Verifique localmente
npm run build

# Se falhar, procure por:
- Imports errados
- TypeScript errors
- Missing dependencies
```

### Deploy falha
```bash
# Verifique logs
vercel logs --prod

# Problemas comuns:
- Falta de variável de ambiente
- Banco de dados não acessível
- Erro no Prisma
```

### App não funciona após deploy
```bash
# Verifique variables
vercel env list

# Veja se todas as variáveis estão:
- DATABASE_URL ✅
- NEXTAUTH_SECRET ✅
- NEXTAUTH_URL ✅ (note: use o URL de produção!)
- RESEND_API_KEY ✅ (para email)
- VERCEL_BLOB_READ_WRITE_TOKEN ✅ (já vem do Vercel)
```

---

## 📊 RESUME: OPÇÕES

| Opção | Fácil | Automático | Recomendado |
|-------|-------|-----------|-------------|
| **CLI Manual** | ✅ Sim | ❌ Não | Para teste rápido |
| **GitHub Actions** | ✅ Depois | ✅ Sim | Para produção |

---

## 🎯 PRÓXIMO PASSO

Escolha uma opção:

### Opção A: Deploy Rápido (5 min)
```bash
vercel login
vercel deploy --prod
```

### Opção B: Setup Automático (10 min)
1. Obter tokens Vercel
2. Adicionar secrets no GitHub
3. Próximo push = deploy automático

---

**Escolha uma e rode! Qual você quer fazer?** 🚀
