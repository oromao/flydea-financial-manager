# FlyDea Financial Manager — Backlog Final

> **Data:** 2026-05-05 | **Build:** `a3e612b` | **Nota:** 8.5/10

---

| ID | Severidade | Tipo | Tela | Problema | Evidencia | Impacto | Solucao | Arquivos | Criterio de aceite | Status |
|----|------------|------|------|----------|-----------|---------|----------|----------|---------------------|--------|
| QA3-01 | 🟡 Alta | Botao/Acao | Mobile global | Button nesting: `button > button` no "Novo" da bottom nav | Playwright: `button "Novo lancamento" > button "Novo lancamento"` | Acessibilidade quebrada, HTML invalido | Remover wrapper button da bottom-nav; usar apenas o button do QuickAdd | `bottom-nav.tsx:62-75` | DOM mostra 1 button, nao 2 aninhados | TODO |
| QA3-02 | 🟡 Alta | UI | Movimentacoes | Botao "IMPORTAR" duplicado ao lado de "Importar Comprovante" | Playwright: 2 botoes lado a lado com mesma funcao | Confusao, poluicao visual | Remover "IMPORTAR", manter so "Importar Comprovante" | `movimentacoes/page.tsx` | Apenas 1 botao de importacao visivel | TODO |
| QA3-03 | 🟡 Alta | Produto | Movimentacoes | Dados de teste (SearchTest*, E2E Test*) em producao | Playwright: 45 registros com nomes de teste | Dados fake poluem a experiencia | Limpar banco de producao OU rodar seed limpo | Banco de dados | Apenas transacoes reais/de demonstracao visiveis | TODO |
| QA3-04 | 🟢 Media | Produto | Dashboard | Seed nao executado — orcamentos vazios apesar de seed existir | "Nenhum orcamento configurado" visivel | Sistema parece vazio, nao demonstra valor | Executar `npx prisma db seed` no ambiente de producao | `prisma/seed.ts` | Orcamentos "Lazer" e "Alimentacao" visiveis | TODO |
| QA3-05 | 🟢 Media | UI | Movimentacoes | Datas nulas mostram "—" sem contexto | Playwright: `generic: —` em campo de data | Usuario nao sabe se e bug ou sem data | Adicionar tooltip "Data nao informada" ou mostrar "Sem data" | `transaction-card.tsx` | Datas nulas mostram texto explicativo | TODO |
| QA3-06 | 🟢 Media | Console | Global | 2-3 erros `Manifest: Syntax error` em todas paginas | Console: `Manifest: Line 1, column 1, Syntax error` | Indicador de problema, PWA pode nao funcionar | Verificar rota `/manifest` — middleware bloqueia? | `src/app/manifest.ts`, middleware | 0 erros de manifest no console | TODO |
| QA3-07 | 🟢 Media | UX | Mobile | "Fluxo" na bottom nav ambiguo — melhor "Transacoes" | Usuario novo pode nao associar "Fluxo" com transacoes | Navegacao confusa | Renomear para "Transacoes" ou "Lancamentos" | `bottom-nav.tsx:14` | Bottom nav mostra "Transacoes" | TODO |
| QA3-08 | 🟢 Media | Produto | Movimentacoes | Todos registros mostram "Alimentacao" — falta diversidade | Playwright: 45 registros todos com categoria Alimentacao | Sistema parece monotematico | Rodar seed com transacoes de categorias variadas | `prisma/seed.ts` | Transacoes mostram categorias variadas (Salario, Aluguel, etc) | TODO |
| QA3-09 | ⚪ Baixa | UX | Movimentacoes | Botao "Exportar" sem feedback visual | Clicar Exportar nao mostra toast/download imediato | Usuario duvida se funcionou | Adicionar toast "Exportando..." ou download automatico | `movimentacoes/page.tsx` | Feedback visivel apos clicar Exportar | TODO |
| QA3-10 | ⚪ Baixa | UI | Movimentacoes | Campos "Periodo De/Ate" sem placeholder | Campos de data vazios sem indicacao visual | Usuario nao sabe o que preencher | Adicionar placeholder "Inicio" / "Fim" | `movimentacoes/page.tsx` | Campos de periodo mostram placeholder | TODO |

---

## Resumo

| Severidade | Qtd |
|------------|-----|
| 🔴 Critica | 0 |
| 🟡 Alta | 3 |
| 🟢 Media | 5 |
| ⚪ Baixa | 2 |
| **Total** | **10** |

---

*Backlog gerado de auditoria Playwright MCP em producao*
