# Design System & CSS Audit Report

**FLY-017** | **Owner:** UX/UI Designer & Researcher | **Data:** 2026-05-11

---

## Resumo

| Métrica | Resultado |
|---------|-----------|
| Tokens CSS no `globals.css` | 80+ tokens (cores, tipografia, spacing, shadows, animações) |
| Arquivos CSS | `globals.css` (378 linhas) + `token-aliases.css` (28 linhas) |
| Componentes `ui/` analisados | 44 componentes |
| Componentes com tokens corretos | ~40/44 (91%) |
| Cores hardcoded encontradas | **22+ ocorrências** |
| Touch targets < 44px | **24 ocorrências** (28px a 40px) |
| Components duplicados | **2 pares** |
| `rounded-` hardcoded | **~20 ocorrências** |
| `shadow-` hardcoded | **5 ocorrências** |
| `confirm()` nativo | **0 ✅** |
| `alert()` nativo | **0 ✅** |
| `window.location.reload()` | **0 ✅** |
| `user-scalable=no` | **0 ✅** |

---

## 1. Tokens CSS Existentes

### Cores Primárias (Light Mode)
| Token | Valor | Uso |
|-------|-------|-----|
| `--color-primary` | `#059669` (verde esmeralda) | Ações principais, links, active states |
| `--color-on-primary` | `#ffffff` | Texto em fundo primary |
| `--color-primary-container` | `#10B981` | Variação primary |
| `--color-secondary` | `#1F2937` | Ações secundárias |
| `--color-tertiary` | `#EF4444` | Despesas, alertas, erros |
| `--color-surface` | `#F9FAFB` | Fundo de cards |
| `--color-background` | `#ffffff` | Fundo geral |
| `--color-muted` | `#F3F4F6` | Elementos muted |

### Cores (Dark Mode)
Completo: todos os tokens acima têm equivalentes dark mode definidos em `@media (prefers-color-scheme: dark)` e `.dark`.

### Tipografia
| Token | Valor |
|-------|-------|
| `--font-sans` | Inter |
| `--font-display` | Manrope |
| `--text-display-xl` | 3.5rem |
| `--text-h1` | 1.875rem |
| `--text-body-lg` | 1rem |
| `--text-caption` | 0.75rem |

### Spacing
Escala de 4px: `--spacing-1` (4px) a `--spacing-16` (64px)

### Border Radius
| Token | Valor | Tailwind equiv |
|-------|-------|----------------|
| `--radius-xs` | 6px | `rounded-xs` |
| `--radius-sm` | 8px | `rounded-sm` |
| `--radius-md` | 12px | `rounded-md` |
| `--radius-lg` | 16px | `rounded-lg` |
| `--radius-xl` | 20px | `rounded-xl` |
| `--radius-2xl` | 24px | `rounded-2xl` |

### Shadows
| Token | Valor |
|-------|-------|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.04)` |
| `--shadow-premium` | `0 4px 20px rgba(138, 5, 190, 0.15)` |
| `--shadow-float` | `0 12px 40px rgba(0, 0, 0, 0.12)` |
| `--shadow-glow` | `0 0 30px rgba(138, 5, 190, 0.3)` |

---

## 2. Cores Hardcoded Encontradas

### 🔴 ALTA PRIORIDADE

#### `src/app/login/page.tsx` — 20+ valores hex hardcoded
**Problema**: Página de login usa `bg-[#FAFAFA]`, `text-[#111827]`, `text-[#6B7280]`, `border-[#E5E7EB]`, `bg-[#8A05BE]` etc. — ignora completamente os tokens do design system.

**Impacto**: Dark mode não funciona corretamente na página de login.

**Recomendação**: Substituir por tokens: `bg-surface`, `text-on-background`, `text-on-surface-variant`, `border-outline`, `bg-primary`.

#### `src/components/importer.tsx` — 7 valores hex hardcoded
**Problema**: Usa `bg-[#111318]`, `text-[#E2E2E6]`, `text-[#8D9199]`, `border-[#43474E]/30` — design dark-only.

**Impacto**: Light mode quebrado. Componente legacy que deve ser substituído por `document-importer.tsx`.

**Recomendação**: Migrar para `document-importer.tsx` ou refatorar com tokens.

#### `src/components/ui/toast.tsx` — RGBA hardcoded em inline styles
**Problema**: Estilos inline com `rgba(16, 185, 129, 0.95)` (success), `rgba(220, 38, 38, 0.95)` (error), `rgba(217, 119, 6, 0.95)` (warning), `rgba(3, 102, 214, 0.95)` (info).

**Impacto**: Notificações não adaptam ao tema.

**Recomendação**: Usar `bg-destructive`, `bg-success`, `bg-warning`, `bg-primary` com `className` em vez de `style`.

### 🟡 MÉDIA PRIORIDADE

#### Cores Tailwind sem token em 16 ocorrências
`text-red-600`, `text-emerald-600`, `text-amber-600`, `text-yellow-500` em:
- `src/lib/financial-labels.ts` (3x)
- `src/components/weekly-cashflow-forecast.tsx` (2x)
- `src/app/fluxo-caixa/page.tsx` (5x)
- `src/app/admin/ai-learning/page.tsx` (3x)
- `src/components/agents/agent-execution-history.tsx`

**Recomendação**: Substituir por `text-destructive`, `text-success`, `text-warning`.

---

## 3. Touch Targets Violações (Mobile)

### 🔴 Critico — h-7 (28px)
| Arquivo | Elemento | Total |
|---------|----------|-------|
| `src/app/movimentacoes/page.tsx` | TabsTrigger (Todos, +, -, Status, Pago, Pend) | **6 ocorrências** |

### 🔴 Critico — h-8 (32px)
| Arquivo | Elemento | Total |
|---------|----------|-------|
| `src/app/movimentacoes/page.tsx` | Input date, TabsList, Button, icon buttons | **8 ocorrências** |
| `src/components/sidebar.tsx` | Profile avatar link | **1 ocorrência** |

### 🟡 Médio — h-9 (36px)
| Arquivo | Elemento | Total |
|---------|----------|-------|
| `src/app/movimentacoes/page.tsx` | Input search, SelectTrigger, pagination | **4 ocorrências** |
| `src/components/agents/agents-dashboard.tsx` | Button Personalizado | **1 ocorrência** |
| `src/app/contas/page.tsx` | Icon buttons | **2 ocorrências** |

### 🔵 Baixo — h-10 (40px, borderline)
| Arquivo | Elemento | Total |
|---------|----------|-------|
| `src/components/payment-importer.tsx` | Buttons | **2 ocorrências** |
| `src/components/document-importer.tsx` | Button | **1 ocorrência** |
| `src/app/fechamento/page.tsx` | Export buttons | **2 ocorrências** |
| `src/app/alertas/page.tsx` | Action buttons | **3 ocorrências** |
| `src/components/agents/agents-dashboard.tsx` | Icon buttons | **3 ocorrências** |

---

## 4. `rounded-` Hardcoded (~20 ocorrências)

Valores arbitrários que deveriam usar tokens do design system:

| Valor | Ocorrências | Token Sugerido |
|-------|-------------|----------------|
| `rounded-[40px]` | 3 | `rounded-4xl` ou novo token |
| `rounded-[32px]` | 7 | Novo token `--radius-3xl` |
| `rounded-[28px]` | 2 | Novo token |
| `rounded-[24px]` | 4 | `rounded-2xl` (= 24px) |
| `rounded-[20px]` | 1 | `rounded-xl` (= 20px) |
| `rounded-[14px]` | 1 | `rounded-md` (= 12px) |

> **Nota**: `rounded-2xl` em Tailwind = 24px (já existe). `rounded-[32px]` não tem token; criar `--radius-3xl: 32px`.

---

## 5. Components Duplicados

### Par 1: `weekly-cashflow.tsx` ↔ `weekly-cashflow-forecast.tsx`
- Ambos no mesmo diretório, mesmos dados (`/api/cashflow/weekly`)
- `weekly-cashflow.tsx`: legacy (sem tokens, sem Framer Motion, sem cn())
- `weekly-cashflow-forecast.tsx`: refatorado (com tokens, Framer Motion, cn())
- **Recomendação**: Remover `weekly-cashflow.tsx`

### Par 2: `error-boundary.tsx` ↔ `page-error-boundary.tsx`
- Ambos são error boundaries React, visualmente diferentes
- `page-error-boundary.tsx` está em `ui/` (componente de design system)
- `error-boundary.tsx` é wrapper legacy
- **Recomendação**: Consolidar em `page-error-boundary.tsx`

---

## 6. Shadows Hardcoded

| Arquivo | Shadow | Recomendação |
|---------|--------|-------------|
| `src/components/ui/card.tsx:14` | `shadow-[0_2px_8px_rgba(0,0,0,0.04)]` | `shadow-sm` |
| `src/components/ui/select.tsx:93` | `shadow-[0_8px_30px_rgb(0,0,0,0.12)]` | `shadow-lg` ou token |
| `src/components/sidebar.tsx:215` | `shadow-[1px_0_20px_rgba(0,0,0,0.02)]` | Token custom |

---

## 7. Outras Inconsistências

### Imports relativos (devem ser aliases)
- `src/components/ui/money-input.tsx` — usa `"./input"` em vez de `"@/components/ui/input"`
- `src/components/invoice-manager.tsx` — usa `"./ui/button"` em vez de `"@/components/ui/button"`

### Hard navigation (deve ser Next.js router)
- `src/app/relatorios/page.tsx:107` — `window.location.href` para download (aceitável)
- `src/app/admin/aprovacoes/page.tsx:89` — `window.location.href = "/"` → deve ser `router.push("/")`

---

## 8. O que está BOM ✅

- `confirm()` nativo: **zero** — todos usam `useConfirm()` customizado ✅
- `alert()` nativo: **zero** ✅
- `window.location.reload()`: **zero** ✅
- `user-scalable=no`: **zero** ✅
- Mobile-first `@media` queries: todas usam `min-width` ✅
- 40/44 componentes `ui/` usam tokens do design system corretamente ✅
- `!important`: apenas em @media print e prefers-reduced-motion (justificado) ✅

---

## 9. Plano de Correção Priorizado

| Prioridade | Tarefa | Esforço | Impacto |
|------------|--------|---------|---------|
| P0 | Corrigir `toast.tsx` — substituir inline rgba por tokens CSS | 1h | Alto (dark mode quebrado) |
| P0 | Corrigir `login/page.tsx` — substituir 20+ hex por tokens | 2h | Alto (dark mode quebrado) |
| P0 | Aumentar touch targets para 44px em movimentações | 3h | Alto (UX mobile) |
| P1 | Remover `weekly-cashflow.tsx` (duplicado) | 1h | Médio (manutenção) |
| P1 | Substituir cores Tailwind fixas por tokens semânticos | 2h | Médio (consistência) |
| P1 | Consolidar `error-boundary.tsx` → `page-error-boundary.tsx` | 1h | Médio |
| P1 | Migrar/remover `importer.tsx` legacy | 2h | Médio |
| P2 | Substituir `rounded-[XXpx]` por tokens | 2h | Baixo (consistência) |
| P2 | Corrigir shadows hardcoded | 1h | Baixo |
| P2 | Corrigir imports relativos | 30min | Baixo |
| P2 | Corrigir `window.location.href` em aprovacoes | 15min | Baixo |

---

*Documento gerado por: UX/UI Designer & Researcher — Auditoria Automatizada*
*Data: 2026-05-11*
