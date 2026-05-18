# Context Compact

## Project
- Flydea Financial Manager — personal finance SaaS
- Next.js 16 + Prisma + Neon PostgreSQL + Vercel
- Startup file: `.ai/00-START-HERE.md`

## Stack
- Frontend: Next.js App Router, React 19, Tailwind CSS 4, shadcn/ui, Framer Motion
- Backend: Next.js API Routes, Prisma 6, Zod 4
- Database: PostgreSQL (Neon Serverless, gru1 São Paulo)
- Auth: NextAuth.js v4 (credentials)
- Infra: Vercel, Vercel Blob, Upstash Redis, Resend
- AI: Local RAG (TF-IDF), PicoClaw, Tesseract.js OCR

## Architecture
- Clean Architecture + DDD
- Timezone: UTC storage, America/Sao_Paulo display
- 32 database models, ~30 API route groups, 56 pages

## Current Status
- 576 tests passing, 60 test files
- Build OK: 116 rotas
- Sprint 4 active: E16 82% ✅, E17/E18/E19 0%
- Brainstorming Estratégico: ✅ (2026-05-14, 9 agentes)
- Plano de Maturidade: `docs/superpowers/specs/2026-05-14-product-maturity-strategy.md`

## Sprint 4 — Polimento Premium (IN PROGRESS 🔶)
- **E16**: 9/11 ✅ — Backend completo, Frontend E16 completo
- **E17**: 1/9 ✅ — Redesign Claro & Clean aplicado (globals.css, layout, sidebar, bottom-nav, card, button, input, dashboard-hero)
- **E18**: 3/10 ✅ — AnimatedList fix, empty states premium, ripple touch feedback
- **E19**: 4/13 ✅ — Touch feedback, responsive tables, keyboard-aware hook, dialog touch targets
- **Gargalo**: Frontend tem 23 tasks pendentes

## Sprint 5-8 Planejados (após Sprint 4)
- **Sprint 5**: Onboarding & Retenção
- **Sprint 6**: Analytics & Observabilidade
- **Sprint 7**: Qualidade & Infraestrutura (E2E, feature flags, coverage 90%)
- **Sprint 8**: LGPD & Compliance

## Key Strategic Gaps
- Onboarding: ❌ Zero
- Analytics: ❌ Zero
- E2E Tests: ❌ 0 implementados
- Feature Flags: ❌ Zero
- LGPD: ❌ Incompleto (data-export, delete-account)
- Monetização: ❌ Não definida

## Harness Bus/Queue
- Event Bus: `.ai/bus/` — 20 eventos publicados (e001-e020)
- Queues: `.ai/queues/` — todas populadas com BRAINSTORM tasks
- Workflows: `.ai/workflows/` — standard, bugfix, feature, code-review
- State: `.ai/state/` — brainstorming ativo

## Known Critical Issues
- C3: Turbopack crash (ignorado — build produção funciona)
- Zod: 27/48 APIs (56.2%)
- Coverage: 37.62%
