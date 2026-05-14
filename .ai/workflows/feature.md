# Workflow: Feature

Fluxo completo para nova funcionalidade, incluindo segurança.

## Estados

```
BACKLOG → INBOX → ASSIGNED → IN_PROGRESS → CODE_READY → QA_REVIEW → SECURITY_REVIEW → APPROVED → DOCS → DONE
```

## Transições

| De | Para | Evento | Quem |
|----|------|--------|------|
| `BACKLOG` | `INBOX` | Sprint planning | PO |
| `INBOX` | `ASSIGNED` | `TASK_ASSIGNED` | PO |
| `ASSIGNED` | `IN_PROGRESS` | `TASK_STARTED` | Dev |
| `IN_PROGRESS` | `CODE_READY` | Código completo | Dev |
| `CODE_READY` | `QA_REVIEW` | `REVIEW_REQUESTED` | Dev → QA |
| `QA_REVIEW` | `SECURITY_REVIEW` | `REVIEW_APPROVED` | QA |
| `QA_REVIEW` | `IN_PROGRESS` | `REVIEW_REJECTED` | QA |
| `SECURITY_REVIEW` | `APPROVED` | `REVIEW_APPROVED` | Security |
| `SECURITY_REVIEW` | `IN_PROGRESS` | `REVIEW_REJECTED` | Security |
| `APPROVED` | `DOCS` | `TASK_COMPLETED` | Dev |
| `DOCS` | `DONE` | Docs atualizada | Docs |

## Regras

- Security review é obrigatório se a feature envolve dados do usuário ou pagamento
- QA e Security podem rodar em paralelo se não houver dependência
- Feature flag deve ser considerada antes do merge
