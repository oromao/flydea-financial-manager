# FlyDea — Backlog Mestre (v2.0)

> **Atualizado:** 2026-04-30 — Pós-auditoria completa  
> **Versão anterior:** BACKLOG_MASTER.md v1.0 (items E1-E6, 94% concluídos)  
> **Novo backlog:** 6 épicos pós-auditoria (AN1-AN6) + itens legados pendentes

---

## RESUMO RÁPIDO

| Épico | Prioridade | Itens | Status |
|-------|-----------|-------|--------|
| AN1 — Correções Críticas (crash/visual) | P0 | 6 | pendente |
| AN2 — Segurança e Validação | P0 | 4 | pendente |
| AN3 — Qualidade de Código | P1 | 5 | pendente |
| AN4 — Design System e Tokens | P1 | 6 | pendente |
| AN5 — UX Premium e Mobile | P1 | 6 | pendente |
| AN6 — Testes e Cobertura | P1 | 5 | pendente |
| **Legado pendente** | P2 | 3 | pendente |
| **Doc fix** | P0 | 1 | pendente |

**Total: 36 itens**

---

## ÉPICO AN1 — CORREÇÕES CRÍTICAS (P0)

| ID | Tipo | Título | Complexidade |
|----|------|--------|-------------|
| AN1-T1 | Bug 🔴 | Definir tokens CSS ausentes (popover, ring, input, border, destructive) | Baixa |
| AN1-T2 | Bug 🔴 | Corrigir `.glass-card` para dark mode | Baixa |
| AN1-T3 | Bug 🔴 | Definir classe `apple-button-primary` ou substituir por tokens | Baixa |
| AN1-T4 | Bug 🔴 | Remover último `confirm()` nativo (agents-dashboard.tsx:133) | Baixa |
| AN1-T5 | Bug 🔴 | Substituir 5 `window.location.reload()` por `router.refresh()` | Baixa |
| AN1-T6 | Bug 🔴 | Corrigir link quebrado `/import` em empty-states.tsx:51 | Baixa |

---

## ÉPICO AN2 — SEGURANÇA E VALIDAÇÃO (P0)

| ID | Tipo | Título | Complexidade |
|----|------|--------|-------------|
| AN2-T1 | Segurança | Adicionar validação Zod nas 34 APIs sem validação | Alta |
| AN2-T2 | Segurança | Aplicar rate limiting nas 43 APIs desprotegidas | Média |
| AN2-T3 | Segurança | Adicionar validação client-side (Zod + react-hook-form) em formulários | Média |
| AN2-T4 | Segurança | Verificar e corrigir role checks em admin routes | Baixa |

---

## ÉPICO AN3 — QUALIDADE DE CÓDIGO (P1)

| ID | Tipo | Título | Complexidade |
|----|------|--------|-------------|
| AN3-T1 | Débito | Substituir 104+ `any` types por tipos corretos | Alta |
| AN3-T2 | Débito | Substituir 77+ cores hardcoded por design tokens | Média |
| AN3-T3 | Débito | Adicionar Error Boundaries nas 18 páginas | Média |
| AN3-T4 | Débito | Padronizar estados vazios com `EmptyState` em todas as páginas | Baixa |
| AN3-T5 | Débito | Padronizar loading states com `Skeleton` ou `PageLoading` | Baixa |

---

## ÉPICO AN4 — DESIGN SYSTEM E TOKENS (P1)

| ID | Tipo | Título | Complexidade |
|----|------|--------|-------------|
| AN4-T1 | UI | Refinar paleta de cores (dark mode: fundo preto premium #0A0A0B) | Baixa |
| AN4-T2 | UI | Criar tokens semânticos: `--color-success`, `--color-warning` | Baixa |
| AN4-T3 | UI | Padronizar border-radius: 12px inputs, 16px cards, 24px dialogs | Baixa |
| AN4-T4 | UI | Padronizar sombras Apple-style | Baixa |
| AN4-T5 | UI | Aplicar design tokens nos components (button, confirm-dialog, etc.) | Média |
| AN4-T6 | UI | Adicionar ARIA attributes nos 15 componentes sem acessibilidade | Média |

---

## ÉPICO AN5 — UX PREMIUM E MOBILE (P1)

| ID | Tipo | Título | Complexidade |
|----|------|--------|-------------|
| AN5-T1 | UX | Redesenhar Dashboard com hierarquia premium (AN5-T1 no detailed) | Alta |
| AN5-T2 | UX | Redesenhar formulário de Movimentações com sections e validação | Média |
| AN5-T3 | UX | Redesenhar Orçamentos com progress bar Apple-style | Média |
| AN5-T4 | UX | Corrigir touch targets < 44px (botões tabela 36px, nav icons 32px) | Baixa |
| AN5-T5 | UX | Redesenhar Relatórios (pie labels, gráficos responsivos) | Média |
| AN5-T6 | UX | Padronizar inputs (todos h-12, 48px mobile) | Baixa |

---

## ÉPICO AN6 — TESTES E COBERTURA (P1)

| ID | Tipo | Título | Complexidade |
|----|------|--------|-------------|
| AN6-T1 | QA | Configurar coverage no Vitest (thresholds: 75% linhas) | Baixa |
| AN6-T2 | QA | Testes unitários para 15+ componentes UI | Média |
| AN6-T3 | QA | Testes de integração para 15+ APIs (transactions, accounts, budgets, etc.) | Alta |
| AN6-T4 | QA | Testes E2E para 10 fluxos críticos (Playwright) | Média |
| AN6-T5 | QA | Testes de smoke e regression automatizados | Média |

---

## ITENS LEGADO PENDENTES (P2)

| ID | Tipo | Título | Complexidade |
|----|------|--------|-------------|
| E4-T1 | Feature | Implementar extractInstallments() real (OCR) | Média |
| E5-T1 | Feature | Bank reconciliation workflow | Alta |
| E5-T7 | Feature | LLM Copiloto integration | Alta |

---

## CORREÇÃO DE DOCUMENTAÇÃO (P0)

| ID | Ação |
|----|------|
| DOC-FIX | Atualizar KNOWN_ISSUES.md (está desatualizado — mostra bugs como pending que já foram corrigidos) |

---

## ORDEM DE EXECUÇÃO RECOMENDADA

```
Onda 1: AN1-T1, AN1-T2, AN1-T3, AN1-T4 (crash/visual fixes, 1-2h)
Onda 2: AN1-T5, AN1-T6, DOC-FIX (low hanging fruit, 1h)
Onda 3: AN2-T1, AN2-T2, AN2-T3, AN2-T4 (segurança, 3-4h)
Onda 4: AN4-T1 a AN4-T4 (design tokens, 2h)
Onda 5: AN4-T5, AN4-T6 (aplicar tokens + ARIA, 3h)
Onda 6: AN3-T1 a AN3-T5 (qualidade código, 4-6h)
Onda 7: AN5-T1 a AN5-T6 (UX premium, 6-8h)
Onda 8: AN6-T1 a AN6-T5 (testes, 8-12h)
Onda 9: E4-T1, E5-T1, E5-T7 (features legacy, varia)
```

---
*Backlog versão 2.0 — substitui BACKLOG_MASTER.md v1.0*
