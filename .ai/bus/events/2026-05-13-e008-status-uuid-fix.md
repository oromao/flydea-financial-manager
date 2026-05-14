---
id: "e-20260513-008"
type: "STATUS_CHANGE"
source: "backend"
timestamp: "2026-05-13T10:15:00-03:00"
target: "po"
taskId: "E16-T1"
severity: "info"
---

## E16-T1 — UUID Reclassificado

O código do fix UUID já foi aplicado no Sprint 3 (commit f159280). 
SelectValue com children mapeando .find() existe em todos os dropdowns.

E16-T1 vira:
- Verificar se o fix funciona em produção
- Atualizar KNOWN_ISSUES.md e AI_HANDOFF_CONTEXT.md
- Se não funcionar: investigar re-renderização do Base UI

E16-T1a: Documentar/verificar (não codar)
