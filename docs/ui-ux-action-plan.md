# FlyDea Financial Manager — Plano de Acao Final

> **Data:** 2026-05-05 | **Nota atual:** 8.5/10 | **Objetivo:** 10/10

---

## FASE 1: Hotfix — Bugs de Interface (15min)

| ID | Acao | Estimativa |
|----|------|------------|
| QA3-01 | Corrigir button nesting na bottom nav — remover wrapper button | 5min |
| QA3-02 | Remover botao "IMPORTAR" duplicado | 5min |
| QA3-05 | Adicionar texto "Sem data" para datas nulas | 5min |

---

## FASE 2: Dados — Limpeza + Seed (10min)

| ID | Acao | Estimativa |
|----|------|------------|
| QA3-03 | Limpar dados de teste do banco de producao (SearchTest*, E2E Test*) | 5min |
| QA3-04 | Executar seed no banco de producao (transacoes + orcamentos) | 5min |

---

## FASE 3: UX Polish (15min)

| ID | Acao | Estimativa |
|----|------|------------|
| QA3-07 | Renomear "Fluxo" → "Transacoes" na bottom nav | 5min |
| QA3-09 | Adicionar toast/download ao clicar Exportar | 5min |
| QA3-10 | Adicionar placeholder nos campos Periodo De/Ate | 5min |

---

## FASE 4: Console & Acessibilidade (10min)

| ID | Acao | Estimativa |
|----|------|------------|
| QA3-06 | Corrigir erro de manifest no console (middleware bypass?) | 10min |

---

## FASE 5: Validacao Final (15min)

| Acao | Estimativa |
|------|------------|
| `npm run build` | 2min |
| `npm run lint` | 2min |
| Playwright re-teste: login → dashboard → movimentacoes → CRUD | 10min |
| `git push origin main` | 1min |

---

## Resumo

| Fase | Items | Tempo |
|------|-------|-------|
| 1. Hotfix | 3 | 15min |
| 2. Dados | 2 | 10min |
| 3. UX Polish | 3 | 15min |
| 4. Console | 1 | 10min |
| 5. Validacao | 4 | 15min |
| **TOTAL** | **10 acoes** | **~1h05min** |

---

## Proximo prompt recomendado:

```
Execute o plano de acao final — Fases 1 a 5. 
Corrija QA3-01 a QA3-10 e faca deploy para main.
```

---

*Plano gerado de auditoria Playwright MCP em producao*
