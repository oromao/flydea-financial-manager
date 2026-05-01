# FlyDea — Auditoria Completa de Código, UX e Arquitetura

> **Data:** 2026-04-30  
> **Escopo:** Análise profunda de 18 páginas, 21 componentes UI, 44 APIs, 37 arquivos de teste  
> **Método:** Leitura linha a linha de todo o código fonte, não apenas documentação

---

## 1. RESUMO DOS ACHADOS

| Categoria | Críticos | Altos | Médios | Total |
|-----------|----------|-------|--------|-------|
| API Validation | 34/44 sem validação | — | — | 34 |
| Rate Limiting | 43/44 sem rate limit | — | — | 43 |
| Hardcoded Colors | 77+ instâncias | — | — | 77 |
| `any` Type | — | 104+ instâncias | — | 104 |
| native confirm() | 1 | — | — | 1 |
| window.location.reload | — | 5 | — | 5 |
| CSS tokens ausentes | 5 | — | — | 5 |
| ARIA ausente | — | 15/21 componentes | — | 15 |
| Form validation client | 18/18 páginas | — | — | 18 |
| Error boundaries (page) | 18/18 páginas | — | — | 18 |
| Testes ausentes (API) | 44/44 rotas | — | — | 44 |
| Testes ausentes (pages) | 18/18 páginas | — | — | 18 |

---

## 2. ARQUITETURA E DOCUMENTAÇÃO

### 2.1 Inconsistências Documentais (CRÍTICO)

**KNOWN_ISSUES.md vs BACKLOG_MASTER.md vs EXECUTION_LOG.md estão contraditórios:**

| Bug | KNOWN_ISSUES.md | BACKLOG_MASTER.md | EXECUTION_LOG.md | Realidade (código) |
|-----|----------------|-------------------|------------------|---------------------|
| E1-T1 (delete recorrências) | pending | completed | completed | ✅ Implementado |
| E1-T2 (filtro fake) | pending | completed | completed | ✅ Implementado |
| E1-T3 (glass-card) | pending | completed | completed | ✅ Implementado (mas não adapta dark mode) |
| E1-T4 (--color-muted) | pending | completed | completed | ✅ Definido no globals.css |
| E1-T5 (paginação logs) | pending | completed | completed | ✅ Implementado |
| E1-T6 (role check) | pending | completed | completed | ✅ Implementado |
| E2-T1 (confirm→useConfirm) | pending | completed | completed | ⚠️ 1 confirm() ainda existe (agents-dashboard.tsx:133) |
| E2-T2 (toast local) | pending | completed | completed | ✅ Substituído |

> **Ação:** KNOWN_ISSUES.md está DESATUALIZADO. Deve ser corrigido urgentemente.

### 2.2 AI_HANDOFF_CONTEXT.md (quebrado)
- **Linhas 62-71:** Conteúdo duplicado/misturado — lista itens do Épico 1 duas vezes, com numeração quebrada
- **Linhas 80-87:** Prioridades Imediatas ainda apontam para bugs que o backlog diz já estarem corrigidos
- **Safe-area config:** Afirma que items foram implementados mas KNOWN_ISSUES discorda

### 2.3 Claim "shadcn/ui" vs Realidade
- AGENTS.md e docs dizem usar "shadcn/ui"
- Código usa **@base-ui/react** (Base UI primitives da MUI) com wrappers customizados
- Isso NÃO é um bug — é uma escolha arquitetural válida. Mas a documentação está errada.

---

## 3. API (src/app/api/) — 44 Rotas

### 3.1 Validação Zod (77% SEM validação)

**Com Zod:** transactions, transactions/[id], accounts, accounts/[id], tags, invoices, recurrences, recurrences/[id], budgets, budgets/[id], categories  
**Sem Zod (34 rotas):** dashboard, notifications, profile, fechamento/export, fechamento/export/pdf, import, reconciliation, insights, revenues, cashflow, agents, approvals, upload, image-proxy, blob-download, document-import, metrics, rag, auth/forgot-password, webhooks, cron/*, logs, cobranca

### 3.2 Rate Limiting (98% SEM proteção)
- Apenas `auth/[...nextauth]` (login) tem rate limit
- Todas as 43 outras rotas estão desprotegidas contra brute force
- `rate-limit.ts` existe e usa Upstash Redis — não é aplicado

### 3.3 Error Handling (95% OK)
- 42/44 rotas retornam HTTP status codes corretos (401, 400, 404, 403, 500, 201, 409)

---

## 4. FRONTEND — 18 Páginas

### 4.1 Validação de Formulários (0%)
- NENHUMA página usa validação client-side estruturada (react-hook-form, Zod)
- Todas usam `if (!description.trim())` manual
- Zod schemas existem em `src/lib/validations.ts` mas só são usados nas APIs

### 4.2 Error Boundaries (0% nas páginas)
- App-level: `error.tsx`, `global-error.tsx`, `error-boundary.tsx` (cobrem crash de React)
- Page-level: NENHUMA página tem tratamento de erro de fetch/API
- Erros de API são apenas `console.error` → usuário vê dados stale/sem feedback

### 4.3 Estados de Loading
- 16/18 mostram spinner inline
- NENHUMA usa o componente `Skeleton` ou `PageLoading` existente
- `/mais` e `/insights` — sem loading state

### 4.4 Estados Vazios
- Inconsistentes: algumas usam `EmptyState`, outras markup inline
- `/fluxo-caixa`, `/agents`, `/mais`, `/insights` — sem empty state

---

## 5. DESIGN SYSTEM — globals.css

### 5.1 Tokens Ausentes (5 tokens não definidos mas usados)
- `--color-popover` → usado por dialog.tsx → sem cor de fundo
- `--color-popover-foreground` → idem
- `--color-ring` → usado por select.tsx
- `--color-input` → input wrapper border
- `--color-border` → tabelas e cards

### 5.2 glass-card (dark mode quebrado)
```css
.glass-card {
  @apply bg-white/80 backdrop-blur-md border border-white/20 rounded-2xl shadow-lg;
}
```
- `bg-white/80` + `border-white/20` → em dark mode, card fica branco sobre fundo escuro
- Sem variante `dark:` — completamente quebrado visualmente

### 5.3 apple-button-primary (CLASSE INEXISTENTE)
- Usada em dezenas de lugares (`className="apple-button-primary..."`)
- NÃO definida em globals.css, tailwind.config, ou qualquer lugar
- Ou está definida em plugin não encontrado, ou está silenciosamente falhando

### 5.4 Hardcoded Colors (77+ instâncias)
- `bg-red-500` (28x), `bg-amber-500` (17x), `bg-emerald-500` (15x), `bg-blue-500` (12x)
- Devem usar tokens: `bg-tertiary`, `bg-primary`, etc.
- `confirm-dialog.tsx` usa `bg-rose-500`, `bg-amber-500`, `bg-blue-500` hardcoded
- `button.tsx:destructive` usa `bg-red-500/10 text-red-600`

---

## 6. UX / MOBILE

### 6.1 Boas Práticas Implementadas
- Dialog mobile usa `h-[100dvh]` com safe-area
- Bottom nav respeita `safe-area-inset-bottom`
- FAB com `calc(6rem + env(safe-area-inset-bottom))`
- Swipe-to-close com Framer Motion
- Viewport sem `maximum-scale` → zoom permitido (acessibilidade ✅)

### 6.2 Problemas Mobile
- Touch targets: botões de tabela `w-9 h-9` (36px) — abaixo de 44px
- Bottom nav icons: `w-11 h-8` — altura 32px, abaixo de 44px
- Inputs inconsistentes: alguns `h-12` (48px), outros `h-10` (40px)

### 6.3 Acessibilidade (ARIA)
- 15/21 componentes sem ARIA attributes
- Apenas toast, confirm-dialog, filter-chips, dialog têm algum ARIA
- button, input, select, table, card, label — ZERO aria

---

## 7. CÓDIGO — Qualidade

### 7.1 TypeScript `any` (104+ instâncias)
- Todos os `useState` declarados como `useState<any[]>([])`
- API routes usam `const where: any = {}`
- Domain entities usam `(this as any).property` (7x em AIAgent.ts)
- Framer Motion variants como `const containerVariants: any`

### 7.2 window.location.reload (5 instâncias)
- `dashboard-hero.tsx:51`, `error-boundary.tsx:40`, `weekly-cashflow.tsx:76`, `weekly-cashflow-forecast.tsx:78`, `perfil/page.tsx:163`
- Deve usar `router.refresh()` ou re-fetch

### 7.3 native confirm() (1 restante)
- `agents-dashboard.tsx:133` ainda usa `confirm()` nativo

---

## 8. TESTES

### 8.1 Cobertura por Camada
| Camada | Testes | Cobertura |
|--------|--------|-----------|
| Domain (financial-engine) | 6 arquivos | ✅ Boa |
| PicoClaw/AI | 8 arquivos | ✅ Boa |
| OCR | 2 arquivos | ✅ Boa |
| API Routes | 0/44 | 🔴 ZERO |
| Pages (18) | 0/18 | 🔴 ZERO |
| UI Components (21) | 1/21 | 🔴 5% |
| Hooks | 0 | 🔴 ZERO |
| Middleware | 0 | 🔴 ZERO |
| Auth flows | 0 | 🔴 ZERO |

### 8.2 Configuração de Coverage
- NÃO há vitest.config.ts com coverage thresholds
- Sem relatório de coverage ou badge
- Cobertura reportada (45%) NÃO é verificável

---

## 9. SEGURANÇA

| Issue | Severidade | Status |
|-------|-----------|--------|
| 43/44 APIs sem rate limiting | 🔴 Crítico | Open |
| 34/44 APIs sem validação de input | 🔴 Crítico | Open |
| Admin routes sem rate limit | 🟡 Alto | Open |
| Token Vercel em .agent/mcp_config.json placeholder | 🟢 Info | Precisa config |

---

## 10. PRIORIDADES DE CORREÇÃO

### 🔴 Onda 1 (Imediato — crashing bugs)
1. `--color-popover` ausente → dialog sem fundo
2. `apple-button-primary` não definida → botões invisíveis
3. 1 `confirm()` nativo restante

### 🟡 Onda 2 (Alto — confiabilidade)
4. 34 APIs sem validação Zod
5. 43 APIs sem rate limiting
6. 5 `window.location.reload()` → substituir por re-fetch

### 🟢 Onda 3 (Médio — qualidade)
7. 77+ hardcoded colors → design tokens
8. 104+ `any` types → tipos corretos
9. 15/21 componentes sem ARIA
10. 18 páginas sem error boundary
11. glass-card sem dark mode

### 🔵 Onda 4 (Testes)
12. 44 rotas de API sem testes
13. 18 páginas sem testes
14. 20 componentes UI sem testes
15. Configurar coverage thresholds

---

*Arquivo gerado por auditoria linha a linha do código. Use como referência para o backlog de correções.*
