---
id: "e-20260513-006"
type: "TASK_ASSIGNED"
source: "po"
timestamp: "2026-05-13T10:11:00-03:00"
target: "backend"
taskId: "E16-T8"
severity: "high"
---

## E16-T8 — Zod validation 19/44 → 44/44 APIs (P0)

25+ APIs sem validação. Cada API route precisa de:
1. Zod schema para input
2. Error handler padronizado
3. Testes opcionais

Sugestão: agrupar por módulo (Contas, Transações, Recorrências, Agentes, Misc).
Sync gate com Frontend após ~15 APIs validadas.
