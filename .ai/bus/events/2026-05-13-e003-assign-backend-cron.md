---
id: "e-20260513-003"
type: "TASK_ASSIGNED"
source: "po"
timestamp: "2026-05-13T10:06:00-03:00"
target: "backend"
taskId: "E16-T11"
severity: "high"
---

## E16-T11 — Fix middleware bloqueia cron routes (P0)

First task: middleware.ts is blocking `/api/cron/*` routes.
Vercel Cron Jobs get 401 redirect.

Repo: `/Users/paulo/flydea-financial-manager`

Read `docs/BACKLOG_DETAILED/SPRINT4.md` for context.
