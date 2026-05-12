# Flydea Financial Manager — Platform Strategy

## Visão da Plataforma

Ser o app de finanças pessoais mais inteligente, privado e premium do Brasil. Um "cérebro financeiro" que entende o comportamento do usuário, aprende com seus hábitos e oferece decisões em tempo real sem comprometer a privacidade.

## Pilares Estratégicos

### 1. Clareza Financeira (P0)
- Spend Decision em tempo real: "PODE_GASTAR / ALERTA / NAO_PODE_GASTAR"
- Dashboard consolidado com saldo real, projetado e disponível
- Definições financeiras oficiais brasileiras (DOMAIN_RULES.md)

### 2. Automação Inteligente (P0)
- Agentes IA configuráveis pelo usuário (Budget Review, Expense Alert, etc.)
- Recorrências automáticas via cron
- OCR para extração de documentos e importação
- Categorização inteligente de transações

### 3. Privacidade Primeiro (P1)
- RAG local — nenhum dado enviado para LLMs externos
- Motor PicoClaw de insights comportamentais (on-device)
- Controle do usuário sobre seus dados

### 4. Experiência Premium (P1)
- Design system com tokens CSS + Tailwind + shadcn/ui
- Animações com Framer Motion
- iPhone 16-first (390x844), PWA installable
- Bottom navigation e touch-friendly (44px min)

### 5. Excelência Técnica (P1)
- Clean Architecture + DDD para sustentar escalabilidade
- 90%+ de cobertura de testes
- Observabilidade e monitoramento de performance

## Stack Decisões

| Decisão | Escolha | Motivo |
|---------|---------|--------|
| Framework | Next.js 16 App Router | SSR, API routes, Vercel |
| Database | PostgreSQL (Neon) | Serverless, escalável, brasileiro |
| ORM | Prisma 6 | Type-safe, migrations, DX |
| Auth | NextAuth v4 | Simples, integrado com Next.js |
| Estilo | Tailwind CSS 4 + shadcn/ui | Produtividade, consistência |
| IA | Local RAG + PicoClaw | Privacidade, sem dependência externa |
| OCR | Tesseract.js + Sharp | Local, sem API externa |
| Infra | Vercel + Neon + Upstash | Serverless, baixa manutenção |

## Roadmap Técnico

### Fase 1 — Estabilização (Agora)
- Resolver 11 bugs P0
- Atingir 60%+ cobertura de testes
- Fechar 30% dos gaps de UX

### Fase 2 — Maturidade (Próximo)
- 90%+ cobertura de testes
- Otimização de performance mobile
- Novos agentes IA para o usuário

### Fase 3 — Expansão
- Modo offline-first
- Integração bancária automatizada
- Multi-tenancy para famílias
