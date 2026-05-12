# Flydea Financial Manager — Architecture

## Stack
- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS 4, shadcn/ui, Framer Motion
- **Backend**: Next.js API Routes (serverless), Prisma 6, Zod 4
- **Database**: PostgreSQL (Neon Serverless)
- **Auth**: NextAuth.js v4 (credentials)
- **Infra**: Vercel (gru1), Vercel Blob, Upstash Redis, Resend
- **AI**: Local RAG (TF-IDF), PicoClaw (behavioral engine), Tesseract.js (OCR)

## Architecture Style
- **Clean Architecture + Domain-Driven Design**
- Layers: `domain/` → `application/` → `infrastructure/` → `presentation/`
- Singleton Prisma client, Dependency Injection via manual container
- Timezone: UTC storage, America/Sao_Paulo display

## Key Directories
- `src/domain/` — Pure domain entities, value-objects, repositories interfaces
- `src/application/` — Use cases (Create, List, Execute, Delete)
- `src/infrastructure/` — Prisma repositories, services (AgentScheduler, EmailService)
- `src/presentation/` — Controllers
- `src/app/` — Next.js App Router pages and API routes
- `src/components/` — React components (44 shadcn/ui, custom)
- `src/lib/` — Utilities (financial-engine, ai/, ocr/, prisma.ts, auth.ts)

## Data Models (32 Prisma models)
- User, Account, Transaction, Category, Budget, Recurrence
- AIAgent, AgentAction, AgentExecution, AgentSchedule
- Notification, Invoice, Document, Tag
- Plus supporting models for insights, logs, approvals

## API Routes (~30 groups)
- `/api/transactions/`, `/api/accounts/`, `/api/budgets/`
- `/api/agents/`, `/api/cron/`, `/api/insights/`
- `/api/auth/`, `/api/profile/`, `/api/admin/`

## Key Patterns
- Zod validation in all API routes
- Server-side auth middleware via NextAuth
- Financial engine as pure functions (567 lines, 76 tests)
- Rate limiting via Upstash
- CSP and security headers via next.config.ts
