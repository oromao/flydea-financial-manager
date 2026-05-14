---
id: "e-20260513-007"
type: "TASK_ASSIGNED"
source: "po"
timestamp: "2026-05-13T10:12:00-03:00"
target: "frontend"
taskId: "E16-T1"
severity: "high"
---

## E16-T1 — UUID visível em dropdowns (P0)

Fix UUID appearing instead of names in:
1. Orçamento modal — category dropdown (QA-02 reaberto)
2. Editar Lançamento modal — account dropdown (AU-02)

Root cause: dropdown renderValue/renders not mapping ID → name.
