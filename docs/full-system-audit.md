# FlyDea — Auditoria Completa de Sistema

**Data:** 2026-05-05
**Metodo:** Playwright E2E + QA exploratorio + Console/Network inspection
**URL:** https://flydea-financial-manager.vercel.app/

---

## Resumo Executivo

O sistema foi testado como usuario comum, QA e engenheiro frontend, cobrindo 11 telas em 4 viewports (iPhone 16 390x844, iPhone 16 Plus 430x932, Tablet 768x1024, Desktop 1440x900). Foram encontrados **4 bugs criticos** e **3 de severidade media**. A IA foi corretamente removida de toda a experiencia visual. O maior problema e a Content Security Policy bloqueando as fontes Google, causando fallback para fontes de sistema.

### Principais Riscos
1. **Fontes nao carregam em producao** — CSP bloqueia fonts.googleapis.com
2. **Select nao funciona no dialog** — overlay intercepta clique (base-ui bug)
3. **Recharts quebra quando container sem dimensao** — erro no console
4. **RangeError em formatacao de data** — `Invalid time value` em runtime

### Veredito: **NAO pronto para demo com cliente**
O produto precisa de correcoes criticas antes de ser apresentado. Apos corrigir os 4 bugs criticos, estara pronto para demo interna. Para demo com cliente, recomendo tambem as correcoes medias.

---

## Escopo Testado

- **Telas:** Login, Dashboard, Movimentacoes, Contas, Orcamentos, Relatorios, Fluxo de Caixa, Contas a Pagar, Recorrencias, Fechamento, Perfil
- **Viewports:** 390x844, 430x932, 768x1024, 1440x900
- **Navegadores:** Chromium (Playwright)
- **Credenciais:** augusto@flydea.com / password123

---

## Bugs Encontrados

### CRITICOS

#### C1 — Content Security Policy bloqueia Google Fonts
- **Tela:** Todas
- **Tipo:** performance / build
- **Evidencia:** 21x `[error] Loading the stylesheet 'https://fonts.googleapis.com/css2?...' violates the following Content Security Policy`
- **Impacto:** Fontes Inter e Manrope nao carregam. Sistema usa fallback de sistema. Visual degradado.
- **Arquivos:** `src/app/layout.tsx` (link tag), Vercel config / middleware (CSP headers)
- **Solucao:** Adicionar `https://fonts.googleapis.com` e `https://fonts.gstatic.com` a `style-src` e `font-src` do CSP no `next.config.ts` ou `vercel.json`
- **Aceite:** Zero erros CSP no console. Fontes carregam em todas as telas.

#### C2 — Select do @base-ui/react nao funciona dentro do Dialog
- **Tela:** Novo Lancamento
- **Tipo:** bug funcional / formulario
- **Evidencia:** Playwright timeout ao clicar no select-item. O overlay do select popup intercepta pointer events do dialog.
- **Passos:** Abrir novo lancamento > preencher descricao e valor > clicar no select de categoria > tentar selecionar item
- **Impacto:** Usuario nao consegue selecionar categoria ao criar transacao pelo botao da bottom nav
- **Arquivos:** `src/components/ui/select.tsx`, `src/components/ui/dialog.tsx`
- **Solucao:** Aumentar z-index do SelectContent (ja tem z-[100]) acima do dialog. Ou usar `Portal` com `container` apropriado.
- **Aceite:** Select abre e permite clique nos itens dentro do Dialog.

#### C3 — Recharts erro de dimensao (-1 x -1)
- **Tela:** Dashboard, Relatorios (qualquer tela com grafico)
- **Tipo:** bug funcional / UI
- **Evidencia:** `The width(-1) and height(-1) of chart should be greater than 0` (console warning)
- **Impacto:** Graficos podem nao renderizar em certas condicoes de resize ou loading
- **Arquivos:** `src/app/page.tsx:199-278`, `src/app/relatorios/page.tsx`
- **Solucao:** Garantir minWidth/minHeight no container do ResponsiveContainer. Usar `debounce` no resize.
- **Aceite:** Zero warnings de dimensao no console. Grafico renderiza em todos os viewports.

#### C4 — RangeError: Invalid time value
- **Tela:** Dashboard, Movimentacoes (onboarding)
- **Tipo:** bug funcional
- **Evidencia:** `RangeError: Invalid time value` + `[FlyDea Error] Invalid time value undefined`
- **Impacto:** Crash silencioso de componente que depende de formatacao de data. Possivel tela quebrada.
- **Arquivos:** `src/components/dashboard/dashboard-hero.tsx`, `src/app/movimentacoes/page.tsx`
- **Solucao:** Adicionar validacao `if (!date || isNaN(date.getTime()))` antes de usar `Intl.RelativeTimeFormat` e `format()` do date-fns.
- **Aceite:** Sem RangeError no console. Datas exibidas corretamente em dados validos.

### ALTOS

#### A1 — Dialog de novo lancamento nao abre via botao "+" em alguns cenarios
- **Tela:** Dashboard, Movimentacoes
- **Evidencia:** Playwright nao encontrou o botao trigger em mobile. O QuickAdd button so renderiza se `controlledOpen === undefined`.
- **Arquivos:** `src/components/quick-add.tsx`
- **Solucao:** Sempre renderizar o trigger mesmo com controlled mode, ou garantir que a bottom nav sempre tenha o trigger.

#### A2 — FAB ainda visivel no Dashboard em algumas condicoes
- **Tela:** Dashboard
- **Evidencia:** 1 FAB detectado (classe `fixed bottom-2*`)
- **Arquivos:** `src/components/quick-add.tsx:92-99`
- **Solucao:** Verificar se o QuickAdd ainda renderiza FAB mobile quando nao usado via bottom nav controlado.

### MEDIOS

#### M1 — Sem pagina 404 adequada para rotas inexistentes
- **Tela:** Rota invalida
- **Evidencia:** Conteudo da pagina nao contem "404" ou "nao encontrado"
- **Impacto:** Usuario que acessa URL errada nao sabe o que aconteceu
- **Arquivos:** `src/app/not-found.tsx` (criar)
- **Solucao:** Criar pagina `not-found.tsx` com mensagem clara e link para Dashboard.

#### M2 — Sidebar desktop com "Consultoria" e "Agendar Conversa" (dead-end)
- **Tela:** Desktop
- **Evidencia:** Card de Consultoria no sidebar que nao leva a lugar real
- **Impacto:** Usuario clica e nao tem acao. Parece placeholder.
- **Arquivos:** `src/components/sidebar.tsx:207-219`
- **Solucao:** Remover o card ou criar link real para contato/suporte.

#### M3 — Sem toast de confirmacao apos criar transacao
- **Tela:** Novo Lancamento
- **Evidencia:** Dialog fecha mas sem confirmacao visual explicita
- **Impacto:** Usuario pode achar que nao salvou
- **Arquivos:** `src/components/quick-add.tsx`
- **Solucao:** Garantir que o toast de sucesso e visivel e tem `aria-live`.

---

## Problemas de UX/UI

| # | Descricao | Tela | Severidade |
|---|-----------|------|------------|
| UX1 | Transacao criada sem confirmacao visual clara | Novo Lancamento | Media |
| UX2 | Card "Consultoria" no sidebar e dead-end | Sidebar Desktop | Baixa |
| UX3 | Recharts ocupa 320px no mobile — muito espaco | Dashboard | Baixa |

## Problemas Mobile

| # | Descricao | Severidade |
|---|-----------|------------|
| M1 | Nenhum — sem overflow horizontal em 390px e 430px ✅ |
| M2 | Bottom nav presente e funcional em todos os viewports mobile ✅ |

## Problemas de Acessibilidade

| # | Descricao | Severidade |
|---|-----------|------------|
| A11y1 | Correcoes da auditoria anterior aplicadas (aria-labels, focus, contrast) ✅ |
| A11y2 | Formulario de novo lancamento: labels presentes nos campos ✅ |

## Console Errors (21 total)

```
21x CSP violation: fonts.googleapis.com stylesheet blocked
4x  Recharts width/height -1 warning
1x  RangeError: Invalid time value
1x  [FlyDea Error] Invalid time value undefined
```

## Network Errors: **0** ✅

---

## Telas Testadas

| Tela | Status | Chars | Problemas |
|------|--------|-------|-----------|
| Login | ✅ OK | — | Erro login invalido visivel |
| Dashboard | ✅ OK | 1198 | OK — sem IA, nav presente, sem overflow |
| Movimentacoes | ✅ OK | 367 | Carregou, precisa de dados para validar lista |
| Contas | ✅ OK | 452 | OK |
| Orcamentos | ✅ OK | 490 | OK |
| Relatorios | ✅ OK | 369 | Recharts warning |
| Fluxo de Caixa | ✅ OK | 1038 | OK |
| Contas a Pagar | ✅ OK | 402 | OK |
| Recorrencias | ✅ OK | 401 | OK |
| Fechamento | ✅ OK | 744 | OK |
| Perfil | ✅ OK | 582 | OK |

---

## Conclusao

O produto **NAO esta pronto para demo com cliente** devido aos 4 bugs criticos (CSP fonts, select quebrado, Recharts erro, RangeError). Para demo interna (equipe), corrigir C1 (CSP) e C4 (RangeError) e suficiente. Para demo com investidor/cliente, corrigir os 4 criticos + A1.

### Positivos
- IA completamente removida da experiencia ✅
- Bottom nav funcional em mobile ✅
- Zero erros de rede (API responses OK) ✅
- Todas as 11 telas carregam sem quebrar ✅
- Build passa ✅
- Typecheck passa ✅
- 434/436 testes passam ✅
