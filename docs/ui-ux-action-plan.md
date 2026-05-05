# FlyDea Financial Manager — Plano de Acao UI/UX/Funcional

> **Data:** 2026-05-05 | **Fonte:** Auditoria Playwright MCP em producao

---

## Visao Geral

Corrigir 18 problemas identificados em auditoria completa, organizados em 7 fases por prioridade e dependencia.

---

## FASE 1: HOTFIX — Bugs Criticos (2 itens)

**Objetivo:** Restaurar funcionalidades basicas quebradas.

| ID | Acao | Estimativa |
|----|------|------------|
| QAF-001 | Fix RangeError: Invalid time value em /movimentacoes | 30min |
| QAF-002 | Fix UUID no dropdown de categoria do modal Novo Lancamento | 20min |

**Criterio de saida:** Usuario consegue ver lista de transacoes e selecionar categorias pelo nome.

---

## FASE 2: Consistencia — Mobile = Desktop (4 itens)

**Objetivo:** Unificar experiencia entre viewports.

| ID | Acao | Estimativa |
|----|------|------------|
| QAF-003 | Preencher valores do dashboard mobile (Saldo Geral, Saldo Mes) | 30min |
| QAF-004 | Padronizar badge "Premium Access" em ambos layouts | 10min |
| QAF-014 | Garantir estado vazio de Orcamentos no mobile | 10min |
| QAF-008 | Remover botao "Novo Lancamento" duplicado no dashboard mobile | 15min |

**Criterio de saida:** Mobile (390px) mostra mesmos dados que desktop. Badge consistente.

---

## FASE 3: PWA + Navegacao (3 itens)

**Objetivo:** Tornar app instalavel e melhorar navegacao.

| ID | Acao | Estimativa |
|----|------|------------|
| QAF-005 | Criar `public/manifest.webmanifest` com icones e metadata | 20min |
| QAF-009 | Corrigir acentos no sidebar | 10min |
| QAF-012 | Adicionar Escape handler no modal Explorar | 10min |

**Criterio de saida:** PWA instalavel. Sidebar com portugues correto. Escape fecha modais.

---

## FASE 4: Formularios e Feedback (3 itens)

**Objetivo:** Melhorar experiencia de criacao de lancamentos.

| ID | Acao | Estimativa |
|----|------|------------|
| QAF-010 | Formatar campo de data em DD/MM/AAAA (pt-BR) | 15min |
| QAF-011 | Adicionar toast "Transacao criada com sucesso!" | 10min |
| QAF-015 | Melhorar FAB com texto ou "+" visivel | 10min |

**Criterio de saida:** Data em formato brasileiro. Toast de confirmacao. FAB legivel.

---

## FASE 5: Contas e Modais (3 itens)

**Objetivo:** Corrigir problemas de interacao na pagina de Contas.

| ID | Acao | Estimativa |
|----|------|------------|
| QAF-006 | Fix botao Fechar do modal de edicao de conta | 15min |
| QAF-016 | Diferenciar visualmente modais de criar vs editar conta | 10min |
| QAF-007 | Remover dados seed de QA de producao | 10min |

**Criterio de saida:** Modais de conta totalmente funcionais em mobile. Sem dados de teste.

---

## FASE 6: Acessibilidade e Seed (3 itens)

**Objetivo:** Melhorar acessibilidade e dados de demonstracao.

| ID | Acao | Estimativa |
|----|------|------------|
| QAF-017 | Auditar e adicionar aria-label em botoes icon-only | 20min |
| QAF-013 | Adicionar transacoes de exemplo no seed | 30min |
| QAF-018 | Limpar erros de console restantes | 15min |

**Criterio de saida:** Leitores de tela funcionam. Dados realistas visiveis. 0 erros no console.

---

## FASE 7: Validacao Final

**Objetivo:** Garantir que tudo funciona antes da demo.

| Acao | Estimativa |
|------|------------|
| Re-testar todas as 12 telas em mobile (390px) e desktop (1440px) | 30min |
| Rodar `npm run type-check` — garantir 0 erros em src/ | 5min |
| Rodar `npm run lint` — garantir 0 erros | 5min |
| Rodar `npm run build` — garantir compilacao limpa | 10min |
| Verificar console em navegacao completa — 0 erros | 10min |
| Testar fluxo completo: login → criar transacao → ver lista → editar → deletar | 15min |

**Criterio de saida:** Build limpo, console limpo, fluxo CRUD completo funcional.

---

## Resumo por Fase

| Fase | Items | Tempo Estimado |
|------|-------|----------------|
| 1. Hotfix | 2 | 50min |
| 2. Consistencia | 4 | 1h05min |
| 3. PWA + Navegacao | 3 | 40min |
| 4. Formularios | 3 | 35min |
| 5. Contas | 3 | 35min |
| 6. A11y + Seed | 3 | 1h05min |
| 7. Validacao | 6 | 1h15min |
| **TOTAL** | **18 acoes + 6 validacoes** | **~6h** |

---

## Ordem de Execucao Recomendada

```
Fase 1 (Hotfix) → Fase 2 (Consistencia) → Fase 3 (PWA) → 
Fase 4 (Forms) → Fase 5 (Contas) → Fase 6 (A11y) → Fase 7 (Validacao)
```

**Pré-requisito para demo:** Completar Fases 1-4 (minimo funcional).
**Demo premium:** Completar Fases 1-7 (produto completo).

---

## Primeiro Passo

```bash
# Iniciar pela correcao do RangeError
# Arquivo provavel: src/app/movimentacoes/page.tsx
# Buscar por: format(date) ou Intl.DateTimeFormat sem validacao previa
grep -rn "format\|DateTimeFormat" src/app/movimentacoes/
```

---

*Plano gerado a partir de auditoria Playwright MCP em producao*
