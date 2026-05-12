# UX Gaps Analysis — Mapeamento e Priorização

**FLY-018** | **Owner:** UX/UI Designer & Researcher | **Data:** 2026-05-11

---

## Sumário Executivo

| Fonte | Total Gaps |
|-------|------------|
| MODULE_MAP.md (gaps por módulo) | 30 |
| KNOWN_ISSUES.md (bugs produção) | 22 |
| FLY-017 Design System Audit | 10+ |
| Mobile UX Audit (touch targets) | 24 |
| **Total consolidado (com overlaps)** | **~87** |

---

## 🔴 P0 — Crítico (Bloqueante para Release)

> Impacto: funcionalidade quebrada, perda de dados, experiência completamente degradada.

| ID | Módulo | Gap | Impacto | Correção |
|----|--------|-----|---------|----------|
| **QA-01** | Movimentações | `RangeError: Invalid time value` — página quebrada | Usuário não vê transações | Validar formato de data antes de renderizar |
| **QA-02** | Transações | Dropdown mostra UUID em vez de nome da categoria | Usuário não sabe o que selecionar | Corrigir query para incluir category.name |
| **DS-08/AN1-T1** | UI | `--color-muted` ausente / 5 tokens ausentes | Skeleton invisível, dialog sem fundo | Adicionar tokens faltantes ao globals.css |
| **R-01/R-02** | Recorrências | Delete sem onClick, handleDelete não existe | Botão delete não funciona | Implementar handler de delete |
| **DS-05/AN1-T2** | UI | glass-card quebra em dark mode | Card branco sobre fundo escuro | Adicionar variante dark ao glass-card |
| **AN2-T1** | API | 34/44 APIs sem validação Zod | Payloads maliciosos alcançam DB | Adicionar validação Zod em todas as APIs |
| **AN2-T2** | API | 43/44 APIs sem rate limiting | Sem proteção brute force | Adicionar rate limiting via Upstash |
| **QA-03** | PWA | manifest.webmanifest ausente | PWA não funcional | Gerar manifest.json |
| **QA-06** | Dashboard | Inconsistência saldo geral | Usuário perde confiança | Debug e corrigir cálculo de saldo |
| **AN1-T3** | UI | apple-button-primary não definida | Botões sem estilo | Definir classe no globals.css |

---

## 🟡 P1 — Alto (Deve ser corrigido antes de release minor)

> Impacto: UX significativamente degradada, inconsistência visual, acessibilidade comprometida.

### Design System & CSS

| ID | Módulo | Gap | Esforço |
|----|--------|-----|---------|
| **AN3-T2** | Global | 77+ cores Tailwind hardcoded (não adaptam dark mode) | M |
| **FLY-017-1** | Login | 20+ valores hex hardcoded na página de login | M |
| **FLY-017-2** | Toast | Toast.tsx com rgba hardcoded em inline styles | P |
| **FLY-017-4** | Importer | importer.tsx com cores dark-only hardcoded | P |
| **F-06** | Fluxo Caixa | Cores hardcoded gray-* em vez de tokens | P |
| **PE-04** | Perfil | Ícone de lixeira para "recarregar" | P |

### Mobile & Touch

| ID | Módulo | Gap | Esforço |
|----|--------|-----|---------|
| **AN5-T4** | Global | Touch targets < 44px (24 violações) | M |
| **C-05** | Contas | Touch target pequeno no mobile | P |
| **MB-01** | Navegação | 67% dos módulos 2+ taps abaixo no mobile | G |
| **M-09** | Movimentações | FAB sobrepõe bottom nav | P |

### Componentes & Funcionalidade

| ID | Módulo | Gap | Esforço |
|----|--------|-----|---------|
| **AN1-T4** | Agents | confirm() nativo em agents-dashboard.tsx | P |
| **AN1-T5** | Global | 5 window.location.reload() no código | M |
| **AN1-T6** | UI | Link quebrado para /import em empty-states.tsx | P |
| **M-02** | Movimentações | 12 campos sem seção no form | P |
| **P-03** | Contas a Pagar | Sem confirmação ao marcar como pago | P |
| **O-04** | Orçamentos | Sem seletor de período para meses anteriores | M |
| **FE-03** | Fechamento | Sem lista de transações detalhada | M |
| **QA-10** | Transações | Sem toast de sucesso ao criar transação | P |
| **AN3-T3** | Global | 18 páginas sem error boundary | G |
| **AL-01** | Alertas | mark all read faz N chamadas paralelas | P |
| **QA-08** | Global | Campo de data em ISO (YYYY-MM-DD) em vez de pt-BR | M |
| **QA-07** | Sidebar | Nomes sem acento (Movimentacoes, Recorrencias) | P |

### Duplicação & Manutenção

| ID | Módulo | Gap | Esforço |
|----|--------|-----|---------|
| **FLY-017-5** | Cashflow | weekly-cashflow.tsx duplica weekly-cashflow-forecast.tsx | P |
| **FLY-017-6** | UI | error-boundary.tsx duplica page-error-boundary.tsx | P |

---

## 🟢 P2 — Médio (Corrigir em regression testing)

> Impacto: problemas visuais menores, inconsistências cosméticas.

| ID | Módulo | Gap | Esforço |
|----|--------|-----|---------|
| **RE-01** | Relatórios | Pie chart labels sobrepõem no mobile | M |
| **RE-03** | Relatórios | Sem print styles adequados | P |
| **FE-01** | Fechamento | Botões de período transbordam no mobile | P |
| **D-01** | Dashboard | Y-axis sem label nos gráficos | P |
| **D-04** | Dashboard | Quick Actions não acionáveis | P |
| **D-06** | Dashboard | 3 APIs separadas sem coordenação | M |
| **F-02** | Fluxo Caixa | InvoiceManager com alert() nativo | P |
| **R-03** | Recorrências | Form não reseta ao reabrir | P |
| **L-01** | Logs | Sem paginação adequada | M |
| **LG-01** | Login | Sem "esqueci senha" | M |
| **LG-03** | Login | Erros crus do NextAuth | P |
| **AN4-T6** | Global | 15/21 componentes sem ARIA labels | G |
| **FLY-017-7** | Global | ~20 rounded-[XXpx] hardcoded | M |
| **FLY-017-8** | Global | 5 shadows hardcoded | P |
| **FLY-017-9** | Global | Imports relativos (money-input, invoice-manager) | P |
| **FLY-017-10** | Admin | window.location.href em aprovacoes | P |
| **QA-04** | Contas | Botão "Fechar" interceptado por header sticky | P |
| **QA-05** | Produção | Dados seed visíveis | P |
| **QA-09** | Console | 20+ erros de console | P |
| **C-04** | Contas | Sem archive/deactivate | M |
| **M-06** | Movimentações | Tabela renderiza no mobile junto com cards | M |
| **DS-02** | Mobile | Dialog swipe-to-close ausente | P |

---

## Top 20 — Priorizados para Ação Imediata

Critérios: impacto no usuário + esforço de correção + depende de outras correções.

| # | ID | Gap | Prioridade | Esforço | Impacto UX | Sprint |
|---|----|-----|------------|---------|------------|--------|
| 1 | **QA-01** | RangeError time value — página quebrada | 🔴 P0 | 2h | 🔥 Total | S2 |
| 2 | **QA-02** | Dropdown UUID em vez de nome | 🔴 P0 | 1h | 🔥 Alto | S2 |
| 3 | **DS-08** | Tokens CSS ausentes (muted, popover, ring, etc.) | 🔴 P0 | 1h | 🔥 Alto | S1 |
| 4 | **R-01** | Delete recorrências não funciona | 🔴 P0 | 2h | 🔥 Total | S2 |
| 5 | **QA-03** | PWA manifest ausente | 🔴 P0 | 1h | 🔥 Alto | S2 |
| 6 | **DS-05** | glass-card dark mode quebrado | 🔴 P0 | 30min | 🔥 Alto | S1 |
| 7 | **TOAST** | Toast.tsx rgba hardcoded (dark mode quebrado) | 🟡 P1 | 1h | 🔥 Alto | S1 |
| 8 | **LOGIN** | Login page 20+ hex hardcoded | 🟡 P1 | 2h | 🔥 Alto | S1 |
| 9 | **TOUCH** | 24 touch target violations (28-40px) | 🟡 P1 | 3h | 🔥 Alto | S2 |
| 10 | **AN3-T2** | 77+ cores Tailwind hardcoded | 🟡 P1 | 4h | 🔥 Alto | S2 |
| 11 | **AN1-T4** | confirm() nativo agents-dashboard | 🟡 P1 | 30min | 🔥 Alto | S1 |
| 12 | **QA-10** | Sem toast ao criar transação | 🟡 P1 | 1h | 🔥 Médio | S2 |
| 13 | **AN3-T3** | 18 páginas sem error boundary | 🟡 P1 | 4h | 🔥 Alto | S2 |
| 14 | **QA-06** | Inconsistência saldo dashboard | 🔴 P0 | 3h | 🔥 Total | S2 |
| 15 | **O-04** | Orçamentos sem seletor de período | 🟡 P1 | 2h | 🔥 Médio | S2 |
| 16 | **AN1-T5** | window.location.reload() (5x) | 🟡 P1 | 2h | 🔥 Médio | S2 |
| 17 | **MB-01** | Navegação 2+ taps (67% módulos) | 🟡 P1 | 1h | 🔥 Alto | S2 |
| 18 | **IMPORTER** | importer.tsx legacy (remover ou migrar) | 🟡 P1 | 2h | 🔥 Médio | S2 |
| 19 | **M-02** | Form 12 campos sem seção | 🟡 P1 | 2h | 🔥 Médio | S2 |
| 20 | **FE-03** | Fechamento sem lista detalhada | 🟡 P1 | 3h | 🔥 Médio | S3 |

---

## Plano de Resolução por Sprint

### Sprint 1 (atual) — Foco: fundação
| Item | Responsável | Previsão |
|------|-------------|----------|
| #3 Tokens CSS ausentes | UX/UI | ✅ Feito (FLY-017) |
| #6 glass-card dark mode | UX/UI | 🔄 |
| #7 Toast hardcoded rgba | UX/UI | ⏳ |
| #8 Login page hex colors | UX/UI | ⏳ |
| #11 confirm() nativo agents | UX/UI | ⏳ |
| FLY-018: Mapeamento gaps | UX/UI | 🔄 **aqui** |
| FLY-019: Quality gate visual | UX/UI | ⏳ |

### Sprint 2 — Foco: P0 + touch + cores
| Item | Responsável |
|------|-------------|
| #1 RangeError time value | Backend |
| #2 Dropdown UUID | Backend |
| #4 Delete recorrências | Backend/Frontend |
| #5 PWA manifest | DevOps |
| #9 Touch target violations | Frontend/UX/UI |
| #10 Cores Tailwind hardcoded | UX/UI |
| #12 Toast ao criar transação | Frontend |
| #13 Error boundary 18 páginas | Frontend |
| #14 Inconsistência saldo | Backend |
| #15 Orçamentos seletor período | Frontend |
| #16 window.location.reload() | Frontend |
| #17 Navegação 2+ taps | UX/UI |
| #18 importer.tsx legacy | Frontend |
| #19 Form 12 campos sem seção | Frontend |

### Sprint 3 — Foco: acessibilidade + refinar
| Item | Responsável |
|------|-------------|
| #20 Fechamento lista detalhada | Frontend |
| ARIA labels (15/21 componentes) | UX/UI/Frontend |
| rounded-[XXpx] → tokens | UX/UI |
| Shadows hardcoded → tokens | UX/UI |
| Document-importer + payment-importer merge | Frontend |
| LG-01: Esqueci senha | Backend |
| AL-01: Mark all read batch | Backend |
| L-01: Paginação logs | Backend |
| DS-02: Swipe-to-close dialog | Frontend |
| C-04: Archive/deactivate contas | Backend/Frontend |

---

## Gaps por Módulo (Distribuição)

```
Movimentações:  7 gaps (QA-01, QA-02, M-01, M-02, M-06, M-09, touch)
Global/CSS:     6 gaps (AN3-T2, DS-08, DS-05, toast, rounded, shadows)
Login:          4 gaps (LG-01, LG-03, login hex, layout)
Contas:         4 gaps (C-04, C-05, QA-04, QA-05)
Relatórios:     2 gaps (RE-01, RE-03)
Fluxo Caixa:    2 gaps (F-02, F-06)
Orçamentos:     2 gaps (O-04, O-01)
Recorrências:   2 gaps (R-01, R-02)
Dashboard:      3 gaps (D-01, D-04, QA-06)
Fechamento:     2 gaps (FE-01, FE-03)
Agents:         1 gap (AN1-T4)
Alertas:        1 gap (AL-01)
Perfil:         2 gaps (PE-01, PE-04)
Navegação:      1 gap (MB-01)
API:            2 gaps (AN2-T1, AN2-T2)
Acessibilidade: 1 gap (AN4-T6)
Error handling: 1 gap (AN3-T3)
```

---

## Como Medir o Progresso

| Meta | Sprint 1 | Sprint 2 | Sprint 3 |
|------|----------|----------|----------|
| Gaps resolvidos | 4/87 (5%) | 26/87 (30%) | 44/87 (50%) |
| P0 resolvidos | 3/10 | 8/10 | 10/10 |
| Touch targets ≥ 44px | 0% | 100% páginas principais | 100% total |
| Cores hardcoded eliminadas | 20% | 60% | 90% |
| Componentes com tokens | 91% | 95% | 100% |
| ARIA components | 0% | 50% | 100% |

---

*Documento gerado por: UX/UI Designer & Researcher*
*Data: 2026-05-11*
