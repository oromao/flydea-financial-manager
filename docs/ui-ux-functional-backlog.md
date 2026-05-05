# FlyDea Financial Manager — Backlog UI/UX/Funcional

> **Data:** 2026-05-05 | **Fonte:** Auditoria Playwright MCP em producao

---

## Legenda

| Severidade | Tipo |
|------------|------|
| 🔴 Critica | UI, UX, Mobile, Botao/Acao, Cores, Funcional, Acessibilidade, Navegacao, Formulario, Performance, Design System, Produto |
| 🟡 Alta | |
| 🟢 Media | |
| ⚪ Baixa | |

---

## Tabela de Problemas

| ID | Severidade | Tipo | Tela | Problema | Evidencia | Impacto | Solucao recomendada | Arquivos provaveis | Criterio de aceite | Status |
|----|------------|------|------|----------|-----------|---------|---------------------|--------------------|--------------------|--------|
| QAF-001 | 🔴 Critica | Funcional | /movimentacoes | Pagina 100% quebrada com RangeError: Invalid time value | Console: `RangeError: Invalid time value` + `[FlyDea Error] Invalid time value undefined` | Usuario nao consegue ver/editar/deletar transacoes | Validar `date` antes de `format()`. Usar safe guard: `date ? format(date) : '—'` | `src/app/movimentacoes/` | Pagina carrega sem erro. Transacoes com data nula mostram '—' em vez de quebrar | TODO |
| QAF-002 | 🔴 Critica | UI | Dashboard (modal Novo Lancamento) | Dropdown de categoria mostra UUID em vez de nome | Modal: "c7a64993-ea44-4585-9c9e-53cd56f0699a" em vez de "Alimentacao" | Usuario nao sabe qual categoria selecionou | Mapear `renderValue` do Select de categoryId para categoryName | `src/components/quick-add.tsx` ou similar | Dropdown mostra nome da categoria (ex: Alimentacao, Transporte) | TODO |
| QAF-003 | 🟡 Alta | UI | Dashboard (mobile) | Saldo Geral e Saldo Mes renderizados como VAZIO no mobile | Mobile mostra elementos vazios `<paragraph />` sem texto. Desktop mostra valores normalmente | Usuario mobile nao ve dados criticos | Verificar renderizacao condicional por viewport. Garantir que valores sejam populados em ambos | `src/app/page.tsx`, `src/components/dashboard/` | Mobile (390px) mostra mesmos valores que desktop | TODO |
| QAF-004 | 🟡 Alta | Produto | Global | Inconsistencia "Sovereign" (mobile) vs "Premium Access" (desktop) | Mobile: `paragraph "Sovereign"` / Desktop: `paragraph "Premium Access"` | Confusao de identidade do produto | Padronizar badge para "Premium" ou unificar em ambos layouts | `src/components/sidebar.tsx`, `src/components/bottom-nav.tsx` | Ambos layouts mostram o mesmo texto de badge | TODO |
| QAF-005 | 🟡 Alta | Produto | Global (PWA) | manifest.webmanifest ausente — retorna HTML | URL `/manifest.webmanifest` retorna pagina de login HTML. Console: `Manifest: Syntax error` | PWA nao funcional, nao instalavel | Criar `public/manifest.webmanifest` com nome, icones, theme_color | `public/manifest.webmanifest` | PWA instalavel no Chrome/Safari. Sem erros de console | TODO |
| QAF-006 | 🟡 Alta | UI | /contas | Botao "Fechar" do modal de edicao interceptado por header sticky | Playwright: `subtree intercepts pointer events`. Escape funciona | Usuario nao consegue fechar modal com clique | Adicionar `pointer-events-none` ao header sticky OU reposicionar botao | `src/components/dialogs/` | Botao Fechar clicavel em mobile 390px | TODO |
| QAF-007 | 🟡 Alta | Produto | /contas | Dados seed de QA visiveis em producao | "Conta QA Edit" listada entre contas reais | Dados de teste misturados com dados reais | Remover seed de QA do ambiente de producao. Usar flag de ambiente | `prisma/seed.ts` | Contas de teste nao visiveis em producao | TODO |
| QAF-008 | 🟢 Media | UX | Dashboard | Duas formas de criar transacao competindo (botao dashboard + FAB bottom nav) no mobile | Dashboard tem "Novo Lancamento" e bottom nav tem "Novo" — ambos abrem mesmo modal | Inflacao de botoes, confusao | Manter apenas FAB da bottom nav no mobile. Remover botao duplicado do dashboard em mobile | `src/components/dashboard/dashboard-hero.tsx` | Mobile mostra apenas 1 botao de criar transacao | TODO |
| QAF-009 | 🟢 Media | UI | Sidebar | Nomes sem acento: "Movimentacoes", "Recorrencias", "Analises" | Sidebar mostra texto sem acentuacao | Inconsistencia com portugues do resto do sistema | Adicionar acentos: "Movimentacoes"→"Movimentacoes", etc | `src/components/sidebar.tsx` | Todos os nomes com acentos corretos | TODO |
| QAF-010 | 🟢 Media | UX | Modal Novo Lancamento | Data em formato ISO (2026-05-05) em vez de pt-BR | Campo data mostra YYYY-MM-DD | Inconsistencia com padrao brasileiro | Formatar campo como DD/MM/AAAA | `src/components/quick-add.tsx` | Data mostra 05/05/2026 | TODO |
| QAF-011 | 🟢 Media | UX | Modal Novo Lancamento | Sem toast de confirmacao ao criar transacao | Modal fecha silenciosamente apos Salvar | Usuario nao tem certeza se salvou | Disparar toast "Transacao criada com sucesso!" apos salvar | `src/components/quick-add.tsx` | Toast visivel por 3s apos criar transacao | TODO |
| QAF-012 | 🟢 Media | UX | Modal Explorar | Escape nao fecha o dialog "Explorar modulos" | Pressionar Escape nao fecha. So clicando em "Fechar painel" | Usuario espera que Escape feche modais | Adicionar `onEscapeKeyDown` handler no Dialog | `src/components/bottom-nav.tsx` | Escape fecha o modal Explorar | TODO |
| QAF-013 | 🟢 Media | Produto | Global | Dados seed insuficientes — todas as paginas mostram R$ 0,00 | Fluxo de Caixa, Contas a Pagar, Relatorios, Fechamento todos com R$ 0,00 | Sistema parece vazio, nao demonstra valor | Adicionar transacoes de exemplo no seed (receitas e despesas variadas) | `prisma/seed.ts` | Dashboard e paginas de analise mostram dados realistas | TODO |
| QAF-014 | ⚪ Baixa | UI | Dashboard | Orcamentos no mobile completamente vazio (sem estado vazio) | Area de Orcamentos no mobile nao mostra nem "Nenhum orcamento configurado" | Secao parece quebrada | Garantir que estado vazio aparece no mobile tambem | `src/app/page.tsx` | Mobile mostra "Nenhum orcamento configurado" como desktop | TODO |
| QAF-015 | ⚪ Baixa | UI | Modal Novo Lancamento | Botao "Novo" na bottom nav (FAB) mostra apenas icone sem texto visivel | Snapshot mostra apenas `img` sem texto legivel no FAB | Usuario pode nao entender o que o botao faz | Adicionar texto "Novo" ou "+" ao FAB | `src/components/bottom-nav.tsx` | FAB tem icone + texto ou "+" visivel | TODO |
| QAF-016 | ⚪ Baixa | UI | /contas | Modal NOVA CONTA e modal EDITAR CONTA competem visualmente | Ambos tem titulo e campos similares mas comportamentos diferentes | Confusao entre criar e editar | Diferenciar titulos: "Nova Conta" vs "Editar Conta" (ja feito). Adicionar cor de destaque no botao primario | `src/components/` | Usuario distingue claramente entre criar e editar | TODO |
| QAF-017 | ⚪ Baixa | Acessibilidade | Global | Alguns botoes de acao sem aria-label | Icon-only buttons podem nao ter aria-label em todos os casos | Leitores de tela nao conseguem identificar acao | Auditar todos os botoes icon-only e adicionar aria-label | Varios componentes | Todos botoes icon-only tem aria-label | TODO |
| QAF-018 | ⚪ Baixa | Performance | /movimentacoes | 5+ erros de console acumulados durante navegacao | Console mostra manifest + RangeError repetidos | Indicativo de problemas subjacentes | Corrigir causas raiz (manifest + date error) | N/A | 0 erros de console durante navegacao completa | TODO |

---

## Resumo por Severidade

| Severidade | Quantidade |
|------------|------------|
| 🔴 Critica | 2 |
| 🟡 Alta | 5 |
| 🟢 Media | 6 |
| ⚪ Baixa | 5 |
| **Total** | **18** |

## Resumo por Tipo

| Tipo | Quantidade |
|------|------------|
| UI | 7 |
| UX | 4 |
| Funcional | 1 |
| Produto | 3 |
| Acessibilidade | 1 |
| Performance | 1 |
| Mobile | 0 (incluido em UI/UX) |
| **Total** | **18** |

---

## Top 5 Problemas Mais Importantes

1. **QAF-001** — Movimentacoes QUEBRADA (RangeError)
2. **QAF-002** — UUID no dropdown de categoria
3. **QAF-003** — Valores ausentes no dashboard mobile
4. **QAF-005** — PWA nao funcional (manifest ausente)
5. **QAF-004** — Inconsistencia "Sovereign" vs "Premium Access"

---

*Backlog gerado a partir de auditoria Playwright MCP em producao*
