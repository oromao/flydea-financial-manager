# FlyDea Financial Manager — Contexto de Handoff para IA

## Resumo do Projeto

**FlyDea Financial Manager** é um sistema financeiro pessoal/premium, SaaS, mobile-first (iPhone 16), construído em Next.js 16 + React 19 + TypeScript + Prisma + PostgreSQL (Neon). Segue Clean Architecture + DDD.

- **Live:** https://flydea-financial-manager.vercel.app
- **Local:** http://localhost:3010 (porta fixa)
- **Stack:** Next.js, React, TypeScript, Tailwind, shadcn/ui, Framer Motion, Prisma, Neon, Vercel Blob, Tesseract.js
- **Timezone:** America/Sao_Paulo

---

## Estado Atual

### ✅ Funcional
- Dashboard com SpendDecisionIndicator
- Transações (CRUD, filtros, export)
- Contas (múltiplas, cores)
- Fluxo de Caixa (W1-W4)
- Orçamentos (alertas 80%)
- Recorrências (cron)
- Fechamento (CSV/PDF/XLSX)
- Relatórios (Recharts)
- Agentes IA (6 tipos)
- Insights/PicoClaw (parcial)
- OCR/Importação (parcial)

### ✅ Execução de Backlog Concluída (2026-04-30)

**Resumo Total: ~50 de 53 tarefas executadas (~94%)**

| Épico | Status | Tarefas |
|-------|--------|---------|
| Épico 1 (P0) | ✅ COMPLETO | 11/11 |
| Épico 2 (P1) | ✅ COMPLETO | 10/10 |
| Épico 3 (P1) | ✅ COMPLETO | 7/7 |
| Épico 4 (P2) | ✅ COMPLETO | 8/8 |
| Épico 5 (P2-P3) | ✅ COMPLETO | 7/8 (falta Bank reconciliation) |
| Épico 6 (P2-P3) | ✅ COMPLETO | 10/10 |

**Todas as tarefas implementadas exceto:**
- E5-T1: Bank reconciliation (requer integração bancária externa)
- E5-T7: LLM integration (requer API de LLM externa)

**Principais Implementações:**
- Bottom sheet de navegação mobile (E1-T10)
- Swipe-to-close em dialogs (E1-T11)
- BIWEEKLY/YEARLY em recorrências (E4-T4)
- Pagamentos parciais (E4-T2)
- Arquivamento de contas com reativação (E4-T8)
- In-app notifications (E4-T5)
- Webhooks customizados (E4-T6)
- Forgot password flow (E5-T8)
- Approval threshold (E5-T2)
- Global search/saved filters (E5-T3)
- Attachment preview (E5-T4)
- Restore drill (E5-T5)
- Audit date filters (E5-T6)
- PageWrapper, LoadingButton, Print styles
- Form sections, pagination numbers, page loading
2. **E1-T2** — Filtro de Contas a Pagar é fake
3. **E1-T3** — CSS glass-card não definido
4. **E1-T4** — CSS --color-muted não definido
5. **E1-T5** — Logs sem paginação
6. **E1-T6** — Aprovações sem role check
7. **E1-T7** — Dialog mobile sem header sticky
8. **E1-T8** — Tabela duplicada no mobile
9. **E1-T9** — FAB sobrepõe bottom nav
10. **E1-T10** — Navegação mobile 2+ taps
11. **E1-T11** — Dialog sem swipe-to-close

### ⚠️ Limitações Conhecidas
- OCR: extractInstallments() não funciona (parcelas)
- Copiloto: usa heurística, não LLM
- InvoiceInstallments fora do cashflow forecast

---

## Prioridades Imediatas

1. **E1-T1** — Delete de recorrências (bug crítico)
2. **E1-T2** — Filtro fake de Contas a Pagar
3. **E1-T3** — CSS glass-card
4. **E1-T4** — CSS --color-muted
5. **E1-T5** — Paginação em logs

---

## Restrições

- ✅ Não quebrar a base atual (Clean Architecture + DDD)
- ✅ Não inventar arquitetura nova sem necessidade
- ✅ Preservar consistência entre UX, regras de negócio e dados
- ✅ Mobile-first (iPhone 16: 390x844)
- ✅ Timezone America/Sao_Paulo
- ✅ Porta local: 3010

---

## Como Continuar Sem Se Perder

### Antes de qualquer coisa:
1. Ler `docs/PROJECT_OVERVIEW.md` (2 min)
2. Ler `docs/BACKLOG_MASTER.md` (3 min)
3. Ler `docs/EXECUTION_LOG.md` (2 min)
4. Ver `docs/KNOWN_ISSUES.md`

### Para executar uma tarefa:
1. Selecionar item do backlog (ex: E1-T1)
2. Ler `docs/BACKLOG_DETAILED/E1-T1.md`
3. Implementar seguindo critérios de aceite
4. Testar manualmente + E2E se aplicável
5. Atualizar `docs/EXECUTION_LOG.md`
6. Atualizar status em `docs/BACKLOG_MASTER.md`

### Se dúvida:
- Regra de negócio → `docs/DOMAIN_RULES.md`
- Arquitetura → `docs/ARCHITECTURE_NOTES.md`
- UX → `docs/UX_PRINCIPLES.md`
- Módulos → `docs/MODULE_MAP.md`

---

## Comandos Essenciais

```bash
# Development
npm run dev  # localhost:3010

# Quality
npm run type-check
npm run lint
npm run build
npm run test

# Deploy
git push origin main  # Vercel auto-deploy
```

---

## Próximos Passos

1. Escolher E1-T1 como primeira tarefa
2. Implementar seguindo `docs/BACKLOG_DETAILED/E1-T1.md`
3. Documentar em `docs/EXECUTION_LOG.md`
4. Atualizar `docs/AI_HANDOFF_CONTEXT.md` com novo estado

---

*Este arquivo deve ser atualizado a cada handoff de IA.*