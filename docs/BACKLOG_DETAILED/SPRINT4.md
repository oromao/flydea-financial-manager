# Sprint 4 — Polimento Premium: Problemas + Design + UX/UI + Responsividade

> **Revisado por:** Backend, Frontend, UX/UI, QA, DevOps, Security, Architect, PO — 4 agentes paralelos
> **Correções aplicadas:** 2 duplicatas removidas · 10 tasks adicionadas · 3 upgrades de prioridade
> **Data:** 2026-05-13

---

## Meta
Fechar todos os bugs/dívidas técnicas, elevar o design system a padrão premium, refinar UX/micro-interações e garantir responsividade mobile impecável.

## Duração
3-4 semanas · ~43 tasks

## Handoff Chain (Corrigida)

```
PO (planeja)
  → Backend (E16-T7, E16-T8, E16-T11, E16-T12, E16-T13)
  → [SYNC GATE: Backend+Frontend - contratos Zod]
  → Frontend (E16-T1..T6, T9 + E17 + E18 + E19)
  → QA (E16-T10, E19-T9, auditorias)
  → Security (E16-T8 Zod audit, E17-T8 CSP)
  → Perf (E19-T10 Lighthouse)
  → Docs (documentar mudanças)
  → PO (fechar sprint)
```

---

## 🔴 Épico 16 — Problemas (Bugs & Dívidas Técnicas)

| ID | Tipo | Módulo | Título | Prioridade | Esforço | Status |
|----|------|--------|--------|------------|---------|--------|
| E16-T1 | Bug | UI | UUID visível em dropdowns — Orçamentos e Editar Lançamento (QA-02 + AU-02) | P0 🔴 | Baixa | pending |
| E16-T2 | Bug | Contas | Botão "Fechar" interceptado por header sticky (QA-04) | P0 🔴 | Baixa | pending |
| E16-T3 | UX | Transações | Data ISO → pt-BR nos formulários (QA-08) | P1 🟡 | Baixa | pending |
| E16-T4 | Bug | Console | Erros de console remanescentes — investigar causas-raiz APIs (QA-09) | **P0 🔴** | Média | pending |
| E16-T5 | **✕ REMOVIDO** | — | Duplicata do E2-T1 (já concluído) | — | — | removed |
| E16-T6 | Bug | UI | Link quebrado /import em empty-states (AN1-T6) | P1 🟡 | Baixa | completed ✅ |
| E16-T7 | Débito | Global | 31 any types → 0 — pré-work: mapear arquivos com any | P1 🟡 | Média | pending |
| E16-T8 | Débito | APIs | Zod validation 19/44 → 44/44 APIs | **P0 🔴** | Alta | pending |
| E16-T9 | Débito | A11y | ARIA labels em 6 componentes (AN4-T6) | P1 🟡 | Média | pending |
| E16-T10 | QA | Global | Auditoria final + checklist regressão 10 fluxos | P1 🟡 | Média | pending |
| **E16-T11** | **Bug 🆕** | **Auth** | **Fix middleware bloqueia cron routes** | **P0 🔴** | Baixa | pending |
| **E16-T12** | **Segurança 🆕** | **API** | **SSRF protection no image-proxy** | **P1 🟡** | Baixa | pending |
| **E16-T13** | **Débito 🆕** | **API** | **Padronizar formato de erro das APIs** | **P1 🟡** | Média | pending |

---

## 🎨 Épico 17 — Design System Premium

| ID | Tipo | Módulo | Título | Prioridade | Esforço | Status |
|----|------|--------|--------|------------|---------|--------|
| E17-T1 | Débito | Global | ~40 cores hardcoded → tokens do design system | P1 🟡 | Alta | pending |
| E17-T2 | Design | Global | Dark mode consistency audit | P1 🟡 | Média | pending |
| E17-T3 | Design | Global | Tipografia consistente: headings, body, caption | P1 🟡 | Média | pending |
| E17-T4 | Design | UI | Cards premium: elevation, hover, selected, active | P1 🟡 | Média | pending |
| E17-T5 | Design | UI | Shadow system audit (todas sombras via tokens) | P3 🔵 | Baixa | pending |
| E17-T6 | Design | UI | Gradientes e superfícies premium consistentes | P2 🟢 | Baixa | pending |
| E17-T7 | Design | UI | Ícones consistentes: audit lucide-react | P2 🟢 | Média | pending |
| **E17-T8** | **Débito 🆕** | **UI** | **Border-radius audit (4 níveis)** | **P2 🟢** | Baixa | pending |
| **E17-T9** | **Débito 🆕** | **UI** | **Spacing audit (múltiplos de 4px)** | **P2 🟢** | Baixa | pending |

---

## ✨ Épico 18 — UX & Micro-Interações

| ID | Tipo | Módulo | Título | Prioridade | Esforço | Status |
|----|------|--------|--------|------------|---------|--------|
| E18-T1 | UX | Global | Skeleton loading em todas as páginas | P1 🟡 | Alta | pending |
| E18-T2 | UX | Global | Page transitions consistentes (framer-motion) | **P1 🟡** | Média | pending |
| E18-T3 | UX | UI | Stagger animation em listas + corrigir AnimatedList key bug | P2 🟢 | Média | pending |
| E18-T4 | **✕ REMOVIDO** | — | Duplicata do E7-T5 (já concluído) | — | — | removed |
| E18-T5 | UX | UI | Empty states premium + consolidar empty-state/empty-states | P1 🟡 | Média | pending |
| E18-T6 | UX | UI | Loading states em botões (LoadingButton audit) | P2 🟢 | Baixa | pending |
| E18-T7 | UX | Global | Error boundaries com fallback amigável | P1 🟡 | Média | pending |
| E18-T8 | UX | UI | Feedback visual: checkmark save, shake erro, pulse badge | P2 🟢 | Média | pending |
| **E18-T9** | **A11y 🆕** | **Global** | **prefers-reduced-motion support** | **P1 🟡** | Baixa | pending |
| **E18-T10** | **A11y 🆕** | **Global** | **Keyboard navigation audit (tab order, focus visible, modal trapping)** | **P1 🟡** | Média | pending |
| **E18-T11** | **A11y 🆕** | **Global** | **Live region announcements (aria-live)** | **P2 🟢** | Média | pending |

---

## 📱 Épico 19 — Responsividade & Mobile

| ID | Tipo | Módulo | Título | Prioridade | Esforço | Status |
|----|------|--------|--------|------------|---------|--------|
| E19-T1 | UX | Mobile | Últimos touch targets < 44px (AN5-T4) | P0 🔴 | Baixa | pending |
| E19-T2 | UX | Mobile | Keyboard-aware forms em todas as páginas | P1 🟡 | Alta | pending |
| E19-T3 | UX | Mobile | Pull-to-refresh em todas as listas + decisão lib | P1 🟡 | Média | pending |
| E19-T4 | UX | Mobile | Safe area insets consistentes em toda UI | P1 🟡 | Média | pending |
| E19-T5 | UX | Mobile | FormWizard completo (E9-T4 partial → definir escopo exato) | P1 🟡 | Alta | pending |
| E19-T6 | UX | Mobile | Bottom sheet para ações mobile consistentes | P2 🟢 | Média | pending |
| E19-T7 | UX | Mobile | Swipe actions consistentes (editar, excluir) | P2 🟢 | Média | pending |
| E19-T8 | UX | Mobile | Responsive tables em todas as páginas | P1 🟡 | Alta | pending |
| E19-T9 | QA | Mobile | Auditoria iPhone 16 + iPhone SE + iPad (viewport criteria) | P1 🟡 | Média | pending |
| E19-T10 | Perf | Global | Lighthouse Mobile > 90, Desktop > 95 — baseline + 3 subtarefas | P1 🟡 | Alta | pending |
| **E19-T11** | **Perf 🆕** | **Mobile** | **Virtualized lists para grandes datasets** | **P1 🟡** | Média | pending |
| **E19-T12** | **UX 🆕** | **Mobile** | **Touch feedback (ripple/highlight) ao tap** | **P2 🟢** | Baixa | pending |
| **E19-T13** | **UX 🆕** | **Mobile** | **Landscape orientation check** | **P2 🟢** | Baixa | pending |

---

## Prioridades

| Prioridade | Tasks |
|------------|-------|
| P0 🔴 | E16-T1, E16-T2, E16-T4, E16-T8, E16-T11, E19-T1 |
| P1 🟡 | E16-T3, E16-T6, E16-T7, E16-T9, E16-T10, E16-T12, E16-T13, E17-T1..T4, E18-T1, E18-T2, E18-T5, E18-T7, E18-T9, E18-T10, E19-T2..T5, E19-T8..T11 |
| P2 🟢 | E17-T6..T9, E18-T3, E18-T6, E18-T8, E18-T11, E19-T6, E19-T7, E19-T12, E19-T13 |
| P3 🔵 | E17-T5 |

## Ordem de Execução (Semanas)

### Semana 1 — P0s + Fundação
```
E16-T11 (middleware cron)  →  E16-T4 (console errors)  →  E16-T8 (Zod)
E16-T1 (UUID dropdowns)    →  E16-T2 (modal Fechar)     →  E19-T1 (touch targets)
```

### Semana 2 — Backend + Design Tokens
```
E16-T7 (any types)  →  E16-T12 (SSRF)  →  E16-T13 (error format)
E16-T3 (data ISO)   →  E16-T6 (link)   →  E16-T9 (ARIA)
E17-T1 (cores)      →  E17-T2 (dark mode)
```

### Semana 3 — Design + UX Core
```
E17-T3 (tipografia)  →  E17-T4 (cards)  →  E17-T6..T9 (shadows, gradients, border, spacing)
E18-T1 (skeletons)   →  E18-T5 (empty states)  →  E18-T7 (error boundaries)
E18-T2 (transitions) →  E18-T9 (reduced-motion)
```

### Semana 4 — UX Final + Responsividade + Validação
```
E18-T3 (stagger)  →  E18-T6 (loading)  →  E18-T8 (feedback)  →  E18-T10 (keyboard)  →  E18-T11 (live regions)
E19-T2 (keyboard forms)  →  E19-T4 (safe areas)  →  E19-T8 (responsive tables)
E19-T3 (pull-to-refresh)  →  E19-T5 (FormWizard)  →  E19-T11 (virtualized)
E19-T6..T7 (bottom sheet, swipe)  →  E19-T9 (audit)  →  E19-T10 (Lighthouse)
E16-T10 (QA final)  →  Security review → Docs → PO close
```

---

*Criado: 2026-05-13 · Versão 2.0 (pós-revisão 4 agentes)*
