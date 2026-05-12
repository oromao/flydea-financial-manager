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
- 45.87% test coverage (target: 90%)
- 11 critical bugs P0 open
- 87 UX gaps documented
- Mobile-first (iPhone 16, 390x844)

## Sprint 2 — Estabilização & Qualidade (ACTIVE)
- 14 items, 2 semanas
- Foco: CI/CD, guardrails, testes 60%, acessibilidade, Zod APIs, performance mobile

## Agent Activity
- DevOps: FLY-002 CI/CD | Platform: FLY-003 Guardrails | Backend: FLY-020 Zod APIs
- Frontend: FLY-010 Performance | QA: FLY-006 Tests | UX/UI: FLY-021 Acessibilidade

## Deploy
- Live: https://flydea-financial-manager.vercel.app (build ✅, 116 rotas)
- Último deploy: 2026-05-11 — UX/UI Agent + rate limit 100% + P0 bug fixes

## Business Context Summary
Flydea Financial Manager é um SaaS de finanças pessoais premium brasileiro, mobile-first iPhone 16, com IA local, automação e foco em privacidade. Decisões técnicas devem priorizar segurança de dados financeiros, performance mobile, precisão de cálculos e experiência premium.

## Personas Summary
Usuário principal: brasileiro tech-savvy, iPhone 16, que quer clareza financeira sem complicação. Também atende usuários organizados, multi-contas e preocupados com privacidade.

## Key Documents
- `AGENTS.md` — Constitution and universal entry point
- `docs/DOMAIN_RULES.md` — Official financial definitions
- `docs/MODULE_MAP.md` — Complete module map
- `docs/PRODUCT_VISION.md` — Product vision and strategy
- `docs/PROJECT_OVERVIEW.md` — 30-line project summary
