# Configuração Vercel - Flydea Financial Manager

## ⚡ Setup Rápido (2 minutos)

### Opção 1: Automático (Recomendado)

```bash
# 1. Execute o script de setup
bash scripts/setup-vercel.sh

# O script irá:
# ✅ Instalar Vercel CLI
# ✅ Conectar seu projeto Vercel
# ✅ Adicionar variáveis de ambiente automaticamente
# ✅ Fazer deploy para produção
```

### Opção 2: Manual (Via Vercel Dashboard)

#### Passo 1: Abrir Vercel Dashboard
- Acesse: https://vercel.com/dashboard
- Selecione o projeto: `flydea-financial-manager`

#### Passo 2: Adicionar Variáveis de Ambiente
Clique em **Settings → Environment Variables** e adicione:

| Variável | Valor |
|----------|-------|
| `DATABASE_URL` | `postgresql://neondb_owner:npg_LhFS0qK7rkaZ@ep-lucky-truth-antd5lhh-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require` |
| `DIRECT_URL` | `postgresql://neondb_owner:npg_LhFS0qK7rkaZ@ep-lucky-truth-antd5lhh-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require` |
| `NEXTAUTH_URL` | `https://flydea-financial-manager.vercel.app` |
| `NEXTAUTH_SECRET` | Gere em: https://generate-secret.vercel.app/32 |

#### Passo 3: Deploy
1. Vá para **Deployments**
2. Clique em **Redeploy** (botão de menu do último deploy)
3. Selecione **Redeploy**

✅ A build vai iniciar e usar seu banco de dados PostgreSQL/Neon real!

---

## ✅ O Que Muda?

### ❌ Antes (com SQLite local)
- Banco de dados efêmero (apagava a cada deploy)
- Dados perdidos
- Não funcionava em produção

### ✅ Depois (com PostgreSQL/Neon)
- ✅ Banco persistente
- ✅ Dados salvos entre deployments
- ✅ Múltiplos usuários
- ✅ Pronto para produção

---

## 🆘 Troubleshooting

### Build falha com "DATABASE_URL not set"
**Solução:** Certifique-se de que `DATABASE_URL` foi adicionada em **Settings → Environment Variables**

### Dados não aparecem após deploy
**Solução:** A build vai criar o schema automaticamente com `prisma db push`

### "Prisma schema validation error"
**Solução:** Aguarde o deploy completar - Prisma precisa sincronizar o schema com o banco

---

## 📝 Variáveis de Ambiente Explicadas

- **DATABASE_URL**: String de conexão PostgreSQL (pooler, para Web)
- **DIRECT_URL**: String direta sem pooling (para migrations, opcional)
- **NEXTAUTH_URL**: URL do seu app no Vercel
- **NEXTAUTH_SECRET**: Chave secreta para sessões (gere aleatoriamente)
- **BLOB_READ_WRITE_TOKEN**: (Opcional) Para upload de arquivos
- **CRON_SECRET**: (Opcional) Para cron jobs automáticos

---

## 🎯 Seu Database URL

```
postgresql://neondb_owner:npg_LhFS0qK7rkaZ@ep-lucky-truth-antd5lhh-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

✅ Este banco contém TODOS seus dados anteriores!

---

Feito com ❤️ por Claude Code
