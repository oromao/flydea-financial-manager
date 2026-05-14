---
id: "e-20260514-016"
type: "STRATEGIC_ASSIGNMENT"
source: "po"
timestamp: "2026-05-14T09:05:00-03:00"
target: "security"
taskId: "BRAINSTORM-SECURITY"
severity: "high"
---

## Security — Análise de Segurança e Compliance

**Status atual:** Idle (aguardando)

**Analisar:**
- E16-T8 audit (Zod) — será que todas as APIs validadas são seguras?
- E17-T8 (CSP audit) — CSP atual é restritivo o suficiente?
- LGPD compliance incompleto: data-export e delete-account endpoints não existem
- Session timeout (NextAuth maxAge) documentado mas não implementado
- Guardrails de segurança estão sendo seguidos no código?
- SSRF protection (E16-T12) — cobre todos os cenários?
- Precisa de pen test / security audit formal?
