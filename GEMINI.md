# GEMINI.md

## 🧠 PRIMARY MEMORY SYSTEM

Treat the Obsidian brain as the primary persistent memory:

/Users/paulo/Documents/Obsidian Vault/brain

The brain is the source of truth for:

* active context
* project memory
* decisions
* reusable knowledge
* session continuity

Do not rely only on repository docs when brain access is available.

---

## ⚠️ BRAIN ACCESS RULE

Before using the brain, ALWAYS verify access.

Preferred order:

1. If `.brain` already exists in the repo, use it.

2. If `.brain` does not exist, create:

   .brain → /Users/paulo/Documents/Obsidian Vault/brain

3. Verify access by checking:

   * .brain/_SYSTEM.md
   * .brain/CAG/current-project.md

If MCP filesystem cannot follow the symlink because of sandbox restrictions:

* do NOT loop
* do NOT waste time trying many variants
* immediately switch to shell-safe file reading using:

  * `head`
  * `sed -n`
  * `ls`
  * `grep`

Never use shell `read` to read files.

If brain access is still unavailable, state clearly:
"I am operating without persistent brain access"

---

## 🔁 MANDATORY SESSION START

At the start of every session:

1. Activate `using-superpowers`
2. If the task involves implementation, design, or behavior changes, activate `brainstorming`
3. Ensure brain access
4. Load:

   * .brain/_SYSTEM.md
   * .brain/CAG/current-project.md
   * .brain/CAG/current-context.md
   * .brain/CAG/current-goals.md
5. Identify current repo and project
6. Only then reason and act

Do not skip the startup sequence.

---

## 🧠 MEMORY PRIORITY

Always load memory in this order:

1. CAG
2. project-specific memory
3. decisions
4. knowledge
5. rag
6. repo docs only after memory

If current CAG conflicts with current repo, detect and report the mismatch.

---

## 🛠 MCP ROUTING RULES

Choose the BEST MCP for the job instead of defaulting blindly.

### filesystem MCP

Use for:

* reading project files
* editing files
* searching code
* inspecting directory structure
* writing project-local notes
* reading GEMINI.md / AGENTS.md / local docs

Default MCP for local repo work.

### Neon MCP

Use for:

* Postgres schema inspection
* migrations
* branch DB workflows
* SQL execution
* query tuning
* explaining SQL
* comparing schema
* database diagnostics

Do not guess DB structure when Neon tools are available.

### computerUse MCP

Use for:

* browser-based validation
* UI interaction
* clicking through app flows
* filling forms
* capturing page/app state

Use this for real UI verification when browser interaction is needed.

### Stitch MCP

Use for:

* screen generation
* design system creation
* screen editing
* design variants
* UI concept exploration

Use this for UI/design generation work, not for core code debugging.

---

## 🧩 SKILL ROUTING RULES

Always choose skills intentionally.

### Required baseline

* `using-superpowers` at the beginning of every session

### Before implementation / feature work / behavior changes

* `brainstorming`
* if multi-step work: `writing-plans`
* if executing a plan: `executing-plans`
* if isolated feature branch is useful: `using-git-worktrees`

### Before bug fixing

* `systematic-debugging`

### Before feature implementation or bugfix code

* `test-driven-development`

### Before saying work is complete

* `verification-before-completion`

### For browser/UI validation

* `lean-browser-testing`

### For API / endpoint / backend validation

* `lean-http-testing`

### For multi-part execution in one session

* `subagent-driven-development`

### For code review moments

* `requesting-code-review`
* `receiving-code-review`
* `code-review-commons`

### For design work

* use Designpowers flow only when the task is actually design-heavy:

  * `using-designpowers`
  * then relevant design skills

Do not activate unrelated marketing/design skills for normal engineering work.

---

## 🚨 TOOL DISCIPLINE

* Prefer the simplest tool that solves the task
* Do not overuse browser or design tools for plain code changes
* Do not use Neon if filesystem/code inspection is enough
* Do not use Stitch for implementation-only tasks
* Do not keep retrying blocked filesystem symlink reads
* If one access method is blocked, switch method quickly

---

## 🧪 VALIDATION REQUIREMENT

Before answering or claiming success, internally verify:

* brain access status
* current project identity
* skill choice made
* MCP choice made
* actual evidence collected
* relevant checks/tests executed

If code or configuration was changed, do not claim completion without validation.

---

## ✍️ WRITE-BACK RULE

After meaningful work, write back concise memory when relevant:

* update CAG if active project/focus changed
* update project memory if project understanding improved
* update decisions if architecture changed
* update knowledge if reusable patterns were found
* update session memory if meaningful actions were taken

Write high-signal memory only.
Do not spam the brain.

---

## 🚫 FORBIDDEN

* Do not hallucinate brain access
* Do not pretend MCP reads succeeded if they did not
* Do not use only repo docs if brain is accessible
* Do not skip required skills
* Do not claim completion without verification
* Do not use shell `read` for file content
* Do not spend many turns fighting the same sandbox restriction

---

## ⚡ OPERATING GOAL

Use the brain as a real cognitive layer.
Use the best MCP for the task.
Use the right skill before acting.
Stay evidence-based.
Prefer execution with validation over vague reasoning.
