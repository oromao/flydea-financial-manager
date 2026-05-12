# E2E Test Plan — FlyDea Financial Manager

## Overview

This document defines the E2E (End-to-End) test strategy for critical user flows.
Tests will be implemented using Playwright (already configured in `playwright.config.ts`).

**Focus:** iPhone 16 (390x844) mobile-first, with desktop as secondary.

---

## 1. Login Flow

### 1.1 Successful Login
1. Navigate to `/login`
2. Enter valid email and password
3. Click "Entrar"
4. **Assert:** Redirected to dashboard (`/`)
5. **Assert:** User name visible in header/nav
6. **Assert:** Session cookie is set

### 1.2 Failed Login — Wrong Password
1. Navigate to `/login`
2. Enter valid email + incorrect password
3. Click "Entrar"
4. **Assert:** Error message displayed ("Credenciais inválidas")
5. **Assert:** Still on `/login` page

### 1.3 Failed Login — Invalid Email Format
1. Navigate to `/login`
2. Enter invalid email format + password
3. **Assert:** Client-side validation error shown
4. **Assert:** Form not submitted

### 1.4 Rate Limiting
1. Attempt login 6+ times with wrong credentials
2. **Assert:** Rate limit message after `n` attempts
3. **Assert:** "Tente novamente em alguns segundos" displayed

### 1.5 Logout
1. Login successfully
2. Click logout
3. **Assert:** Redirected to `/login`
4. **Assert:** Session cookie cleared

### 1.6 Session Expiry
1. Login successfully
2. Wait for session to expire (or mock via cookie manipulation)
3. Attempt to navigate to `/movimentacoes`
4. **Assert:** Redirected to `/login`

---

## 2. Create Transaction Flow

### 2.1 Create Expense Transaction
1. Login as authenticated user
2. Navigate to `/movimentacoes`
3. Click "Nova transação" (or FAB button)
4. Fill in:
   - Type: "Despesa"
   - Description: "Compra mercado"
   - Amount: 150.50
   - Date: today
   - Category: "Alimentação"
   - Account: "Nubank" (optional)
5. Click "Salvar"
6. **Assert:** Transaction appears in list
7. **Assert:** Success toast/notification shown

### 2.2 Create Income Transaction
1. Follow same flow as 2.1
2. Select Type: "Receita"
3. **Assert:** Income values display correctly in list/dashboard

### 2.3 Create Transaction — Validation Errors
1. Open create transaction modal
2. Submit with empty description
3. **Assert:** Validation error shown
4. Submit with amount = 0
5. **Assert:** Validation error shown ("Valor deve ser positivo")

### 2.4 Create Transaction with Tags
1. Create transaction with 2 tags attached
2. **Assert:** Tags visible in transaction detail

### 2.5 Create Recurring Transaction
1. Create transaction with frequency = "Mensal"
2. **Assert:** Recurrence created in `/recorrencias`

---

## 3. Dashboard Data Loading

### 3.1 Dashboard Loads Correctly
1. Login as user with existing transactions
2. Navigate to `/`
3. **Assert:** Month income displayed
4. **Assert:** Month expenses displayed
5. **Assert:** Balance shown
6. **Assert:** Category breakdown chart renders
7. **Assert:** No loading spinners after 5s

### 3.2 Dashboard — Empty State
1. Login as new user (no transactions)
2. Navigate to `/`
3. **Assert:** Empty state message shown ("Nenhuma transação este mês")
4. **Assert:** "Criar primeira transação" CTA visible

### 3.3 Dashboard — Budget Alerts
1. Create a budget with alert threshold at 80%
2. Create expenses exceeding 80% of budget
3. Navigate to dashboard
4. **Assert:** Budget alert card visible
5. **Assert:** Alert shows percentage and amount

### 3.4 Dashboard — AI Insights
1. Login as user with significant transaction history
2. Navigate to `/`
3. **Assert:** AI insights section loads (or gracefully hides if unavailable)
4. **Assert:** No console errors from AI service

### 3.5 Dashboard — Cash Flow Weekly View
1. Navigate to `/cashflow` or dashboard weekly section
2. **Assert:** Weekly income/expense breakdown renders
3. **Assert:** "Pode gastar" / "Alerta" status is accurate

---

## 4. Account Management

### 4.1 Create Account
1. Login and navigate to `/contas`
2. Click "Nova conta"
3. Fill: name="Nubank", type="Corrente", balance="1000"
4. Click "Salvar"
5. **Assert:** Account card appears in list
6. **Assert:** Balance displayed correctly (with computed transactions)

### 4.2 Edit Account
1. From account list, click on existing account
2. Change name and color
3. Save
4. **Assert:** Updated name visible
5. **Assert:** Updated color visible

### 4.3 Archive/Unarchive Account
1. Edit existing account
2. Set "Ativa" toggle to off
3. Save
4. **Assert:** Account hidden from main list
5. Toggle "Mostrar arquivadas"
6. **Assert:** Account visible with "Arquivada" badge

### 4.4 Delete Account
1. From account edit, click "Excluir"
2. Confirm deletion
3. **Assert:** Account removed from list
4. **Assert:** Associated transactions remain (or are handled gracefully)

### 4.5 Account Balance Calculation
1. Create account with initial balance 1000
2. Create an expense of 300 linked to this account
3. Navigate to `/contas`
4. **Assert:** Current balance = 700 (1000 - 300)
5. Create an income of 500 linked to this account
6. **Assert:** Current balance = 1200

---

## 5. Additional Critical Flows

### 5.1 Budget Management
- CRUD budget for a category
- Budget alert at 80%/100% thresholds
- Budget appears in dashboard alerts

### 5.2 Recurrence Management
- Create monthly recurrence
- Verify auto-generated transaction on save
- Edit recurrence amount/frequency
- Delete recurrence

### 5.3 Category Management
- Create custom category
- Verify category appears in transaction form dropdown
- Cannot delete system categories

### 5.4 Export Flow
- Navigate to export page
- Select date range
- Export as CSV/PDF
- **Assert:** File download triggers
- **Assert:** Downloaded file contains correct data

### 5.5 Tag Management
- Create/delete tags
- Assign tags to transactions
- Filter transactions by tag

---

## Test Infrastructure

### Tools
- **Framework:** Playwright (configured in `playwright.config.ts`)
- **Mobile viewport:** 390x844 (iPhone 16)
- **Desktop viewport:** 1440x900

### Test Files Location
- `tests/` — Playwright E2E tests
- `tests-examples/` — Example test files

### Data Setup
- Use a dedicated test database (Neon branch or local)
- Seed script: `scripts/seed-e2e.ts` (to be created)
- Cleanup between test suites via API calls

### Environment Variables
```
E2E_TEST_EMAIL=test@flydea.com
E2E_TEST_PASSWORD=testpassword123
E2E_BASE_URL=http://localhost:3010
```

### CI Integration
- Run E2E tests after unit/integration tests pass
- Use `npm run test:e2e` command
- Run against preview deployments in Vercel

---

## Implementation Priority

| Priority | Flow | Effort | Impact |
|----------|------|--------|--------|
| P0 | Login + Session | Low | Critical |
| P0 | Create Transaction | Medium | Critical |
| P0 | Dashboard Load | Medium | High |
| P0 | Account CRUD | Medium | High |
| P1 | Budget Alerts | Medium | Medium |
| P1 | Recurrence Creation | Medium | Medium |
| P2 | Export | High | Low |
| P2 | Tags | Low | Low |

---

## Acceptance Criteria

- All P0 flows pass consistently (3/3 attempts)
- All P1 flows pass (2/3 attempts)
- No flaky tests — retry logic configured in Playwright
- Tests run in < 5 minutes total
- Screenshots captured on failure
- Trace enabled for debugging failures
