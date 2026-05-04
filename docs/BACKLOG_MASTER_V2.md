# FlyDea Financial Manager — Backlog Mestre V2

> **Versão:** 2.0  
> **Data:** 2026-05-02  
> **Foco:** Sistema maduro, mobile-first, UX/UI premium, shadcn/ui  
> **Status:** Backlog anterior (E1-E6) concluído. Este é o backlog de maturidade.

---

## Legenda

| Status | Significado |
|--------|-------------|
| `pending` | Não iniciado |
| `in_progress` | Em execução |
| `blocked` | Bloqueado por dependência |
| `completed` | Feito e validado |

| Prioridade | Significado |
|------------|-------------|
| P0 | Crítico — bloqueante ou segurança |
| P1 | Alto — impacto direto na experiência |
| P2 | Médio — melhoria significativa |
| P3 | Baixo — polish e nice-to-have |

---

## 🎯 Visão de Maturidade

O sistema está **funcionalmente completo** (E1-E6) mas **visualmente inconsistente**.  
Este backlog leva o produto de "MVP polido" para **"SaaS Premium"**.

**Definição de Pronto:**
- Screenshot comparativo antes/depois salvo em `/docs/screenshots/`
- Mobile (390×844) validado via Playwright MCP
- Desktop (1280×800) validado
- Build passa (`npm run build`)
- Nenhum `any`, nenhuma cor hardcoded, nenhum `alert()` nativo

---

## 📱 Ferramentas Obrigatórias

| Ferramenta | Uso |
|------------|-----|
| **Playwright MCP** (`@playwright/mcp`) | Screenshots mobile/desktop, testes visuais |
| **shadcn MCP** (`shadcn@4.6.0 mcp`) | Adicionar/gerenciar componentes shadcn/ui |
| **Vercel MCP** (`@robinsonai/vercel-mcp`) | Deploy, logs, variáveis de ambiente |

---

## ÉPICO 7: REDESIGN VISUAL PREMIUM (Mobile-First)

> **Objetivo:** Aplicar `DESIGN_DIRECTION.md` em **todas** as telas internas.  
> **Login já está OK** (refeito em 2026-05-02).

### 7.1 Dashboard (Página Inicial)

| ID | Tipo | Problema | Ação | Pri | Compl | Status |
|----|------|----------|------|-----|-------|--------|
| E7-T1 | Design | Card "Saldo Geral" destoa dos outros, sem hierarquia hero | Criar hero section com saldo em display 32px, 3 cards de resumo abaixo, depois alertas, depois gráfico compacto | P0 | Média | pending |
| E7-T2 | Design | Gráfico sem label no eixo Y | Adicionar label "Receitas / Despesas (R$)" no eixo Y | P1 | Baixa | pending |
| E7-T3 | Design | Quick Actions cards decorativos | Transformar em ações reais: "+ Nova Transação" abre dialog, "Ver Relatório" linka | P1 | Baixa | pending |
| E7-T4 | UX | Sem indicador de frescor de dados | Adicionar "Atualizado às HH:MM" abaixo do header | P2 | Baixa | pending |
| E7-T5 | UX | 3 APIs carregam separadamente | Coordinar loading com Promise.all + skeleton único | P2 | Baixa | pending |

### 7.2 Movimentações

| ID | Tipo | Problema | Ação | Pri | Compl | Status |
|----|------|----------|------|-----|-------|--------|
| E7-T6 | Design | Formulário 12+ campos sem sections visuais | Agrupar em 3 sections com divider: "Dados Principais", "Valores e Datas", "Classificação e Status" | P0 | Média | pending |
| E7-T7 | Design | Tabela renderiza junto com cards no mobile | Esconder tabela `hidden md:block`, cards `md:hidden` | P0 | Baixa | pending |
| E7-T8 | Design | FAB em `bottom-24` pode sobrepor bottom nav | Usar `bottom-[calc(4rem+env(safe-area-inset-bottom)+16px)]` | P0 | Baixa | pending |
| E7-T9 | UX | Filtros ocupam 4 linhas verticais | Collapsar em 1 barra com botão "Filtros" que abre drawer | P1 | Média | pending |
| E7-T10 | UX | Paginação só prev/next | Adicionar números de página (1-5) com ellipsis | P2 | Baixa | pending |
| E7-T11 | UX | Export sem loading/error | Usar `fetch()` + blob download + toast loading/error | P2 | Média | pending |
| E7-T12 | UX | Search sem indicador de loading | Adicionar spinner inline no input durante busca | P2 | Baixa | pending |
| E7-T13 | Acessibilidade | Upload file com `opacity-0` | Usar `<label>` visível com `aria-label` adequado | P1 | Baixa | pending |

### 7.3 Orçamentos

| ID | Tipo | Problema | Ação | Pri | Compl | Status |
|----|------|----------|------|-----|-------|--------|
| E7-T14 | Design | Progress bar inconsistente | Criar progress bar Apple-style: thin (4px), rounded-full, cor sutil | P1 | Média | pending |
| E7-T15 | Design | Cards sem hierarquia clara | Redesenhar cards com: categoria (H2), valor usado/total, progress bar, alerta visual sutil | P1 | Baixa | pending |
| E7-T16 | UX | Slider sem ticks ou labels | Adicionar tick marks e porcentagem ao vivo no thumb | P2 | Baixa | pending |
| E7-T17 | UX | Animação de barra reseta em toda render | Adicionar `key={budget.id}` e respeitar `prefers-reduced-motion` | P2 | Baixa | pending |

### 7.4 Relatórios

| ID | Tipo | Problema | Ação | Pri | Compl | Status |
|----|------|----------|------|-----|-------|--------|
| E7-T18 | Design | Pie labels sobrepostos no mobile | Esconder labels no mobile; usar legenda externa com porcentagem | P1 | Média | pending |
| E7-T19 | Design | Bar chart labels truncados em 10 chars | Usar nomes completos com rotação 45° ou tooltip rico | P1 | Baixa | pending |
| E7-T20 | Design | Charts fixos em 300px de altura | Altura responsiva: 200px mobile, 300px desktop | P1 | Baixa | pending |
| E7-T21 | UX | `window.print()` sem estilos | Adicionar `@media print` em globals.css (esconde nav, texto preto) | P2 | Baixa | pending |

### 7.5 Contas

| ID | Tipo | Problema | Ação | Pri | Compl | Status |
|----|------|----------|------|-----|-------|--------|
| E7-T22 | Design | Botões de ação pequenos (`sm:h-8`) | Mínimo 44px em todos os viewports, remover `sm:h-8` | P1 | Baixa | pending |
| E7-T23 | Design | Cores duras nos cards | Usar cores suaves do design system, adicionar visual de archive | P1 | Baixa | pending |
| E7-T24 | UX | Color picker sem labels acessíveis | Adicionar `aria-label={`Selecionar cor ${color}`}` | P2 | Baixa | pending |
| E7-T25 | UX | Sem empty state component | Usar `<EmptyState icon={Wallet} ... />` | P2 | Baixa | pending |

### 7.6 Recorrências

| ID | Tipo | Problema | Ação | Pri | Compl | Status |
|----|------|----------|------|-----|-------|--------|
| E7-T26 | Bug | Delete button SEM `onClick` | Adicionar `onClick={() => handleDelete(rec.id)}` + API call | P0 | Baixa | pending |
| E7-T27 | Design | Lista densa, botões colados | Transformar em cards individuais com spacing 16px, ações em dropdown | P1 | Média | pending |
| E7-T28 | UX | Dialog mantém valores ao reabrir | Resetar form ao abrir: `onOpenChange={(v) => { if (v) resetForm(); }}` | P2 | Baixa | pending |
| E7-T29 | UX | Toggle pause sem toast | Adicionar `useToast().success()` após toggle | P2 | Baixa | pending |

### 7.7 Contas a Pagar

| ID | Tipo | Problema | Ação | Pri | Compl | Status |
|----|------|----------|------|-----|-------|--------|
| E7-T30 | Bug | Filtro não filtra de verdade | Corrigir lógica: quando "overdue", mostrar SÓ seção de atrasadas | P0 | Baixa | pending |
| E7-T31 | Design | Seções sem diferenciação visual | Headers com cor de fundo sutil, badges de status coloridos | P1 | Baixa | pending |
| E7-T32 | UX | Marcar como pago sem confirmação | Adicionar `useConfirm()` antes de marcar como pago | P1 | Baixa | pending |
| E7-T33 | UX | 3 seções sempre expandidas | Adicionar accordion; expandir a mais relevante por padrão | P2 | Baixa | pending |
| E7-T34 | UX | Botão "Atualizar" sem loading | Adicionar estado `loading` e desabilitar durante fetch | P2 | Baixa | pending |

### 7.8 Fechamento

| ID | Tipo | Problema | Ação | Pri | Compl | Status |
|----|------|----------|------|-----|-------|--------|
| E7-T35 | Design | Botões de período overflow no mobile | Converter em carrossel horizontal com snap ou dropdown/select | P1 | Média | pending |
| E7-T36 | UX | Export sem loading/error | Usar `fetch()` + blob download + toast loading/error | P2 | Média | pending |
| E7-T37 | UX | Sem lista de transações | Adicionar lista colapsável abaixo de cada card de resumo | P2 | Média | pending |
| E7-T38 | Microcopy | "1 mês atrás" gramaticalmente incorreto | Alterar para "Mês anterior" quando p=1 | P3 | Baixa | pending |

### 7.9 Fluxo de Caixa

| ID | Tipo | Problema | Ação | Pri | Compl | Status |
|----|------|----------|------|-----|-------|--------|
| E7-T39 | Design | InvoiceManager usa inputs HTML puros | Substituir TODOS os `<input className="border border-gray-300">` por `<Input>` e `<Select>` do design system | P1 | Média | pending |
| E7-T40 | UX | `alert()` nativo para sucesso/erro | Substituir por `useToast().success()` e `.error()` | P1 | Baixa | pending |
| E7-T41 | UX | Form muito longo no mobile sem sticky submit | Adicionar barra sticky no bottom com botão submit | P2 | Baixa | pending |
| E7-T42 | Design | WeeklyCashflow com cores hardcoded gray | Substituir `bg-gray-50`, `text-gray-900` por tokens do design system | P1 | Baixa | pending |

### 7.10 Perfil

| ID | Tipo | Problema | Ação | Pri | Compl | Status |
|----|------|----------|------|-----|-------|--------|
| E7-T43 | UX | `window.location.reload()` ao salvar | Substituir por toast + re-fetch sem reload | P1 | Baixa | pending |
| E7-T44 | UX | Sem feedback de sucesso/erro no save | Adicionar `useToast().success("Perfil salvo!")` | P1 | Baixa | pending |
| E7-T45 | UX | Ícone Trash2 no botão "Recarregar" | Substituir por `<RefreshCw />` | P2 | Baixa | pending |
| E7-T46 | UX | Avatar upload sem error handling | Adicionar catch block com toast error | P2 | Baixa | pending |
| E7-T47 | UX | Email disabled sem explicação | Adicionar microcopy "Email não pode ser alterado" | P3 | Baixa | pending |

### 7.11 Alertas

| ID | Tipo | Problema | Ação | Pri | Compl | Status |
|----|------|----------|------|-----|-------|--------|
| E7-T48 | Performance | Mark all read dispara N requests | Criar endpoint `PATCH /api/notifications/mark-all` | P2 | Média | pending |
| E7-T49 | UX | Delete sem undo/confirm | Adicionar `useConfirm()` ou undo toast de 5s | P2 | Baixa | pending |
| E7-T50 | UX | Search sem debounce | Adicionar 200ms debounce no search | P3 | Baixa | pending |

### 7.12 Página "Mais"

| ID | Tipo | Problema | Ação | Pri | Compl | Status |
|----|------|----------|------|-----|-------|--------|
| E7-T51 | UX | Cards têm botão "Abrir" mas card não é clicável | Transformar card inteiro em `<Link>` ou `onClick` | P2 | Baixa | pending |
| E7-T52 | Design | Todos os ícones com mesma cor | Usar cores distintas por módulo (match sidebar colors) | P3 | Baixa | pending |

### 7.13 Admin / Logs

| ID | Tipo | Problema | Ação | Pri | Compl | Status |
|----|------|----------|------|-----|-------|--------|
| E7-T53 | Design | Cells com `sm:px-10` muito largo | Reduzir para `px-4 lg:px-6` | P2 | Baixa | pending |
| E7-T54 | UX | Filtros hardcoded | Buscar ações/entidades únicas da API para opções dinâmicas | P3 | Média | pending |

### 7.14 Admin / Aprovações

| ID | Tipo | Problema | Ação | Pri | Compl | Status |
|----|------|----------|------|-----|-------|--------|
| E7-T55 | UX | Approve/Reject sem loading/confirm | Adicionar `useConfirm()` + loading state + toast error | P0 | Média | pending |
| E7-T56 | Design | Sem empty state | Adicionar `<EmptyState icon={ShieldCheck} ... />` | P2 | Baixa | pending |
| E7-T57 | UX | Sem data de criação nos cards | Adicionar `createdAt` formatado em cada card | P3 | Baixa | pending |

---

## ÉPICO 8: DESIGN SYSTEM + SHADCN/UI MATURIDADE

> **Objetivo:** Sistema de componentes robusto, documentado, sem duplicação.  
> **Ferramenta:** `npx -y shadcn@4.6.0 mcp` para adicionar/gerenciar componentes.

| ID | Tipo | Título | Descrição | Pri | Compl | Status |
|----|------|--------|-----------|-----|-------|--------|
| E8-T1 | DS | Criar token `bg-muted` no tema | Adicionar `--color-muted: #E5E5EA` ou mapear para `bg-surface-variant` | P0 | Baixa | pending |
| E8-T2 | DS | Definir `.glass-card` em globals.css | `backdrop-blur-md bg-white/80 border-white/20 shadow-lg` | P0 | Baixa | pending |
| E8-T3 | DS | Padronizar border-radius do Button | Default `rounded-xl` (12px) ao invés de `rounded-full` | P1 | Baixa | pending |
| E8-T4 | DS | Criar componente `PageWrapper` | Padding consistente, max-width, spacing tokens em todas as páginas | P1 | Média | pending |
| E8-T5 | DS | Criar componente `LoadingButton` | `<LoadingButton loading={saving}>Salvar</LoadingButton>` | P1 | Baixa | pending |
| E8-T6 | DS | Criar componente `MoneyInput` | Formatação BRL `R$ 1.000,00` com Intl.NumberFormat | P1 | Média | pending |
| E8-T7 | DS | Criar componente `FilterChips` | Usar tokens do design system, não hardcoded | P2 | Baixa | pending |
| E8-T8 | DS | Documentar todos os componentes | Criar `docs/DESIGN_SYSTEM.md` com lista de componentes, props, exemplos | P2 | Baixa | pending |
| E8-T9 | DS | Auditar e remover CSS hardcoded | Buscar `gray-`, `red-500`, `amber-500` e substituir por tokens | P1 | Média | pending |

---

## ÉPICO 9: MOBILE INTERACTIONS AVANÇADAS

> **Objetivo:** O app deve **sentir-se nativo** no iPhone 16.

| ID | Tipo | Título | Descrição | Pri | Compl | Status |
|----|------|--------|-----------|-----|-------|--------|
| E9-T1 | Interação | Pull-to-refresh em listas | Dashboard, Movimentações, Contas a Pagar | P1 | Alta | pending |
| E9-T2 | Interação | Swipe actions nos cards | Swipe left: editar. Swipe right: deletar (com confirmação) | P2 | Alta | pending |
| E9-T3 | Interação | Haptic feedback em ações críticas | Usar `navigator.vibrate(50)` ou Vibration API | P3 | Baixa | pending |
| E9-T4 | Interação | Skeleton loading em todas as páginas | Substituir spinners por skeletons estruturais | P1 | Média | pending |
| E9-T5 | Interação | Bottom sheet para ações rápidas | Dashboard: "+ Nova Transação" abre sheet em vez de navegar | P2 | Média | pending |
| E9-T6 | Interação | Keyboard-aware dialogs | Submit button sticky no mobile quando teclado abre | P0 | Média | pending |
| E9-T7 | Interação | Scroll-to-top no header tap | Tap no header volta ao topo (padrão iOS) | P3 | Baixa | pending |

---

## ÉPICO 10: PERFORMANCE E ACESSIBILIDADE

> **Objetivo:** Lighthouse 90+ em todas as categorias.

| ID | Tipo | Título | Descrição | Pri | Compl | Status |
|----|------|--------|-----------|-----|-------|--------|
| E10-T1 | A11y | Remover `user-scalable=false` | Permitir zoom (WCAG 2.1 AA) | P0 | Baixa | pending |
| E10-T2 | A11y | Focus-visible ring global | `*:focus-visible:ring-2 ring-secondary ring-offset-2` | P0 | Baixa | pending |
| E10-T3 | A11y | Skip-to-content link | `<a href="#main">` como primeiro elemento no layout | P2 | Baixa | pending |
| E10-T4 | A11y | ARIA labels em todos os ícones/buttons | Sem ícones sem `aria-label` ou `aria-hidden` | P1 | Média | pending |
| E10-T5 | A11y | Respeitar `prefers-reduced-motion` | Desabilitar animações para usuários que preferem | P1 | Baixa | pending |
| E10-T6 | Perf | Lazy loading de gráficos | `next/dynamic` para Recharts em todas as páginas | P2 | Baixa | pending |
| E10-T7 | Perf | Otimizar imagens | Usar `next/image` com sizes e placeholder="blur" | P2 | Baixa | pending |
| E10-T8 | Perf | Bundle audit | Rodar `npx @next/bundle-analyzer` e reduzir chunks > 200KB | P3 | Média | pending |

---

## ÉPICO 11: TESTES VISUAIS E E2E

> **Objetivo:** Nenhuma regressão visual passa despercebida.

| ID | Tipo | Título | Descrição | Pri | Compl | Status |
|----|------|--------|-----------|-----|-------|--------|
| E11-T1 | Teste | Screenshot test para todas as páginas | Script Playwright que fotografa todas as rotas em 390×844 e 1280×800 | P1 | Média | pending |
| E11-T2 | Teste | Visual regression baseline | Salvar screenshots baseline em `/tests/baseline/` | P2 | Alta | pending |
| E11-T3 | Teste | E2E para fluxos críticos | Login → Dashboard → Criar Transação → Ver Relatório → Logout | P1 | Alta | pending |
| E11-T4 | Teste | Cobertura de testes unitários 80%+ | Foco em `financial-engine.ts`, `export-helpers.ts` | P2 | Alta | pending |
| E11-T5 | Teste | Teste de acessibilidade automatizado | Rodar `axe-core` em todas as páginas via Playwright | P2 | Média | pending |

---

## ÉPICO 12: FEATURES DE MATURIDADE (P3)

> **Objetivo:** Diferenciais SaaS enterprise.

| ID | Tipo | Título | Descrição | Pri | Compl | Status |
|----|------|--------|-----------|-----|-------|--------|
| E12-T1 | Feature | Bank reconciliation (E5-T1 pendente) | Integração com Open Finance / OFX import | P3 | Alta | pending |
| E12-T2 | Feature | LLM Copilot (E5-T7 pendente) | Substituir heurística por LLM real (OpenAI/Claude) | P3 | Alta | pending |
| E12-T3 | Feature | Dark mode refinado | Aplicar `#0A0A0B` como fundo escuro, não roxo-acinzentado | P2 | Média | pending |
| E12-T4 | Feature | PWA completo | Service worker, offline mode, add-to-homescreen | P2 | Alta | pending |
| E12-T5 | Feature | Push notifications | Notificações nativas para alertas de orçamento | P3 | Alta | pending |

---

## 📊 Resumo por Prioridade

| Prioridade | Qtd | Épicos |
|------------|-----|--------|
| P0 | 10 | E7-T1, E7-T6, E7-T7, E7-T8, E7-T26, E7-T30, E7-T55, E8-T1, E8-T2, E9-T6 |
| P1 | 28 | E7-T2, E7-T3, E7-T9, E7-T13, E7-T14, E7-T15, E7-T18, E7-T19, E7-T20, E7-T22, E7-T23, E7-T27, E7-T31, E7-T32, E7-T35, E7-T39, E7-T40, E7-T42, E7-T43, E7-T44, E8-T3, E8-T4, E8-T5, E8-T6, E9-T1, E9-T4, E10-T4, E11-T1, E11-T3 |
| P2 | 24 | E7-T4, E7-T5, E7-T10, E7-T11, E7-T12, E7-T16, E7-T17, E7-T24, E7-T25, E7-T28, E7-T29, E7-T33, E7-T34, E7-T36, E7-T37, E7-T38, E7-T41, E7-T45, E7-T46, E7-T48, E7-T49, E7-T51, E7-T53, E8-T7, E9-T2, E9-T5, E10-T2, E10-T3, E10-T6, E10-T7, E11-T5 |
| P3 | 12 | E7-T47, E7-T50, E7-T52, E7-T54, E7-T56, E7-T57, E8-T8, E9-T3, E9-T7, E10-T8, E12-T1, E12-T2, E12-T5 |

**Total: ~74 tarefas**

---

## 🚀 Ordem de Execução Recomendada

### Fase 1: Fundação (Semana 1)
1. E8-T1, E8-T2 — Tokens CSS faltantes
2. E8-T3 — Button radius padrão
3. E8-T9 — Auditar cores hardcoded

### Fase 2: Telas Críticas (Semana 2-3)
4. E7-T1 a E7-T5 — Dashboard
5. E7-T6 a E7-T13 — Movimentações
6. E7-T30 a E7-T34 — Contas a Pagar

### Fase 3: Consistência (Semana 4)
7. E7-T14 a E7-T57 — Todas as telas restantes
8. E8-T4 a E8-T8 — Componentes compartilhados

### Fase 4: Interações (Semana 5)
9. E9-T1 a E9-T7 — Mobile native feel
10. E10-T1 a E10-T8 — A11y + Performance

### Fase 5: Qualidade (Semana 6)
11. E11-T1 a E11-T5 — Testes
12. E12-T3 a E12-T5 — Features de maturidade

---

## 📝 Como Usar Este Backlog

1. **Sempre** ler `docs/BACKLOG_DETAILED/E{ID}.md` antes de executar
2. **Sempre** tirar screenshot "antes" via Playwright MCP
3. **Sempre** seguir `DESIGN_DIRECTION.md` para decisões visuais
4. **Sempre** usar shadcn MCP para adicionar componentes: `npx -y shadcn@4.6.0 mcp`
5. **Sempre** validar mobile (390×844) antes de desktop
6. **Sempre** atualizar `docs/EXECUTION_LOG.md` e este arquivo

---

*Última atualização: 2026-05-02 — Versão 2.0*
