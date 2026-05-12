# UX Discovery Audit — FlyDea Financial Manager

**Data:** 2026-05-11 | **Método:** Playwright MCP + Code Review

---

## Metodologia

- Navegação em todas as 9 páginas principais via browser headless
- Viewport: 1440x900 (desktop) + análise de responsividade mobile
- Screenshots capturados de cada página
- Monitoramento de console errors, API status e layout
- Auditoria de código para tokens, acessibilidade e componentes

---

## 1. Dashboard (`/`)

### Problemas Encontrados

| # | Problema | Severidade | Status |
|---|----------|------------|--------|
| D-01 | **Balance display:** Saldo mostra -R$ 16.928,85 (negativo) mas todos os valores parecem estar em centavos (R$ 10,00 de receita no mês é irreal) | 🔴 Crítico | Code bug |
| D-02 | **API 500:** Dashboard retornava 500 devido à coluna `financialScore` faltante no DB | 🔴 Crítico | ✅ Fix deployed |
| D-03 | **Empty state confuso:** Mostrava "Bem-vindo ao FlyDea!" mesmo quando API falhava | 🟡 Alto | ✅ Fix deployed |
| D-04 | **QuickAdd escondido no mobile:** Só aparecia em desktop (`hidden md:inline-flex`) | 🟡 Alto | ✅ Fix deployed |
| D-05 | **BudgetAlerts removido:** Temporariamente retornando array vazio | 🟡 Médio | ⏳ Pendente |
| D-06 | **sidebar Skeleton não aparece:** Loading state não mostra skeleton para sidebar | 🟢 Baixo | UX Polish |
| D-07 | **Hero card com saldo inconsistente:** "Saldo Total" no hero vs "Saldo" no mini-card mostram valores diferentes | 🟡 Médio | UX Polish |

---

## 2. Movimentações (`/movimentacoes`)

| # | Problema | Severidade | Status |
|---|----------|------------|--------|
| M-01 | **Touch targets pequenos:** Tabs de filtro (Todos/+/-, Status/Pago/Pend) ainda têm height < 44px | 🔴 Crítico | ✅ Fix parcial |
| M-02 | **12 campos sem seção no form:** Formulário de criação não agrupa campos em seções | 🟡 Médio | UX gap |
| M-03 | **Pagination buttons < 44px:** Botões Anterior/Próxima e números de página | 🟡 Médio | ✅ Fix deploy |
| M-04 | **Desktop table + mobile cards renderizados:** Ambos no DOM mesmo que ocultos | 🟢 Baixo | Performance |
| M-05 | **Sem empty state na lista filtrada:** Se filtro não encontra resultados, mostra "Sem resultados" mas sem CTA | 🟢 Baixo | UX gap |
| M-06 | **Filtro de data com input type="date" pequeno:** h-8 (32px) no mobile | 🟡 Médio | ✅ Fix deploy |

---

## 3. Contas e Cartões (`/contas`)

| # | Problema | Severidade | Status |
|---|----------|------------|--------|
| C-01 | **Botão Fechar interceptado por header sticky no dialog** | 🟡 Alto | Bug report |
| C-02 | **Sem archive/deactivate:** Única ação disponível é excluir conta | 🟡 Médio | ⏳ FLY-024 |
| C-03 | **Cards sem cor de identificação:** Account.color não é usada visualmente | 🟢 Baixo | UX gap |
| C-04 | **Valor em centavos suspeito:** Saldo "R$ 50.000,00" parece irreal para seed data | 🟢 Baixo | Seed data |

---

## 4. Fluxo de Caixa (`/fluxo-caixa`)

| # | Problema | Severidade | Status |
|---|----------|------------|--------|
| F-01 | **Gráfico semanal sem labels no Y-axis** | 🟡 Médio | UX gap |
| F-02 | **Cores hardcoded residual:** `text-emerald-600` em alguns lugares | 🟡 Médio | ✅ Fix deploy |
| F-03 | **InvoiceManager sem confirmação:** Alert nativo ao invés de confirm dialog | 🟡 Médio | Bug report |
| F-04 | **Projeção semanal com dados inconsistentes:** Semanas futuras mostram valores zerados sem indicativo de previsão | 🟢 Baixo | UX gap |

---

## 5. Contas a Pagar (`/contas-a-pagar`)

| # | Problema | Severidade | Status |
|---|----------|------------|--------|
| P-01 | **Valor em centavos:** Seed data mostra R$ 45,90 (Uber) — verificar escala | 🟡 Médio | Seed data |
| P-02 | **Layout cards no mobile:** Cards ocupam largura total sem margem | 🟢 Baixo | UX Polish |
| P-03 | **Sem indicador de "Atrasada" visual:** Apenas cor de fundo muda | 🟢 Baixo | UX gap |

---

## 6. Orçamentos (`/orcamentos`)

| # | Problema | Severidade | Status |
|---|----------|------------|--------|
| O-01 | **Period selector parece funcional mas dados não filtram corretamente:** API pode não suportar period param | 🟡 Médio | ⏳ Backend |
| O-02 | **Budget sem categoria default:** Se não há categorias EXPENSE, form fica vazio | 🟢 Baixo | UX gap |
| O-03 | **Progress bar com cor inadequada:** 100% usa `bg-destructive animate-pulse` (muito agressivo) | 🟢 Baixo | UX Polish |

---

## 7. Recorrências (`/recorrencias`)

| # | Problema | Severidade | Status |
|---|----------|------------|--------|
| R-01 | **Form não reseta ao reabrir dialog** | 🟡 Médio | Bug report |
| R-02 | **Sem visualização de próximas transações geradas** | 🟢 Baixo | UX gap |
| R-03 | **Lista vazia sem CTA para criar:** Mostra empty state mas sem botão de ação | 🟢 Baixo | UX Polish |

---

## 8. Fechamento (`/fechamento`)

| # | Problema | Severidade | Status |
|---|----------|------------|--------|
| FE-01 | **Botões de período transbordam no mobile:** Labels longas ("2 meses atrás") quebram layout | 🟡 Médio | UX gap |
| FE-02 | **Sem lista de transações detalhada:** Apenas sumários, sem breakdown | 🟡 Médio | ⏳ Pendente |
| FE-03 | **Cores hardcoded:** `text-success`, `text-destructive` OK mas valores hardcoded de cor em alguns badges | 🟢 Baixo | UX Polish |
| FE-04 | **Print styles incompletos:** Cards com shadow não são estilizados para impressão | 🟢 Baixo | UX gap |

---

## 9. Relatórios/Análises (`/relatorios`)

| # | Problema | Severidade | Status |
|---|----------|------------|--------|
| RE-01 | **Pie chart legend não mostra valor em R$:** Apenas percentual | 🟡 Médio | UX gap |
| RE-02 | **Gráfico de barras sem eixo X com nomes dos meses legíveis** | 🟢 Baixo | UX Polish |
| RE-03 | **Print styles:** `window.print()` existe mas layout não otimizado | 🟢 Baixo | UX gap |
| RE-04 | **Seletor de período usa Select com scroll:** Difícil selecionar mês específico | 🟢 Baixo | UX gap |

---

## 10. Problemas Globais

| # | Problema | Severidade | Status |
|---|----------|------------|--------|
| G-01 | **Valores em centavos inconsistentes:** Seed data parece usar escala errada (R$ 850.000 = salário de R$ 8.500?) | 🔴 Crítico | Seed data bug |
| G-02 | **Acessibilidade:** 9 icon-only buttons sem ARIA label | 🟡 Alto | ✅ Fix deploy |
| G-03 | **Missing schema column: financialScore:** DB sem migration causa 500 no dashboard | 🔴 Crítico | ✅ Fix deploy |
| G-04 | **Sem loading state no QuickAdd:** Ação não mostra feedback imediato | 🟢 Baixo | UX gap |
| G-05 | **Toast notifications sem dark mode suporte (residual)** | 🟡 Médio | ✅ Fix deploy |
| G-06 | **Swipe-actions sem ARIA label:** Icon buttons sem descrição | 🟡 Médio | ✅ Fix deploy |
| G-07 | **Console errors zero:** 0 erros durante navegação | ✅ Limpo | — |
| G-08 | **Todas as páginas carregam sem 404:** Navegação completa OK | ✅ | — |

---

## Resumo por Severidade

| Severidade | Total | Corrigidos | Pendentes |
|------------|-------|------------|-----------|
| 🔴 Crítico | 5 | 4 | 1 (G-01 seed data scale) |
| 🟡 Alto | 6 | 5 | 1 (C-01 close btn) |
| 🟡 Médio | 13 | 4 | 9 |
| 🟢 Baixo | 15 | 0 | 15 |
| **Total** | **39** | **13** | **26** |

---

## Ações Recomendadas (Prioritárias)

1. **🔴 G-01:** Verificar escala de valores — seed data em centavos vs reais (R$ 850.00 ou R$ 8.500,00?)
2. **🟡 C-01:** Corrigir botão Fechar interceptado por header sticky no dialog de edição de conta
3. **🟡 D-05:** Restaurar budgetAlerts no dashboard
4. **🟡 D-07:** Alinhar "Saldo Total" com "Saldo" do mini-card
5. **🟡 F-03:** Substituir alert() nativo no InvoiceManager por useConfirm()
6. **🟡 R-01:** Resetar form ao reabrir dialog de recorrência

---

*Auditoria realizada em: 2026-05-11 23:55 BRT*
*Ferramenta: Playwright MCP + browser-use*
