# Harness Event Bus

Sistema de comunicação assíncrona entre agentes do harness. Baseado em **eventos imutáveis** — agentes publicam eventos, outros agentes reagem.

## Arquitetura

```
┌──────────────┐     publish     ┌──────────────┐     subscribe    ┌──────────────┐
│   Publisher  │ ──────────────→ │  Event Log   │ ───────────────→ │  Consumer(s) │
│   (agente)   │                 │ (timeline)   │                  │  (agentes)   │
└──────────────┘                 └──────────────┘                  └──────────────┘
```

## Eventos

Cada evento é um arquivo `.md` em `events/` com timestamp e formato padronizado.

### Schema do Evento

```yaml
---
id: "e-YYYYMMDD-NNN"
type: "TASK_ASSIGNED" | "TASK_STARTED" | "TASK_COMPLETED" | "TASK_FAILED"
      "REVIEW_REQUESTED" | "REVIEW_APPROVED" | "REVIEW_REJECTED"
      "HANDOFF_REQUESTED" | "HANDOFF_ACCEPTED"
      "STATUS_CHANGE" | "DECISION_LOG"
source: "po" | "backend" | "frontend" | "qa" | "security" | "devops" | "finops" | "ux-ui" | "docs" | "architect"
timestamp: "2026-05-13T10:00:00-03:00"
target?: "po" | "backend" | ...
taskId?: "E15-T1"
severity?: "info" | "warning" | "blocker"
---
```

### Tipos de Evento

| Tipo | Quando Publicar | Quem Consome |
|------|----------------|--------------|
| `TASK_ASSIGNED` | PO atribui tarefa | Agente designado |
| `TASK_STARTED` | Agente inicia trabalho | PO, QA |
| `TASK_COMPLETED` | Agente termina trabalho | PO, QA, próximo agente |
| `TASK_FAILED` | Agente encontra bloqueio | PO, Architect |
| `REVIEW_REQUESTED` | Código pronto para review | QA, Security |
| `REVIEW_APPROVED` | Review aprovado | PO, autor |
| `REVIEW_REJECTED` | Review rejeitado | Autor, PO |
| `HANDOFF_REQUESTED` | Agente pede handoff | Próximo agente na cadeia |
| `HANDOFF_ACCEPTED` | Handoff aceito | Agente anterior |
| `STATUS_CHANGE` | Mudança de estado geral | Todos |
| `DECISION_LOG` | Decisão arquitetural | Architect, Todos |

## Fluxo

1. Agente publica evento → arquivo criado em `events/`
2. Agentes consumidores verificam `events/` por novos eventos (polling)
3. Ao processar, agente publica evento de resposta
4. Eventos são imutáveis — nunca editados, apenas lidos

## Boas Práticas

- Publique um evento por ação
- Inclua `taskId` sempre que aplicável
- Use `severity: blocker` para impedimentos reais
- Para decisões importantes, publique também em `DECISION_LOG`
