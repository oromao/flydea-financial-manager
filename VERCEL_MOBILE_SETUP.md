# 📱 Configurar Vercel no Celular - Guia Passo a Passo

Seu app está deployed! Agora precisa de 4 variáveis de ambiente. Cada uma leva 1 minuto.

---

## ✅ Environment Variables Necessárias

Copie esses valores:

```
DATABASE_URL:
postgresql://neondb_owner:npg_LhFS0qK7rkaZ@ep-lucky-truth-antd5lhh-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

DIRECT_URL:
postgresql://neondb_owner:npg_LhFS0qK7rkaZ@ep-lucky-truth-antd5lhh-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require

NEXTAUTH_URL:
https://flydea-financial-manager.vercel.app

NEXTAUTH_SECRET:
(será gerado automaticamente - deixe em branco por enquanto)
```

---

## 📱 Passo 1: Abrir Vercel no Celular

1. Abra seu navegador mobile
2. Acesse: **https://vercel.com/dashboard**
3. Faça login (se não estiver logado)
4. Clique no projeto **flydea-financial-manager**

---

## ⚙️ Passo 2: Acessar Settings

1. Dentro do projeto, procure por **Settings** (⚙️)
   - No mobile, pode estar em um menu (⋮ ou ≡)
   - Desça a tela até encontrar "Environment Variables"

2. Ou acesse direto: https://vercel.com/your-username/flydea-financial-manager/settings/environment-variables
   - Substitua `your-username` pelo seu username do Vercel (provavelmente "oromao")

---

## 🔐 Passo 3: Adicionar Variáveis (4x)

**Para cada variável, siga:**

1. Clique em **"Add New"** ou **"Add Environment Variable"**
2. No campo **Name**: Cole o nome (ex: DATABASE_URL)
3. No campo **Value**: Cole o valor completo da lista acima
4. Selecione os ambientes:
   - ☑️ Production
   - ☑️ Preview  
   - ☑️ Development
5. Clique em **"Save"** ou **"Add"**

**Repita para:**
- ✅ DATABASE_URL (valor completo com postgresql://...)
- ✅ DIRECT_URL (valor completo com postgresql://...)
- ✅ NEXTAUTH_URL (https://flydea-financial-manager.vercel.app)
- ✅ NEXTAUTH_SECRET (deixe em branco, Vercel gera)

---

## 🚀 Passo 4: Fazer Deploy Novamente

Depois que adicionar as 4 variáveis:

1. Volte à página principal do projeto
2. Procure por **"Deployments"** ou **"Redeploy"**
3. Clique em **"Redeploy"** ou **"Revalidate"**

Ou:
1. Acesse: https://github.com/oromao/flydea-financial-manager/actions
2. Clique em **"Deploy to Vercel"**
3. Clique em **"Run workflow"**
4. Escolha **main** branch
5. Clique em **"Run workflow"** novamente

---

## ✨ Pronto!

Após a redeploração, seu app estará 100% funcional:

🔗 https://flydea-financial-manager.vercel.app

- ✅ Banco de dados PostgreSQL conectado
- ✅ Autenticação funcionando
- ✅ Toggle de Dark Mode disponível
- ✅ Botão rápido para marcar conta como paga

---

## ❓ Problemas?

**Se clicar em "Add Environment Variable" mas não aparecer campo de texto:**
- Scroll para baixo na tela
- Ou tente em landscape mode (vire o celular)

**Se aparecer mensagem de erro ao salvar:**
- Verifique se todos os caracteres foram copiados
- Tente copiar novamente do PC (se tiver acesso) e colar no celular

**URL não funciona ou mostra erro:**
- Aguarde 2-3 minutos após o redeploy
- Vercel usa CDN global, pode levar um pouco

---

**Feito com ❤️**
