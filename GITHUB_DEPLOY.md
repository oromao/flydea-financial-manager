# 🚀 Deploy Automático via GitHub Actions

Configurar variáveis no GitHub é **muito mais fácil** que no Vercel Dashboard!

---

## ⚡ 3 Passos Rápidos:

### 1️⃣ Gerar Tokens (1 minuto)

**A. Gerar VERCEL_TOKEN:**
- Acesse: https://vercel.com/account/tokens
- Clique **Create**
- Nome: `GITHUB_DEPLOY`
- Copie o token

**B. Encontrar VERCEL_PROJECT_ID:**
- Acesse: https://vercel.com/dashboard
- Clique no projeto `flydea-financial-manager`
- URL fica: `vercel.com/oromao/flydea-financial-manager?id=<PROJECT_ID>`
- Copie o `PROJECT_ID`

### 2️⃣ Adicionar Secrets no GitHub (1 minuto)

1. Acesse seu repo no GitHub:
   ```
   https://github.com/oromao/flydea-financial-manager
   ```

2. Clique em **Settings → Secrets and variables → Actions**

3. Clique **New repository secret** e adicione:

   **Secret 1:**
   - Name: `VERCEL_TOKEN`
   - Value: (cola o token que você copiou)
   - Clique **Add secret**

   **Secret 2:**
   - Name: `VERCEL_PROJECT_ID`
   - Value: (cola o PROJECT_ID que você copiou)
   - Clique **Add secret**

### 3️⃣ Disparar Deploy Automático (30 segundos)

Opção A (Automático):
- Faça qualquer push para `main` branch
- GitHub Actions vai fazer deploy automaticamente

Opção B (Manual):
1. Acesse: https://github.com/oromao/flydea-financial-manager/actions
2. Selecione: **Deploy to Vercel**
3. Clique: **Run workflow**
4. Escolha branch: `main`
5. Clique: **Run workflow**

---

## ✅ O Que Acontece Automaticamente:

1. ✅ Instala dependências
2. ✅ Configura DATABASE_URL (Neon PostgreSQL)
3. ✅ Configura NEXTAUTH_URL e NEXTAUTH_SECRET
4. ✅ Faz deploy para produção
5. ✅ Seus dados são restaurados

---

## 🔗 Links Rápidos

- 🔑 Vercel Tokens: https://vercel.com/account/tokens
- 📊 Vercel Dashboard: https://vercel.com/dashboard
- 🔐 GitHub Secrets: https://github.com/oromao/flydea-financial-manager/settings/secrets/actions
- ⚙️ GitHub Actions: https://github.com/oromao/flydea-financial-manager/actions

---

## ❓ Dúvidas?

**"Como acho o PROJECT_ID?"**
- Abra Vercel Dashboard → clique no projeto
- A URL fica: `vercel.com/oromao/flydea-financial-manager?id=<ID>`
- Copie apenas o `<ID>`

**"Posso fazer mais de um deploy?"**
- Sim! Cada vez que você fizer push ou rodar o workflow, vai fazer novo deploy

**"Meus dados vão ser perdidos?"**
- NÃO! Você está usando PostgreSQL/Neon que é persistente
- Dados ficam salvos entre deployments

---

**Pronto! Agora é só:**
1. ✅ Adicionar VERCEL_TOKEN no GitHub Secrets
2. ✅ Adicionar VERCEL_PROJECT_ID no GitHub Secrets
3. ✅ Rodar o workflow ou fazer push para main
4. ✅ Pronto! Deploy automático!

Feito com ❤️ por Claude Code
