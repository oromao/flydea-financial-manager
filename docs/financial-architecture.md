# FlyDea Financial Manager — Financial Architecture

## Overview
SaaS financial manager built with Next.js 16, React 19, TypeScript, Prisma + PostgreSQL.
Modules: Dashboard, Transactions, Accounts, Cash Flow, Payables, Budgets, Recurrences, Monthly Closing, Reports, Logs, Approvals.

## Financial Engine (`src/lib/financial-engine.ts`)

**Single Source of Truth** — 567 lines, pure functions, zero UI dependency.

### Core Functions

| Function | Purpose | Consumed By |
|----------|---------|-------------|
| `getWeekNumber(day, daysInMonth)` | Maps day 1-31 to W1-W4 | Decision API, tests |
| `getWeeksForMonth(date)` | Returns W1-W4 boundaries for any month | Weekly forecast, tests |
| `computeMonthlySummary(tx[], start, end, allTime[])` | Monthly income/expenses/pending/overdue + all-time balance | Dashboard API, Movimentações stats |
| `computeWeeklyForecast(date, installments, expenses)` | Revenue/expense distribution across 4 weeks | Weekly cashflow API, Decision API |
| `computeSpendDecision(forecast, date)` | PODE_GASTAR / ALERTA / NAO_PODE_GASTAR | Decision API, SpendDecisionIndicator |
| `computePayablesSummary(pendingTx[])` | Separates INCOME pending from EXPENSE pending | Contas a Pagar page |
| `computeClosingSummary(tx[], start, end)` | Alias for monthly summary with closing-specific structure | Fechamento page |
| `computeCashflowMetrics(forecast)` | Extracts faturado/aReceber/monthBalance | Weekly cashflow API |

### Week Definition (Fixed, Single Source)
- **W1**: days 1-7
- **W2**: days 8-14
- **W3**: days 15-21
- **W4**: days 22 to end of month

## Financial Semantics (Official)

| Concept | Definition | Where Used |
|---------|-----------|------------|
| **Saldo Geral** | All-time Σ(INCOME) - Σ(EXPENSE) | Dashboard card |
| **Saldo do Mês** | Σ(INCOME do mês) - Σ(EXPENSE do mês) | Fechamento, Weekly forecast |
| **Receita do Mês** | All INCOME transactions in month (regardless of payment status) | Dashboard, Fechamento |
| **Despesa do Mês** | All EXPENSE transactions in month (regardless of payment status) | Dashboard, Fechamento |
| **Desp. Pendentes** | EXPENSE with paymentStatus=PENDING | Dashboard, Fechamento, Movimentações |
| **Total Pendente** | INCOME PENDING + EXPENSE PENDING | Contas a Pagar (explicitly labeled) |
| **Atrasadas** | EXPENSE PENDING where dueDate < today | Fechamento, Contas a Pagar |
| **Vence em 7 dias** | EXPENSE PENDING where today ≤ dueDate ≤ today+7 | Contas a Pagar |
| **Faturado** | Revenue installments RECEIVED this month | Weekly forecast |
| **A Receber** | Revenue installments PENDING this month | Weekly forecast |

## Data Flow

```
Database (Prisma)
    ↓
API Routes (server-side)
    ↓
financial-engine.ts (pure computation)
    ↓
JSON Response → Client Components (React)
```

**Key principle:** API routes fetch raw data, financial-engine.ts computes. UI only displays.

## Recurrence System

### How it works
1. **Template** (`Recurrence` model): stores description, amount, frequency (MONTHLY/WEEKLY), startDate, nextDate
2. **Cron job** (`/api/cron/recurrence`): runs periodically, generates `Transaction` instances from templates
3. **Transaction** (`Transaction` model): actual financial record with `recurrenceId` pointing to template

### Idempotency
- Cron checks if a transaction already exists for (userId, recurrenceId, recurrenceDate)
- Uses `format(date, "yyyy-MM-dd")` string comparison to avoid time-component false negatives
- Safe to run multiple times without creating duplicates

### Initial Transaction
- When a recurrence is created with startDate ≤ today, an initial transaction is generated immediately
- `nextDate` advances by 1 month (MONTHLY) or 1 week (WEEKLY)

## Export System

All exports use shared `computeExportSummary()` from `src/lib/export-helpers.ts`:

| Export | Route | Format | Summary Totals |
|--------|-------|--------|----------------|
| CSV | `/api/fechamento/export` | UTF-8 with BOM | ✅ Receitas, Despesas, Saldo, Pagas, Pendentes |
| PDF | `/api/fechamento/export/pdf` | jsPDF + autoTable | ✅ Same 5 summary rows |
| XLSX | `/api/transactions/export` | xlsx buffer | ✅ Same 5 summary rows |

Exports query Prisma directly with the same date filters as the UI, then compute summaries from the raw transaction list.

## Tests

| Suite | File | Tests | Coverage |
|-------|------|-------|----------|
| Financial Engine | `__tests__/financial-engine.test.ts` | 28 | Week logic, monthly summary, weekly forecast, spend decision, payables, closing, metrics, cross-consistency |
| Recurrence | `__tests__/recurrence.test.ts` | 15 | Idempotency, date progression, catch-up, financial impact |
| Date Boundaries | `__tests__/date-boundaries.test.ts` | 23 | Month/year boundaries, endOfDay, Feb leap year, dueDate vs date |
| Export Helpers | `__tests__/export-helpers.test.ts` | 10 | Summary computation, BRL formatting |
| E2E Consistency | `tests/consistency.spec.ts` | 9 | Page loading, label consistency, export endpoints, navigation |

**Total: 85 tests** (76 unit + 9 E2E)

### CI Pipeline

| Workflow | Trigger | Jobs |
|----------|---------|------|
| `ci.yml` | Push/PR to main | Typecheck + Lint + Unit Tests + Build |
| `e2e.yml` | Push/PR to main (if DB available) | Playwright E2E (consistency tests only) |

## Timezone Strategy

**Approach**: Store dates at midnight UTC. Display using server-local timezone.

**Why this works**: All date inputs use `type="date"` which captures YYYY-MM-DD as a string. The string is stored as `new Date("2026-04-15")` = midnight UTC. Month classification uses `startOfMonth`/`endOfMonth` which correctly identify the month regardless of timezone offset.

**Risk**: Day display could be off by ±1 if server and user are in different timezones (e.g., UTC server, BRT user). **Impact**: Negligible — we aggregate by month, not by day. The intended date (from the date picker) is always correct.

## Known Risks (Accepted)

| Risk | Impact | Status |
|------|--------|--------|
| `CashflowWeekly` table orphan in schema | None | Documented. Remove in future migration. |
| Timezone UTC vs BRT (off-by-one in display) | Low | Month aggregation correct. Day display may vary by ±1. |
| InvoiceInstallments not in cashflow forecast | Low | Separate concept (invoice vs revenue). By design. |
| E2E requires DB credentials in CI | Medium | E2E job skips gracefully if secrets unavailable. Manual runs always possible. |

## Running Tests

```bash
# Unit tests (fast)
npm test

# Unit tests (watch mode)
npm run test:watch

# E2E tests (requires running dev server)
npm run test:e2e

# E2E tests against production
npm run test:e2e:remote

# All tests
npm run test:all
```
