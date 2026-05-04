# FlyDea Financial Manager — Plano de Design Overhaul

**Objetivo:** Transformar o FlyDea em um sistema financeiro premium, mobile-first, sem bugs, com UX top de linha.
**Baseline:** QA Audit Report (2026-05-04) — Nota geral: 6/10
**Meta:** Nota 9/10 em UX/UI/Desktop/Mobile

---

## VISÃO GERAL DO PLANO

```
FASE 0: Correções Críticas (bugs que quebram o sistema)
FASE 1: Design System & Foundation (base sólida)
FASE 2: Mobile-First Revolution (experiência mobile premium)
FASE 3: Desktop Polish (experiência desktop refinada)
FASE 4: Micro-interactions & Motion (animações e delight)
FASE 5: Pages Completion (páginas faltantes)
FASE 6: Final QA & Polish (validação final)
```

**Estimativa Total:** ~3-4 semanas de desenvolvimento focado

---

## FASE 0: CORREÇÕES CRÍTICAS (Dias 1-2)

### 0.1 — Corrigir Loop Infinito de Erros
**Tipo:** Bug | **Prioridade:** P0 | **Complexidade:** Baixa

**Problema:** "Contas e Cartões" e "Admin Aprovações" disparam dezenas de toasts de erro em loop.

**Tarefas:**
- [ ] Identificar causa raiz do loop (provavelmente useEffect sem deps corretas)
- [ ] Adicionar debounce em chamadas de API
- [ ] Limitar toasts a máximo 3 simultâneos
- [ ] Adicionar error boundary por seção

**Critério de Aceite:**
- Página "Contas e Cartões" carrega sem toasts repetidos
- Página "Admin Aprovações" mostra acesso restrito sem toasts
- Máximo 3 toasts visíveis simultaneamente

### 0.2 — Corrigir Validação de Formulário de Transação
**Tipo:** Bug | **Prioridade:** P0 | **Complexidade:** Baixa

**Problema:** Formulário permite criar transação sem selecionar conta.

**Tarefas:**
- [ ] Adicionar validação Zod para campo `accountId` obrigatório
- [ ] Exibir erro inline abaixo do campo "Conta"
- [ ] Desabilitar botão "CONFIRMAR" até campos obrigatórios preenchidos
- [ ] Adicionar asterisco (*) nos labels de campos obrigatórios

**Critério de Aceite:**
- Formulário não envia sem conta selecionada
- Erro aparece inline, não como toast
- Botão desabilitado visualmente quando inválido

### 0.3 — Corrigir Campo Valor na Edição
**Tipo:** Bug | **Prioridade:** P0 | **Complexidade:** Baixa

**Problema:** Campo "Valor (BRL)" aparece vazio ao editar transação.

**Tarefas:**
- [ ] Verificar se valor está sendo carregado da API
- [ ] Garantir que MoneyInput recebe initialValue
- [ ] Testar formatação BRL (R$ 1.234,56)

**Critério de Aceite:**
- Valor atual aparece preenchido ao editar
- Formatação BRL correta

### 0.4 — Toast System Improvements
**Tipo:** UX | **Prioridade:** P1 | **Complexidade:** Baixa

**Problema:** Toasts aparecem em loop e não têm auto-dismiss.

**Tarefas:**
- [ ] Adicionar auto-dismiss após 5 segundos
- [ ] Limitar a 3 toasts simultâneos
- [ ] Adicionar botão de fechar mais visível
- [ ] Agrupar toasts do mesmo tipo

**Critério de Aceite:**
- Toasts somem automaticamente
- Máximo 3 visíveis
- Fácil de fechar manualmente

---

## FASE 1: DESIGN SYSTEM & FOUNDATION (Dias 3-5)

### 1.1 — Design Token Audit & Cleanup
**Tipo:** Design | **Prioridade:** P1 | **Complexidade:** Média

**Problema:** Inconsistências visuais entre páginas.

**Tarefas:**
- [ ] Auditar todas as cores hardcoded no código
- [ ] Substituir por tokens do design system
- [ ] Documentar paleta completa no Storybook/docs
- [ ] Criar variante "premium" para cards especiais

**Tokens a Implementar:**
```css
/* Gradientes Premium */
--gradient-primary: linear-gradient(135deg, var(--color-primary) 0%, #A855F7 100%);
--gradient-success: linear-gradient(135deg, var(--color-success) 0%, #34D399 100%);
--gradient-hero: linear-gradient(180deg, var(--color-surface) 0%, var(--color-surface-container-low) 100%);

/* Sombras Premium */
--shadow-premium: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06);
--shadow-float: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04);
--shadow-glow: 0 0 20px rgba(138, 5, 190, 0.15);

/* Glassmorphism */
--glass-bg: rgba(255, 255, 255, 0.8);
--glass-border: rgba(255, 255, 255, 0.2);
--glass-blur: blur(20px);
```

### 1.2 — Typography System
**Tipo:** Design | **Prioridade:** P1 | **Complexidade:** Baixa

**Problema:** Hierarquia tipográfica inconsistente.

**Tarefas:**
- [ ] Definir escala tipográfica completa
- [ ] Criar componentes Typography (H1-H6, Body, Caption, Label)
- [ ] Garantir contraste WCAG AA em todos os textos
- [ ] Usar Manrope para headings, Inter para body

**Escala Tipográfica:**
```
Display:  48px / 700 / Manrope / -1.5% tracking
H1:       32px / 700 / Manrope / -1% tracking
H2:       24px / 600 / Manrope / -0.5% tracking
H3:       20px / 600 / Inter / normal
Body:     16px / 400 / Inter / normal
Caption:  14px / 400 / Inter / normal
Overline: 12px / 500 / Inter / +5% tracking (uppercase)
```

### 1.3 — Spacing & Layout Grid
**Tipo:** Design | **Prioridade:** P1 | **Complexidade:** Baixa

**Problema:** Espaçamentos inconsistentes.

**Tarefas:**
- [ ] Definir grid base (4px increments)
- [ ] Criar utilitários de spacing
- [ ] Documentar padrões de layout por página

**Grid System:**
```
Mobile:  16px padding lateral, 12px gap entre elementos
Tablet:  24px padding lateral, 16px gap
Desktop: 32px padding lateral, 24px gap
Max-width: 1280px (centralizado)
```

### 1.4 — Component Library Enhancement
**Tipo:** Design | **Prioridade:** P1 | **Complexidade:** Média

**Tarefas:**
- [ ] Melhorar Button com variantes (primary, secondary, ghost, destructive)
- [ ] Criar Card premium com glass effect
- [ ] Melhorar Input com floating label
- [ ] Criar Badge/Tag component
- [ ] Criar Progress Ring component
- [ ] Melhorar Select com search

---

## FASE 2: MOBILE-FIRST REVOLUTION (Dias 6-10)

### 2.1 — Bottom Navigation Bar
**Tipo:** UX | **Prioridade:** P0 | **Complexidade:** Média

**Problema:** Sidebar ocupa tela inteira no mobile, navegação confusa.

**Design:**
```
┌─────────────────────────────────────────────┐
│                                             │
│              CONTEÚDO PRINCIPAL             │
│                                             │
├─────────────────────────────────────────────┤
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐  │
│  │ 🏠  │ │ 📊  │ │ ➕  │ │ 🔔  │ │ ⋯   │  │
│  │Home │ │Mov. │ │Add  │ │Alert│ │Mais │  │
│  └─────┘ └─────┘ └─────┘ └─────┘ └─────┘  │
└─────────────────────────────────────────────┘
```

**Tarefas:**
- [ ] Criar componente BottomNav
- [ ] Detectar mobile vs desktop
- [ ] Esconder sidebar no mobile
- [ ] Adicionar FAB (Floating Action Button) para adicionar transação
- [ ] Respeitar safe-area-inset-bottom

**Critérios de Aceite:**
- 5 itens máximo no bottom nav
- Ícone + Label sempre visível
- Active state claro (cor + indicador)
- FAB central com animação de abertura

### 2.2 — Mobile-Optimized Forms
**Tipo:** UX | **Prioridade:** P1 | **Complexidade:** Média

**Problema:** Formulários com muitos campos, scroll excessivo.

**Design — Transaction Form Wizard:**
```
Step 1: Tipo + Valor (fullscreen)
Step 2: Descrição + Categoria
Step 3: Conta + Data + Status
Step 4: Anexos (opcional)
```

**Tarefas:**
- [ ] Criar componente FormWizard
- [ ] Implementar steps com progress indicator
- [ ] Keyboard-aware: botão fixo acima do teclado
- [ ] Swipe entre steps (Framer Motion)
- [ ] Validação por step (não no final)

### 2.3 — Touch Target Optimization
**Tipo:** UX | **Prioridade:** P1 | **Complexidade:** Baixa

**Problema:** Alguns botões < 44px, difíceis de tocar.

**Tarefas:**
- [ ] Auditar todos os touch targets
- [ ] Garantir mínimo 44x44px em todos os elementos clicáveis
- [ ] Adicionar padding invisível onde necessário
- [ ] Testar em dispositivo real

### 2.4 — Mobile Cards Layout
**Tipo:** UX | **Prioridade:** P1 | **Complexidade:** Média

**Problema:** Tabelas não funcionam bem no mobile.

**Design — Transaction Card:**
```
┌──────────────────────────────────────┐
│ 🛒 Alimentação              -R$ 50  │
│ Supermercado Extra                  │
│ 22/04/26 • Pago                     │
└──────────────────────────────────────┘
```

**Tarefas:**
- [ ] Criar TransactionCard component
- [ ] Esconder tabela no mobile, mostrar cards
- [ ] Swipe actions (editar, excluir)
- [ ] Pull-to-refresh

### 2.5 — Mobile Gesture Support
**Tipo:** UX | **Prioridade:** P2 | **Complexidade:** Média

**Tarefas:**
- [ ] Swipe down para fechar modals
- [ ] Swipe left/right para ações em cards
- [ ] Pull-to-refresh em listas
- [ ] Long press para seleção múltipla

---

## FASE 3: DESKTOP POLISH (Dias 11-14)

### 3.1 — Sidebar Redesign
**Tipo:** Design | **Prioridade:** P1 | **Complexidade:** Média

**Design Atual:** Sidebar simples com links
**Design Novo:** Sidebar premium com seções, ícones, indicadores

```
┌──────────────────────────────────┐
│  🟣 FlyDea          Premium     │
│  ─────────────────────────────  │
│                                  │
│  📊 PRINCIPAL                   │
│  ├── Painel Geral        [●]   │
│  ├── Movimentações              │
│  ├── Contas e Cartões           │
│  └── Fluxo de Caixa             │
│                                  │
│  📋 GESTÃO                      │
│  ├── Contas a Pagar      [2]   │
│  ├── Planejamento               │
│  ├── Recorrências               │
│  └── Fechamento                 │
│                                  │
│  🤖 INTELIGÊNCIA                │
│  ├── Inteligência IA            │
│  ├── Análises                   │
│  └── Insights                   │
│                                  │
│  ─────────────────────────────  │
│  👤 Augusto Flydea              │
│  ⚙️  Configurações              │
└──────────────────────────────────┘
```

**Tarefas:**
- [ ] Agrupar menu em seções lógicas
- [ ] Adicionar badges de notificação
- [ ] Melhorar hover/active states
- [ ] Adicionar collapse/expand por seção
- [ ] Mostrar tooltip quando collapsed

### 3.2 — Dashboard Premium Layout
**Tipo:** Design | **Prioridade:** P1 | **Complexidade:** Alta

**Design:**
```
┌────────────────────────────────────────────────────┐
│  Bom dia, Augusto! 👋              [🔔] [⚙️]      │
│  Hoje é segunda, 04 de maio                        │
├────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────┐  │
│  │  💰 SALDO ATUAL                              │  │
│  │  R$ 12.450,00                                │  │
│  │  ──────────────────────────────────────────  │  │
│  │  Receitas    Despesas     Saldo              │  │
│  │  +R$ 5.000   -R$ 3.200   +R$ 1.800          │  │
│  └──────────────────────────────────────────────┘  │
│                                                      │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │
│  │ 📈 Receitas │ │ 📉 Despesas │ │ 💳 Contas   │   │
│  │ R$ 5.000    │ │ R$ 3.200    │ │ 3 ativas    │   │
│  │ ↑ 12%       │ │ ↓ 5%        │ │             │   │
│  └─────────────┘ └─────────────┘ └─────────────┘   │
│                                                      │
│  ┌──────────────────────┐ ┌──────────────────────┐  │
│  │ 📊 Gastos por        │ │ 📅 Próximos          │  │
│  │    Categoria          │ │    Vencimentos       │  │
│  │  [Donut Chart]        │ │  • Aluguel 05/05    │  │
│  │                       │ │  • Cartão 10/05     │  │
│  └──────────────────────┘ └──────────────────────┘  │
│                                                      │
│  ┌──────────────────────────────────────────────┐  │
│  │ 🕐 Últimas Transações                        │  │
│  │  • Supermercado    -R$ 150,00    22/04      │  │
│  │  • Salário         +R$ 5.000,00  01/04      │  │
│  └──────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────┘
```

**Tarefas:**
- [ ] Criar componente DashboardHero com saudação
- [ ] Criar mini-cards de resumo
- [ ] Melhorar gráficos com cores do design system
- [ ] Adicionar quick actions
- [ ] Implementar skeleton loading

### 3.3 — Data Table Enhancement
**Tipo:** UX | **Prioridade:** P1 | **Complexidade:** Média

**Tarefas:**
- [ ] Adicionar sorting por colunas
- [ ] Melhorar filtros visuais
- [ ] Adicionar seleção múltipla
- [ ] Bulk actions (excluir selecionados)
- [ ] Column visibility toggle
- [ ] Responsive: esconder colunas menos importantes

### 3.4 — Empty States Premium
**Tipo:** Design | **Prioridade:** P2 | **Complexidade:** Baixa

**Design:**
```
┌──────────────────────────────────────┐
│                                      │
│         📭                           │
│                                      │
│    Nenhuma transação ainda           │
│                                      │
│    Comece adicionando sua primeira   │
│    transação ou importe um extrato.  │
│                                      │
│    [➕ Nova Transação] [📄 Importar]  │
│                                      │
└──────────────────────────────────────┘
```

**Tarefas:**
- [ ] Criar EmptyState premium com ilustração
- [ ] Adicionar ações claras
- [ ] Usar em todas as listas vazias

---

## FASE 4: MICRO-INTERACTIONS & MOTION (Dias 15-17)

### 4.1 — Page Transitions
**Tipo:** UX | **Prioridade:** P2 | **Complexidade:** Média

**Tarefas:**
- [ ] Adicionar fade-in/slide-up ao trocar de página
- [ ] Skeleton loading durante transições
- [ ] Manter scroll position ao voltar

### 4.2 — Card Animations
**Tipo:** Design | **Prioridade:** P2 | **Complexidade:** Baixa

**Tarefas:**
- [ ] Hover: scale(1.02) + shadow increase
- [ ] Click: scale(0.98) feedback
- [ ] Entry: stagger animation em listas
- [ ] Exit: fade-out ao deletar

### 4.3 — Loading States Premium
**Tipo:** UX | **Prioridade:** P2 | **Complexidade:** Média

**Tarefas:**
- [ ] Skeleton screens para cada tipo de conteúdo
- [ ] Shimmer animation
- [ ] Progress indicators para ações longas
- [ ] Optimistic updates

### 4.4 — Feedback Animations
**Tipo:** UX | **Prioridade:** P2 | **Complexidade:** Baixa

**Tarefas:**
- [ ] Checkmark animation ao salvar
- [ ] Shake animation em erro de validação
- [ ] Pulse animation em badges novos
- [ ] Confetti ao atingir meta (opcional)

---

## FASE 5: PAGES COMPLETION (Dias 18-22)

### 5.1 — Fluxo de Caixa Page
**Tipo:** Feature | **Prioridade:** P0 | **Complexidade:** Alta

**Design:**
```
┌────────────────────────────────────────────────────┐
│  Fluxo de Caixa                    [📅 Maio 2026] │
├────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────────────────────────────────────────┐  │
│  │  📊 Fluxo de Caixa Diário                    │  │
│  │  [Line Chart - Receitas vs Despesas]         │  │
│  └──────────────────────────────────────────────┘  │
│                                                      │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │
│  │ 💰 Entradas │ │ 💸 Saídas   │ │ 📊 Saldo    │   │
│  │ R$ 8.500    │ │ R$ 6.200    │ │ R$ 2.300    │   │
│  └─────────────┘ └─────────────┘ └─────────────┘   │
│                                                      │
│  ┌──────────────────────────────────────────────┐  │
│  │  📅 Calendário de Fluxo                      │  │
│  │  [Heatmap de dias positivos/negativos]       │  │
│  └──────────────────────────────────────────────┘  │
│                                                      │
│  ┌──────────────────────────────────────────────┐  │
│  │  📋 Transações do Período                    │  │
│  │  [Lista filtrável por data]                  │  │
│  └──────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────┘
```

**Tarefas:**
- [ ] Criar API route /api/cashflow
- [ ] Implementar gráfico de fluxo diário
- [ ] Criar heatmap calendar
- [ ] Adicionar filtros por período
- [ ] Export CSV/PDF

### 5.2 — Planejamento Page
**Tipo:** Feature | **Prioridade:** P0 | **Complexidade:** Alta

**Design:**
```
┌────────────────────────────────────────────────────┐
│  Planejamento                      [📅 Maio 2026] │
├────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────────────────────────────────────────┐  │
│  │  🎯 Metas do Mês                             │  │
│  │  • Economizar R$ 1.000        [████████░░] 80%│  │
│  │  • Reduzir gastos delivery    [████░░░░░░] 40%│  │
│  └──────────────────────────────────────────────┘  │
│                                                      │
│  ┌──────────────────────────────────────────────┐  │
│  │  💰 Orçamento por Categoria                  │  │
│  │  [Bar Chart - Orçado vs Real]                │  │
│  └──────────────────────────────────────────────┘  │
│                                                      │
│  ┌──────────────────────────────────────────────┐  │
│  │  📊 Projeção de Saldo                        │  │
│  │  [Line Chart - Saldo projetado fim do mês]   │  │
│  └──────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────┘
```

**Tarefas:**
- [ ] Criar API route /api/planning
- [ ] Implementar metas mensais
- [ ] Gráfico de orçamento vs real
- [ ] Projeção de saldo
- [ ] Alertas de ultrapassagem

### 5.3 — Inteligência IA Page
**Tipo:** Feature | **Prioridade:** P0 | **Complexidade:** Alta

**Design:**
```
┌────────────────────────────────────────────────────┐
│  Inteligência IA                                   │
├────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────────────────────────────────────────┐  │
│  │  🤖 Chat com IA Financeira                   │  │
│  │  ──────────────────────────────────────────  │  │
│  │  [Messages area]                             │  │
│  │                                              │  │
│  │  ┌──────────────────────────────────────┐   │  │
│  │  │ 💡 Sugestões Rápidas                  │   │  │
│  │  │ [Como economizar?] [Analisar gastos]  │   │  │
│  │  └──────────────────────────────────────┘   │  │
│  │                                              │  │
│  │  ┌──────────────────────────────────────┐   │  │
│  │  │ [Input]                    [Enviar]  │   │  │
│  │  └──────────────────────────────────────┘   │  │
│  └──────────────────────────────────────────────┘  │
│                                                      │
│  ┌──────────────────────────────────────────────┐  │
│  │  📊 Insights Automáticos                     │  │
│  │  • Seus gastos com alimentação aumentaram 20%│  │
│  │  • Você pode economizar R$ 300 em delivery   │  │
│  └──────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────┘
```

**Tarefas:**
- [ ] Criar API route /api/ai
- [ ] Implementar chat interface
- [ ] Adicionar sugestões contextuais
- [ ] Insights automáticos baseados em dados
- [ ] Disclaimer de privacidade

### 5.4 — Análises Page
**Tipo:** Feature | **Prioridade:** P0 | **Complexidade:** Alta

**Design:**
```
┌────────────────────────────────────────────────────┐
│  Análises                          [📅 Período ▾] │
├────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────────────────────────────────────────┐  │
│  │  📈 Tendência de Gastos                      │  │
│  │  [Line Chart - Últimos 6 meses]              │  │
│  └──────────────────────────────────────────────┘  │
│                                                      │
│  ┌──────────────┐ ┌──────────────┐                 │
│  │ 🏆 Top       │ │ 📉 Maiores   │                 │
│  │ Categorias   │ │ Aumentos     │                 │
│  │ 1. Aliment.  │ │ 1. Delivery  │                 │
│  │ 2. Transport │ │ 2. Lazer     │                 │
│  └──────────────┘ └──────────────┘                 │
│                                                      │
│  ┌──────────────────────────────────────────────┐  │
│  │  🔄 Comparativo Mensal                       │  │
│  │  [Bar Chart - Mês atual vs anterior]         │  │
│  └──────────────────────────────────────────────┘  │
│                                                      │
│  ┌──────────────────────────────────────────────┐  │
│  │  💡 Recomendações                            │  │
│  │  • Reduza gastos com delivery em 30%         │  │
│  │  • Considere renegociar plano de saúde       │  │
│  └──────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────┘
```

**Tarefas:**
- [ ] Criar API route /api/analytics
- [ ] Implementar gráficos de tendência
- [ ] Top categorias com drill-down
- [ ] Comparativo mensal
- [ ] Recomendações automáticas

---

## FASE 6: FINAL QA & POLISH (Dias 23-25)

### 6.1 — Cross-Browser Testing
**Tipo:** QA | **Prioridade:** P1

**Tarefas:**
- [ ] Testar em Chrome, Safari, Firefox
- [ ] Testar em iOS Safari
- [ ] Testar em Android Chrome
- [ ] Corrigir inconsistências

### 6.2 — Accessibility Audit
**Tipo:** A11y | **Prioridade:** P1

**Tarefas:**
- [ ] Verificar contraste de cores (WCAG AA)
- [ ] Testar com leitor de tela
- [ ] Verificar navegação por teclado
- [ ] Adicionar ARIA labels onde necessário
- [ ] Testar com zoom de 200%

### 6.3 — Performance Optimization
**Tipo:** Performance | **Prioridade:** P1

**Tarefas:**
- [ ] Otimizar bundle size
- [ ] Implementar lazy loading
- [ ] Otimizar imagens
- [ ] Implementar service worker para cache
- [ ] Meta: Lighthouse score > 90

### 6.4 — Final Visual Polish
**Tipo:** Design | **Prioridade:** P2

**Tarefas:**
- [ ] Revisar todas as páginas
- [ ] Garantir consistência visual
- [ ] Ajustar spacing final
- [ ] Revisar dark mode
- [ ] Screenshots para documentação

---

## PRIORIZAÇÃO FINAL

### Sprint 1 (Dias 1-5): Fundação
```
Fase 0: Correções Críticas
Fase 1: Design System Foundation
```

### Sprint 2 (Dias 6-12): Mobile-First
```
Fase 2: Mobile Revolution
Fase 3: Desktop Polish (início)
```

### Sprint 3 (Dias 13-18): Pages & Features
```
Fase 3: Desktop Polish (conclusão)
Fase 5: Pages Completion (início)
```

### Sprint 4 (Dias 19-25): Polish & Launch
```
Fase 4: Micro-interactions
Fase 5: Pages Completion (conclusão)
Fase 6: Final QA & Polish
```

---

## MÉTRICAS DE SUCESSO

| Métrica | Antes | Meta |
|---------|-------|------|
| Nota QA Geral | 6/10 | 9/10 |
| Páginas funcionais | 75% | 100% |
| Bugs críticos | 2 | 0 |
| Touch targets < 44px | ~30% | 0% |
| Lighthouse Mobile | ~60 | >90 |
| Lighthouse Desktop | ~70 | >95 |
| Tempo de carregamento | ~3s | <1.5s |

---

## DEPENDÊNCIAS

```
Fase 0 → Fase 1 (precisa de sistema estável)
Fase 1 → Fase 2 (precisa de design system)
Fase 1 → Fase 3 (precisa de design system)
Fase 2 → Fase 4 (precisa de mobile funcionando)
Fase 5 → Fase 6 (precisa de páginas completas)
```

---

## REFERÊNCIAS DE DESIGN

### Inspirações
- **Nubank:** Simplicidade, cores bold, mobile-first
- **Revolut:** Dashboard limpo, gráficos claros
- **Monzo:** Cores vivas, feedback visual forte
- **Apple Wallet:** Gestos, animações fluidas

### Ferramentas
- **Figma:** Para mockups (se necessário)
- **Tailwind CSS:** Styling
- **Framer Motion:** Animações
- **Recharts:** Gráficos
- **Lucide React:** Ícones

---

*Plano criado em 2026-05-04*
*Última atualização: 2026-05-04*
