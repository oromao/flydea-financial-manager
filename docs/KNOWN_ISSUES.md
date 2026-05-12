# FlyDea — Problemas Conhecidos

> **Atualizado:** 2026-05-05 — Auditoria QA Playwright MCP (produção)

---

## Bugs Confirmados em Produção (2026-05-05)

| ID | Módulo | Problema | Impacto | Severidade |
|----|--------|----------|---------|------------|
| QA-01 | Movimentações | ~~`RangeError: Invalid time value`~~ | ✅ Date validation adicionada: API transactions, contas-a-pagar safeDate helpers, fluxo-caixa fmtDate/fmtFullMonth safe, alertas safeFormatDate | 🔴 Crítico ✅ |
| QA-02 | Transações | ~~Dropdown de categoria mostra UUID em vez de nome~~ | ✅ API retorna category.name, frontend usa c.name | 🔴 Crítico ✅ |
| QA-03 | PWA | ~~manifest.webmanifest ausente~~ | ✅ Manifest existe, icons SVG criados, path corrigido no layout | 🟡 Alto ✅ |
| QA-04 | Contas e Cartões | Botão "Fechar" do modal de edição interceptado por header sticky | Usuário não consegue fechar modal (Escape funciona) | 🟡 Alto |
| QA-05 | Produção | Dados seed visíveis ("Conta QA Edit") | Dados de teste em produção | 🟡 Alto |
| QA-06 | Dashboard | ~~Inconsistência de saldo geral~~ | ✅ Dashboard `balance` agora = projectedBalance (transações committed, não só PAID), `realizedBalance` disponível separadamente | 🟡 Alto ✅ |
| QA-07 | Sidebar | Nomes sem acento (Movimentacoes, Recorrencias, Analises) | Inconsistência linguística | 🟢 Médio |
| QA-08 | Transações | Campo de data em formato ISO (YYYY-MM-DD) em vez de pt-BR | Inconsistência com padrão brasileiro | 🟢 Médio |
| QA-09 | Console | 20+ erros de console acumulados durante sessão | Indica problemas subjacentes | 🟢 Médio |
| QA-10 | UX | Sem toast de sucesso ao criar transação | Usuário não tem confirmação visual | 🟢 Médio |

---

## Bugs Confirmados (não corrigidos)

| ID | Módulo | Problema | Impacto | Severidade |
|----|--------|----------|---------|------------|
| AN1-T1 | CSS | 5 tokens ausentes (popover, ring, input, border, destructive) | Dialog sem fundo, select sem ring | 🔴 Crítico |
| AN1-T2 | CSS | ~~glass-card quebra em dark mode~~ | ✅ Classe glass-card removida, premium-card usa tokens | 🔴 Crítico ✅ |
| AN1-T3 | CSS | ~~apple-button-primary não definida~~ | ✅ Classe existe em globals.css:344 | 🔴 Crítico ✅ |
| AN1-T4 | Agents | confirm() nativo em agents-dashboard.tsx:133 | Quebra design system | 🟡 Alto |
| AN1-T5 | Global | window.location.reload() / window.location.href no código | Perda de estado | 🟡 Alto (reduzido de 5 para 1 — relatorios download) |
| AN1-T6 | UI | Link quebrado para /import em empty-states.tsx | 404 ao clicar | 🟡 Alto |
| AN2-T1 | API | Validação Zod | 10 APIs com Zod + 1 nova (approvals) = 11/44 | 🔴 Crítico (progresso: 25%) |
| AN2-T2 | API | ~~Rate limiting~~ | ✅ 44/44 APIs com withRateLimit (100%) | 🔴 Crítico ✅ |
| AN3-T1 | TS | 104+ `any` types no código | Type safety perdido | 🟡 Alto |
| AN3-T2 | CSS | Cores Tailwind hardcoded | Não adaptam dark mode | 🟡 Alto (reduzido de 77+ para ~40 — login, fluxo-caixa, ai-learning corrigidos) |
| AN3-T3 | Global | ~~18 páginas sem error boundary~~ | ✅ 14 páginas agora com PageErrorBoundary (só insights/agents sem, pois só redirect) | 🟡 Alto ✅ |
| AN4-T6 | A11y | 15/21 componentes sem ARIA | Inacessível para leitores de tela | 🟡 Alto |
| AN5-T4 | Mobile | Touch targets < 44px | Dificuldade de toque | 🟡 Alto |
| AN6-T1 | Testes | Sem coverage config no Vitest | Cobertura não verificável | 🟡 Alto |

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
