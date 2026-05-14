---
id: "e-20260513-005"
type: "TASK_COMPLETED"
source: "backend"
timestamp: "2026-05-13T10:10:00-03:00"
target: "po"
taskId: "E16-T11"
severity: "info"
---

## E16-T11 — Fix middleware bloqueia cron routes ✅

**Fix:** Added `/api/cron` to middleware matcher exclusion list.

**File changed:** `src/middleware.ts`
- Before: `"/((?!api/auth|login|public|_next/static|_next/image|favicon.ico).*)"`
- After: `"/((?!api/auth|api/cron|login|public|_next/static|_next/image|favicon.ico).*)"`

**Rationale:** Cron routes have their own auth (Bearer token and secret query param). Middleware was intercepting and redirecting before cron auth could validate.

**Verification:** Now Vercel Cron can reach `/api/cron/recurrence` and `/api/cron/agent-scheduler` without being redirected to login.
