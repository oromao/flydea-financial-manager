# FlyDea — Backlog de Correcoes (Auditoria 2026-05-05)

| ID | Severidade | Tipo | Tela | Problema | Passos | Esperado | Atual | Impacto | Arquivos | Solucao | Criterio Aceite | Status |
|----|------------|------|------|----------|--------|----------|-------|---------|----------|---------|-----------------|--------|
| C1 | CRITICA | performance/build | Todas | CSP bloqueia Google Fonts | Abrir qualquer tela em producao | Fontes Inter/Manrope carregam | Fallback para fontes de sistema. 21 erros CSP no console | Visual degradado, produto parece inacabado | `src/app/layout.tsx`, `next.config.ts`, `middleware.ts` | Adicionar fonts.googleapis.com e fonts.gstatic.com ao style-src e font-src do CSP | Zero CSP errors no console. Fontes carregam. | TODO |
| C2 | CRITICA | bug funcional | Novo Lancamento | Select de categoria nao funciona no Dialog | Abrir novo lancamento, clicar no select de categoria, tentar selecionar item | Item selecionado | Clique interceptado pelo overlay do dialog. Timeout. | Usuario nao consegue selecionar categoria | `src/components/ui/select.tsx:86`, `src/components/ui/dialog.tsx` | Aumentar z-index do SelectContent ou usar portal com stacking context correto | Select abre e aceita clique nos itens dentro do Dialog. | TODO |
| C3 | CRITICA | bug funcional | Dashboard, Relatorios | Recharts erro de dimensao -1x-1 | Carregar pagina com grafico, redimensionar ou carregar sem dados | Grafico renderiza normalmente | Warning no console, possivel grafico invisivel | Grafico pode nao aparecer | `src/app/page.tsx:199-278`, `src/app/relatorios/page.tsx` | Adicionar minWidth/minHeight no container. Debounce no resize. | Zero warnings Recharts. Grafico visivel em todos viewports. | TODO |
| C4 | CRITICA | bug funcional | Dashboard, Movimentacoes | RangeError: Invalid time value | Carregar dashboard com dados de data invalida/null | Datas formatadas normalmente | Crash silencioso. Console: RangeError + [FlyDea Error] | Componente pode quebrar completamente | `src/components/dashboard/dashboard-hero.tsx`, `src/app/movimentacoes/page.tsx` | Validar date antes de formatar: `if (!date \|\| isNaN(date.getTime())) return fallback` | Sem RangeError no console. Datas invalidas mostram fallback. | TODO |
| A1 | ALTA | navegacao | Novo Lancamento | Botao "Novo" pode nao abrir dialog em certos cenarios | Clicar botao + na bottom nav | Dialog abre | Dialog pode nao abrir se controlled state nao propagar | Bloqueia criacao de transacao | `src/components/quick-add.tsx`, `src/components/bottom-nav.tsx` | Garantir que QuickAdd sempre renderiza trigger ou que bottom nav gerencia estado | Dialog abre ao clicar no + da bottom nav. | TODO |
| M1 | MEDIA | UX | 404 | Sem pagina 404 para rotas inexistentes | Acessar /pagina-inexistente | Pagina com "Pagina nao encontrada" e link para inicio | Conteudo generico, sem indicacao de erro | Usuario perdido | `src/app/not-found.tsx` (criar) | Criar not-found.tsx com mensagem clara e botao "Voltar ao Dashboard" | Rota invalida mostra pagina 404 amigavel. | TODO |
| M2 | MEDIA | UX | Sidebar Desktop | Card "Consultoria" e dead-end | Clicar em "Agendar Conversa" no sidebar | Acao real (contato, link, modal) | Botao sem funcionalidade real | Confunde usuario, parece placeholder | `src/components/sidebar.tsx:207-219` | Remover card ou linkar para pagina de suporte real | Card de consultoria nao existe ou linka para funcionalidade real. | TODO |
| M3 | MEDIA | UX | Novo Lancamento | Sem confirmacao visual apos salvar | Criar transacao e salvar | Toast ou feedback visual claro | Dialog fecha silenciosamente | Usuario pode achar que nao salvou | `src/components/quick-add.tsx` | Garantir toast visivel com aria-live. Delay de fechamento do dialog para ver toast. | Toast "Transacao adicionada" visivel apos salvar. | TODO |
| B1 | BAIXA | UI | Dashboard | Grafico ocupa muito espaco vertical no mobile (320px) | Ver dashboard no iPhone 16 | Grafico compacto, opcao de expandir | 320px fixo de altura | Desperdica espaco em tela pequena | `src/app/page.tsx:199` | Reduzir para 240px no mobile, 280px no desktop. Ou grafico colapsavel. | Grafico ocupa menos espaco no mobile. | TODO |
| B2 | BAIXA | UX | Movimentacoes | Pagina com 761 linhas — componente muito grande | Abrir /movimentacoes | Codigo organizado e modular | Monolito de 761 linhas | Dificil manutencao, performance | `src/app/movimentacoes/page.tsx` | Quebrar em TransactionList, TransactionFilters, TransactionSummary, ImportSection | Pagina de movimentacoes dividida em 4+ componentes. | TODO |

---

## Ordem de Prioridade para Correcao

1. **C1** (CSP fonts) — 30min, alto impacto visual
2. **C4** (RangeError) — 15min, crash silencioso
3. **C2** (Select quebrado) — 30min, bloqueia funcionalidade
4. **C3** (Recharts) — 20min, warning mas nao quebra
5. **A1** (Dialog trigger) — 15min
6. **M1** (404 page) — 10min
7. **M2** (Consultoria) — 5min
8. **M3** (Toast confirm) — 10min
9. **B1, B2** (Polish) — opcionais pre-demo
