# Sprint 2 — Estabilização & Qualidade

**Goal:** Fechar CI/CD, guardrails, testes, acessibilidade e UX gaps remanescentes para estabilizar o produto

**Duration:** 2 semanas (2026-05-11 até 2026-05-25)

## Items (14)

### P0 — Bloqueantes
| ID | Título | Owner |
|----|--------|-------|
| FLY-002 | CI/CD GitHub Actions | DevOps |
| FLY-003 | Guardrails de segurança | Security |
| FLY-005 | Últimos bugs P0 (QA-05, QA-09) | Backend |

### P1 — Alta Prioridade
| ID | Título | Owner |
|----|--------|-------|
| FLY-004 | Backlog do produto 20+ itens | PO |
| FLY-006 | Cobertura testes 60%+ | QA |
| FLY-007 | 30% gaps UX (26 correções) | Frontend + UX/UI |
| FLY-008 | Monitoramento Vercel | DevOps |
| FLY-009 | Testes E2E fluxos críticos | QA |
| FLY-010 | Performance FCP < 1.5s | Frontend |
| FLY-020 | Zod validation APIs | Backend |
| FLY-021 | Acessibilidade WCAG | UX/UI |
| FLY-022 | Responsividade mobile | Frontend |
| FLY-025 | Esqueci senha + NextAuth | Backend |

### P2 — Melhorias
| ID | Título | Owner |
|----|--------|-------|
| FLY-023 | Navegação mobile — reduzir taps | UX/UI |
| FLY-024 | Archive/deactivate contas | Backend + Frontend |

## Dependencies
- FLY-006 ← FLY-020 (testes dependem de APIs validadas)
- FLY-007 ← FLY-021, FLY-022 (UX gaps incluem acessibilidade e responsividade)
- FLY-025 ← FLY-003 (security guardrails)
