# Workflow: Bugfix

Fluxo acelerado para correção de bugs.

## Estados

```
BACKLOG → INBOX → ASSIGNED → IN_PROGRESS → FIX_READY → IN_REVIEW → VERIFIED → DONE
```

## Transições

| De | Para | Evento | Quem |
|----|------|--------|------|
| `BACKLOG` | `INBOX` | Bug report | PO |
| `INBOX` | `ASSIGNED` | `TASK_ASSIGNED` | PO |
| `ASSIGNED` | `IN_PROGRESS` | `TASK_STARTED` | Dev |
| `IN_PROGRESS` | `FIX_READY` | Fix aplicado | Dev |
| `FIX_READY` | `IN_REVIEW` | `REVIEW_REQUESTED` | Dev |
| `IN_REVIEW` | `VERIFIED` | `REVIEW_APPROVED` | QA |
| `IN_REVIEW` | `IN_PROGRESS` | `REVIEW_REJECTED` | QA |
| `VERIFIED` | `DONE` | Bug confirmado | QA |

## Agentes

| Estado | Dono |
|--------|------|
| `BACKLOG` → `ASSIGNED` | PO |
| `ASSIGNED` → `FIX_READY` | Dev |
| `FIX_READY` → `VERIFIED` | QA |
| `VERIFIED` → `DONE` | QA → PO |

## Regras

- P0 bugs: PO pode pular `INBOX` e ir direto para `ASSIGNED`
- P0 bugs: sem Docs step (documentação opcional)
- Timeout: P0 bug sem movimento em 4h → escalar para Architect
