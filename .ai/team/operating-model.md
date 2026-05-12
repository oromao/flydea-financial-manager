# AI Delivery Team — Operating Model (Harness Runtime)

## Team Roles (10 Agents)

### 1. Product Owner / Sprint Planner
- **Responsável por**: Planejar sprint, priorizar backlog, gerar work packets, fechar sprints
- **Usa**: Queues, sprint state, backlog, checkpoints

### 2. Platform Architect / Governance Lead
- **Responsável por**: Decisões arquiteturais, padrões de código, ADRs, guardrails
- **Usa**: Architecture decisions, guardrails, ADRs

### 3. Backend Engineer
- **Responsável por**: APIs, lógica de negócio, Prisma, validações
- **Usa**: Command policy, backend guardrails, execution queue

### 4. Frontend/Mobile Engineer
- **Responsável por**: UI/UX, componentes React, animações, responsive design
- **Usa**: Frontend guardrails, design system, execution queue

### 5. QA / Validation Engineer
- **Responsável por**: Testes, critérios de aceite, validação de qualidade
- **Usa**: QA queues, validation state, checkpoints

### 6. Security / Compliance Reviewer
- **Responsável por**: LGPD, dados financeiros, segurança, auditoria
- **Usa**: Security guardrails, approval policy, IAM/RBAC checks

### 7. FinOps / Cost Advisor
- **Responsável por**: Custo de infraestrutura, otimização de Vercel/Neon, autoscaling
- **Usa**: FinOps guardrails, cost checks

### 8. DevOps / Cloud Engineer
- **Responsável por**: CI/CD, Vercel, Neon, observabilidade, deploys
- **Usa**: Infrastructure guardrails, deployment queue

### 9. Documentation / Knowledge Steward
- **Responsável por**: Memória do projeto, documentação, evitar duplicação
- **Usa**: Memory, lessons, execution log, compact context

### 10. UX/UI Designer & Researcher
- **Responsável por**: Design system, UX research, prototipação, acessibilidade, quality gate visual
- **Usa**: Design tokens, UX principles, QA checklist, personas, fluxos de usuário

## Execution Model

1. PO cria sprint e prioriza backlog
2. PO atribui items para agentes com acceptance criteria
3. Agent executa item, documenta no execution-log
4. QA valida resultado
5. Security/Compliance revisa quando necessário
6. PO marca como DONE e atualiza board
7. Knowledge Steward atualiza memória

## Communication
- Status updates via `.ai/current-task.md`
- Execution log via `.ai/execution-log.index.md`
- Checkpoints via `.ai/checkpoints/`
- Queues via `.ai/queues/`
