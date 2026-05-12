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
- Clean Architecture + DDD (domain → application → infrastructure → presentation)
- Timezone: UTC storage, America/Sao_Paulo display
- 32 database models, ~30 API route groups, 56 pages

## Current Status
- 576 tests passing, 60 test files
- Build OK: 116 rotas
- 11 critical bugs P0 — ALL FIXED
- 87 UX gaps — 30%+ closed (AL-01, QA-07, QA-10, P-03, QA-04, QA-08)
- 56 mobile issues audited — TOP 20 FIXED
- Mobile-first (iPhone 16, 390x844)
- 73+ any types fixed (104 → 31)
- window.location: 0 occurrences
- Zod validation: 19/44 APIs (43%)
- Rate limiting: 44/44 APIs (100%)
- Archive/deactivate contas: ✅
- Esqueci senha + NextAuth errors: ✅
- CI/CD GitHub Actions: ✅
- Security guardrails: ✅
- Monitoring: ✅
- E2E test plan: ✅
- Security headers: CSP ✅, HSTS ✅, Permissions-Policy ✅

## Sprint 2 — Estabilização & Qualidade (COMPLETED ✅)
- 13/14 items concluídos (93%)
- Pendente: FLY-004 (backlog produto — PO)

## Sprint 3 — UX/UI Audit Bugfix (COMPLETED ✅)
- 10/10 items (3 P0, 6 P1, 1 P2) — todos concluídos
- Source: Auditoria browser-use 2026-05-12
- 17 problemas encontrados → 10 resolvidos, 7 integrados em tasks existentes

## Agent Activity (Sprint 3)
- UX/UI Audit: ✅ Auditoria completa (12 páginas, 5 modais, 17 problemas)
- Backlog: ✅ Épico 15 criado — 10 tarefas priorizadas
- Documentation: ✅ AUDITORIA_UX_UI_2026-05-12.md, KNOWN_ISSUES.md, BACKLOG_MASTER.md

## Known Critical Issues (new)
- E15-T1: Base UI error #51 em /contas 🔴
- E15-T2/E15-T3: UUID visível em dropdowns 🔴 (QA-02 reaberto)
- C3: Turbopack crash (ignorado — build produção funciona)

## Deploy
- Live: https://flydea-financial-manager.vercel.app (build ✅, 116 rotas)
- Último deploy: 2026-05-12 — Sprint 3 iniciado

## Business Context Summary
Flydea Financial Manager é um SaaS de finanças pessoais premium brasileiro, mobile-first iPhone 16, com IA local, automação e foco em privacidade.

## Personas Summary
Usuário principal: brasileiro tech-savvy, iPhone 16, que quer clareza financeira sem complicação.

## Key Documents
- `AGENTS.md` — Constitution and universal entry point
- `docs/DOMAIN_RULES.md` — Official financial definitions
- `docs/MODULE_MAP.md` — Complete module map
- `docs/PRODUCT_VISION.md` — Product vision and strategy
- `docs/PROJECT_OVERVIEW.md` — 30-line project summary
- `docs/e2e-test-plan.md` — E2E test plan created
- `docs/monitoring-plan.md` — Monitoring strategy
