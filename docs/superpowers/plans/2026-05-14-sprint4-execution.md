# Sprint 4 — Polimento Premium: Plano de Execução

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Entregar as 31 tasks restantes do Sprint 4 (E17 Design System + E18 UX + E19 Mobile) + fechar E16 (Zod 100% + QA audit)

**Architecture:** Tailwind v4 CSS-first (tokens em `globals.css`), shadcn/ui components, Framer Motion para animações, iPhone 16 (390x844) como referência mobile

**Tech Stack:** Next.js 16, React 19, Tailwind CSS 4, shadcn/ui, Framer Motion, date-fns, lucide-react

**Estado atual:** Skeletons, empty states, error boundaries já existem como componentes — o foco é integrá-los nas 19 páginas.

---

## Sprint 4: Mapa de Execução

```
Semana 1: P0s + Fundação
  E19-T1 (touch targets) → E17-T1 (tokens) → E16-T8 (Zod 100%)

Semana 2: Design System + UX Core  
  E17-T2..T9 (design)  →  E18-T1 (skeletons)  →  E18-T5 (empty states)  →  E18-T7 (error boundaries)

Semana 3: UX Final + Mobile Core
  E18-T2..T11 (UX restante)  →  E19-T2..T5 (mobile core)

Semana 4: Mobile Final + Validação
  E19-T6..T13 (mobile restante)  →  E16-T10 (QA audit)  →  Security review  →  Docs  →  PO close
```

---

### Task 1: E19-T1 — Touch targets < 44px (P0)

**Files:**
- Search all page files for interactive elements with h-10, h-9, h-8, w-8, w-9, w-10, p-2, p-1
- Fix to min-h-11, min-w-11 or p-3

- [ ] **1.1: Audit touch targets**

Run: `rg 'h-(8|9|10)\b' src/app/ --include='*.tsx' -n`

Expected: List of files with small interactive elements

- [ ] **1.2: Fix small buttons in mobile views**

For each file found, replace `h-8`/`h-9`/`h-10` on clickable elements (button, a, [role=button]) with `min-h-[44px]`:

```tsx
// Before
<Button className="h-9 px-3">
// After  
<Button className="min-h-[44px] px-3">
```

Files to fix based on KNOWN_ISSUES (AN5-T4: 4 touch targets < 44px):
- `src/app/contas/page.tsx` (action buttons)
- `src/app/orcamentos/page.tsx` (action buttons)
- `src/app/recorrencias/page.tsx` (action buttons)
- `src/app/movimentacoes/page.tsx` (FAB, action buttons)

- [ ] **1.3: Verify FAB touch target**

File: `src/app/movimentacoes/page.tsx`
Ensure FAB is `min-h-[44px] min-w-[44px]`

- [ ] **1.4: Run build to verify**

Run: `npm run build`
Expected: Build succeeds, no type/lint errors

---

### Task 2: E17-T1 — ~40 cores hardcoded → tokens (P1)

**Files:**
- Modify: All page and component files with hardcoded Tailwind colors
- Test: `npm run build`

**Approach:** Substituir cores hardcoded por tokens do design system definidos em `globals.css`:
- `bg-red-*` / `text-red-*` → `bg-destructive/10 text-destructive`
- `bg-amber-*` / `text-amber-*` → `bg-warning/10 text-warning`
- `bg-emerald-*` / `text-emerald-*` → `bg-success/10 text-success`
- `bg-blue-*` / `text-blue-*` → `bg-primary/10 text-primary`
- `text-gray-*` / `text-slate-*` → `text-on-surface-variant`
- `bg-gray-*` → `bg-surface-variant`
- Cores de fundo de página → `bg-background`
- Cores de card → `bg-card text-card-foreground`

- [ ] **2.1: Buscar todas as cores hardcoded**

Run: `rg '(bg|text)-(red|amber|emerald|blue|green|gray|slate|rose|purple|indigo|teal|cyan|pink|orange|yellow|violet)-[0-9]' src/ --include='*.tsx' --include='*.css' -n | grep -v node_modules | grep -v '.next' | head -60`

- [ ] **2.2: Substituir cores em ordem de prioridade (pages primeiro)**

Priority files (pages mais visitadas):
1. `src/app/page.tsx` (Dashboard)
2. `src/app/movimentacoes/page.tsx`
3. `src/app/contas/page.tsx`
4. `src/app/orcamentos/page.tsx`
5. `src/app/recorrencias/page.tsx`
6. `src/app/relatorios/page.tsx`
7. `src/components/**/*.tsx`

For each file: substitute hardcoded colors with design tokens:

```tsx
// Before
<div className="bg-red-50 text-red-600">
// After
<div className="bg-destructive/10 text-destructive">
```

```tsx
// Before  
<span className="text-emerald-600 bg-emerald-50">
// After
<span className="text-success bg-success/10">
```

- [ ] **2.3: Verificar dark mode compatibility**

Ensure substituted tokens work in dark mode (test by adding `class="dark"` to HTML element)

- [ ] **2.4: Build check**

Run: `npm run build`
Expected: Build succeeds

---

### Task 3: E16-T8 — Zod validation 27/48 → 44/44 (P0)

**Files:**
- Create: Zod schema files for remaining 17 API routes
- Modify: API route files to use schemas

**APIs sem Zod validation (17 restantes, alvo: 44/44):**
Grupo Transações: `/api/transactions/[id]`, `/api/transactions/export`
Grupo Contas: `/api/accounts/[id]`
Grupo Recorrências: `/api/recurrences/[id]`
Grupo Orçamentos: `/api/budgets/[id]`
Grupo Fechamento: `/api/fechamento`, `/api/fechamento/export`
Grupo Agentes: `/api/agents/[id]/executions`
Grupo Notificações: `/api/notifications`, `/api/notifications/[id]`
Grupo Perfil: `/api/profile`
Grupo Admin: `/api/logs`, `/api/approvals`
Grupo Misc: `/api/invoices`, `/api/revenues`, `/api/cashflow`

- [ ] **3.1: Create `src/lib/validations/transaction.ts`**

```tsx
import { z } from "zod/v4";

export const UpdateTransactionSchema = z.object({
  description: z.string().min(1).max(200).optional(),
  amount: z.number().positive().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  categoryId: z.string().uuid().nullable().optional(),
  accountId: z.string().uuid().optional(),
  paymentStatus: z.enum(["PENDING", "PAID"]).optional(),
  type: z.enum(["INCOME", "EXPENSE"]).optional(),
  paidAt: z.string().datetime().nullable().optional(),
});

export const TransactionExportSchema = z.object({
  dateFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  dateTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  format: z.enum(["csv", "xlsx"]).default("csv"),
});
```

- [ ] **3.2: Apply schema to `/api/transactions/[id]/route.ts`**

```tsx
import { UpdateTransactionSchema } from "@/lib/validations/transaction";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const parsed = UpdateTransactionSchema(body);
  // ... rest of handler with parsed.data
}
```

- [ ] **3.3: Create remaining schemas and apply to all 17 remaining APIs**

Follow the same pattern for each API group. Create files:
- `src/lib/validations/account.ts`
- `src/lib/validations/recurrence.ts`
- `src/lib/validations/budget.ts`
- `src/lib/validations/notification.ts`
- `src/lib/validations/profile.ts`

- [ ] **3.4: Run tests**

Run: `npm run test`
Expected: 576+ tests passing (no regressions)

- [ ] **3.5: Build check**

Run: `npm run build`
Expected: Build succeeds

---

### Task 4: E17-T2..T9 — Design System restante (P1-P3)

**Files:**
- Modify: `src/app/globals.css` (tokens, shadows, borders, spacing)
- Modify: Various page/component files

- [ ] **4.1: E17-T2 Dark mode audit**

Check all pages render correctly in dark mode. Add `class="dark"` to test.
Fix any hardcoded light-only colors.

- [ ] **4.2: E17-T3 Tipografia consistente**

Ensure all pages use the typography tokens:
- `heading-{xl,lg,md,sm}` for headings
- `body-{lg,md,sm}` for body text
- `caption` for captions
- `overline` for overlines

- [ ] **4.3: E17-T4 Cards premium**

Enhance card component with:
- Default elevation: `shadow-sm`
- Hover: `shadow-md` + `scale-[1.01]`
- Selected: `ring-2 ring-primary`
- Active: `shadow-inner`

```css
/* In globals.css */
.premium-card {
  @apply rounded-2xl border bg-card text-card-foreground shadow-sm transition-all duration-200;
}
.premium-card:hover {
  @apply shadow-md;
}
.premium-card.selected {
  @apply ring-2 ring-primary;
}
```

- [ ] **4.4: E17-T5 Shadow system**

Audit all shadow classes and ensure they use tokens:
- `shadow-sm` → card default
- `shadow-md` → card hover
- `shadow-lg` → dialog/modal
- `shadow-xl` → dropdown/sheet

- [ ] **4.5: E17-T6 Gradientes premium**

Ensure gradients use CSS variables:
```css
--gradient-primary: linear-gradient(135deg, var(--color-primary), #047857);
--gradient-surface: linear-gradient(135deg, var(--color-surface), var(--color-surface-container));
```

- [ ] **4.6: E17-T7 Ícones consistentes**

Audit lucide-react icons. Replace inconsistent icons:
- All "add" → `Plus`
- All "edit" → `Pencil`  
- All "delete" → `Trash2`
- All "back" → `ArrowLeft`

- [ ] **4.7: E17-T8 Border-radius audit**

Ensure 4 levels of border-radius:
```css
--radius-sm: 0.5rem;   /* 8px - buttons, inputs */
--radius-md: 0.75rem;  /* 12px - cards */
--radius-lg: 1rem;     /* 16px - dialogs */
--radius-xl: 1.5rem;   /* 24px - large containers */
```

- [ ] **4.8: E17-T9 Spacing audit**

Ensure all spacing is in multiples of 4px (p-1 = 4px, p-2 = 8px, etc.)
Replace any odd spacing (p-1.5, p-3.5, gap-3.5, etc.)

- [ ] **4.9: Build check**

Run: `npm run build`
Expected: Build succeeds

---

### Task 5: E18-T1 — Skeleton loading (P1)

**Files:**
- Modify: All page.tsx files to add skeleton loading states
- Components already exist: `CardsGridSkeleton`, `TableSkeleton`, `StatCardsSkeleton`, `PageHeaderSkeleton`

- [ ] **5.1: Dashboard skeleton**

File: `src/app/page.tsx`
Add skeleton while data loads:

```tsx
import { CardsGridSkeleton, StatCardsSkeleton } from "@/components/ui/page-skeleton";

// In the page component:
if (loading) {
  return (
    <div className="space-y-6 p-6">
      <PageHeaderSkeleton />
      <StatCardsSkeleton count={4} />
      <CardsGridSkeleton count={3} />
    </div>
  );
}
```

- [ ] **5.2: Movimentações skeleton**

File: `src/app/movimentacoes/page.tsx`
Add `TableSkeleton` while transactions load

- [ ] **5.3: Contas skeleton**

File: `src/app/contas/page.tsx`
Add `CardsGridSkeleton` while accounts load

- [ ] **5.4: Apply to remaining 16 pages**

Apply appropriate skeleton to each page:
- Pages with tables → `TableSkeleton`
- Pages with cards → `CardsGridSkeleton` or `StatCardsSkeleton`
- Pages with both → compose multiple skeletons

- [ ] **5.5: Build check**

Run: `npm run build`
Expected: Build succeeds

---

### Task 6: E18-T5 — Empty states premium (P1)

**Files:**
- Modify: Page files to show `EmptyState` when no data
- Components already exist: `EmptyState` in `empty-state.tsx`, `EmptyTransactions`, `EmptyDashboard`, `EmptyCategories`

- [ ] **6.1: Audit pages for empty state handling**

Run: `rg 'empty' src/app/ --include='*.tsx' -n | grep -i 'empty\|length\|length === 0\|\.length\s*===\s*0' | head -30`

- [ ] **6.2: Add EmptyState to Contas**

File: `src/app/contas/page.tsx`

```tsx
import { EmptyState } from "@/components/ui/empty-state";
import { Wallet } from "lucide-react";

if (accounts.length === 0) {
  return <EmptyState icon={Wallet} title="Nenhuma conta" description="Crie sua primeira conta para começar a controlar suas finanças." ctaLabel="Criar conta" onCta={() => setIsDialogOpen(true)} />;
}
```

- [ ] **6.3: Add EmptyState to Orçamentos**

File: `src/app/orcamentos/page.tsx`

```tsx
import { EmptyState } from "@/components/ui/empty-state";
import { PiggyBank } from "lucide-react";

if (budgets.length === 0) {
  return <EmptyState icon={PiggyBank} title="Nenhum orçamento" description="Crie orçamentos para acompanhar seus gastos por categoria." ctaLabel="Criar orçamento" onCta={() => setIsDialogOpen(true)} />;
}
```

- [ ] **6.4: Add EmptyState to Recorrências, Alertas, Agents**

Repeat pattern for pages that can be empty

- [ ] **6.5: Consolidate empty-state.tsx and empty-states.tsx**

If `empty-state.tsx` and `empty-states.tsx` overlap, merge into single component.
Keep `empty-states.tsx` as presets, `empty-state.tsx` as generic.

- [ ] **6.6: Build check**

Run: `npm run build`
Expected: Build succeeds

---

### Task 7: E18-T7 — Error boundaries (P1)

**Files:**
- Modify: Page files to wrap content in `PageErrorBoundary`
- Component already exists: `PageErrorBoundary` in `page-error-boundary.tsx`

- [ ] **7.1: Audit existing error boundary usage**

Run: `rg 'PageErrorBoundary\|ErrorBoundary' src/app/ --include='*.tsx' -n`

- [ ] **7.2: Wrap remaining pages with PageErrorBoundary**

For each page not yet wrapped:

```tsx
import { PageErrorBoundary } from "@/components/ui/page-error-boundary";

export default function Page() {
  return (
    <PageErrorBoundary>
      {/* existing page content */}
    </PageErrorBoundary>
  );
}
```

- [ ] **7.3: Build check**

Run: `npm run build`
Expected: Build succeeds

---

### Task 8: E18-T2..T11 — UX restante + E19-T2..T13 — Mobile restante

**Files:** Various page and component files

- [ ] **8.1: E18-T2 Page transitions (framer-motion)**

Wrap page content in `motion.div` with fade-in/slide-up:

```tsx
import { motion } from "framer-motion";

<motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
  {/* page content */}
</motion.div>
```

- [ ] **8.2: E18-T9 prefers-reduced-motion**

```tsx
import { useReducedMotion } from "framer-motion";
const prefersReduced = useReducedMotion();
// Skip animations when prefersReduced is true
```

- [ ] **8.3: E18-T10 Keyboard navigation audit**

Check tab order, focus visible ring, modal focus trapping in all dialogs

- [ ] **8.4: E19-T2 Keyboard-aware forms**

File: `src/app/movimentacoes/page.tsx` + modal dialog files
Ensure forms scroll into view when keyboard appears on mobile

- [ ] **8.5: E19-T4 Safe area insets**

Ensure padding uses `env(safe-area-inset-top)` and `env(safe-area-inset-bottom)` in mobile layouts

- [ ] **8.6: E19-T8 Responsive tables**

Each page with a table should have mobile card view:
```tsx
{/* Desktop: table */}
<div className="hidden md:block"><Table ... /></div>
{/* Mobile: cards */}
<div className="md:hidden">{data.map(item => <Card ... />)}</div>
```

- [ ] **8.7: E19-T10 Lighthouse**

Run: `npx lighthouse http://localhost:3010 --view`
Target: Mobile > 90, Desktop > 95

- [ ] **8.8: Remaining E19 tasks**

Execute E19-T3 (pull-to-refresh), E19-T5 (FormWizard), E19-T6 (bottom sheet), E19-T7 (swipe actions), E19-T11 (virtualized lists), E19-T12 (touch feedback), E19-T13 (landscape check)

---

### Task 9: E16-T10 — QA auditoria final (P1)

- [ ] **9.1: Run regression test suite**

Run: `npm run test`
Expected: 576+ tests passing

- [ ] **9.2: E2E smoke test**

Manually test 10 critical flows:
1. Login → Dashboard
2. Create transaction
3. Edit transaction
4. Create account
5. Create budget
6. View reports
7. Mobile navigation (bottom nav + FAB)
8. Dark mode toggle
9. Create recurrence
10. Monthly closing

- [ ] **9.3: Document any regressions found**

Add to docs/KNOWN_ISSUES.md if new bugs found

- [ ] **9.4: Final build + test**

Run: `npm run build && npm run test`
Expected: Build succeeds, all tests pass

---

## Execution Order Summary

```
Task 1 (E19-T1)     →  Touch targets P0          →  30 min
Task 2 (E17-T1)     →  Cores → tokens             →  1-2h  
Task 3 (E16-T8)     →  Zod 100%                   →  3-4h
Task 4 (E17-T2..T9) →  Design system              →  3-4h
Task 5 (E18-T1)     →  Skeleton loading           →  1-2h
Task 6 (E18-T5)     →  Empty states               →  1h
Task 7 (E18-T7)     →  Error boundaries           →  30min
Task 8 (E18+E19)    →  UX + Mobile restante       →  4-6h
Task 9 (E16-T10)    →  QA audit                   →  1h
```

**Total estimado:** ~15-20h de desenvolvimento
