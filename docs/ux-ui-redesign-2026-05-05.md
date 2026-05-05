# FlyDea — UX/UI Redesign 2026-05-05

## Resumo

Redesign completo com foco em: remover IA da experiencia, simplificar navegacao mobile, melhorar dashboard e lista de transacoes, refinar formulario de lancamento.

## Problemas Encontrados e Corrigidos

### CRITICO
| # | Problema | Arquivo | Solucao |
|---|----------|---------|---------|
| 1 | Aba "IA" na bottom nav causava confusao no produto financeiro | bottom-nav.tsx | Substituida por botao central "Novo" |
| 2 | Botao "+" duplicado: FAB flutuante + QuickAdd no hero | sidebar.tsx, quick-add.tsx | FAB removido. Botao "Novo" na bottom nav e o unico trigger |
| 3 | FAB cobria conteudo e cards no scroll | sidebar.tsx | Removido |
| 4 | CopilotWrapper injetava sidebar de IA em todas as telas | layout.tsx | Removido |
| 5 | Cards "Copiloto IA" e "SpendDecisionIndicator" no dashboard | page.tsx | Removidos |
| 6 | Paginas /insights e /agents acessiveis | agents/page.tsx, insights/page.tsx | Redirect para / |
| 7 | Sidebar desktop com "Inteligencia IA" no menu | sidebar.tsx | Removido do navItems |
| 8 | DailyInsight com metricas de IA e stats de precisao | page.tsx | Componente removido do dashboard |
| 9 | Sparkles icon no dashboard-hero (icone IA) | dashboard-hero.tsx | Substituido por Wallet |
| 10 | TransactionCard muito grande, poluido, açoes sempre visiveis | transaction-card.tsx | Redesenhado: compacto, estilo Nubank/Revolut, açoes via "..." |

### ALTO
| # | Problema | Arquivo | Solucao |
|---|----------|---------|---------|
| 11 | Sidebar "Consultoria" card usava Sparkles (icone IA) | sidebar.tsx | Substituido por Lightbulb |
| 12 | Header do QuickAdd com bg-white/5 nao adaptava dark mode | quick-add.tsx | Fundo removido, footer sticky adicionado |
| 13 | Botao Salvar do QuickAdd nao era sticky no mobile | quick-add.tsx | Footer fixo com border-top |
| 14 | Touch actions via long-press nos cards de transacao | transaction-card.tsx | Implementado show/hide com "..." toggle |
| 15 | Feature flag criada para controlar IA | constants.ts | ENABLE_AI_FEATURES: false |

### MEDIO
| # | Problema | Arquivo | Solucao |
|---|----------|---------|---------|
| 16 | Scroll-margin-top ausente no main content | sidebar.tsx | scroll-mt-20 adicionado (auditoria anterior) |
| 17 | scope="col" ausente nos th | table.tsx | Adicionado (auditoria anterior) |
| 18 | Gramatica errada nos empty-states | empty-states.tsx | Corrigido (auditoria anterior) |

## Arquivos Alterados

### Remocao de IA
- `src/app/layout.tsx` — remove CopilotWrapper import/render
- `src/app/page.tsx` — remove Copilot card, SpendDecision, DailyInsight
- `src/components/bottom-nav.tsx` — remove IA tab, adiciona botao central "Novo"
- `src/components/sidebar.tsx` — remove "Inteligencia IA" do nav, remove FAB
- `src/components/dashboard/dashboard-hero.tsx` — troca Sparkles por Wallet
- `src/app/insights/page.tsx` — redirect para /
- `src/app/agents/page.tsx` — redirect para /
- `src/lib/constants.ts` — adiciona FEATURE_FLAGS.ENABLE_AI_FEATURES

### Navegacao
- `src/components/bottom-nav.tsx` — reescrito: Inicio / Fluxo / Novo(+) / Mais
- `src/components/sidebar.tsx` — FAB removido, 9 icons removidos do import
- `src/components/quick-add.tsx` — suporte a controlled open/onOpenChange

### UI Components
- `src/components/movimentacoes/transaction-card.tsx` — redesign completo
- `src/components/quick-add.tsx` — header fixo, footer sticky

## Componentes Criados/Refatorados

| Componente | Status | Descricao |
|------------|--------|-----------|
| BottomNav | Refatorado | 4 itens: Inicio, Fluxo, Novo(botao central), Mais |
| TransactionCard | Refatorado | Compacto, estilo banking app, acoes em menu expandivel |
| QuickAdd | Refatorado | Suporte controlled, footer sticky, dark mode fix |
| DashboardHero | Alterado | Icone IA substituido |
| Dashboard | Alterado | Secoes IA removidas |

## Testes

- `next build` — passou sem erros
- TypeScript typecheck — sem erros nos arquivos alterados
- Lint — sem novos warnings

## Problemas Restantes

1. SpendDecisionIndicator — removido do dashboard mas componente ainda existe (nao importado)
2. DailyInsight — removido do dashboard mas componente ainda existe (nao importado)
3. CopilotWrapper/CopilotSidebar/IntelligentCopilot — arquivos existem mas nao sao importados
4. FinancialAIChat — arquivo existe mas nao e mais acessado
5. Movimentacoes page (761 linhas) — precisa ser quebrada em componentes menores
6. Formulario de edicao usa o mesmo QuickAdd — precisa de modo "edit" com pre-preenchimento

## Proximo Passo Recomendado

1. Refatorar `movimentacoes/page.tsx` — quebrar em componentes menores (TransactionList, TransactionFilters, TransactionSummary)
2. Extrair formulario de edicao para componente separado ou adicionar modo "edit" ao QuickAdd
3. Limpar componentes IA nao utilizados (remover arquivos ou mover para /unused)
4. Adicionar testes smoke com Playwright para fluxos principais
