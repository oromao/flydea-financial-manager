# Sprint 7 — Qualidade & Infraestrutura

> **Origem:** Brainstorming Estratégico 2026-05-14 (e011-e020)
> **Gaps identificados:** Sem feature flags, sem E2E tests, coverage baixa

---

## Tasks

### M3-T1 — Feature Flag System (P0, Alta)
- **Implementação:** Sistema de feature flags em tempo real:
  - `src/lib/feature-flags.ts` — client/server side
  - Storage em Upstash Redis (baixa latência)
  - Admin UI em `/admin/feature-flags` para ativar/desativar flags
- **Flags iniciais:** `onboarding-tour`, `new-dashboard`, `offline-mode`
- **Critério de aceite:** PO pode ativar/desativar feature sem deploy

### M3-T2 — E2E Tests — 5 Fluxos Críticos (P0, Alta)
- **Playwright:** Implementar testes seguindo `docs/e2e-test-plan.md`
- **Fluxos:**
  1. Login → Dashboard (autenticação completa)
  2. Criar transação (formulário completo)
  3. Criar conta → ver no dashboard
  4. Navegação mobile (bottom nav + FAB)
  5. Fluxo de erro (token expirado → redirect login)
- **Critério de aceite:** 5 fluxos passando em CI

### M3-T3 — Test Coverage 90% (P1, Alta)
- **Foco:** Páginas e componentes de UI (atualmente com ~0% coverage)
- **Metas:**
  - API routes: 100% (atual ~95%)
  - Domain: 100% (atual ~100%)
  - Lib: 100% (atual ~87-100%)
  - Pages: > 50% (atual ~0%)
  - Components: > 70% (atual ~0%)
- **Critério de aceite:** `npm run test:coverage` mostra ≥ 90% lines

### M3-T4 — PWA Service Worker (P1, Alta)
- **Implementação:** Service worker com cache-first para assets
- **Estratégia:** Cache assets estáticos, network-first para dados
- **Critério de aceite:** App funciona offline para assets (dados ainda precisam de rede)

### M3-T5 — Lighthouse CI (P1, Média)
- **Implementação:** Adicionar @lhci/cli ao CI pipeline
- **Thresholds:** Mobile > 85, Desktop > 90
- **Critério de aceite:** PRs não podem diminuir scores abaixo do threshold
