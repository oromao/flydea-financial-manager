# FlyDea — Problemas Conhecidos

> **Atualizado:** 2026-05-12 — Sprint 2 completo (93%)

---

## Bugs Confirmados (não corrigidos)

| ID | Módulo | Problema | Impacto | Severidade |
|----|--------|----------|---------|------------|
| AN1-T4 | Agents | confirm() nativo em agents-dashboard.tsx:133 | Quebra design system | 🟡 Alto |
| AN1-T6 | UI | Link quebrado para /import em empty-states.tsx | 404 ao clicar | 🟡 Alto |
| AN3-T2 | CSS | ~40 cores Tailwind hardcoded (reduzido de 77+) | Não adaptam dark mode | 🟡 Alto |
| AN4-T6 | A11y | ~6/21 componentes sem ARIA (reduzido de 15) | Inacessível para leitores de tela | 🟡 Alto |
| AN5-T4 | Mobile | ~4 touch targets < 44px (reduzido de 24) | Dificuldade de toque | 🟡 Alto |
| AN3-T1 | TS | 31 `any` types (reduzido de 104+) | Type safety perdido | 🟡 Médio |
| QA-02 (reaberto) | Orçamentos | UUID visível em dropdown de categoria no modal "Novo Orçamento" | Usuário vê UUID em vez de nome | 🔴 Crítico |
| QA-04 | Contas e Cartões | Botão "Fechar" do modal de edição interceptado por header sticky | Usuário não consegue fechar modal (Escape funciona) | 🟡 Alto |
| QA-08 | Transações | Campo de data em formato ISO (YYYY-MM-DD) em vez de pt-BR | Inconsistência com padrão brasileiro | 🟢 Médio |
| QA-09 | Console | 20+ erros de console (parcialmente corrigido) | Indica problemas subjacentes | 🟢 Médio |
| AU-01 | Contas e Cartões | Base UI error #51 — página quebrada (/contas) | Usuário não acessa contas | 🔴 Crítico |
| AU-02 | Editar Lançamento | UUID visível no dropdown "Conta" | Usuário vê UUID em vez de nome da conta | 🔴 Crítico |
| AU-03 | Dev Server | Turbopack crash com path ../Documents/Obsidian Vault/brain | Dev server não inicia | 🔴 Crítico |
| AU-04 | UI | Typos em pt-BR: "Automacao", "Criticos", "Lancamento", "RECORRENCIA" | Contraste com proposta de clareza | 🟡 Alto |
| AU-05 | Insights | Conteúdo duplica o Dashboard | Página inútil | 🟡 Alto |
| AU-06 | Sidebar | Links perdem texto ao scroll | Navegação comprometida | 🟡 Alto |
| AU-07 | Sidebar | Link "Relatórios" ausente na navegação | Página sem acesso | 🟢 Médio |

---

## Bugs Corrigidos (Sprint 1 + Sprint 2)

| Bug | Status |
|-----|--------|
| QA-01 RangeError time value | ✅ Date validation adicionada |
| QA-02 Dropdown UUID | ✅ API retorna category.name |
| QA-03 PWA manifest | ✅ Manifest + icons SVG |
| QA-05 Dados seed produção | ✅ /api/setup retorna 403 em prod |
| QA-06 Dashboard saldo | ✅ balance = projectedBalance |
| QA-07 Sidebar acentos | ✅ "Aprovações" corrigido |
| AN1-T1 Tokens CSS ausentes | ✅ Adicionados ao globals.css |
| AN1-T2 glass-card dark mode | ✅ Removido, premium-card usa tokens |
| AN1-T3 apple-button-primary | ✅ Definido em globals.css |
| AN1-T5 window.location | ✅ 0 ocorrências (3→0) |
| AN2-T1 Zod validation | ✅ 19/44 APIs (43%, era 25%) |
| AN2-T2 Rate limiting | ✅ 44/44 APIs (100%) |
| AN3-T3 Error boundaries | ✅ 14 páginas com PageErrorBoundary |
| AN3-T1 any types | ✅ 104→31 (73+ fixados) |
| AN1-T4 confirm() nativo | ⏳ Ainda aberto (agents-dashboard) |
| AL-01 markAllRead batch | ✅ N paralelas → batch único |
| FLY-024 Archive contas | ✅ Implementado completo |

---

## Bugs Corrigidos (Épico 1-2 do backlog original)

| Bug | Status |
|-----|--------|
| E1-T1 Delete recorrências | ✅ Corrigido |
| E1-T2 Filtro fake Contas a Pagar | ✅ Corrigido |
| E1-T3 glass-card CSS | ✅ Definido (mas quebra dark mode → AN1-T2) |
| E1-T4 --color-muted CSS | ✅ Definido |
| E1-T5 Paginação logs | ✅ Implementado |
| E1-T6 Role check aprovações | ✅ Implementado |
| E1-T7 Header sticky dialog mobile | ✅ Implementado |
| E1-T8 Tabela escondida mobile | ✅ Implementado |
| E1-T9 FAB safe-area | ✅ Implementado |
| E1-T10 Bottom sheet navegação | ✅ Implementado |
| E1-T11 Swipe-to-close dialog | ✅ Implementado |
| E2-T1 useConfirm nas páginas | ✅ 2/3 feito (1 confirm() restante → AN1-T4) |
| E2-T2 Toast global | ✅ Substituído |
| E2-T3 Error boundary | ✅ App-level (falta page-level → AN3-T3) |

---

## Limitações Conhecidas (Accepted)

| L-01 | Fluxo de Caixa | InvoiceInstallments não no forecast | By design |
| L-02 | OCR | extractInstallments() não processa parcelas | Ver E4-T1 |
| L-03 | Copiloto | Heurística local, não LLM | Ver E5-T7 |
| L-05 | Timezone | Display pode variar ±1 dia | Negligível |

---

*Sincronizado com auditoria de 2026-04-30. Substitui versão anterior.*
