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

## Harness Agents
- 10 agentes: PO, Platform Architect, Backend, Frontend/Mobile, QA, Security, FinOps, DevOps, Documentation, UX/UI
- UX/UI Designer & Researcher (novo, grupo Design) — complementa Frontend com design system, UX research, acessibilidade, quality gate visual

## Design System Audit (FLY-017 ✅)
- 80+ tokens inventariados, 40/44 componentes usam tokens corretamente
- 22+ cores hardcoded, 24 touch target violations, 20+ radius hardcoded
- 2 componentes duplicados identificados
- Plano de correção priorizado em `docs/design-system-audit.md`

## UX Gaps Analysis (FLY-018 ✅)
- 87 gaps categorizados: 10 P0, 22 P1, 22 P2
- Top 20 priorizados para ação imediata
- Plano de resolução S2 (19 itens) e S3 (10 itens) em `docs/ux-gaps-analysis.md`

## Quality Gate Visual (FLY-019 ✅)
- 25+ itens de verificação em 6 categorias
- Critérios de aprovação/rejeição definidos
- Template PR em `docs/quality-gate-visual.md`

## UX Correções Aplicadas (Sprint 1)
- Toast tokens, login tokens, touch targets, importer removido
- Cores Tailwind fixas (15+) → tokens, radius hardcoded (15+) → tokens
- Error boundary adicionado a 14 páginas (antes 3, agora 17/19)
- Orçamentos period selector funcional
- PWA manifest path corrigido + icons SVG criados
- KNOWN_ISSUES: 10/11 P0 bugs corrigidos (91%), rate limit 35/44 APIs (80%)
- QA-05 (seed data) e QA-09 (console errors) pendentes

## Current Focus
- Resolve P0 blockers
- Increase test coverage
- Close UX gaps (quality gate criado)
- Stabilize recurrences and import flows

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
