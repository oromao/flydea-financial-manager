# FlyDea Financial Manager — Visão Geral do Projeto

## O que é

Sistema financeiro pessoal/premium, SaaS, mobile-first (iPhone 16), construído em Next.js 16 + React 19 + TypeScript + Prisma + PostgreSQL (Neon). Segue Clean Architecture + DDD com engine financeira centralizada.

## Objetivo

Fornecer controle financeiro pessoal com clareza absoluta, automação inteligente via IA e experiência premium no mobile. O usuário sabe exatamente quanto pode gastar, o que está atrasado e o que a IA recomenda.

## Para quem

Pessoa física com perfil tech-savvy, usuária de iPhone 16, que valoriza design premium, quer clareza financeira e aceita automação inteligente. Dono da conta — não empresa, não contador.

## Estágio Atual

- ✅ **Core funcional:** Dashboard, Movimentações, Contas, Fluxo de Caixa, Orçamentos, Recorrências, Fechamento, Relatórios
- ✅ **IA implementada:** OCR (Tesseract.js), Agentes IA (cron), PicoClaw (insights), Copiloto (RAG local)
- ✅ **Engine financeira:** 567 linhas puras, 76 testes unitários
- ⚠️ **87 UX gaps** documentados em `docs/QA_CHECKLIST.md`
- ⚠️ **Cobertura de testes:** 45,87% (meta: 90%)

## Pilares do Produto

1. **Clareza** — termos em português, definições financeiras oficiais
2. **Controle** — transações, contas, recorrências, orçamentos, fechamento
3. **Automação** — agentes IA, OCR, recorrências via cron
4. **Inteligência** — insights comportamentais, predições, PicoClaw
5. **UX Premium** — mobile-first, iPhone 16, design system consistente

## Stack

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion
- **Backend:** Next.js API Routes, Prisma ORM
- **Database:** PostgreSQL (Neon)
- **Storage:** Vercel Blob
- **IA:** PicoClaw, RAG local (TF-IDF), Tesseract.js (OCR)
- **Arquitetura:** Clean Architecture + Domain-Driven Design (DDD)
- **Timezone:** America/Sao_Paulo (UTC midnight para datas)

## Módulos Principais

| Módulo | Status | Observações |
|--------|--------|-------------|
| Dashboard | ✅ Completo | SpendDecisionIndicator, WeeklyCashflow |
| Movimentações | ✅ Completo | CRUD, filtros, export, OCR |
| Contas | ✅ Completo | Múltiplas contas, cores |
| Fluxo de Caixa | ✅ Completo | W1-W4 projection |
| Orçamentos | ✅ Completo | Alertas por categoria |
| Recorrências | ⚠️ Incompleto | Delete não funciona |
| Fechamento | ✅ Completo | CSV/PDF/XLSX export |
| Relatórios | ✅ Completo | Gráficos Recharts |
| Agentes IA | ✅ Completo | 6 tipos, cron |
| Insights/PicoClaw | ⚠️ Parcial | Heurística local, não LLM |
| OCR/Importação | ⚠️ Parcial | Installments não funciona |
| Admin (Logs/Aprovações) | ⚠️ Incompleto | Sem paginação, sem role check |

## Prioridades Atuais

1. **P0:** Corrigir 11 bugs críticos (recorrências delete, filtro fake, CSS undefined, logs paginação, mobile UX)
2. **P1:** Consistência de interface (useConfirm, useToast, error boundary)
3. **P1:** Cobertura de testes 45% → 80%+
4. **P2:** Funcionalidades parciais (pagamentos parciais, OCR installments)
5. **P2-P3:** Novas features (reconciliação, aprovações, LLM copiloto)

## Riscos Atuais

| Risco | Impacto | Mitigação |
|-------|--------|-----------|
| Cobertura testes 45% | Deploy sem regressão | Mocks para OCR, Blob, PicoClaw |
| Bugs críticos (E1-T1 a T11) | Erosão de confiança | Resolver P0 primeiro |
| CSS glass-card/muted undefined | UI quebrada | Definir no globals.css |
| 87 UX gaps | Experiência abaixo do premium | Roadmap de 5 fases |
| Mobile 67% módulos 2+ taps | Descoberta ruim | Expandir navegação |

## Links Essenciais

- **Live:** https://flydea-financial-manager.vercel.app
- **Repo:** https://github.com/oromao/flydea-financial-manager
- **Local:** http://localhost:3010 (porta fixa)
- **Prisma Schema:** `./prisma/schema.prisma`
- **Engine Financeira:** `./src/lib/financial-engine.ts`
- **Design System:** `./src/components/ui/`

## Próximos Passos para IA

1. Ler `docs/BACKLOG_MASTER.md`
2. Selecionar item P0 (E1-T1)
3. Executar seguindo `docs/BACKLOG_DETAILED/E1-T1.md`
4. Documentar em `docs/EXECUTION_LOG.md`
5. Atualizar `docs/AI_HANDOFF_CONTEXT.md`

---

*Última atualização: 2026-04-30*