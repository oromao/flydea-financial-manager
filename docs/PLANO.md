# FlyDea — Plano Completo de Redesign

> **Data:** 2026-05-04  
> **Status:** Planejamento — Aguardando execução  
> **Objetivo:** Redesign completo mobile-first usando shadcn/ui, reorganizar features bagunçadas, corrigir todos os bugs críticos, entregar app funcional e premium

---

## 1. DIAGNÓSTICO GERAL

### 1.1 Estado Atual (Evidenciado por Auditoria)

| Métrica | Valor | Gravidade |
|---------|-------|-----------|
| Gaps UX/UI documentados | 87+ | 🔴 Crítico |
| Cores Tailwind hardcoded | 77+ instâncias | 🔴 Crítico |
| `any` types no TypeScript | 104+ instâncias | 🟡 Alto |
| APIs sem validação Zod | 34/44 (77%) | 🔴 Crítico |
| APIs sem rate limiting | 43/44 (98%) | 🔴 Crítico |
| Páginas sem error boundary | 18/18 (0%) | 🔴 Crítico |
| Componentes sem ARIA | 15/21 (71%) | 🟡 Alto |
| `window.location.reload()` | 5 instâncias | 🟡 Alto |
| `confirm()` nativo restante | 1 (agents-dashboard) | 🟡 Alto |
| Cobertura de testes | ~45% (não verificável) | 🟡 Alto |

### 1.2 Problemas Estruturais

1. **Login refeito, mas resto do app NÃO** — Login segue DESIGN_DIRECTION.md (Apple-style premium), mas 14+ páginas internas ainda usam o design antigo. Resultado: experiência completamente inconsistente entre login e dashboard.

2. **Documentação contraditória** — KNOWN_ISSUES.md, BACKLOG_MASTER.md, e EXECUTION_LOG.md têm informações divergentes sobre o que foi corrigido. AI_HANDOFF_CONTEXT.md tem conteúdo duplicado/quebrado.

3. **Design system fragmentado** — `glass-card` existe no CSS mas não tem dark mode. `apple-button-primary` existe mas não é usada consistentemente. Tokens shadcn/ui estão parcialmente definidos (popover, ring, input, border), mas muitos componentes ainda usam cores hardcoded.

4. **Mobile navigation ruim** — 67% dos módulos estão a 2+ taps no mobile. Bottom sheet "Mais" foi implementado (E1-T10), mas ainda é uma solução de contorno, não uma navegação nativa.

5. **Componentes não usam shadcn/ui de verdade** — A auditoria revelou que o projeto usa `@base-ui/react` (Base UI primitives da MUI) com wrappers customizados, NÃO o shadcn/ui original. Os componentes wrapper são inconsistentes.

---

## 2. GAPS POR MÓDULO (Priorizados)

### 🔴 P0 — CRÍTICO (Bloqueantes)

| Gap | Módulo | Problema | Arquivo |
|-----|--------|----------|---------|
| R-01/R-02 | Recorrências | Botão delete **não funciona** — sem onClick, sem handler | `src/app/recorrencias/page.tsx` |
| A-01 | Admin/Aprovações | Approve/Reject sem confirmação, loading, ou error feedback | `src/app/admin/aprovacoes/page.tsx` |
| A-05 | Admin/Aprovações | Sem role check — qualquer usuário logado pode aprovar | `src/app/admin/aprovacoes/page.tsx` |
| DS-05/DS-10 | UI/Design System | `glass-card` classe usada em EmptyState e ConfirmDialog mas sem fallback consistente | `src/components/ui/empty-state.tsx`, `confirm-dialog.tsx` |
| MB-01 | Mobile/Navegação | 10+ módulos escondidos atrás de "Mais" — discoverability zero | `src/components/bottom-nav.tsx`, `sidebar.tsx` |
| MB-02 | Mobile/Dialogs | Teclado cobre submit button em formulários longos | Todas as páginas com dialog |
| E7-T26 | Recorrências | Delete button SEM onClick (bug confirmado no código) | `src/app/recorrencias/page.tsx` |

### 🟡 P1 — ALTO (Experiência quebrada)

| Gap | Módulo | Problema | Arquivo |
|-----|--------|----------|---------|
| Dashboard | Hero card destoa dos outros cards | `src/app/page.tsx` |
| Dashboard | Quick Actions cards decorativos, não funcionais | `src/app/page.tsx` |
| Movimentações | Formulário 12+ campos sem seções visuais | `src/app/movimentacoes/page.tsx` |
| Movimentações | Filtros ocupam 4 linhas verticais no mobile | `src/app/movimentacoes/page.tsx` |
| Orçamentos | Progress bar inconsistente, sem hierarquia | `src/app/orcamentos/page.tsx` |
| Relatórios | Pie labels sobrepostos no mobile | `src/app/relatorios/page.tsx` |
| Contas | Botões de ação pequenos (sm:h-8 = 32px) | `src/app/contas/page.tsx` |
| Fluxo de Caixa | InvoiceManager usa inputs HTML puros | `src/components/invoice-manager.tsx` |
| Fluxo de Caixa | `alert()` nativo em InvoiceManager | `src/components/invoice-manager.tsx` |
| Perfil | `window.location.reload()` ao salvar | `src/app/perfil/page.tsx` |
| Perfil | Sem feedback toast em save | `src/app/perfil/page.tsx` |
| Fechamento | Botões de período overflow no mobile | `src/app/fechamento/page.tsx` |
| Contas a Pagar | Seções sem diferenciação visual | `src/app/contas-a-pagar/page.tsx` |

### 🟢 P2 — MÉDIO (Polish visual)

| Gap | Módulo | Problema |
|-----|--------|----------|
| Dashboard | Gráfico sem label no eixo Y |
| Dashboard | Sem indicador de "atualizado às HH:MM" |
| Relatórios | Bar chart labels truncados |
| Relatórios | Charts com altura fixa (não responsivos) |
| Contas | Color picker sem labels acessíveis |
| Recorrências | Dialog mantém valores ao reabrir |
| Orçamentos | Slider sem ticks ou labels |
| Alertas | Mark all read faz N chamadas em paralelo |
| Admin/Logs | Cells com padding excessivo |
| Perfil | Ícone Trash2 no botão "Recarregar" |

---

## 3. REDESIGN VISUAL — ESTRATÉGIA

### 3.1 Princípios (de DESIGN_DIRECTION.md)

```
Minimalismo Apple × shadcn/ui premium
- Fundo branco puro (#FFFFFF) / escuro premium (#0A0A0B)
- Roxo premium (#8A05BE) como primary
- Cards sem borda, sombras suaves Apple-style
- Border radius 12px (botões) / 16px (cards) / 24px (dialogs)
- Tipografia: Manrope (headings) + Inter (body)
- Espaçamento generoso (min 16px entre elementos)
- Touch targets mínimos 44px (WCAG 2.1)
```

### 3.2 O Que Fazer em Cada Tela

#### 3.2.1 Dashboard (`/`) — Reconstruir do zero

```
ESTADO ATUAL: Card "Saldo Geral" sem hierarquia, gráfico sem contexto,
Quick Actions decorativos, 3 APIs carregam separadamente

NOVO LAYOUT (mobile-first):
┌─────────────────────────────────────┐
│ [Header: FlyDea + avatar]           │
│ Saldo Geral (Hero, 32px Manrope)    │
│ Atualizado às 09:42                 │
├─────────────────────────────────────┤
│ [3 Cards de Resumo em grid-cols-3]  │
│ Receita  │  Despesa  │  Pendentes   │
├─────────────────────────────────────┤
│ [SpendDecisionIndicator]            │
│ "Você pode gastar R$ 1.200 este mês"│
├─────────────────────────────────────┤
│ [Alertas de Orçamento] (lista)      │
│ ⚠️ Alimentação: 85% do orçamento    │
├─────────────────────────────────────┤
│ [Gráfico Compacto: Receita/Despesa] │
│ Últimos 30 dias, linha suave        │
├─────────────────────────────────────┤
│ [FAB: + Nova Transação]             │
└─────────────────────────────────────┘

AÇÕES:
- Hero com saldo em display 32px Manrope 800
- 3 mini-cards de resumo (Receita/Despesa/Pendentes)
- SpendDecisionIndicator integrado no fluxo
- Alertas de orçamento como banner expansível
- Gráfico compacto com labels claros
- Remover Quick Actions decorativos
- Coordenar loading com Promise.all (skeleton único)
- Adicionar timestamp de frescor
```

#### 3.2.2 Movimentações (`/movimentacoes`) — Reorganizar

```
ESTADO ATUAL: 12 campos em bloco único, tabela + cards duplicados no mobile,
filtros em 4 linhas, FAB posição problemática

NOVO LAYOUT:
┌─────────────────────────────────────┐
│ [Filtro Bar: busca + chips]         │
│ [Pesquisar...] [Receita] [Despesa]  │
├─────────────────────────────────────┤
│ [Lista de Transações (cards mobile)]│
│ ┌─────────────────────────────────┐ │
│ │ R$ 1.200,00 — Mercado          │ │
│ │ 04/05 — Alimentação            │ │
│ │ [Pago ✓]                        │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ [Paginação: 1 2 3 ... 10]          │
├─────────────────────────────────────┤
│ [FAB: +] (safe-area aware)         │
└─────────────────────────────────────┘

DIALOG (mobile fullscreen):
┌─────────────────────────────────────┐
│ [Header Sticky: Nova Transação  ✕]  │
├─────────────────────────────────────┤
│ DADOS PRINCIPAIS                    │
│ [Valor]  [Descrição]  [Categoria]   │
├─────────────────────────────────────┤
│ DATAS                               │
│ [Data]  [Vencimento]                │
├─────────────────────────────────────┤
│ STATUS                              │
│ [Tipo: Receita/Despesa] [Status]    │
├─────────────────────────────────────┤
│ [Salvar] ← sticky                   │
└─────────────────────────────────────┘

AÇÕES:
- Agrupar form em 3 seções com divider
- Collapsar filtros em 1 barra + drawer
- Esconder tabela no mobile (hidden md:block)
- FAB: bottom-[calc(4rem+env(safe-area-inset-bottom)+16px)]
- Paginação com números
- Upload com label visível (não opacity-0)
- Search com spinner inline
- Export com fetch + blob + toast
```

#### 3.2.3 Orçamentos (`/orcamentos`) — Redesenhar Cards

```
ESTADO ATUAL: Cards sem hierarquia, progress bar inconsistente,
slider sem ticks, animação reseta em toda render

NOVO LAYOUT:
┌─────────────────────────────────────┐
│ [Seletor de Período ▼]              │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ ALIMENTAÇÃO                     │ │
│ │ R$ 850 / R$ 1.000               │ │
│ │ ████████████░░░░ 85%           │ │ ← barra Apple-style (4px)
│ │ ⚠️ Acima do esperado (+5%)      │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ TRANSPORTE                      │ │
│ │ R$ 200 / R$ 500                 │ │
│ │ ██████░░░░░░░░░░ 40%           │ │
│ │ ✓ Dentro do orçamento           │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘

AÇÕES:
- Progress bar Apple-style: thin (4px), rounded-full
- Cards com: categoria (H2), valor usado/total, barra, alerta
- Slider com tick marks + porcentagem ao vivo
- Animar com key={budget.id}
```

#### 3.2.4 Relatórios (`/relatorios`) — Compactar Gráficos

```
ESTADO ATUAL: Pie labels sobrepostos, bar chart labels truncados,
altura fixa 300px, sem print styles

AÇÕES:
- Pie: esconder labels no mobile, usar legenda externa
- Bar: nomes completos com rotação 45° ou tooltip
- Altura responsiva: 200px mobile, 300px desktop
- Print styles: esconder nav, texto preto
```

#### 3.2.5 Contas (`/contas`) — Touch Targets + Cores

```
AÇÕES:
- Botões: min 44px (remover sm:h-8)
- Cores suaves do design system (não bg-red-500 direto)
- Color picker com aria-label
- Empty state com componente shared
```

#### 3.2.6 Recorrências (`/recorrencias`) — Consertar Delete + Cards

```
AÇÕES:
- Adicionar onClick + handleDelete (bug crítico R-01/R-02)
- Transformar lista densa em cards com spacing 16px
- Ações em dropdown (não botões colados)
- Resetar form ao abrir dialog
- Toast após toggle pause/reativar
```

#### 3.2.7 Contas a Pagar (`/contas-a-pagar`) — Seções Visuais

```
AÇÕES:
- Headers com cor de fundo sutil por seção
- Badges de status coloridos (não double-red)
- Accordion: expandir a mais relevante por padrão
- Botão "Atualizar" com loading state
```

#### 3.2.8 Fechamento (`/fechamento`) — Período + Lista

```
AÇÕES:
- Botões de período: carrossel horizontal ou tabs
- Export com fetch + blob + toast
- Lista colapsável de transações abaixo do resumo
- "Mês anterior" em vez de "1 mês atrás"
```

#### 3.2.9 Fluxo de Caixa (`/fluxo-caixa`) — Substituir HTML Puro

```
AÇÕES:
- InvoiceManager: trocar TODOS <input className="border-gray-300"> por <Input> e <Select>
- Substituir alert() por useToast()
- Sticky submit bar no mobile
- WeeklyCashflow: trocar bg-gray-50/text-gray-900 por tokens
```

#### 3.2.10 Perfil (`/perfil`) — Remover reload()

```
AÇÕES:
- Substituir window.location.reload() por toast + re-fetch
- Toast sucesso/erro no save
- Ícone RefreshCw em vez de Trash2
- Avatar upload com error handling
- Microcopy "Email não pode ser alterado"
```

#### 3.2.11 Admin/Logs + Aprovações

```
AÇÕES:
- Logs: reduzir padding (sm:px-10 → px-4 lg:px-6)
- Logs: filtros dinâmicos da API
- Aprovações: useConfirm + loading + toast em approve/reject
- Aprovações: role check (P0 segurança)
```

#### 3.2.12 Login (`/login`) — Já refeito ✅

```
ESTADO: ✅ OK — Segue DESIGN_DIRECTION.md
- Background gradientes ambientais + grid pattern
- Card glassmorphism com backdrop-blur
- Inputs com ícones Mail/Lock e focus states
- Toggle visibilidade de senha
- Link "Esqueci minha senha"
- Estados de erro animados
- Botão primary com shadow
- Tipografia Manrope/Inter
- Mobile-first: touch targets 48px
```

---

## 4. REORGANIZAÇÃO DAS FEATURES

### 4.1 Navegação Mobile (Repensar)

```
PROBLEMA: 14 módulos, bottom nav só mostra 4 + "Mais"
SOLUÇÃO: Bottom Sheet Sheet-style (já parcialmente implementado em E1-T10)

NOVO BOTTOM NAV:
[Início] [Transações] [+] [Alertas] [Menu]

"Menu" abre um sheet com TODOS os módulos organizados em grupos:
- FINANCEIRO: Contas, Contas a Pagar, Fluxo de Caixa, Fechamento
- PLANEJAMENTO: Orçamentos, Recorrências
- ANÁLISE: Relatórios, Insights, Agentes IA
- CONTA: Perfil, Configurações
- ADMIN (se role=ADMIN): Logs, Aprovações
```

### 4.2 Agrupar Funcionalidades por Fluxo do Usuário

```
VISÃO GERAL (Início)
├── Dashboard (hero + resumo + gráfico)
└── SpendDecisionIndicator

MOVIMENTAÇÃO DE DINHEIRO (Transações)
├── Lista de transações com filtros
├── Criar/Editar transação (dialog)
├── OCR/Importar documento
└── Exportar dados

CONTROLE (Financeiro)
├── Contas (saldo por conta)
├── Contas a Pagar (pendências)
├── Fluxo de Caixa (projeção W1-W4)
└── Fechamento Mensal (resumo + export)

PLANEJAMENTO
├── Orçamentos (por categoria)
└── Recorrências (contas fixas)

INTELIGÊNCIA (IA)
├── Insights/PicoClaw
├── Agentes IA (cron)
└── Copiloto (chat RAG)

RELATÓRIOS & ALERTAS
├── Relatórios (gráficos)
└── Alertas (notificações)

ADMIN
├── Logs (auditoria)
└── Aprovações
```

---

## 5. DESIGN SYSTEM — CORREÇÕES URGENTES

### 5.1 Corrigir Base CSS (globals.css)

```css
/* JÁ EXISTE ✅ */
.glass-card {
  @apply bg-white/80 dark:bg-white/10 backdrop-blur-md 
         border border-white/20 dark:border-white/10 
         rounded-2xl shadow-lg;
}

/* JÁ EXISTE ✅ */
.apple-button-primary {
  @apply bg-primary text-on-primary rounded-xl font-semibold 
         inline-flex items-center justify-center gap-2 
         transition-all duration-300 
         hover:brightness-110 active:scale-[0.98];
}

/* PRECISA CRIAR/VERIFICAR ❌ */
--color-muted → definido mas precisa conferir se todos usam
--color-popover → definido
--color-ring → definido
--color-input → definido
--color-border → definido
```

### 5.2 Substituir Cores Hardcoded (77+ instâncias)

```bash
# Buscar e substituir sistematicamente:
bg-red-500    → bg-tertiary (ou variante destrutiva)
bg-amber-500  → bg-warning (novo token)
bg-emerald-500 → bg-success
bg-blue-500   → bg-primary/80 (quando for primary)
text-gray-900 → text-on-surface
bg-gray-50    → bg-surface
border-gray-200 → border-outline
```

### 5.3 Componentes Shadcn/UI Necessários

```
Componentes já existentes (wrapper custom):
- Button, Input, Select, Dialog, Card, Table
- Toast, EmptyState, Skeleton, Label
- ConfirmDialog, FilterChips, MoneyInput
- PageWrapper, LoadingButton, PageHeader

Componentes a adicionar via shadcn MCP:
- Accordion (para Contas a Pagar seções)
- Sheet (para "Mais" menu mobile)
- Command (para global search)
- Progress (para orçamentos)
- Badge (para status indicators)
- Tooltip (para ações com ícone)
- Tabs (para Fechamento períodos)
- ScrollArea (para listas longas)
- Avatar (para perfil)
- Separator (para dividers visuais)
```

---

## 6. PLANO DE EXECUÇÃO

### FASE 1: Fundação do Design System (2-3h)

```
E8-T1  → Definir token --color-muted
E8-T2  → Verificar glass-card dark mode
E8-T3  → Padronizar border-radius do Button (rounded-xl)
E8-T4  → Criar componente PageWrapper
E8-T5  → Criar componente LoadingButton
E8-T6  → Criar componente MoneyInput
E8-T9  → Auditar e remover CSS hardcoded (77+ instâncias)
```

### FASE 2: Correção de Bugs Críticos (2h)

```
E7-T26 → Delete recorrências (adicionar onClick + handleDelete)
E7-T30 → Filtro Contas a Pagar (corrigir lógica)
E7-T55 → Approve/Reject com confirmação e loading
E7-T8  → FAB safe-area position
E7-T7  → Esconder tabela no mobile
```

### FASE 3: Redesign Telas Principais (6-8h)

```
E7-T1  → Dashboard: Hero + 3 cards + alertas + gráfico
E7-T6  → Movimentações: form sections + filtro collapsado
E7-T14 → Orçamentos: cards Apple-style com progress bar
E7-T18 → Relatórios: gráficos responsivos sem overlap
```

### FASE 4: Consistência Visual (4-6h)

```
E7-T22 → Contas: touch targets 44px + cores suaves
E7-T27 → Recorrências: cards com spacing
E7-T31 → Contas a Pagar: headers visuais
E7-T35 → Fechamento: tabs para período
E7-T39 → Fluxo de Caixa: substituir HTML puro
E7-T43 → Perfil: remover reload
```

### FASE 5: Mobile Native Feel (3-4h)

```
E9-T1  → Pull-to-refresh em listas
E9-T2  → Swipe actions nos cards
E9-T4  → Skeleton loading em todas as páginas
E9-T6  → Keyboard-aware dialogs
```

### FASE 6: Acessibilidade + Performance (2-3h)

```
E10-T1 → Permitir zoom (remover user-scalable=false)
E10-T2 → Focus-visible ring global
E10-T4 → ARIA labels em ícones/botões
E10-T5 → Respeitar prefers-reduced-motion
```

### FASE 7: Testes + QA (2-3h)

```
E11-T1 → Screenshot test para todas as páginas (390x844 + 1280x800)
E11-T3 → E2E para fluxos críticos
E11-T5 → Teste de acessibilidade automatizado (axe-core)
```

---

## 7. ESTRUTURA DE ARQUIVOS (Pós-Redesign)

```
src/
├── app/
│   ├── page.tsx                    # Dashboard redesenhado
│   ├── movimentacoes/page.tsx      # Reorganizado
│   ├── contas/page.tsx             # Touch targets + cores
│   ├── contas-a-pagar/page.tsx     # Seções visuais
│   ├── orcamentos/page.tsx         # Cards Apple-style
│   ├── recorrencias/page.tsx       # Cards + delete fix
│   ├── fluxo-caixa/page.tsx        # Inputs design system
│   ├── fechamento/page.tsx         # Tabs de período
│   ├── relatorios/page.tsx         # Gráficos responsivos
│   ├── login/page.tsx              # ✅ Já refeito
│   └── ... (demais páginas)
│
├── components/
│   ├── ui/
│   │   ├── button.tsx              # ✅ Existe
│   │   ├── input.tsx               # ✅ Existe
│   │   ├── dialog.tsx              # ✅ Existe (swipe)
│   │   ├── toast.tsx               # ✅ Existe
│   │   ├── confirm-dialog.tsx      # ✅ Existe
│   │   ├── money-input.tsx         # ✅ Existe
│   │   ├── loading-button.tsx      # ✅ Existe
│   │   ├── page-wrapper.tsx        # ✅ Existe
│   │   ├── page-skeleton.tsx       # ✅ Existe
│   │   ├── empty-state.tsx         # ✅ Existe
│   │   ├── page-error-boundary.tsx # ✅ Existe
│   │   ├── filter-chips.tsx        # ✅ Existe
│   │   └── ...
│   ├── bottom-nav.tsx              # Refatorar
│   ├── sidebar.tsx                 # Refatorar
│   └── ... (demais componentes)
│
└── app/globals.css                 # Corrigido + tokens
```

---

## 8. MÉTRICAS DE SUCESSO

| Métrica | Antes | Depois |
|---------|-------|--------|
| Cores hardcoded | 77+ | 0 |
| `any` types | 104+ | <20 |
| `confirm()` nativo | 1 | 0 |
| `window.location.reload()` | 5 | 0 |
| APIs sem Zod | 34 | 0 |
| APIs sem rate limit | 43 | 0 |
| Páginas sem error boundary | 18 | 0 |
| Componentes sem ARIA | 15 | 0 |
| Touch targets <44px | Vários | 0 |
| Cobertura de testes | ~45% | 80%+ |
| Screenshots padronizados | 0 | Todas as páginas |
| Nota Lighthouse mobile | Desconhecido | 90+ |

---

## 9. PRÓXIMOS PASSOS

1. **Aprovar este plano** com o usuário
2. **FASE 1:** Executar E8-T1 a E8-T9 (Fundação Design System)
3. **FASE 2:** Executar correções críticas (bugs P0)
4. **FASE 3:** Redesign Dashboard → Movimentações → Orçamentos → Relatórios
5. **FASE 4-7:** Consistência → Mobile → A11y → Testes

**Cada tarefa deve:**
- Tirar screenshot "antes" via Playwright
- Implementar seguindo DESIGN_DIRECTION.md
- Validar mobile (390×844) + desktop (1280×800)
- Rode `npm run build && npm run type-check && npm run lint`
- Atualizar `docs/EXECUTION_LOG.md`

---

*Documento gerado com base em auditoria completa de 22 arquivos de documentação, 15 páginas de código, e testes via Playwright contra o site live.*
