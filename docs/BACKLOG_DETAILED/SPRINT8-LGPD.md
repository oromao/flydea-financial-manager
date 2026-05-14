# Sprint 8 — LGPD & Compliance

> **Origem:** Brainstorming Estratégico 2026-05-14 (e011-e020)
> **Gap identificado:** LGPD compliance incompleto

---

## Tasks

### M4-T1 — Data-Export Endpoint (P0, Média)
- **Implementação:** `GET /api/account/data-export`
  - Retorna ZIP com: perfil (JSON), transações (CSV), contas (CSV), orçamentos (CSV), recorrências (CSV), agentes config (JSON)
  - Envia link por email (via Resend) ou download direto
- **UI:** Botão "Exportar meus dados" na página de Perfil
- **Critério de aceite:** Usuário recebe todos os seus dados em formato portável em < 30s

### M4-T2 — Delete-Account Endpoint (P0, Média)
- **Implementação:** `DELETE /api/account` com:
  - Confirmação por email (token de 15 min)
  - Soft-delete: marca como `deletedAt` (período de graça de 30 dias)
  - Hard-delete após 30 dias (cron job)
  - Anonimização de dados em vez de deleção total (LGPD art. 16)
- **UI:** Fluxo de exclusão na página de Perfil com avisos claros
- **Critério de aceite:** Usuário pode solicitar exclusão e ela é processada em < 5 min

### M4-T3 — Session Timeout (P1, Média)
- **Implementação:**
  - NextAuth `maxAge: 86400` (24h) — já documentado mas não ativo
  - Idle detection no frontend: `useIdleTimer` (30 min de inatividade → warning → logout)
  - Refresh token rotation (se suportado pelo provider)
- **Critério de aceite:** Sessão expira após 24h OU 30 min de inatividade

### M4-T4 — Auditoria Acessibilidade WCAG 2.2 (P1, Alta)
- **Ferramentas:** axe-core, Lighthouse a11y audit, manual testing
- **Cobertura:**
  - Contraste de cores (WCAG AA)
  - Navegação por teclado (tab order, focus trapping)
  - ARIA labels e roles
  - prefers-reduced-motion
  - Screen reader testing (VoiceOver)
- **Critério de aceite:** Lighthouse a11y score ≥ 95, sem violações axe-core
