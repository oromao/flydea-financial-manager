# Workflow Engine — Harness

Workflows multi-etapa que definem o ciclo de vida completo de uma task no harness.

## Workflows Disponíveis

| Workflow | Quando Usar | Agentes Envolvidos |
|----------|-------------|-------------------|
| `standard` | Tarefa padrão de desenvolvimento | PO → Dev → QA → Docs → PO |
| `bugfix` | Correção de bug crítico | PO → Dev → QA → PO |
| `feature` | Nova funcionalidade completa | PO → Dev → QA → Security → Docs → PO |
| `code-review` | Revisão de código sem nova feature | PO → Dev → Security/Architect → PO |

## Formato do Workflow

Cada workflow define:
1. **Estados** — milestones da task
2. **Transições** — eventos que disparam mudanças
3. **Agentes** — responsáveis em cada estado
4. **Regras** — condições para avançar
