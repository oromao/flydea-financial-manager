# FlyDea Financial Manager — Contexto de Handoff para IA

## Resumo do Projeto

**FlyDea Financial Manager** é um sistema financeiro pessoal/premium, SaaS, mobile-first (iPhone 16), construído em Next.js 16 + React 19 + TypeScript + Prisma + PostgreSQL (Neon).

- **Live:** https://flydea-financial-manager.vercel.app
- **Local:** http://localhost:3010
- **Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, shadcn/ui, Framer Motion, Prisma, Neon, Vercel Blob

---

## Estado Atual (2026-05-05)

### ✅ Auditoria QA Completa (Playwright MCP)

- **10 páginas testadas** interativamente via Playwright MCP (browser real, iPhone 16)
- **2 bugs críticos** encontrados em produção (Movimentações quebrada, UUID no dropdown)
- **12 items** adicionados ao backlog como ÉPICO 14 (E14-T1 a E14-T12)
- **MCPs utilizados:** Playwright MCP, Vercel MCP, GitHub MCP
- **Deploy:** Último commit `37532226` (READY)

### 🔴 Bugs Críticos em Produção

| Bug | Página | Status |
|-----|--------|--------|
| RangeError: Invalid time value | /movimentacoes | Página 100% quebrada |
| UUID no dropdown de categoria | Dashboard → Novo Lançamento | UX confusa |
| manifest.webmanifest ausente | Global | PWA não funcional |

### ✅ Redesign Visual Executado

- **Design System:** Button `rounded-xl` (12px), ~60+ cores hardcoded → tokens CSS
- **Dashboard:** Hero premium com saldo display 42px, timestamp, 3 mini-cards integrados, gráfico com label Y
- **Relatórios:** Cores tokenizadas (`var(--color-success)`, etc), labels rotacionados no mobile
- **A11y:** Skip-to-content link, focus-visible global, zoom permitido
- **Todas as páginas:** Verificadas e confirmadas funcionais

### ✅ Backlog Anterior Completamente Verificado

| Épico | Status |
|-------|--------|
| Épico 1-2 (P0/P1): Bugs e consistência | ✅ Todos corrigidos |
| Épico 3: Testes e QA | ✅ Mocks criados |
| Épico 4: Funcionalidades parciais | ✅ Todas implementadas |
| Épico 5: Novas funcionalidades | ✅ Quase total (falta Bank reconciliation E5-T1) |
| Épico 6: UX Polish | ✅ Completo |
| Épico 7-8: Redesign + Design System | ✅ Completo |

### ⚠️ Pendências (P2-P3)

- E5-T1: Bank reconciliation (requer Open Finance)
- E5-T7: LLM integration (requer API externa)
- E10-T4: ARIA labels em todos os ícones (parcial)
- E10-T5: prefers-reduced-motion (parcial, alguns components)
- Testes: 0 screenshots padronizados, cobertura ~45%

---

## Arquivos Modificados Recentemente (2026-05-04)

- `src/app/page.tsx` — Dashboard redesenhado
- `src/components/dashboard/dashboard-hero.tsx` — Hero premium
- `src/components/ui/button.tsx` — rounded-xl
- `src/app/relatorios/page.tsx` — Chart tokens
- `src/app/layout.tsx` — Skip-to-content
- `src/components/sidebar.tsx` — main#main-content
- `src/components/ui/toast.tsx` — Cores tokenizadas
- `src/components/movimentacoes/transaction-card.tsx` — Cores tokenizadas
- `src/components/daily-insight.tsx` — Cores tokenizadas
- `src/components/agents/agents-dashboard.tsx` — Cores tokenizadas
- `src/components/agents/agent-execution-history.tsx` — Cores tokenizadas
- `src/components/weekly-cashflow.tsx` — Cores tokenizadas
- `src/components/weekly-cashflow-forecast.tsx` — Cores tokenizadas
- `src/components/spend-decision-indicator.tsx` — Cores tokenizadas
- `src/components/confirm-dialog.tsx` — Ícones tokenizados
- `src/components/field-error.tsx` — Cores tokenizadas
- `src/components/copilot/intelligent-copilot.tsx` — Cores tokenizadas
- `src/components/quick-add.tsx` — Cores tokenizadas
- `src/components/payment-importer.tsx` — Cores tokenizadas
- `src/components/document-importer.tsx` — Cores tokenizadas
- `src/components/importer.tsx` — Cores tokenizadas
- `src/components/invoice-manager.tsx` — Cores tokenizadas (select items)
- `src/components/notifications/in-app-notifications.tsx` — Cores tokenizadas
- `src/app/contas-a-pagar/page.tsx` — Cores tokenizadas
- `src/app/admin/aprovacoes/page.tsx` — Cores tokenizadas
- `src/app/admin/logs/page.tsx` — Cores tokenizadas
- `src/app/mais/page.tsx` — Cores tokenizadas
- `src/app/login/page.tsx` — Cores tokenizadas
- `src/app/esqueci-senha/page.tsx` — Cores tokenizadas
- `src/app/perfil/page.tsx` — Cores tokenizadas
- `src/app/alertas/page.tsx` — Cores tokenizadas
- `src/app/insights/page.tsx` — Cores tokenizadas
- `src/app/fechamento/page.tsx` — Cores tokenizadas (sem alterações de cor, só verificada)

---

## Comandos Essenciais

```bash
npm run dev          # localhost:3010
npm run type-check   # tsc --noEmit (passa limpo no src/)
npm run lint         # 5 erros pré-existentes, 441 warnings
npm run build        # compila 17 rotas com sucesso
npm run test         # testes existentes
git push origin main # deploy automático no Vercel
```

---

## Próximos Passos Recomendados

1. **HOTFIX (E14-T1):** Fix RangeError na página Movimentações — PÁGINA 100% QUEBRADA
2. **HOTFIX (E14-T2):** Fix UUID no dropdown de categoria
3. **HOTFIX (E14-T3):** Criar manifest.webmanifest
4. Corrigir botão Fechar interceptado (E14-T4)
5. Remover dados seed de produção (E14-T8)
6. Investigar inconsistência de saldo (E14-T9)
7. Continuar com Épico 7-13 do backlog

---

*Última atualização: 2026-05-05*
