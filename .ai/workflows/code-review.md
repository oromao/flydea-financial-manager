# Workflow: Code Review

Fluxo para revisão de código sem nova funcionalidade (refatoração, cleanup, tech debt).

## Estados

```
BACKLOG → INBOX → ASSIGNED → IN_PROGRESS → READY_FOR_REVIEW → IN_REVIEW → APPROVED → DONE
```

## Transições

| De | Para | Evento | Quem |
|----|------|--------|------|
| `BACKLOG` | `INBOX` | Tech debt identified | PO/Architect |
| `INBOX` | `ASSIGNED` | `TASK_ASSIGNED` | PO |
| `ASSIGNED` | `IN_PROGRESS` | `TASK_STARTED` | Dev |
| `IN_PROGRESS` | `READY_FOR_REVIEW` | Código refatorado | Dev |
| `READY_FOR_REVIEW` | `IN_REVIEW` | `REVIEW_REQUESTED` | Dev |
| `IN_REVIEW` | `APPROVED` | `REVIEW_APPROVED` | Security/Architect |
| `IN_REVIEW` | `IN_PROGRESS` | `REVIEW_REJECTED` | Reviewer |
| `APPROVED` | `DONE` | Merge realizado | Dev |

## Agentes

| Estado | Dono |
|--------|------|
| `BACKLOG` → `ASSIGNED` | PO ou Architect |
| `ASSIGNED` → `READY_FOR_REVIEW` | Dev |
| `READY_FOR_REVIEW` → `APPROVED` | Security ou Architect |
| `APPROVED` → `DONE` | Dev |

## Regras

- Sem step de QA (confiança no code review)
- Architect ou Security são revisores obrigatórios
- Mudanças arquiteturais exigem aprovação do Architect
