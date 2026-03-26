# FLY DEA — Deploy em Produção (5 minutos)

## Opção 1 — Via Vercel Dashboard (mais fácil, sem terminal)

### Passo 1 — Criar banco PostgreSQL gratuito (Neon)

1. Acesse **https://neon.tech** → Sign Up (gratuito com GitHub)
2. Crie um projeto: **New Project** → nome `flydea` → região `São Paulo` (ou `US East`)
3. Clique em **Connection details** → copie a string de conexão (format: `postgresql://...`)
4. Guarde **duas strings**: `DATABASE_URL` (pooler) e `DIRECT_URL` (direct)

### Passo 2 — Importar projeto na Vercel

1. Acesse **https://vercel.com** → Sign Up com GitHub
2. Clique **Add New Project** → **Import Git Repository**
3. Selecione o repositório `oromao/flydea-financial-manager`
4. Em **Branch**, escolha `master` (ou a branch principal)
5. **Antes de clicar Deploy**, configure as variáveis de ambiente:

```
DATABASE_URL       = postgresql://[user]:[password]@[host]/neondb?sslmode=require
DIRECT_URL         = postgresql://[user]:[password]@[host]/neondb?sslmode=require
NEXTAUTH_SECRET    = [gere aqui → https://generate-secret.vercel.app/32]
NEXTAUTH_URL       = https://[seu-projeto].vercel.app
BLOB_READ_WRITE_TOKEN = (opcional — para upload de anexos)
CRON_SECRET        = [qualquer string aleatória forte]
```

6. Clique **Deploy** 🚀

### Passo 3 — Popular o banco com dados iniciais

Após o primeiro deploy, abra o **Vercel terminal** ou rode localmente:

```bash
# Clone o repo, configure .env.local com as mesmas vars, então:
npx prisma db push
npx tsx prisma/seed.ts
```

Ou use o **Neon SQL Editor** e cole o SQL gerado por `npx prisma migrate sql`.

---

## Opção 2 — Via Terminal (se tiver node e git instalados)

```bash
# 1. Clone o projeto
git clone https://github.com/oromao/flydea-financial-manager
cd flydea-financial-manager

# 2. Configure as variáveis
cp .env.example .env.local
# Edite .env.local com os valores do Neon

# 3. Rode o script de setup automático
bash setup.sh
```

O script instala dependências, configura o banco e faz o deploy.

---

## Usuários padrão após seed

| Email | Senha | Role |
|---|---|---|
| admin@flydea.com | flydea2026 | Admin |
| augusto@flydea.com | flydea2024 | Usuário teste |

> **Altere as senhas após o primeiro acesso!**

---

## Variáveis opcionais (ativam features extras)

| Variável | Serviço | Feature |
|---|---|---|
| `UPSTASH_REDIS_REST_URL` + `TOKEN` | Upstash (grátis) | Rate limiting no login |
| `RESEND_API_KEY` | Resend (grátis) | Email de notificações |
| `RESEND_FROM_EMAIL` | — | Remetente dos emails |

---

## Checklist pós-deploy

- [ ] Acessar a URL e fazer login
- [ ] Criar uma conta bancária em `/contas`
- [ ] Criar categorias personalizadas em `/movimentacoes`
- [ ] Configurar orçamentos em `/orcamentos`
- [ ] Testar exportação CSV em `/relatorios`
- [ ] Alterar senhas dos usuários padrão
