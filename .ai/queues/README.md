# Harness Queues — Sistema de Filas de Agentes

Sistema de filas estruturadas para distribuição e rastreamento de trabalho entre agentes do harness.

## Estrutura

```
queues/
├── inbox/              ← Tarefas não atribuídas (PO deposita aqui)
│   └── <task-id>.md
├── agents/             ← Filas individuais por agente
│   ├── po/
│   ├── backend/
│   ├── frontend/
│   ├── qa/
│   ├── security/
│   ├── devops/
│   ├── finops/
│   ├── ux-ui/
│   ├── docs/
│   └── architect/
└── handoff/            ← Tarefas em transição entre agentes
    └── <task-id>.md
```

## Ciclo de Vida de uma Task

```
inbox → agent/<role>/pending → agent/<role>/active → handoff → agent/<next>/pending → ... → done
```

### Estados

| Estado | Diretório | Descrição |
|--------|-----------|-----------|
| `pending` | `inbox/` ou `agents/<role>/` | Aguardando agente pegar |
| `active` | `agents/<role>/active/` | Sendo trabalhada |
| `handoff` | `handoff/` | Transição entre agentes |
| `completed` | (removido das filas) | Finalizada |

## Formato do Item na Fila

```yaml
---
id: "E15-T1"
title: "Corrigir Base UI error #51"
priority: "P0" | "P1" | "P2"
status: "pending" | "active" | "handoff"
assignedTo: "backend"
dependsOn: []
source: "auditoria-2026-05-12"
workflow: "bugfix"
---
```

## Regras de Operação

1. PO coloca tasks em `inbox/` no início da sprint
2. Cada agente verifica sua fila ao iniciar um ciclo
3. Ao pegar uma task: mover para `active/` e publicar `TASK_STARTED`
4. Ao concluir: publicar `TASK_COMPLETED` e mover para `handoff/` se houver próximo agente
5. Handoff aceito: mover para fila do próximo agente
6. Tasks sem movimento por 48h: escalar para PO via `TASK_FAILED`

## Handoff Chain (Ordem Padrão)

```
PO → Backend/Frontend/UX-UI → QA → Security (se necessário) → Docs → PO
```
