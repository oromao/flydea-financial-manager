---
name: neon-postgres
description: Guia e boas práticas para Neon Serverless PostgreSQL. Conexão, schema, queries, performance, e integração com Prisma.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# Neon PostgreSQL

> **Guia prático para trabalhar com Neon Serverless PostgreSQL no FlyDea.**

## 🎯 Quando carregar esta skill

- Trabalhar com schema Prisma que usa Neon
- Fazer queries diretas ou inspeção de banco
- Configurar conexão Neon (dev/prod)
- Diagnosticar problemas de banco
- Migrations e seed

## 🔌 Conexão

O projeto usa **Prisma** com Neon via `DATABASE_URL` no `.env`:

```
DATABASE_URL="postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/dbname?sslmode=require"
```

A conexão é `pooled` via Neon, com 100 conexões máximas:
```
DATABASE_URL="postgresql://user:pass@ep-xxx-pooler.us-east-2.aws.neon.tech/dbname?pgbouncer=true&connection_limit=100"
```

## 📋 Comandos essenciais

```bash
npx prisma generate     # Gera o client Prisma (após alterar schema)
npx prisma migrate dev  # Migração em dev (aplica schema no banco)
npx prisma db push      # Sincroniza schema sem criar migration
npx prisma db seed      # Popula banco com dados iniciais
npx prisma studio       # UI para inspecionar dados (http://localhost:5555)
```

## 🧠 Schema (Prisma)

O schema está em `prisma/schema.prisma`. Principais models:

- `User` — autenticação, perfil, preferências
- `Transaction` — receitas e despesas
- `Account` — contas bancárias/carteiras
- `Category` — categorias de transações
- `Budget` — orçamentos mensais
- `Recurrence` — transações recorrentes
- `Revenue` — receitas projetadas
- `CashflowWeekly` — fluxo de caixa semanal

## ⚠️ Cuidados com Neon

1. **Serverless cold start**: Primeira query pode ser lenta (~500ms). Use `prisma.$connect()` no startup.
2. **Pool connections**: Em produção, use connection pooler (`pgbouncer=true`).
3. **Branching**: Neon suporta branch pra dev. Não faça schema drift entre branches.
4. **Migrations em produção**: Sempre use `prisma migrate deploy`, nunca `db push`.
5. **Transaction limits**: Neon tem limites de transações por segundo no tier gratuito.

## 🔍 Debug de queries

Para ver queries SQL no console em dev:
```typescript
const prisma = new PrismaClient({
  log: ['query'],
});
```

Para inspecionar dados manualmente:
```bash
npx prisma studio
```

## 📦 Referências

- Prisma schema: `prisma/schema.prisma`
- Engine financeira: `src/lib/financial-engine.ts`
- API de transações: `src/app/api/transactions/`
