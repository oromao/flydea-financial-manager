# FlyDea — Plano de Testes

**Data:** 2026-05-05
**Stack:** Next.js 16 + React 19 + Playwright + Vitest

---

## Matriz de Telas

| Tela | Rota | Mobile 390 | Mobile 430 | Tablet 768 | Desktop 1440 | E2E Existente |
|------|------|------------|------------|------------|--------------|---------------|
| Login | /login | ✅ | ✅ | ✅ | ✅ | auth.spec.ts |
| Dashboard | / | ✅ | ✅ | ✅ | ✅ | smoke.spec.ts |
| Movimentacoes | /movimentacoes | ✅ | ✅ | ✅ | ✅ | movimentacoes-e2e.spec.ts |
| Contas | /contas | ✅ | ✅ | ✅ | ✅ | — |
| Orcamentos | /orcamentos | ✅ | ✅ | ✅ | ✅ | — |
| Relatorios | /relatorios | ✅ | ✅ | ✅ | ✅ | dashboard_relatorios.spec.ts |
| Fluxo de Caixa | /fluxo-caixa | ✅ | ✅ | ✅ | ✅ | — |
| Contas a Pagar | /contas-a-pagar | ✅ | ✅ | ✅ | ✅ | — |
| Recorrencias | /recorrencias | ✅ | ✅ | ✅ | ✅ | — |
| Fechamento | /fechamento | ✅ | ✅ | ✅ | ✅ | — |
| Perfil | /perfil | ✅ | ✅ | ✅ | ✅ | profile.spec.ts |
| Insights (IA) | /insights | ✅ (redirect) | — | — | — | — |
| Agents (IA) | /agents | ✅ (redirect) | — | — | — | — |
| 404 | /qualquer | ✅ | — | — | — | — |

---

## Casos de Teste Manuais Minimos (Smoke Tests)

### Login
- [ ] Login com credenciais validas redireciona para Dashboard
- [ ] Login com credenciais invalidas mostra erro
- [ ] Campos de email e senha tem autocomplete
- [ ] Botao "Esqueci minha senha" linka para /esqueci-senha
- [ ] Toggle de mostrar/ocultar senha funciona

### Dashboard
- [ ] Saldo geral visivel e formatado em BRL
- [ ] Cards de Entradas, Saidas, Saldo Mes com valores
- [ ] Botao "Novo" na bottom nav abre dialog
- [ ] Botao "Extrato" linka para /movimentacoes
- [ ] Bottom nav mostra 4 itens: Inicio, Fluxo, Novo(+), Mais
- [ ] Menu "Mais" abre sheet com modulos
- [ ] Nenhum elemento de IA visivel (Copilot, Insights, Brain)
- [ ] Grafico de fluxo mensal renderiza

### Movimentacoes
- [ ] Lista de transacoes carrega (ou empty state)
- [ ] Cada transacao mostra: descricao, data, categoria, valor, status
- [ ] Botao de acoes ("...") expande opcoes editar/excluir
- [ ] Filtros visiveis e funcionais
- [ ] Busca funcional
- [ ] Botao importar comprovante visivel

### Novo Lancamento
- [ ] Dialog abre ao clicar "+"
- [ ] Alternar entre Despesa e Receita funciona
- [ ] Todos os campos obrigatorios tem label
- [ ] Submit com campos vazios mostra validacao
- [ ] Select de categoria funciona (CORRIGIR C2)
- [ ] Salvar com dados validos cria transacao
- [ ] Toast de confirmacao visivel apos salvar

### Excluir Lancamento
- [ ] Confirmacao de exclusao aparece
- [ ] Cancelar nao exclui
- [ ] Confirmar exclui e remove da lista

### Navegacao
- [ ] Bottom nav presente em todas as telas mobile
- [ ] Sidebar visivel no desktop (≥768px)
- [ ] /insights redireciona para /
- [ ] /agents redireciona para /
- [ ] Rota invalida mostra pagina 404

### Mobile
- [ ] Sem overflow horizontal em 390px
- [ ] Safe area insets aplicados
- [ ] Touch targets ≥ 44px
- [ ] Formularios usaveis com teclado aberto

---

## Casos de Teste E2E Recomendados (Playwright)

### smoke-critical.spec.ts (novo)
```typescript
// 1. Login flow
// 2. Dashboard loads without errors
// 3. Bottom nav visible and functional
// 4. Navigate to all main pages
// 5. IA pages redirect correctly
// 6. No CSP errors in console
// 7. No JS runtime errors
```

### transactions-crud.spec.ts (novo)
```typescript
// 1. Open "Novo Lancamento" dialog
// 2. Fill all fields
// 3. Select category works
// 4. Save creates transaction
// 5. Toast confirmation visible
// 6. Edit transaction
// 7. Delete transaction with confirmation
```

### mobile-responsive.spec.ts (atualizar)
```typescript
// Testar em iPhone 16 (390x844) e iPhone 16 Plus (430x932)
// 1. No horizontal overflow
// 2. Bottom nav covers full width
// 3. FAB not overlapping content
// 4. Form inputs not cut off
// 5. Safe area respected
```

### accessibility-basic.spec.ts (novo)
```typescript
// 1. All icon buttons have aria-label
// 2. Form inputs have associated labels
// 3. Skip link present and functional
// 4. No color-only indicators
// 5. Focus visible on all interactive elements
```

---

## Setup de Testes

### Comandos
```bash
# Unit tests (Vitest)
npm test

# E2E tests (Playwright)
npm run test:e2e

# Quality check
npm run test:quality    # type-check + lint + coverage

# Build
npm run build
```

### Configuracao Playwright
- Config: `playwright.config.ts`
- Projetos: chromium, Mobile Chrome (Pixel 5), Mobile Safari (iPhone 16)
- Base URL: `http://localhost:3010` (ou `BASE_URL` env var)
- Timeout: 90s
- Screenshots: only-on-failure

### Test Users
- augusto@flydea.com / password123 (membro)
- admin@flydea.com / (admin)
- luiz@flydea.com / luiz2026 (membro)

---

## Resultados da Ultima Execucao

| Comando | Resultado | Detalhes |
|---------|-----------|----------|
| `npm run build` | ✅ Passou | Zero erros |
| `npx tsc --noEmit` | ✅ Passou | Apenas erros pre-existentes em `__mocks__` |
| `npm test` | ⚠️ 434/436 | 2 falhas pre-existentes (.env.local, approval-threshold) |
| `npx playwright test` | ❓ Nao executado | Dev server local com problema |
| Auditoria Playwright live | ✅ Executado | Contra Vercel, 4 bugs encontrados |

---

## Recomendacoes

1. **Corrigir dev server local** — `next dev -p 3010` esta instavel. Investigar porque cai.
2. **Adicionar smoke tests criticos** — `smoke-critical.spec.ts` como safety net.
3. **CI com E2E** — Rodar Playwright no CI apontando para preview deployments.
4. **Lighthouse CI** — Adicionar auditoria de performance e acessibilidade no CI.
5. **Percy/Chromatic** — Se o projeto crescer, adicionar testes visuais de regressao.
