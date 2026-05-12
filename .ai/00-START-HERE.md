# AI Agent Start Here

This is the official bootstrap file for all AI agents working in this repository.

## Startup Sequence

Read only these files at session start:

1. `.ai/context-compact.md`
2. `.ai/current-task.md`
3. `.ai/backlog.index.md`
4. `.ai/risks.index.md`
5. `.ai/business-context.index.md`
6. `.ai/tools/command-policy.md` (Mandatory before execution)

Do not read full memory files unless necessary.

## Token Economy Principle

Use compact context first.
Use targeted inspection second.
Use full files only when required.
Never scan the entire repository by default.

## Hot Memory

- `.ai/context-compact.md`
- `.ai/current-task.md`
- `.ai/backlog.index.md`
- `.ai/risks.index.md`
- `.ai/business-context.index.md`
- `.ai/platform-strategy.index.md` — only if the task involves architecture, SRE, security, compliance, cost, scalability or product
- `.ai/personas.index.md` — only if the task involves prioritization, product, UX, support, or user impact
- `.ai/market-risks.index.md` — only if the task involves security, LGPD, sensitive data, audit, competition, roadmap or strategic decisions
- `.ai/team/operating-model.md` — only if the task is being handled as sprint/team work
- `.ai/architecture.index.md` — only if architecture is relevant
- `.ai/execution-log.index.md` — only if recent execution history is relevant

## Cold Memory

Read cold memory only when the task explicitly requires it:
- `.ai/memory/backlog.full.md`
- `.ai/memory/execution-log.full.md`
- `.ai/memory/decisions.md`
- `.ai/memory/architecture.full.md`
- `.ai/memory/project-state.full.md`

## Harness Guardrails

When performing specific tasks, respect the domain guardrails:
- `.ai/guardrails/security-guardrails.md`
- `.ai/guardrails/backend-guardrails.md`
- `.ai/guardrails/frontend-guardrails.md`
- `.ai/guardrails/infrastructure-guardrails.md`

## Safety Rules

Follow the Command Policy at `.ai/tools/command-policy.md`.
Never execute `MUTATING_INFRASTRUCTURE` or `DESTRUCTIVE` commands without explicit Human Approval (see `.ai/human-approval/approval-policy.md`).

## Required Behavior

Before taking action:

1. Summarize the current understanding
2. State which additional files are needed, if any
3. Explain why those files are needed
4. Propose a short and safe plan
5. Execute only safe commands
6. Create checkpoints in `.ai/checkpoints/`
7. Update compact memory at the end

## End of Task Updates

Always update:
- `.ai/current-task.md`
- `.ai/backlog.index.md` when backlog changes
- `.ai/execution-log.index.md`
- `.ai/context-compact.md` when project state changes
