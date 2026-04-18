# AUDIT REPORT — FlyDea Financial Manager
> Generated: 2026-04-18 | Branch: fix/flydea-complete

---

## 1. Console Logs (to replace with logger)

| File | Lines |
|------|-------|
| src/app/api/document-import/route.ts | 18, 40, 95 |
| src/app/api/document-import/confirm/route.ts | 25, 116 |
| src/app/api/upload/route.ts | 39 |
| src/app/api/cobranca/whatsapp/route.ts | 36, 37 |
| src/lib/document-parser.ts | 38, 64, 79 |
| src/lib/duplicate-detector.ts | 16, 39, 57, 76, 87 |

**Action:** Replace with `logger.info/warn/error` from `src/lib/logger.ts`

---

## 2. Fixed Pixel Widths (mobile risk)

| File | Class |
|------|-------|
| src/components/importer.tsx | max-w-[200px] |
| src/components/document-importer.tsx | max-w-[200px] |
| src/app/contas/page.tsx | max-w-[500px] |
| src/app/relatorios/page.tsx | max-w-[120px] |
| src/app/movimentacoes/page.tsx | max-w-[500px] |
| src/app/login/page.tsx | max-w-[440px] |
| src/app/orcamentos/page.tsx | max-w-[500px] |
| src/app/recorrencias/page.tsx | max-w-[600px] |

**Status:** All are `max-w` on `DialogContent` — acceptable, they don't cause overflow.

---

## 3. HTML Tables (overflow risk on mobile)

| File | Notes |
|------|-------|
| src/components/ui/table.tsx | Base component — already wrapped in overflow-x-auto |

**Status:** No raw `<table>` in pages outside the base component. ✅

---

## 4. DialogContent Usage (responsiveness audit)

| File | Uses |
|------|------|
| src/app/contas/page.tsx | 1 dialog |
| src/app/movimentacoes/page.tsx | 1 dialog |
| src/app/orcamentos/page.tsx | 1 dialog |
| src/app/recorrencias/page.tsx | 1 dialog |
| src/components/importer.tsx | 1 dialog |
| src/components/quick-add.tsx | 1 dialog |
| src/components/document-importer.tsx | 1 dialog |

**Action:** Ensure all have `max-h-[90dvh] overflow-y-auto` for long forms.

---

## 5. Type `any` Usage

**High-risk files:**
- `src/app/movimentacoes/page.tsx` — 8 occurrences (transaction types)
- `src/app/page.tsx` — 4 occurrences (metrics state)
- `src/app/contas/page.tsx` — 3 occurrences
- `src/lib/auth.ts` — 2 occurrences (session role)

**Action:** Create proper TypeScript interfaces for Transaction, Account, etc.

---

## 6. Overflow-X Usage

All existing `overflow-x-auto/hidden` look intentional and correct. ✅

---

## 7. Unsafe Date Splits (`.split("T")`)

| File | Lines | Risk |
|------|-------|------|
| src/app/movimentacoes/page.tsx | 47, 220-224, 236 | HIGH — breaks on null/undefined |
| src/app/contas-a-pagar/page.tsx | 40 | HIGH |
| src/components/invoice-manager.tsx | 41, 49, 62, 94, 102 | MEDIUM |
| src/components/quick-add.tsx | 26 | MEDIUM |
| src/components/document-importer.tsx | 135 | LOW |
| src/app/recorrencias/page.tsx | 46, 141 | LOW |

**Action:** Replace with `toLocalDateInput()` from `src/lib/date-utils.ts`

---

## 8. window.confirm Usage

None found. ✅ (Already replaced with ConfirmDialog)

---

## 9. Pages Inventory

| Page | Path | Mobile-ready? |
|------|------|--------------|
| Dashboard | src/app/page.tsx | ⚠️ Cards grid-cols-2 can truncate values |
| Movimentações | src/app/movimentacoes/page.tsx | ⚠️ Badge absolute, FAB overlap |
| Contas a Pagar | src/app/contas-a-pagar/page.tsx | ⚠️ Summary cards truncate |
| Orçamentos | src/app/orcamentos/page.tsx | ✅ |
| Recorrências | src/app/recorrencias/page.tsx | ✅ |
| Contas | src/app/contas/page.tsx | ✅ |
| Fechamento | src/app/fechamento/page.tsx | ⚠️ Table needs overflow-x-auto |
| Fluxo de Caixa | src/app/fluxo-caixa/page.tsx | ⚠️ Weekly W1-W4 grid |
| Relatórios | src/app/relatorios/page.tsx | ⚠️ Charts |
| Admin/Logs | src/app/admin/logs/page.tsx | Desktop-only OK |
| Admin/Aprovações | src/app/admin/aprovacoes/page.tsx | Desktop-only OK |

---

## 10. Build Baseline

- **Build:** ✅ Compiled successfully
- **TypeScript:** ✅ 0 errors (after `prisma generate`)
- **Tests:** ✅ 86/86 passing (5 test files)
- **Console.logs in production code:** 16 occurrences (to be replaced with logger)
