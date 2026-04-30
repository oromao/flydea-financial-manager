# FlyDea Financial Manager — Problemas Conhecidos

## Visão Geral

Este documento lista todos os problemas conhecidos no projeto, seu impacto, status eworkarounds quando aplicável.

---

## Bugs Críticos (P0)

| ID | Módulo | Problema | Impacto | Status | Workaround |
|----|--------|----------|---------|--------|------------|
| E1-T1 | Recorrências | Delete não funciona (R-01, R-02) | Usuário não consegue deletar recorrências | pending | N/A |
| E1-T2 | Contas a Pagar | Filtro fake (P-01) | Filtros não mostram dados corretos | pending | N/A |
| E1-T3 | UI | glass-card CSS undefined (DS-05) | EmptyState sem estilo | pending | N/A |
| E1-T4 | UI | --color-muted undefined (DS-08) | Skeletons invisíveis | pending | N/A |
| E1-T5 | Admin Logs | Sem paginação (L-01) | Performance ruim com muitos logs | pending | N/A |
| E1-T6 | Admin Aprovações | Sem role check (A-05) | Segurança comprometida | pending | N/A |

---

## Bugs Alto (P1)

| ID | Módulo | Problema | Impacto | Status | Workaround |
|----|--------|----------|---------|--------|------------|
| E1-T7 | Movimentações | Dialog mobile sem header sticky (M-01) | Usuário não consegue fechar após scroll | pending | N/A |
| E1-T8 | Movimentações | Tabela duplicada no mobile (M-06) | UI confusa | pending | N/A |
| E1-T9 | Movimentações | FAB sobrepõe bottom nav (M-09) | Toques acidentais | pending | N/A |
| E1-T10 | Mobile | Navegação 2+ taps (MB-01) | Descoberta ruim | pending | N/A |
| E1-T11 | Mobile | Dialog sem swipe-to-close (DS-02) | Gesto ausente | pending | N/A |
| E2-T1 | Global | confirm() nativo em 3 páginas | UX inconsistente | pending | N/A |
| E2-T2 | Global | Toast local em 3 páginas | UI duplicada | pending | N/A |
| E2-T3 | Global | Sem error boundary | App quebra inteiro | pending | N/A |

---

## Limitações Conhecidas (Accepted)

| ID | Módulo | Problema | Impacto | Status | Notas |
|----|--------|----------|---------|--------|-------|
| L-01 | Fluxo de Caixa | InvoiceInstallments não no forecast | Receitas de fatura não consideradas | known | "By design" em financial-architecture.md |
| L-02 | OCR | extractInstallments() não processa "3x de R$" | Parcelas não extraídas | known | PRIORIDADE: implementar (E4-T1) |
| L-03 | Copiloto | Heurística local, não LLM | Respostas limitadas | known | PRIORIDADE: LLM integration (E5-T7) |
| L-04 | CashflowWeekly | Tabela órfã no schema | Nenhum | known | Remover em futura migração |
| L-05 | Timezone | Display pode variar ±1 dia | Datas específicas podem errar | known | Negligível para agregação mensal |

---

## Issues Não-Bugs (Wont Fix)

| ID | Módulo | Problema | Decisão | Razão |
|----|--------|----------|----------|-------|
| W-01 | Login | Sem "esqueci senha" | Won't fix (por agora) | Requer infraestrutura de email |
| W-02 | Login | Sem "lembrar-me" | Won't fix (por agora) | Sessão atual é suficiente |
| W-03 | Recorrências | Sem BIWEEKLY/YEARLY | Won't fix (por agora) | R-05: baixa prioridade |

---

## Como Usar Este Documento

1. **Antes de reporta bug:** Verificar se já está nesta lista
2. **Antes de implementar feature:** Verificar se não contradiz uma limitação conhecida
3. **QA:** Cross-reference com checklist de validação

---

## Atualização

Este documento deve ser atualizado quando:
- Novo bug for descoberto
- Bug for corrigido (mover para "resolvido" ou remover)
- Workaround for adicionado
- Decisão de won't fix for tomada

---

*Última atualização: 2026-04-30*