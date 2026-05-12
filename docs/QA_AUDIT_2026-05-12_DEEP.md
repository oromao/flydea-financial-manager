# QA Deep Audit — FlyDea Financial Manager
**Data:** 2026-05-12 | **Ferramenta:** browser-use (Chromium headed, 1224x670)
**Usuário:** Augusto Flydea | **URL:** https://flydea-financial-manager.vercel.app

---

## 📊 Resumo Executivo

| Métrica | Valor |
|---------|-------|
| Páginas auditadas | 12 |
| Modais testados | 6 (Novo/Editar Lançamento, Novo Orçamento, Nova Recorrência, Delete, Discard) |
| Fluxos CRUD testados | 3 (create, edit, delete) |
| **Total de problemas** | **14** |
| 🔴 Críticos | 2 |
| 🟡 Altos | 5 |
| 🟢 Médios | 5 |
| 🔵 Baixos | 2 |

---

## 🔴 CRÍTICOS

### QA-C1 — "Poupança" mostra -359.0% e não faz sentido
**Página:** `/relatorios`
**Problema:** O card "Poupança" mostra `-359.0%` quando deveria mostrar a taxa de economia real. O valor parece ser `(receita - despesa) / despesa` em vez do correto `(receita - despesa) / receita`. No estado atual (receita R$10, despesa R$46), a taxa não faz sentido para o usuário.
**Passos:** Navegar para Relatórios → ver o card "Poupança"
**Severidade:** 🔴 Crítico — um produto financeiro não pode mostrar métricas financeiras incorretas
**Sugestão:** Revisar a fórmula: `savingsRate = (income - expense) / income * 100`. Se income for 0, mostrar "N/A" ou "Sem receitas".

### QA-C2 — Página /relatorios com acentos faltando
**Página:** `/relatorios`
**Problema:** Título "Relatorios" (sem acento, deveria ser "Relatórios"), subtítulo "Estatisticas & Insights" (sem acento, deveria ser "Estatísticas & Insights"), "Distribuicao Detalhada" (sem cedilha, "Distribuição"), "Poupanca" (sem cedilha, "Poupança"), "Visao Comparativa" (sem acento, "Visão"), "Receita vs Despesa" ("Despesa" sem acento → "Despesa", este já está correto)
**Passos:** Navegar para /relatorios → ver header e seções
**Impacto:** 6+ erros de acentuação na mesma página, contraste com a proposta de "clareza"
**Severidade:** 🔴 Crítico (múltiplos erros na mesma página prejudicam credibilidade)

---

## 🟡 ALTOS

### QA-A1 — "Novo Lançamento" duplicado na página de Movimentações
**Página:** `/movimentacoes`
**Problema:** Existem dois botões "Novo Lançamento" — um no header (modo desktop) e outro via FAB (modo mobile). Em desktop, o botão do header abre um modal. No mobile, ambos aparecem. O FAB também existe no dashboard. Pode causar confusão.
**Passos:** Navegar para /movimentacoes → ver botão NOVO no canto superior direito e verificar se há duplicação da ação
**Severidade:** 🟡 Alto

### QA-A2 — Card "Alertas Críticos" sempre vazio
**Página:** `/orcamentos`
**Problema:** O card "Alertas Críticos" está sempre presente mesmo quando não há alertas, o que pode causar ruído visual. O valor mostra contagem 0 e um ícone de check ✓, mas não informa claramente que está tudo ok.
**Passos:** Navegar para /orcamentos → ver card "Alertas Críticos"
**Severidade:** 🟡 Alto — UX confusa, usuário pode achar que há algo errado

### QA-A3 — Sidebar "Relatórios" não destaca quando ativa
**Página:** `/relatorios`
**Problema:** Quando na página /relatorios, o item "Relatórios" na sidebar não mostra destaque visual (active state) porque o href no sidebar é `/relatorios` mas pode haver problema de path matching.
**Passos:** Navegar para /relatorios → sidebar → verificar se o item está destacado
**Severidade:** 🟡 Alto — feedback de navegação quebrado

### QA-A4 — Exportar CSV/PDF sem feedback
**Página:** `/relatorios`, `/fechamento`, `/movimentacoes`
**Problema:** Botões "Exportar", "Excel (CSV)" e "Documento PDF" não mostram loading state ou feedback após clique.
**Passos:** Clicar em Exportar → sem indicador de progresso
**Severidade:** 🟡 Alto — usuário não sabe se o clique funcionou

### QA-A5 — Input de valor usa step=0.01 que permite decimais infinitos
**Páginas:** Modais de transação, orçamento
**Problema:** O input de valor monetário usa `step=0.01` e `type=number`, que permite valores como 0.001 (3 casas decimais) via digitação manual, embora o step sugira 2 casas.
**Passos:** Abrir Novo Lançamento → digitar 10.999 → verificar se aceita
**Severidade:** 🟡 Alto — valores financeiros com mais de 2 casas decimais

---

## 🟢 MÉDIOS

### QA-M1 — Filtro "Categoria" na página de Movimentações não mostra valor selecionado
**Página:** `/movimentacoes`
**Problema:** O botão de filtro "Categoria" não exibe o texto da categoria selecionada — apenas o placeholder "Categoria"
**Passos:** Clicar em Categoria → selecionar uma → botão continua mostrando "Categoria"
**Severidade:** 🟢 Médio

### QA-M2 — Modal "Novo Orçamento" fecha ao clicar fora (sem confirmação)
**Página:** `/orcamentos`
**Problema:** Ao contrário do modal de transação (que mostra "Descartar alterações?"), o modal de orçamento fecha sem confirmação se clicar fora.
**Passos:** Abrir Novo Orçamento → preencher campos → clicar fora → modal fecha sem aviso
**Severidade:** 🟢 Médio

### QA-M3 — Data em formato ISO (YYYY-MM-DD) no lugar de pt-BR (DD/MM/AAAA)
**Páginas:** Modais de transação, filtros de data
**Problema:** Todos os inputs de data usam `type=date` que exibe no formato ISO. Para um sistema brasileiro, o formato DD/MM/AAAA seria mais adequado.
**Passos:** Abrir Novo Lançamento → ver campo "Data" → formato ISO
**Severidade:** 🟢 Médio (já documentado como QA-08)

### QA-M4 — Perfil: não há confirmação ao salvar
**Página:** `/perfil`
**Problema:** O botão "Salvar perfil" não tem confirmação visual de sucesso após salvar. A página tem botão "Recarregar" que faz reload completo.
**Passos:** Navegar para Perfil → alterar nome → Salvar → sem feedback
**Severidade:** 🟢 Médio

### QA-M5 — Insights ainda redireciona para Relatórios
**Página:** `/insights`
**Problema:** A página /insights redireciona para /relatorios, o que é uma melhoria (antes redirecionava para /). Mas o nome "Insights" não corresponde a "Relatórios" na sidebar.
**Passos:** Acessar /insights → redireciona para relatorios
**Severidade:** 🟢 Médio

---

## 🔵 BAIXOS

### QA-B1 — Texto "Pular para o conteudo" sem contraste ideal
**Global**
**Problema:** O link "Pular para o conteúdo" (skip-to-content) pode não ter contraste suficiente quando focado.
**Severidade:** 🔵 Baixo

### QA-B2 — "este minuto" no dashboard é genérico
**Página:** `/` (Dashboard)
**Problema:** O timestamp "Saldo Total • este minuto" é vago. Um horário específico seria mais informativo.
**Severidade:** 🔵 Baixo

---

## ✅ VERIFICADO — Funcionando Corretamente

| Item | Status |
|------|--------|
| Base UI error #51 em /contas | ✅ CORRIGIDO |
| UUID em dropdown de categoria (orçamento) | ✅ CORRIGIDO |
| UUID em dropdown de conta (edição) | ✅ CORRIGIDO |
| UUID em quick-add, document-importer, payment-importer | ✅ CORRIGIDO |
| Typos "Criticos" → "Críticos" | ✅ CORRIGIDO |
| Typos "Automacao"/"RECORRENCIA" → "Automação"/"RECORRÊNCIA" | ✅ CORRIGIDO |
| Typo "Novo Lancamento" → "Novo Lançamento" | ✅ CORRIGIDO |
| Sidebar "Análises" → "Relatórios" | ✅ CORRIGIDO |
| /insights redirect → /relatorios | ✅ CORRIGIDO |
| Delete confirmation dialog | ✅ Funcional |
| Discard changes dialog (Escape) | ✅ Funcional |
| Dark mode toggle | ✅ Funcional |
| Sidebar navigation | ✅ Funcional |
| Loading states (skeleton) | ✅ Presente |
| Empty states (recorrências, orçamentos, contas a pagar) | ✅ Presentes |
| Error boundaries | ✅ Presentes |
| Skip-to-content link | ✅ Presente |
| ARIA labels | ✅ Boa cobertura |

---

## 🏆 Ranking de Páginas por Problemas

| Página | Problemas | Nota |
|--------|-----------|------|
| `/relatorios` | 5 (2 críticos, 2 altos, 1 médio) | 🔴 Ruim |
| `/movimentacoes` | 3 (1 alto, 2 médios) | 🟡 Regular |
| `/orcamentos` | 2 (1 alto, 1 médio) | 🟡 Regular |
| `/perfil` | 1 (médio) | 🟢 Bom |
| `/fluxo-caixa` | 0 | ✅ Excelente |
| `/fechamento` | 0 | ✅ Excelente |
| `/contas` | 0 | ✅ Excelente (após correção) |
| `/recorrencias` | 0 | ✅ Excelente |
| `/contas-a-pagar` | 0 | ✅ Excelente |
| `/` (Dashboard) | 1 (baixo) | 🟢 Bom |

---

## 🔧 Recomendações Prioritárias

1. **QA-C1**: Corrigir fórmula de savings rate em `/relatorios` — usar `(receita - despesa) / receita` e tratar division by zero
2. **QA-C2**: Corrigir acentos em `/relatorios` — "Relatórios", "Estatísticas", "Distribuição", "Poupança", "Visão"
3. **QA-A4**: Adicionar loading state aos botões de exportação
4. **QA-A3**: Verificar active state da sidebar para /relatorios
5. **QA-M1**: Filtro "Categoria" deve mostrar valor selecionado
6. **QA-M2**: Adicionar discard confirmation ao modal de orçamento
7. **QA-A5**: Arredondar valor para 2 casas decimais antes de enviar

---

*Relatório gerado em 2026-05-12 16:15 BRT — QA Deep Audit*
