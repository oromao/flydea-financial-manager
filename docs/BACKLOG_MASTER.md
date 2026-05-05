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
| E3-T1 | QA | UI | QA3-01: button nesting (bottom-nav) | P1 | Baixa | ✅ completed |
| E3-T2 | QA | UI | QA3-02: botao IMPORTAR duplicado | P1 | Baixa | ✅ completed |
| E3-T3 | QA | UI | QA3-05: datas nulas com "Sem data" | P1 | Baixa | ✅ completed |
| E3-T4 | QA | UI | QA3-07: "Fluxo" → "Transacoes" bottom-nav | P1 | Baixa | ✅ completed |
| E3-T5 | QA | UI | Fix modal Novo Lancamento transparente | P1 | Baixa | ✅ completed |
| E3-T6 | UX | Movimentacoes | Filtros mais compactos no mobile | P1 | Media | ✅ completed |
| E3-T7 | UX | FluxoCaixa | Summary cards com icones e cores | P1 | Media | ✅ completed |
| E3-T8 | UX | Contas | Limpar tokens nao-shadcn | P1 | Baixa | ✅ completed |
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

## ÉPICO 7: DESIGN OVERHAUL — BUGS CRÍTICOS (P0) — 🔴 PENDING

| ID | Tipo | Módulo | Título | Prioridade | Complexidade | Status |
|----|------|--------|-------|------------|--------------|--------|
| E7-T1 | Bug 🔴 | Contas e Cartões | Corrigir loop infinito de erros "Erro ao carregar contas" | P0 | Baixa | pending |
| E7-T2 | Bug 🔴 | Admin Aprovações | Corrigir loop infinito de erros "Não foi possível carregar aprovações" | P0 | Baixa | pending |
| E7-T3 | Bug 🔴 | Transações | Adicionar validação de conta obrigatória no formulário | P0 | Baixa | pending |
| E7-T4 | Bug 🔴 | Transações | Corrigir campo valor vazio no formulário de edição | P0 | Baixa | pending |
| E7-T5 | UX 🔴 | Toast System | Limitar toasts a 3 simultâneos com auto-dismiss 5s | P0 | Baixa | pending |

---

## ÉPICO 8: DESIGN SYSTEM & FOUNDATION (P1) — 🔴 PENDING

| ID | Tipo | Módulo | Título | Prioridade | Complexidade | Status |
|----|------|--------|-------|------------|--------------|--------|
| E8-T1 | Design | Global | Audit de cores hardcoded → tokens do design system | P1 | Média | pending |
| E8-T2 | Design | Global | Implementar gradientes premium (--gradient-primary, etc) | P1 | Baixa | pending |
| E8-T3 | Design | Global | Implementar sombras premium (--shadow-premium, --shadow-float, --shadow-glow) | P1 | Baixa | pending |
| E8-T4 | Design | Typography | Criar sistema tipográfico completo (Display, H1-H6, Body, Caption, Overline) | P1 | Baixa | pending |
| E8-T5 | Design | Layout | Definir grid system (4px increments, padding lateral por breakpoint) | P1 | Baixa | pending |
| E8-T6 | UI | Components | Melhorar Button com variantes (primary, secondary, ghost, destructive) | P1 | Média | pending |
| E8-T7 | UI | Components | Criar Card premium com glass effect | P1 | Média | pending |
| E8-T8 | UI | Components | Melhorar Input com floating label | P1 | Média | pending |
| E8-T9 | UI | Components | Criar Badge/Tag component | P1 | Baixa | pending |
| E8-T10 | UI | Components | Criar Progress Ring component | P1 | Baixa | pending |

---

## ÉPICO 9: MOBILE-FIRST REVOLUTION (P0-P1) — 🔴 PENDING

| ID | Tipo | Módulo | Título | Prioridade | Complexidade | Status |
|----|------|--------|-------|------------|--------------|--------|
| E9-T1 | UX 🔴 | Mobile | Criar Bottom Navigation Bar (5 itens: Home, Mov., Add, Alert, Mais) | P0 | Média | pending |
| E9-T2 | UX 🔴 | Mobile | Esconder sidebar no mobile, usar bottom nav | P0 | Média | pending |
| E9-T3 | UX 🔴 | Mobile | Criar FAB (Floating Action Button) para adicionar transação | P0 | Baixa | pending |
| E9-T4 | UX | Mobile | Implementar FormWizard para formulários (steps com progress) | P1 | Alta | pending |
| E9-T5 | UX | Mobile | Keyboard-aware: botão fixo acima do teclado em formulários | P1 | Média | pending |
| E9-T6 | UX | Mobile | Garantir touch targets mínimos 44x44px em todos os elementos | P1 | Baixa | pending |
| E9-T7 | UX | Mobile | Criar TransactionCard component para layout mobile | P1 | Média | pending |
| E9-T8 | UX | Mobile | Esconder tabela no mobile, mostrar cards | P1 | Baixa | pending |
| E9-T9 | UX | Mobile | Implementar swipe actions em cards (editar, excluir) | P2 | Média | pending |
| E9-T10 | UX | Mobile | Implementar pull-to-refresh em listas | P2 | Média | pending |

---

## ÉPICO 10: DESKTOP POLISH (P1) — 🔴 PENDING

| ID | Tipo | Módulo | Título | Prioridade | Complexidade | Status |
|----|------|--------|-------|------------|--------------|--------|
| E10-T1 | Design | Sidebar | Redesign sidebar com seções, ícones, badges, collapse/expand | P1 | Média | pending |
| E10-T2 | Design | Dashboard | Criar DashboardHero com saudação personalizada | P1 | Média | pending |
| E10-T3 | Design | Dashboard | Criar mini-cards de resumo com ícones e tendências | P1 | Média | pending |
| E10-T4 | UX | Tables | Adicionar sorting, filtros visuais, seleção múltipla em tabelas | P1 | Alta | pending |
| E10-T5 | UX | Tables | Bulk actions (excluir selecionados) | P2 | Média | pending |
| E10-T6 | Design | Empty States | Criar EmptyState premium com ilustração e ações claras | P2 | Baixa | pending |

---

## ÉPICO 11: MICRO-INTERACTIONS & MOTION (P2) — 🔴 PENDING

| ID | Tipo | Módulo | Título | Prioridade | Complexidade | Status |
|----|------|--------|-------|------------|--------------|--------|
| E11-T1 | UX | Global | Adicionar page transitions (fade-in/slide-up) | P2 | Média | pending |
| E11-T2 | UX | Global | Skeleton loading durante transições de página | P2 | Média | pending |
| E11-T3 | Design | Cards | Hover: scale(1.02) + shadow increase em cards | P2 | Baixa | pending |
| E11-T4 | Design | Cards | Entry stagger animation em listas | P2 | Média | pending |
| E11-T5 | UX | Loading | Skeleton screens premium com shimmer animation | P2 | Média | pending |
| E11-T6 | UX | Feedback | Checkmark animation ao salvar | P2 | Baixa | pending |
| E11-T7 | UX | Feedback | Shake animation em erro de validação | P2 | Baixa | pending |
| E11-T8 | UX | Feedback | Pulse animation em badges novos | P2 | Baixa | pending |

---

## ÉPICO 12: PAGES COMPLETION (P0) — 🔴 PENDING

| ID | Tipo | Módulo | Título | Prioridade | Complexidade | Status |
|----|------|--------|-------|------------|--------------|--------|
| E12-T1 | Feature 🔴 | Fluxo de Caixa | Criar página /fluxo-de-caixa com gráfico diário e heatmap | P0 | Alta | pending |
| E12-T2 | Feature 🔴 | Fluxo de Caixa | Criar API route /api/cashflow | P0 | Alta | pending |
| E12-T3 | Feature 🔴 | Planejamento | Criar página /planejamento com metas e projeções | P0 | Alta | pending |
| E12-T4 | Feature 🔴 | Planejamento | Criar API route /api/planning | P0 | Alta | pending |
| E12-T5 | Feature 🔴 | Inteligência IA | Criar página /inteligencia-ia com chat interface | P0 | Alta | pending |
| E12-T6 | Feature 🔴 | Inteligência IA | Criar API route /api/ai | P0 | Alta | pending |
| E12-T7 | Feature 🔴 | Análises | Criar página /analises com tendências e comparativos | P0 | Alta | pending |
| E12-T8 | Feature 🔴 | Análises | Criar API route /api/analytics | P0 | Alta | pending |

---

## ÉPICO 13: FINAL QA & POLISH (P1) — 🔴 PENDING

| ID | Tipo | Módulo | Título | Prioridade | Complexidade | Status |
|----|------|--------|-------|------------|--------------|--------|
| E13-T1 | QA | Cross-Browser | Testar em Chrome, Safari, Firefox, iOS Safari, Android Chrome | P1 | Média | pending |
| E13-T2 | A11y | Accessibility | Verificar contraste WCAG AA em todas as cores | P1 | Média | pending |
| E13-T3 | A11y | Accessibility | Testar com leitor de tela e navegação por teclado | P1 | Média | pending |
| E13-T4 | A11y | Accessibility | Adicionar ARIA labels onde necessário | P1 | Baixa | pending |
| E13-T5 | Performance | Global | Otimizar bundle size e lazy loading | P1 | Média | pending |
| E13-T6 | Performance | Global | Implementar service worker para cache | P2 | Alta | pending |
| E13-T7 | Performance | Global | Meta: Lighthouse Mobile > 90, Desktop > 95 | P1 | Alta | pending |
| E13-T8 | Design | Global | Revisão final visual de todas as páginas | P1 | Média | pending |
| E13-T9 | Design | Dark Mode | Revisar e garantir consistência do dark mode | P2 | Média | pending |

---

## ÉPICO 14: AUDITORIA QA PLAYWRIGHT — BUGS EM PRODUÇÃO (P0-P2) — 🔴 PENDING

> **Auditado em:** 2026-05-05 via Playwright MCP (browser real, iPhone 16 390×844)
> **Ambiente:** Produção (Vercel) — commit `37532226`

| ID | Tipo | Módulo | Título | Prioridade | Complexidade | Status |
|----|------|--------|-------|------------|--------------|--------|
| E14-T1 | Bug 🔴 | Movimentações | Fix `RangeError: Invalid time value` — página quebrada 100% | P0 | Média | pending |
| E14-T2 | Bug 🔴 | Transações | Dropdown de categoria mostra UUID em vez de nome no modal Novo Lançamento | P0 | Baixa | pending |
| E14-T3 | Bug 🟡 | PWA | Criar `public/manifest.webmanifest` — retorna HTML em vez de JSON | P1 | Baixa | pending |
| E14-T4 | Bug 🟡 | Contas e Cartões | Botão "Fechar" do modal de edição interceptado por header sticky | P1 | Baixa | pending |
| E14-T5 | UX 🟡 | Dashboard | Adicionar toast de sucesso ao criar transação (modal fecha sem feedback) | P1 | Baixa | pending |
| E14-T6 | UX 🟡 | Sidebar | Corrigir acentos: "Movimentacoes" → "Movimentações", "Recorrencias" → "Recorrências", "Analises" → "Análises" | P2 | Baixa | pending |
| E14-T7 | UX 🟡 | Transações | Formatar campo de data em pt-BR (DD/MM/AAAA) em vez de ISO (YYYY-MM-DD) | P2 | Baixa | pending |
| E14-T8 | Bug 🟡 | Produção | Remover dados seed visíveis ("Conta QA Edit") da página de Contas | P1 | Baixa | pending |
| E14-T9 | UX 🟡 | Dashboard | Investigar inconsistência de saldo geral (-R$ 16.578 vs transações visíveis) | P1 | Média | pending |
| E14-T10 | Bug 🟡 | Console | Limpar 20+ erros de console acumulados durante sessão (manifest, date, React) | P2 | Média | pending |
| E14-T11 | UX 🟡 | Global | Adicionar skeleton loading no dashboard enquanto dados carregam | P2 | Média | pending |
| E14-T12 | Melhoria | Seed | Melhorar dados seed para demonstração (todas as páginas mostram R$ 0,00) | P2 | Baixa | pending |

### Detalhes dos Bugs Críticos (E14-T1, E14-T2)

**E14-T1 — RangeError: Invalid time value**
- Página `/movimentacoes` quebra completamente com erro "Algo deu errado"
- Console: `RangeError: Invalid time value` + `[FlyDea Error] Invalid time value undefined`
- Causa raiz: transação com data nula/undefined no banco de dados
- Commit `a491fe67` já tentou corrigir (Safe format para date undefined) mas bug persiste
- **Impacto:** Usuário não consegue ver, editar ou deletar transações existentes

**E14-T2 — UUID no dropdown de categoria**
- Modal "Novo Lançamento" → selecionar "Alimentação" → mostra "c7a64993-ea44-4585-9c9e-53cd56f0699a"
- O `renderValue` do Select não está mapeando ID→nome da categoria
- Transação é criada corretamente mas o campo fica com UUID visível
- **Impacto:** UX confusa, usuário não sabe qual categoria selecionou

---

## Resumo por Prioridade

| Prioridade | Qtd Items | Items |
|------------|-----------|-------|
| P0 | 26 | E1-T1 a E1-T11, E7-T1 a E7-T5, E9-T1 a E9-T3, E12-T1 a E12-T8, E14-T1, E14-T2 |
| P1 | 38 | E2-T1 a E2-T10, E3-T1 a E3-T7, E8-T1 a E8-T10, E9-T4 a E9-T8, E10-T1 a E10-T4, E13-T1 a E13-T5, E13-T7, E13-T8, E14-T3, E14-T4, E14-T5, E14-T8, E14-T9 |
| P2 | 28 | E4-T1 a E4-T8, E5-T1, E5-T2, E5-T5, E5-T8, E6-T1 a E6-T10, E9-T9, E9-T10, E10-T5, E10-T6, E11-T1 a E11-T8, E13-T6, E13-T9, E14-T6, E14-T7, E14-T10, E14-T11, E14-T12 |
| P3 | 4 | E5-T3, E5-T4, E5-T6, E5-T7 |

---

## Próximos Passos Recomendados

### Semana 0: HOTFIX — Bugs Críticos de Produção (E14)
1. **E14-T1** — Fix RangeError na página Movimentações (PÁGINA 100% QUEBRADA)
2. **E14-T2** — Fix UUID no dropdown de categoria
3. **E14-T3** — Criar manifest.webmanifest
4. **E14-T4** — Fix botão Fechar interceptado
5. **E14-T8** — Remover dados seed de produção
6. **E14-T9** — Investigar inconsistência de saldo

### Semana 1: Fundação (E7 + E8)
1. **E7-T1** — Corrigir loop infinito em Contas e Cartões
2. **E7-T2** — Corrigir loop infinito em Admin Aprovações
3. **E7-T3** — Validação de conta obrigatória
4. **E7-T4** — Campo valor na edição
5. **E7-T5** — Toast system improvements
6. **E8-T1** — Audit de cores hardcoded

### Semana 2: Mobile-First
1. **E9-T1** — Bottom Navigation Bar
2. **E9-T2** — Esconder sidebar no mobile
3. **E9-T3** — FAB para adicionar transação
4. **E9-T6** — Touch targets 44px
5. **E9-T7** — TransactionCard component
6. **E9-T8** — Cards no mobile

### Semana 3: Pages & Desktop
1. **E12-T1** — Página Fluxo de Caixa
2. **E12-T3** — Página Planejamento
3. **E12-T5** — Página Inteligência IA
4. **E12-T7** — Página Análises
5. **E10-T1** — Sidebar redesign
6. **E10-T2** — Dashboard hero

### Semana 4: Polish
1. **E11-T1** — Page transitions
2. **E11-T5** — Skeleton screens premium
3. **E13-T1** — Cross-browser testing
4. **E13-T2** — Accessibility audit
5. **E13-T7** — Performance optimization
6. **E13-T8** — Final visual review

---

## Como Ler Este Backlog

- **ID estruturado:** E{Épico}-{Tarefa}
- **Primeiro dígito:** Épico (1-13)
- **Segundo dígito:** Tarefa sequencial
- **Ordem de execução:** P0 → P1 → P2 → P3, dentro de cada prioridade, respeitar dependências
- **Épicos 1-6:** Históricos (completados)
- **Épicos 7-13:** Design Overhaul (novos, pending)

---

## Atualização

Este arquivo deve ser atualizado sempre que:
- Nova task for criada
- Status mudar (pending → in_progress → completed)
- Prioridade mudar
- Dependências mudarem

**Regra:** Se não está no backlog, não existe oficialmente.

---

*Última atualização: 2026-05-05 — Versão 2.1 (QA Audit Playwright MCP)*