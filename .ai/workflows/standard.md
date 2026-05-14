# Workflow: Standard

Fluxo padrão para tarefas de desenvolvimento.

## Estados

```
BACKLOG → INBOX → ASSIGNED → IN_PROGRESS → CODE_READY → IN_REVIEW → APPROVED → DOCS → DONE
```

## Transições

| De | Para | Evento | Quem |
|----|------|--------|------|
| `BACKLOG` | `INBOX` | Sprint planning | PO |
| `INBOX` | `ASSIGNED` | `TASK_ASSIGNED` | PO |
| `ASSIGNED` | `IN_PROGRESS` | `TASK_STARTED` | Dev |
| `IN_PROGRESS` | `CODE_READY` | Código completo | Dev |
| `CODE_READY` | `IN_REVIEW` | `REVIEW_REQUESTED` | Dev |
| `IN_REVIEW` | `APPROVED` | `REVIEW_APPROVED` | QA |
| `IN_REVIEW` | `IN_PROGRESS` | `REVIEW_REJECTED` | QA |
| `APPROVED` | `DOCS` | `TASK_COMPLETED` | QA |
| `DOCS` | `DONE` | Documentação atualizada | Docs |

## Agentes

| Estado | Dono | Próximo |
|--------|------|---------|
| `BACKLOG` → `ASSIGNED` | PO | Dev (backend/frontend/ux-ui) |
| `ASSIGNED` → `CODE_READY` | Dev | QA |
| `CODE_READY` → `APPROVED` | QA | Docs |
| `APPROVED` → `DONE` | Docs | PO |

## Regras

- Review rejeitado volta para `IN_PROGRESS` (não para `ASSIGNED`)
- Docs só começa após APPROVED
- PO valida DONE e fecha o ciclo
