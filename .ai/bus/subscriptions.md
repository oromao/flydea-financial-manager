# Subscriptions — Quem Escuta o Quê

Matriz de eventos que cada agente deve consumir.

| Agente | Assina Eventos |
|--------|---------------|
| **PO** | `TASK_COMPLETED`, `TASK_FAILED`, `REVIEW_APPROVED`, `REVIEW_REJECTED`, `HANDOFF_REQUESTED`, `DECISION_LOG`, `STATUS_CHANGE` |
| **Backend** | `TASK_ASSIGNED` (quando target=backend), `REVIEW_REQUESTED` (backend), `HANDOFF_ACCEPTED` |
| **Frontend** | `TASK_ASSIGNED` (quando target=frontend), `REVIEW_REQUESTED` (frontend), `HANDOFF_ACCEPTED` |
| **QA** | `TASK_COMPLETED`, `REVIEW_REQUESTED` (qa), `HANDOFF_ACCEPTED` |
| **Security** | `TASK_COMPLETED` (quando envolve dados sensíveis), `REVIEW_REQUESTED` (security) |
| **DevOps** | `TASK_COMPLETED` (quando envolve infra), `STATUS_CHANGE`, `DECISION_LOG` (se impacta infra) |
| **FinOps** | `DECISION_LOG` (se impacta custo), `STATUS_CHANGE` |
| **UX/UI** | `TASK_ASSIGNED` (quando target=ux-ui), `REVIEW_REQUESTED` (ux-ui) |
| **Docs** | `TASK_COMPLETED` (todo) — documentar o que foi feito |
| **Architect** | `TASK_FAILED`, `DECISION_LOG`, `REVIEW_REJECTED` (se architectural), `STATUS_CHANGE` |

## Regras

1. Cada agente DEVE verificar seus eventos ao iniciar um ciclo
2. Processar eventos na ordem do timestamp
3. Ao processar, publicar evento de resposta (ex: `TASK_STARTED` ao pegar uma task)
4. Eventos não processados em 24h escalam para PO
