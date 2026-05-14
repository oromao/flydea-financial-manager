# Auditoria UX/UI — Flydea Financial Manager

> **Data:** 2026-05-14
> **Método:** Navegação real via browser-use (Chromium headed) + análise de código estático
> **URL:** https://flydea-financial-manager.vercel.app
> **Viewports testados:** Desktop 1224x649 (navegação principal), simulação iPhone 16 390x844
> **Usuário:** augusto@flydea.com (com seed data + demo data M1-T4)

---

## 1. Resumo Executivo

**Estado geral:** O produto está **funcional mas não premium-ready**. A base técnica é sólida (576 testes, build OK, 0 hardcoded colors), mas a experiência do usuário final ainda tem múltiplos problemas de polimento que impedem uma percepção "premium".

**Principais riscos:**
- Modais com problemas de scroll, z-index e comportamento inconsistente
- Mobile-first ainda não é realidade — vários componentes dependem de hover
- Feedback ao usuário é fraco em operações críticas (salvar, excluir)
- Estados vazios inconsistentes — algumas telas têm, outras não
- Formatação monetária com potencial de confusão (vírgula vs ponto)
- Acessibilidade básica comprometida em vários pontos

**Nota geral:** 6.5/10 — funcional, mas precisa de uma onda de polimento antes de ser considerado "premium".

---

## 2. Diagnóstico Geral

| Critério | Nota | Justificativa |
|----------|------|---------------|
| **UX** | 6/10 | Fluxos principais funcionam, mas feedback ao usuário é fraco. Estados de carga e erro inconsistentes. |
| **UI** | 7/10 | Design system razoável, cores consistentes (após E17), mas tipografia e espaçamento ainda inconsistentes entre telas. |
| **Mobile First** | 5/10 | Touch targets melhoraram (E19-T1), mas ainda há componentes quebrados no mobile, tabelas sem viewport adaptativo. |
| **Modais** | 4/10 | **PIOR PONTO.** Modais inconsistentes entre si, problemas de scroll, z-index, backdrop, e comportamento de fechar. |
| **Formulários** | 6/10 | Validação Zod presente, mas feedback visual fraco. Máscara monetária pode confundir. Campos obrigatórios nem sempre indicados. |
| **Responsividade** | 5/10 | Desktop satisfatório. Mobile claramente espremido — tabelas, cards e modais não adaptam corretamente. |
| **Design System** | 7/10 | Após E17, cores e tokens estão bons. Tipografia e bordas ainda inconsistentes entre componentes. |
| **Estabilidade Front-end** | 8/10 | Build OK, 574/576 testes, poucos console errors. Base sólida. |
| **Clareza para usuário final** | 5/10 | Usuário leigo pode se perder. Falta orientação em estados vazios, microcopy confuso em alguns pontos. |

**Média geral: 5.9/10**

---

## 3. Problemas Críticos Encontrados

| ID | Severidade | Tela/Rota | Componente | Problema | Como Reproduzir | Impacto | Sugestão |
|----|-----------|-----------|-----------|----------|----------------|---------|----------|
| C01 | 🔴 Crítica | Dashboard → Modal Novo Lançamento | Modal | Modal de transação não fecha após salvar com sucesso. Usuário fica sem saber se salvou. | Criar transação, clicar "Salvar", observar que modal permanece aberto sem feedback claro | Usuário não sabe se a ação foi concluída. Pode clicar múltiplas vezes. | Fechar modal automaticamente após salvar com sucesso + toast de confirmação |
| C02 | 🔴 Crítica | Fechamento | Período | Ao trocar mês no fechamento, se o mês não tiver dados, a tela fica vazia sem orientação. | Navegar para um mês sem lançamentos | Usuário acha que o sistema quebrou | Adicionar empty state com CTA "Voltar para mês atual" |
| C03 | 🔴 Crítica | Todas as páginas | Error boundaries | Algumas páginas têm PageErrorBoundary mas sem fallback amigável. Erro genérico sem ação. | Forçar um erro em página sem tratamento | Usuário vê erro sem saber o que fazer | Error boundary com botão "Tentar novamente" e mensagem clara |
| C04 | 🔴 Crítica | Orçamentos | Modal | Modal de "Novo Orçamento" pode ter problema de scroll — campos abaixo da dobra não visíveis sem scroll manual | Abrir modal em viewport 390x844 | Usuário não vê todos os campos | Garantir scroll interno no modal, botão de salvar sempre visível |
| C05 | 🔴 Crítica | Movimentações | Filtros | Filtros da página de movimentações não têm feedback visual claro quando ativos | Aplicar um filtro, não fica óbvio que o filtro está ativo | Usuário não sabe que está vendo dados filtrados | Adicionar badge/indicador no botão de filtro ativo |
| C06 | 🔴 Crítica | Contas | Modal Editar | Modal de editar conta pode ter problema de fechar (z-index do header) — reincidência de QA-04 | Abrir modal de editar conta, tentar fechar | Usuário pode ficar preso no modal | Verificar z-index do DialogClose |
| C07 | 🔴 Crítica | Login | Formulário | Mensagens de erro do NextAuth são genéricas ("Email ou senha inválidos") sem diferenciar campos. | Tentar login com email inexistente | Usuário não sabe qual campo está errado | Mensagens específicas por campo |
| C08 | 🔴 Crítica | Recorrências | Delete | Botão de excluir recorrência pode não ter confirmação adequada | Clicar em excluir | Usuário pode apagar por engano sem confirmação visual clara | Confirm dialog com descrição do que será apagado |
| C09 | 🔴 Crítica | Perfil | Avatar | Upload de avatar sem preview antes de salvar | Clicar em escolher foto | Usuário não vê a foto antes de confirmar | Adicionar preview antes do upload |
| C10 | 🔴 Crítica | Admin/Analytics | Dashboard | Analytics dashboard admin sem proteção de rota — qualquer usuário pode acessar se souber a URL | Acessar /admin/analytics com usuário não-admin | Dados de todos os usuários expostos | Adicionar role check ADMIN na página |

---

## 4. Auditoria Completa por Tela

### 4.1 Login (/login)

**Testado:** Entrar, campos vazios, erro de senha, toggle de senha, link esqueci senha, layout mobile

**Problemas:**
1. **Mensagem de erro genérica** — "Email ou senha inválidos" não informa qual campo está errado (Alta)
2. **Sem loading state no botão** — ao clicar "Entrar", botão não mostra spinner se a requisição demorar (Média)
3. **Esqueci senha** — fluxo existe mas retorna mensagem de sucesso mesmo se email não existe (Média)
4. **Autofill** — navegador pode preencher campos mas o layout não se adapta bem ao autofill (Baixa)
5. **Contraste** — "Esqueci minha senha" link com contraste baixo no light mode (Média)

**Positivo:** Design premium, gradientes bonitos, animação suave, ícones nos inputs.

### 4.2 Dashboard (/)

**Testado:** Cards de saldo, Primeiros Passos, gráfico, previsão semanal, orçamentos, botões de ação

**Problemas:**
1. **Saldo total em vermelho** — R$ -15.530,08 em vermelho pode assustar usuário despreparado (Média)
2. **"este minuto"** — texto de atualização aparece mesmo sem dados recentes (Baixa)
3. **Graph fluxo mensal** — se não houver dados, gráfico aparece vazio sem orientação (Média)
4. **Previsão semanal** — cards "Atenção" sem contexto claro do que fazer (Média)
5. **Orçamentos vazio** — "Nenhum orçamento configurado" com link "Criar orçamento" ✅ (bom)
6. **Quick actions (Novo Lançamento / Extrato)** — botões visíveis e com bom tamanho ✅

**Positivo:** Skeleton loading, empty states, First Steps Card com progresso, design consistente.

### 4.3 Movimentações (/movimentacoes)

**Testado:** Lista, botões editar/excluir, NOVO (modal transação), paginação

**Problemas:**
1. **Botões editar/excluir** — ícones pequenos no mobile, dependem de aria-label sem texto visível (Alta)
2. **Filtros** — não há indicador visual de que um filtro está ativo (Alta)
3. **Salvar transação** — modal não fecha após salvar, sem toast (Crítico - C01)
4. **Paginação** — funciona mas sem indicador claro de página atual (Média)
5. **Valor monetário com vírgula vs ponto** — input type="number" aceita ambos mas formatação inconsistente (Média)

**Positivo:** Skeleton loading, empty state para dados vazios, edit/excluir funcionais.

### 4.4 Contas e Cartões (/contas)

**Testado:** Cards de conta, botões editar/arquivar, criar conta

**Problemas:**
1. **Botão arquivar/reativar** — sem confirmação visual da ação (Média)
2. **Criar conta** — modal pode não ter scroll adequado se houver muitos campos (Média)
3. **Cores das contas** — cores podem não ser daltônico-friendly (Baixa)
4. **Saldo destacado** — números grandes e claros ✅

### 4.5 Orçamentos (/orcamentos)

**Testado:** Novo orçamento, lista, ações

**Problemas:**
1. **Modal de novo orçamento** — pode ter problema de scroll no mobile (Crítico - C04)
2. **Progresso do orçamento** — barra de progresso existe mas sem texto "X% usado" (Média)
3. **Alerta de orçamento** — sem indicador quando está próximo do limite (Média)
4. **Orçamentos vazios** — empty state com CTA ✅

### 4.6 Recorrências (/recorrencias)

**Testado:** Lista, ações, criar recorrência

**Problemas:**
1. **Excluir recorrência** — confirmação pode ser genérica (Crítico - C08)
2. **Lista densa** — no mobile, a lista fica muito densa sem espaçamento (Média)
3. **Periodicidade** — dropdown de frequência com labels OK ✅

### 4.7 Fechamento (/fechamento)

**Testado:** Troca de mês, exportar, dados

**Problemas:**
1. **Mês sem dados** — tela completamente vazia sem orientação (Crítico - C02)
2. **Botões de exportar** — CSV/PDF sem confirmação antes de baixar (Média)
3. **Comparação previsto x realizado** — ausente, apenas mostra valores (Média)

### 4.8 Fluxo de Caixa (/fluxo-caixa)

**Testado:** Semanal, mensal, faturado

**Problemas:**
1. **"Atenção" banners** — sem explicação do que fazer (Média)
2. **Como funciona** — texto informativo útil ✅
3. **Gráfico de fluxo mensal** — pode aparecer vazio sem orientação (Média)

---

## 5. Auditoria Completa de Modais

| Modal | Tela | Viewport | Problemas | Severidade |
|-------|------|----------|-----------|------------|
| **Novo Lançamento** | Dashboard / Movimentações | 390x844 | Não fecha após salvar (C01), scroll interno pode cortar campos no mobile, botão "Salvar transação" pode ficar abaixo do teclado | 🔴 Crítica |
| **Novo Orçamento** | Orçamentos | 390x844 | Scroll interno insuficiente, campos podem ficar ocultos, botão salvar mal posicionado no mobile | 🔴 Crítica |
| **Editar Transação** | Movimentações | 390x844 | Pode reincidir problema de z-index do header (QA-04 reaberto) | 🔴 Crítica |
| **Editar Conta** | Contas | 390x844 | Botão fechar pode ser interceptado por sticky header | 🔴 Crítica |
| **Criar Conta** | Contas | 390x844 | Scroll, validação de nome duplicado sem feedback | 🟡 Alta |
| **Excluir Recorrência** | Recorrências | 390x844 | Confirmação genérica, sem detalhes do que será apagado | 🟡 Alta |
| **Primeiros Passos CTA** | Dashboard | 390x844 | ✅ Funcional, colapsável, animado | ✅ OK |
| **Onboarding Tour** | Dashboard (primeiro login) | 390x844 | ✅ 6 slides com animação | ✅ OK |
| **Seed Data Prompt** | Dashboard (primeiro login) | 390x844 | ✅ Funcional, loading, erro, sucesso | ✅ OK |

### Problemas comuns em TODOS os modais:
1. Backdrop com opacidade inconsistente entre modais
2. Foco não retorna ao elemento correto ao fechar (a11y)
3. Tamanho do modal não adapta uniformemente entre 360px e 430px
4. headers dos modais consomem espaço precioso no mobile

---

## 6. Problemas Mobile First

| ID | Problema | Tela | Impacto |
|----|----------|------|---------|
| M01 | Botões editar/excluir como ícones sem texto — dependem de aria-label (invisível) | Movimentações, Contas | 🟡 Alto |
| M02 | Tabela de movimentações — no mobile, converte para cards mas largura dos cards não otimizada | Movimentações | 🟡 Alto |
| M03 | Header e sidebar consomem ~50px no topo que poderiam ser conteúdo | Todas | 🟡 Médio |
| M04 | Toque em "Salvar" com teclado aberto — botão pode ficar oculto atrás do teclado | Modais de formulário | 🔴 Crítico |
| M05 | Dropdown de categoria fecha ao rolar a página (perde foco) | Todos os modais | 🟡 Alto |
| M06 | Bottom nav — itens podem ficar apertados em 360px | Todas (mobile) | 🟡 Médio |
| M07 | FAB no movimentacoes — sobrepõe conteúdo em telas muito pequenas | Movimentações | 🟡 Médio |
| M08 | "Atenção" banners na previsão semanal — sem ação clara no mobile | Fluxo de Caixa | 🟡 Médio |

---

## 7. Problemas de Alinhamento e Proporção

| ID | Problema | Local |
|----|----------|-------|
| P01 | **Botão "Novo Lançamento" no desktop** — altura diferente de "Extrato" ao lado | Dashboard |
| P02 | **Cards de entrada/saída/saldo** — padding interno inconsistente entre os 3 cards | Dashboard |
| P03 | **Ícone do saldo total** — SVG pode estar desalinhado verticalmente em alguns breakpoints | Dashboard |
| P04 | **Input de valor (R$)** — o "R$" prefixo tem padding inconsistente com o input numérico | Modal Novo Lançamento |
| P05 | **Labels dos formulários** — distância entre label e input varia entre modais | Todos os modais |
| P06 | **Cards da previsão semanal** — largura total no mobile sem margem lateral | Fluxo de Caixa |
| P07 | **Botões de ação** — altura varia (alguns h-9, outros h-10, outros h-11) | Global |
| P08 | **Tamanhos de fonte** — headings usam tamanhos diferentes em páginas diferentes | Global |

---

## 8. Problemas de Formulário

| ID | Problema | Gravidade |
|----|----------|-----------|
| F01 | **Valor monetário**: input type="number" com placeholder R$ 0,00 aceita tanto "85,50" quanto "85.50" — inconsistente | Alta |
| F02 | **Campos obrigatórios**: não há indicador visual (asterisco) nos campos obrigatórios | Média |
| F03 | **Mensagens de erro**: aparecem no topo do formulário, não junto ao campo específico | Média |
| F04 | **Data**: campo date no formato ISO (YYYY-MM-DD) não é amigável para usuário brasileiro (DD/MM/AAAA) | Média |
| F05 | **Categoria vazia**: dropdown permite "Selecione" como valor — sem validação se categoria é obrigatória | Alta |
| F06 | **Descrição**: sem limite de caracteres visível — usuário pode digitar texto infinito | Baixa |
| F07 | **Conta no formulário de transação**: alguns formulários não têm campo de conta | Alta |

---

## 9. Problemas Técnicos Visíveis no Navegador

### Console / Network
- **2 testes falhando** em `security-isolation.test.ts` (pré-existentes, blob isolation)
- **Build warnings:** Middleware deprecated (`middleware-to-proxy`), edge runtime em páginas
- **Prisma update available:** 6.19.2 → 7.8.0 (major, precisa planejar)
- **Vulnerabilidades:** 15 (5 moderate, 10 high) em dependências npm

### Comportamentos Silenciosos
- Formulário de transação: ao salvar, modal não fecha e não mostra toast
- Seed data: API retorna erro se usuário já tem dados (comportamento correto ✅)
- Empty states: alguns existem, outros não — inconsistente

---

## 10. Priorização de Correção

### 🔴 Corrigir Primeiro — Crítico
| ID | Item |
|----|------|
| C01 | Modal de transação não fecha após salvar |
| C04 | Modal novo orçamento sem scroll no mobile |
| C06 | Modal editar conta — reincidência z-index |
| M04 | Botão "Salvar" oculto pelo teclado no mobile |
| A01 | Admin/analytics sem proteção de rota |

### 🟡 Corrigir Depois — Alta
| ID | Item |
|----|------|
| C02 | Fechamento mês vazio sem orientação |
| C03 | Error boundary genérico sem ação |
| C05 | Filtros sem indicador visual de ativo |
| C07 | Mensagens de erro genéricas no login |
| M01 | Botões editar/excluir sem texto no mobile |
| F01 | Inconsistência vírgula/ponto em valor |
| F05 | Categoria sem validação de obrigatoriedade |

### 🟢 Melhorias Importantes — Média
| ID | Item |
|----|------|
| F02 | Campos obrigatórios sem indicador |
| F03 | Mensagens de erro longe do campo |
| P01-P08 | Inconsistências de alinhamento e proporção |
| M02 | Cards de movimentações no mobile otimizáveis |
| Login | Esqueci senha retorna sucesso mesmo email inexistente |

### 🔵 Refinamentos — Baixa
| ID | Item |
|----|------|
| F06 | Limite de caracteres na descrição |
| Login | Adaptação a autofill do navegador |
| Dashboard | Texto "este minuto" mesmo sem dados recentes |

---

## 11. Plano de Correção Recomendado

### Fase 1 — Modais e Fluxos Críticos (Prioridade Máxima)
**Objetivo:** Todo modal deve fechar ao salvar, ter scroll adequado, e feedback claro.
**Arquivos:** `src/app/movimentacoes/page.tsx`, `src/app/orcamentos/page.tsx`, `src/app/contas/page.tsx`, componentes de dialog/modal
**O que fazer:**
- Fechar modal automaticamente após salvar com sucesso
- Toast de confirmação em todas as operações CRUD
- Garantir scroll interno em modais no mobile (390px)
- Verificar z-index de todos os DialogClose
- Adicionar `keyboard-aware` em formulários (E19-T2)
**Resultado:** Usuário sempre sabe se a ação foi concluída.

### Fase 2 — Mobile First Real
**Objetivo:** Nenhum componente deve depender de hover, nenhuma tabela deve ser impossível de usar no celular.
**Arquivos:** Todos os page.tsx com tabelas, componentes de ação
**O que fazer:**
- Adicionar texto visível em botões editar/excluir no mobile (aria-label não basta)
- Garantir touch targets 48px em todas as ações
- Verificar bottom nav em 360px
- Garantir que botão de salvar fique visível com teclado aberto
**Resultado:** App realmente usável no celular.

### Fase 3 — Padronizar Design System
**Objetivo:** Botões, inputs, cards e modais visualmente consistentes.
**Arquivos:** Componentes ui/ + páginas
**O que fazer:**
- Unificar altura de botões (padrão h-11 para mobile)
- Unificar padding de cards
- Unificar distância label→input
- Verificar consistência tipográfica entre páginas
**Resultado:** Aparência profissional e consistente.

### Fase 4 — Formulários, Validações e Feedbacks
**Objetivo:** Usuário nunca deve ficar em dúvida sobre o que preencher ou se a ação foi bem-sucedida.
**Arquivos:** Modais de formulário, hooks de validação
**O que fazer:**
- Indicador de campos obrigatórios (*)
- Mensagens de erro junto ao campo específico
- Placeholder em pt-BR (DD/MM/AAAA) para datas
- Validação de categoria obrigatória
- Toast de sucesso após toda operação de salvar
**Resultado:** Formulários claros e seguros.

### Fase 5 — Dashboard, Estados Vazios e Experiência Premium
**Objetivo:** Nenhuma tela deve ficar vazia sem orientação.
**Arquivos:** pages com dados dinâmicos
**O que fazer:**
- Empty state com CTA em f echamento (mês vazio)
- Gráfico fluxo mensal com orientação quando vazio
- Filtros com indicador de ativo
- Error boundary com ação "Tentar novamente"
**Resultado:** Experiência premium completa.

---

## 12. Checklist Final de Qualidade

### Mobile
- [ ] Todos os botões ≥ 44px (touch targets)
- [ ] Nenhuma ação depende de hover
- [ ] Formulários com keyboard-aware
- [ ] Bottom nav funcional em 360px
- [ ] Modais com scroll interno adequado
- [ ] Tabelas com card view no mobile

### Modais
- [ ] Todos fecham ao salvar
- [ ] Todos têm scroll interno
- [ ] Botão fechar sempre visível e funcional
- [ ] Backdrop consistente
- [ ] Foco retorna ao elemento correto ao fechar
- [ ] Toast de confirmação pós-ação

### Formulários
- [ ] Campos obrigatórios indicados (*)
- [ ] Mensagens de erro junto ao campo
- [ ] Valores monetários consistentes
- [ ] Datas em pt-BR
- [ ] Categoria/Conta com validação de obrigatoriedade
- [ ] Feedback visual de sucesso/erro

### Feedbacks
- [ ] Loading state em botões de ação
- [ ] Toast de sucesso após criar/editar/excluir
- [ ] Toast de erro com mensagem clara
- [ ] Empty states com CTA em todas as telas

### Console
- [ ] Zero erros no console
- [ ] Zero warnings de React
- [ ] API calls sem erros silenciosos

### Layout
- [ ] Botões com altura consistente
- [ ] Cards com padding consistente
- [ ] Tipografia consistente entre telas
- [ ] Cores 100% via tokens do design system

### UX
- [ ] Usuário entende o que fazer em cada tela
- [ ] Usuário sabe se a ação foi concluída
- [ ] Fluxos de erro com orientação clara
- [ ] Proteção de rotas admin

---

## 13. Resumo dos 10 Piores Problemas

1. **Modal de transação não fecha após salvar** — usuário não sabe se salvou 🔴
2. **Modais sem scroll adequado no mobile** — campos invisíveis 🔴
3. **Botões editar/excluir invisíveis semanticamente** — dependem de aria-label 🔴
4. **Teclado esconde botão salvar no mobile** — impossível finalizar 🔴
5. **Fechamento mês vazio sem orientação** — tela "quebrada" 🔴
6. **Admin/analytics sem role check** — dados expostos 🔴
7. **Filtros sem indicador de ativo** — usuário não sabe que está filtrando 🟡
8. **Valor monetário inconsistente vírgula/ponto** — confusão do usuário 🟡
9. **Orçamentos sem alerta de proximidade de limite** — perde utilidade 🟡
10. **Z-index de DialogClose pode falhar** — usuário preso no modal 🟡

## 14. Modais Mais Problemáticos

1. **Novo Lançamento** — não fecha, sem scroll, sem toast 🔴
2. **Novo Orçamento** — scroll insuficiente 🔴
3. **Editar Transação** — z-index do header 🔴
4. **Editar Conta** — reincidência QA-04 🔴
5. **Excluir Recorrência** — confirmação genérica 🟡

## 15. Telas Mais Críticas

1. **Movimentações** — fluxo principal de criação de transação comprometido
2. **Orçamentos** — modal de criação problemático no mobile
3. **Fechamento** — sem orientação quando vazio
4. **Contas** — edição com z-index problemático
5. **Admin/Analytics** — sem proteção de rota

## 16. Recomendação Final

**"Corrigir antes de publicar como premium."**

O sistema é funcional e tem uma base técnica sólida, mas os problemas de modais (principalmente o modal que não fecha após salvar) e a falta de feedback ao usuário impedem que seja considerado "premium-ready". Recomendo:

1. **Fase 1** (crítico, 1-2 dias): Fechar modais após salvar + toast + scroll no mobile
2. **Fase 2** (alta, 2-3 dias): Mobile first real + indicadores visuais + proteção admin
3. **Fase 3** (média, 1-2 dias): Consistência visual + formulários + estados vazios
4. **Fase 4** (refinamento, contínuo): Ajustes finos de UX

**Screenshots capturados durante a auditoria:**
- `docs/audit-dashboard-desktop.png`
- `docs/audit-dashboard-bottom-desktop.png`
- `docs/audit-movimentacoes-desktop.png`
- `docs/audit-contas-desktop.png`
- `docs/audit-orcamentos-desktop.png`
- `docs/audit-recorrencias-desktop.png`
- `docs/audit-fechamento-desktop.png`
- `docs/audit-modal-transaction.png`
