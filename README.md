# 💸 Flydea Financial Manager

**Plataforma financeira pessoal premium com IA, automação e controle total.**

[![CI](https://github.com/oromao/flydea-financial-manager/actions/workflows/ci.yml/badge.svg)](https://github.com/oromao/flydea-financial-manager/actions/workflows/ci.yml)

[🌐 Live](https://flydea-financial-manager.vercel.app) · [📖 Docs](docs/) · [🐛 Bugs](https://github.com/oromao/flydea-financial-manager/issues)

---

## ✨ Por Que Flydea?

| Problema | Solução |
|---------|--------|
| Finanças descentralizadas | **Dashboard unificado** — tudo em um lugar |
| Planilhas manual | **Importação inteligente** via OCR |
| Controle fraco | **Orçamentos com alertas** automáticos |
| Sem visão futura | **Projeções de fluxo de caixa** |
| Decisões às cegas | **IA que analisa seus dados** |

**100% português brasileiro** — termos oficiais, zero jargão.

---

## 🎯 Features

### 🧠 Inteligência Artificial
- **Copiloto contexto-aw**: Entende onde você está na app
- **RAG Local**: Busca sua documentação sem API externa
- **Agentes autônomos**: Alertas, revisões, projeções automáticas
- **Insights comportamentais**: Padrões de gasto personalizados

### 📊 Controle Total
- **Multi-contas**: Bancos, cartões, investimentos
- **Transações**: Entrada/saída com recorrências
- **Orçamentos**: Limites por categoria com alertas
- **Fechamento mensal**: Resumo completo
- **Relatórios**: Análise de padrões

### 📱 Mobile-First
- **iPhone 16**: Design otimizado (390×844)
- **Bottom Navigation**:快速 acesso
- **Touch-friendly**: 44px mínimos
- **PWA**: Instalável como app nativo

### 🔄 Automação
- **Recorrências automáticas**: Assinaturas, contas fixas
- **Cron robotizado**: Agentes executam.diariamente
- **OCR**: Extrai dados de comprovantes
- **Notificações**: Email + in-app

---

## 🚀 Quick Start

```bash
# Clone
git clone https://github.com/oromao/flydea-financial-manager.git
cd flydea-financial-manager

# Instale
npm install

# Ambiente (.env.local)
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="random"
NEXTAUTH_URL="http://localhost:3010"

# Banco
npx prisma generate
npx prisma db push

# Rode
npm run dev
```

Acesse: [http://localhost:3010](http://localhost:3010)

---

## 🏗️ Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | Next.js 16 · React 19 · TypeScript |
| Styling | Tailwind CSS · shadcn/ui · Framer Motion |
| Backend | Next.js API Routes · Prisma ORM |
| Database | PostgreSQL (Neon) |
| Auth | NextAuth.js |
| AI | Local RAG · Tesseract.js (OCR) |
| Storage | Vercel Blob |
| Email | Resend |

---

## 📁 Arquitetura

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # 50+ API routes
│   ├── movimentacoes/      # Transações
│   ├── contas/           # Contas bancárias
│   ├── orcamentos/      # Orçamentos
│   ├── fluxo-caixa/     # Cash flow
│   └── ...
├── components/
│   ├── ui/              # 40+ componentes
│   └── bottom-nav.tsx    # Mobile navigation
├── lib/                   # Utils
│   ├── prisma.ts
│   ├── financial-engine.ts
│   └── date-utils.ts
└── docs/                  # Documentação
```

---

## 📱 Pages

| Rota | Módulo |
|------|--------|
| `/` | Dashboard · Saldo · Projeções |
| `/movimentacoes` | Transações · Filtros · OCR |
| `/contas` | Contas bancárias |
| `/fluxo-caixa` | Cash flow diário |
| `/contas-a-pagar` | Bills to pay |
| `/orcamentos` | Orçamentos por categoria |
| `/recorrencias` | Transações recorrentes |
| `/fechamento` | Fechamento mensal |
| `/relatorios` | Análises · Gráficos |
| `/alertas` | Notificações |
| `/agents` | Agentes IA |
| `/insights` | Copiloto IA |
| `/perfil` | Configurações usuário |

---

## 🤖 Agentes IA

Crie agentes que executam automaticamente:

```typescript
const agent = await AIAgent.create({
  userId: user.id,
  name: "Alerta de Gastos",
  type: "EXPENSE_ALERT",
  schedule: "0 9 * * *",  // 9AM diário
  config: { threshold: 500 }
});
```

**Ações**: Email (Resend), Notificação in-app, Webhook

---

## 🔒 Segurança

- **Autenticação**: NextAuth.js
- **CSRF Protection**: Built-in
- **Row-level Security**: Usuário só vê seus dados
- **Cron Protection**: `CRON_SECRET` requerido
- **Input Validation**: Zod em todas as APIs

---

## 🧪 Testes

```bash
npm run build      # Compile
npm run lint      # Lint
npm run type-check # Types
```

Build: **56 páginas** compiladas com sucesso.

---

## 🚀 Deploy

```
git push origin main
# Vercel auto-deploy
```

**Produção**: [flydea-financial-manager.vercel.app](https://flydea-financial-manager.vercel.app)

---

## 📄 Licença

MIT License · [LICENSE.md](LICENSE.md)

---

## 👤 Autor

**Rodrigo O. Marino**
- GitHub: [@oromao](https://github.com/oromao)

---

_Built with ❤️ using Next.js + TypeScript + Tailwind CSS_

**Flydea** — Suas finanças, seu controle.