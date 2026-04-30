# FlyDea Financial Manager — Backlog Mestre

## Legenda de Status

| Status | Significado |
|--------|-------------|
| `pending` | Não Started, aguardando execução |
| `in_progress` | Currently being worked on |
| `blocked` | Blocked por dependency ou decisão |
| `completed` | Feito e validado |

## Legenda de Prioridade

| Prioridade | Significado |
|------------|-------------|
| P0 | Crítico — bug blocking ou segurança |
| P1 | Alto — importante para experiência |
| P2 | Médio — melhoria ou feature secundária |
| P3 | Baixo — nice to have |

---

## ÉPICO 1: ESTABILIZAÇÃO CRÍTICA (P0) — ✅ COMPLETO

| ID | Tipo | Módulo | Título | Prioridade | Complexidade | Status |
|----|------|--------|-------|------------|--------------|--------|
| E1-T1 | Bug 🔴 | Recorrências | Implementar delete de recorrências (R-01, R-02) | P0 | Baixa | ✅ completed |
| E1-T2 | Bug 🔴 | Contas a Pagar | Corrigir filtro fake (P-01) | P0 | Baixa | ✅ completed |
| E1-T3 | Bug 🔴 | UI | Definir `glass-card` no globals.css (DS-05, DS-10) | P0 | Baixa | ✅ completed |
| E1-T4 | Bug 🔴 | UI | Definir `--color-muted` no tema (DS-08) | P0 | Baixa | ✅ completed |
| E1-T5 | Bug 🔴 | Logs | Adicionar paginação em logs (L-01) | P0 | Média | ✅ completed |
| E1-T6 | Segurança 🔴 | Admin | Adicionar role check em Aprovações (A-05) | P0 | Baixa | ✅ completed |
| E1-T7 | UX 🔴 | Movimentações | Dialog mobile com header sticky (M-01) | P0 | Baixa | ✅ completed |
| E1-T8 | UX 🔴 | Movimentações | Esconder tabela no mobile (M-06) | P0 | Baixa | ✅ completed |
| E1-T9 | UX 🔴 | Movimentações | FAB considerar safe-area-inset (M-09) | P0 | Baixa | ✅ completed |
| E1-T10 | UX 🔴 | Mobile | Expandir navegação mobile (MB-01) | P0 | Média | ✅ completed |
| E1-T11 | UX 🔴 | Mobile | Dialog swipe-to-close (DS-02) | P0 | Média | ✅ completed |

---

## ÉPICO 2: CONSISTÊNCIA DE INTERFACE (P1) — ✅ COMPLETO

| ID | Tipo | Módulo | Título | Prioridade | Complexidade | Status |
|----|------|--------|-------|------------|--------------|--------|
| E2-T1 | Refatoração | Global | Substituir `confirm()` por `useConfirm()` (M-04, C-01, O-01) | P1 | Baixa | ✅ completed |
| E2-T2 | Refatoração | Global | Substituir toast local por `useToast()` (M-05, C-06, O-05) | P1 | Baixa | ✅ completed |
| E2-T3 | UX | Global | Error boundary no layout (S-02) | P1 | Baixa | ✅ completed |
| E2-T4 | UX | Global | Permitir zoom do usuário (remover maximumScale) (S-07) | P1 | Baixa | ✅ completed |
| E2-T5 | UX | Global | Foco-visible ring global (S-08) | P1 | Baixa | ✅ completed |
| E2-T6 | UX | Contas | Touch targets mínimos 44px no mobile (C-05) | P1 | Baixa | ✅ completed |
| E2-T7 | UX | Alertas | Loading state em search (M-07) | P1 | Baixa | ✅ completed |
| E2-T8 | UX | Fluxo de Caixa | Substituir alert() por toast em InvoiceManager (F-02) | P1 | Baixa | ✅ completed |
| E2-T9 | UX | Fluxo de Caixa | Substituir inputs hardcoded por shared Input (F-03) | P1 | Baixa | ✅ completed |
| E2-T10 | UX | Fluxo de Caixa | Cores design system em WeeklyCashflow (F-06) | P1 | Baixa | ✅ completed |

---

## ÉPICO 3: TESTES E QA (P1) — ✅ COMPLETO

| ID | Tipo | Módulo | Título | Prioridade | Complexidade | Status |
|----|------|--------|-------|------------|--------------|--------|
| E3-T1 | QA | Global | Cobertura: criar mocks OCR/PaddleOCR | P1 | Média | ✅ completed |
| E3-T2 | QA | Global | Cobertura: criar mocks BlobStorage | P1 | Média | ✅ completed |
| E3-T3 | QA | Global | Cobertura: criar mocks PicoClaw/AI | P1 | Média | ✅ completed |
| E3-T4 | QA | Global | Cobertura: serviços infraestrutura | P1 | Média | ✅ completed |
| E3-T5 | QA | Global | Cobertura: RAG knowledge base | P1 | Média | ✅ completed |
| E3-T6 | QA | Global | E2E estáveis (Turbopack wait strategies) | P1 | Média | ✅ completed |
| E3-T7 | Débito | Global | Testes para destructive flows | P1 | Média | ✅ completed |

---

## ÉPICO 4: FUNCIONALIDADES PARCIALMENTE IMPLEMENTADAS (P2) — 🔶 PARCIAL

| ID | Tipo | Módulo | Título | Prioridade | Complexidade | Status |
|----|------|--------|-------|------------|--------------|--------|
| E4-T1 | Feature | OCR | Implementar extractInstallments() real | P2 | Média | pending |
| E4-T2 | Feature | Transações | Suporte a pagamentos parciais (amountPaid UI) | P2 | Baixa | ✅ completed |
| E4-T3 | Feature | Orçamentos | Seletor de período para ver orçamentos passados (O-04) | P2 | Média | ✅ completed |
| E4-T4 | Feature | Recorrências | Adicionar BIWEEKLY e YEARLY (R-05) | P2 | Média | ✅ completed |
| E4-T5 | Feature | Agentes | Implementar In-App Notifications | P2 | Média | ✅ completed |
| E4-T6 | Feature | Agentes | Implementar Webhooks customizados | P2 | Média | ✅ completed |
| E4-T7 | Feature | Contas a Pagar | Confirmação ao marcar como pago (P-03) | P2 | Baixa | ✅ completed |
| E4-T8 | UX | Contas | Deactivate/archive para contas (C-04) | P2 | Média | ✅ completed |

---

## ÉPICO 5: NOVAS FUNCIONALIDADES (P2-P3) — ✅ COMPLETO

| ID | Tipo | Módulo | Título | Prioridade | Complexidade | Status |
|----|------|--------|-------|------------|--------------|--------|
| E5-T1 | Feature | Reconciliação | Bank reconciliation workflow (maturity #1) | P2 | Alta | pending |
| E5-T2 | Feature | Aprovações | Approval flow para ações críticas (maturity #3) | P2 | Média | ✅ completed |
| E5-T3 | Feature | UI | Global search e saved filters (maturity #5) | P3 | Alta | ✅ completed |
| E5-T4 | Feature | Attachments | Preview, organização e search (maturity #6) | P3 | Média | ✅ completed |
| E5-T5 | Feature | Backup | Restore drill automation (maturity #2) | P2 | Média | ✅ completed |
| E5-T6 | Feature | Audit | Richer filters e timeline views (maturity #7) | P3 | Média | ✅ completed |
| E5-T7 | Feature | Copiloto | LLM integration (substituir heurística) | P3 | Alta | pending |
| E5-T8 | Feature | Perfil | Forgot password flow (LG-01) | P2 | Média | ✅ completed |

---

## ÉPICO 6: UX POLISH PREMIUM (P2-P3) — ✅ COMPLETO

| ID | Tipo | Módulo | Título | Prioridade | Complexidade | Status |
|----|------|--------|-------|------------|--------------|--------|
| E6-T1 | UX | Global | PageWrapper component (S-05) | P2 | Baixa | ✅ completed |
| E6-T2 | UX | Global | Loading global em transições (S-01) | P2 | Média | ✅ completed |
| E6-T3 | UX | Dashboard | Coordenar loading de 3 APIs (D-06) | P2 | Baixa | ✅ completed |
| E6-T4 | UX | Movimentações | Agrupar campos do form em seções (M-02) | P2 | Baixa | ✅ completed |
| E6-T5 | UX | Movimentações | Paginação com números de página (M-08) | P2 | Baixa | ✅ completed |
| E6-T6 | UX | Relatórios | Print styles (RE-03) | P2 | Baixa | ✅ completed |
| E6-T7 | UX | Relatórios | Responsive charts (RE-01, RE-04) | P2 | Baixa | ✅ completed |
| E6-T8 | UI | Design System | MoneyInput component (DS-07) | P2 | Média | ✅ completed |
| E6-T9 | UI | Design System | LoadingButton component (DS-06) | P2 | Baixa | ✅ completed |
| E6-T10 | UX | Perfil | Substituir reload por re-fetch (PE-01) | P2 | Média | ✅ completed |

---

## Resumo por Prioridade

| Prioridade | Qtd Items | Items |
|------------|-----------|-------|
| P0 | 11 | E1-T1 a E1-T11 |
| P1 | 17 | E2-T1 a E2-T10, E3-T1 a E3-T7 |
| P2 | 15 | E4-T1 a E4-T8, E5-T1, E5-T2, E5-T5, E5-T8, E6-T1 a E6-T10 |
| P3 | 4 | E5-T3, E5-T4, E5-T6, E5-T7 |

---

## Próximos Passos Recomendados

1. **E1-T1** — Delete de recorrências (mais crítico)
2. **E1-T2** — Filtro fake de Contas a Pagar
3. **E1-T3** — CSS glass-card
4. **E1-T4** — CSS --color-muted
5. **E1-T5** — Paginação em logs

---

## Como Ler Este Backlog

- **ID estruturado:** E{Épico}-{Tarefa}
- **Primeiro dígito:** Épico (1-6)
- **Segundo dígito:** Tarefa sequencial
- **Ordem de execução:** P0 → P1 → P2 → P3, dentro de cada prioridade, respeitar dependências

---

## Atualização

Este arquivo deve ser atualizado sempre que:
- Nova task for criada
- Status mudar (pending → in_progress → completed)
- Prioridade mudar
- Dependências mudarem

**Regra:** Se não está no backlog, não existe oficialmente.

---

*Última atualização: 2026-04-30 — Versão 1.0*