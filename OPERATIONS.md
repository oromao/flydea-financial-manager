# FlyDea Financial Manager — Operations Guide

## Quick Start

```bash
# Install
npm install

# Seed database (creates admin + test users)
npx prisma db push --force-reset && npx prisma db seed

# Development
npm run dev          # http://localhost:3000

# Production build
npm run build && npm start
```

## Test Users (after seed)

| Email | Password | Role |
|-------|----------|------|
| `admin@flydea.com` | `flydea2026` | ADMIN |
| `augusto@flydea.com` | `password123` | MEMBER |
| `luiz@flydea.com` | `luiz2026` | MEMBER |

## Running Tests

```bash
# Unit tests (fast, ~220ms)
npm test                        # 76 tests, 4 suites

# Unit tests (watch mode)
npm run test:watch

# E2E tests (requires running dev server + seeded DB)
npm run test:e2e

# E2E against production
npm run test:e2e:remote

# All tests
npm run test:all
```

### Test Coverage

The financial core (`financial-engine.ts` + `export-helpers.ts`) has a **90% line coverage threshold**.
To check coverage (requires `@vitest/coverage-v8`):

```bash
npm run test:coverage
```

## Understanding the Financial Architecture

### Single Source of Truth

All financial calculations flow through `src/lib/financial-engine.ts`:

```
Database → API Route → financial-engine.ts → JSON → UI
```

**No UI component computes financial values.** All numbers come from API routes that call engine functions.

### Week Definitions (Fixed, Non-Negotiable)

| Week | Days |
|------|------|
| W1 | 1–7 |
| W2 | 8–14 |
| W3 | 15–21 |
| W4 | 22–end of month |

### Financial Semantics

| Term | Meaning |
|------|---------|
| **Saldo Geral** | All-time Σ(INCOME) − Σ(EXPENSE) |
| **Receita do Mês** | All INCOME transactions in the month |
| **Despesa do Mês** | All EXPENSE transactions in the month |
| **Desp. Pendentes** | EXPENSE with paymentStatus=PENDING |
| **Total Pendente** | INCOME PENDING + EXPENSE PENDING (Contas a Pagar only) |
| **Faturado** | Revenue installments RECEIVED |
| **A Receber** | Revenue installments PENDING |

### How Recurrence Works

1. **Template** (`Recurrence` model): stores description, amount, frequency, startDate, nextDate
2. **Cron** (`/api/cron/recurrence`): generates `Transaction` instances from templates
3. **Idempotency**: checks existing transactions by (userId, recurrenceId, recurrenceDate) using YYYY-MM-DD comparison
4. **Safe to run multiple times**: will not create duplicates

### How Exports Reconcile with UI

All three exports (CSV, PDF, XLSX) use `computeExportSummary()` from `src/lib/export-helpers.ts`.
The summary totals in exports match the UI cards because both compute from the same Prisma query results.

## Deployment

### Required Environment Variables

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection (Neon recommended) |
| `DIRECT_URL` | Direct PostgreSQL connection (for migrations) |
| `NEXTAUTH_SECRET` | Session encryption key |
| `NEXTAUTH_URL` | Base URL (http://localhost:3000 for dev) |
| `CRON_SECRET` | Protects `/api/cron/*` endpoints |

See `.env.example` for template.

### Deploy Checklist

- [ ] Environment variables configured
- [ ] `npm run build` succeeds locally
- [ ] CI pipeline passes (typecheck + lint + unit tests + build)
- [ ] `prisma db push` or `prisma migrate deploy` applied
- [ ] Seed data loaded (first deploy only): `npx prisma db seed`
- [ ] Cron job configured for recurrence (calls `/api/cron/recurrence` with Bearer token)

### Post-Deploy Validation

1. Access `/login` — should show login page
2. Login as `augusto@flydea.com` / `password123`
3. Verify Dashboard loads with financial cards
4. Navigate to Movimentações, Fechamento, Contas a Pagar, Fluxo de Caixa
5. Verify no 500 errors in server logs
6. Optionally run E2E: `npm run test:e2e:remote`

## Known Accepted Risks

| Risk | Impact | Status |
|------|--------|--------|
| `CashflowWeekly` table orphan in schema | None | Documented, remove in future migration |
| Timezone UTC vs BRT (off-by-one in display) | Low | Month aggregation is correct; day display may vary by ±1 |
| InvoiceInstallments not in cashflow forecast | Low | Separate concept (invoice vs revenue) |

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| Login fails after seed | Password mismatch | Re-run seed: `npx prisma db push --force-reset && npx prisma db seed` |
| "This page couldn't load" | Error boundary triggered | Check server logs for `[FlyDea ERROR]` messages |
| Export returns empty | No transactions in period | Verify date filter; check if seed data covers current month |
| CI build fails | TypeScript error or lint error | Run `tsc --noEmit` and `npm run lint` locally |
| E2E tests fail | DB not seeded or server not running | Run `npm run dev` and seed DB first |
