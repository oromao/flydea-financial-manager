# FlyDea Financial Manager — Contexto de Handoff para IA

**Data:** 2026-05-12 | **Sprint:** 3 — UX/UI Audit Bugfix (ACTIVE 🔶)

---

## Estado Atual do Projeto

**FlyDea Financial Manager** — SaaS de finanças pessoais premium, mobile-first (iPhone 16).

- **Live:** https://flydea-financial-manager.vercel.app ✅
- **Local:** `npm run dev` → http://localhost:3010 (⚠️ Turbopack crash — usar build produção)
- **Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, shadcn/ui, Framer Motion, Prisma, Neon, Vercel Blob
- **Testes:** 576 passing, 60 files

---

## Última Auditoria (browser-use — 2026-05-12)

Auditoria completa com navegador real (Chromium headed) na produção Vercel.

| Páginas auditadas | Modais testados | Problemas encontrados |
|-------------------|----------------|----------------------|
| 12 | 5 | 17 |

**Relatório completo:** `docs/AUDITORIA_UX_UI_2026-05-12.md`

---

## Sprint 3 — 10 items (3 P0 🔴, 6 P1 🟡, 1 P2 🟢)

| ID | Título | Prioridade | Status |
|----|--------|------------|--------|
| E15-T1 | Base UI error #51 — página /contas quebrada | P0 🔴 | pending |
| E15-T2 | UUID visível em categoria no modal "Novo Orçamento" | P0 🔴 | pending |
| E15-T3 | UUID visível em conta no modal "Editar Lançamento" | P0 🔴 | pending |
| E15-T4 | Typo "Alertas Criticos" → "Críticos" | P1 🟡 | pending |
| E15-T5 | Typos "Automacao" → "Automação", "RECORRENCIA" → "RECORRÊNCIA" | P1 🟡 | pending |
| E15-T6 | Typo "Novo Lancamento" → "Novo Lançamento" | P1 🟡 | pending |
| E15-T7 | Sidebar perde texto ao scroll | P1 🟡 | pending |
| E15-T8 | /insights duplica Dashboard | P1 🟡 | pending |
| E15-T9 | Dropdown de categoria inconsistente entre modais | P1 🟡 | pending |
| E15-T10 | Adicionar link "Relatórios" na sidebar | P2 🟢 | pending |

### Notas Importantes
- **C3 (Turbopack crash)**: IGNORADO por decisão do usuário. Build de produção funciona.
- **QA-02 reaberto**: UUID em dropdowns foi parcialmente fixado — orçamentos e edição ainda mostram UUID.
- **Contas e Cartões**: O Base UI error #51 pode ser relacionado ao E14-T4 (modal Fechar interceptado).

---

## Prioridade de Execução Recomendada

```
1. E15-T1 → E15-T2 → E15-T3  (P0 — bugs críticos)
2. E15-T4 → E15-T5 → E15-T6  (P1 — typos rápidos)
3. E15-T7 → E15-T8 → E15-T9  (P1 — UX)
4. E15-T10                    (P2 — melhoria)
```

---

## Documentos de Referência

| Documento | Conteúdo |
|-----------|----------|
| `docs/AUDITORIA_UX_UI_2026-05-12.md` | Relatório completo da auditoria |
| `docs/KNOWN_ISSUES.md` | Bugs conhecidos (atualizado) |
| `docs/BACKLOG_MASTER.md` | Backlog mestre (Épico 15 adicionado) |
| `.ai/current-task.md` | Tarefa corrente |
| `.ai/backlog.index.md` | Índice do backlog |

## Comandos Essenciais

```bash
npm run dev          # localhost:3010 (⚠️ Turbopack crash)
npm run type-check   # tsc --noEmit
npm run build        # next build ✅ (116 rotas)
npm run test         # vitest (576 testes)
npm run test:coverage# vitest com cobertura
```

---

## Próximos Passos para a Próxima IA

1. **E15-T1**: Debug Base UI error #51 em `/contas` — investigar componente quebrado
2. **E15-T2/T3**: Corrigir UUID em dropdowns de categoria (orçamentos) e conta (edição)
3. **E15-T4/T5/T6**: Corrigir typos de acentuação pt-BR
4. **E15-T7**: Debug sidebar perdendo texto ao scroll
5. **E15-T8**: Diferenciar página /insights do Dashboard
6. Documentar cada fix em `docs/EXECUTION_LOG.md`

---

*Handoff gerado em: 2026-05-12 15:00 BRT — Sprint 3 UX/UI Audit Bugfix*
