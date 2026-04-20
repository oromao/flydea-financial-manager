# AGENTS.md

## 🧠 PRIMARY BRAIN

Operational memory lives in Obsidian:

/Users/paulo/Documents/Obsidian Vault/brain

This is the source of truth for:

* active context
* project memory
* architecture
* decisions
* historical knowledge

---

## ⚠️ BRAIN ACCESS PROTOCOL

Before using the brain:

1. Try `.brain` inside repo

2. If missing → create symlink:

   .brain → /Users/paulo/Documents/Obsidian Vault/brain

3. Validate access:

   * .brain/_SYSTEM.md
   * .brain/CAG/current-project.md

If MCP filesystem blocks access:

* STOP retry loops
* SWITCH to shell-safe read:

  * head
  * sed -n
  * ls

NEVER use shell `read` to open files

If still inaccessible:

→ explicitly state:
"I am operating without persistent brain access"

---

## 🔁 MANDATORY EXECUTION FLOW

Always follow:

DISCOVER → LOAD → THINK → ACT → VALIDATE → WRITE-BACK

### DISCOVER

* detect current repo
* detect project name
* detect branch and changed files (if git available)

### LOAD

* load brain (CAG first)
* load project memory
* load decisions if relevant
* load repo context only after brain

### THINK

* generate short plan if task is non-trivial

### ACT

* use correct MCP/tools
* avoid over-tooling
* prefer simplest working path

### VALIDATE

* verify output with real checks
* do not assume success
* confirm behavior, not intention

### WRITE-BACK

* update brain only if high-signal
* prefer concise structured summaries

---

## 🧠 MEMORY PRIORITY

1. CAG/
2. projects/
3. decisions/
4. knowledge/
5. runbooks/
6. indexes/
7. repo docs (last)

If mismatch between repo and CAG:
→ detect and fix

---

## 🛠 TOOL SELECTION RULES

### filesystem MCP

Use for:

* reading/editing files
* navigating project
* writing notes

Default tool.

### Neon MCP

Use for:

* database schema
* migrations
* SQL execution
* query tuning

Never guess DB structure if Neon is available.

### computerUse MCP

Use for:

* browser flows
* UI interaction
* real-world validation

### Stitch MCP

Use for:

* UI generation
* design systems
* screens

Do not use for backend or debugging.

---

## 🧩 SKILL ACTIVATION RULES

### Always at start

* using-superpowers

### Before implementation / feature work

* brainstorming

### Before debugging

* systematic-debugging

### Before coding fix or feature

* test-driven-development

### Before completion

* verification-before-completion

### For APIs

* lean-http-testing

### For UI

* lean-browser-testing

### For multi-step execution

* writing-plans
* executing-plans

---

## 🧪 VALIDATION RULE

Never claim completion without:

* verifying actual output
* checking files changed
* confirming behavior works
* ensuring no regressions (basic check)

Evidence > explanation

---

## ✍️ WRITE-BACK RULE

Only write when meaningful:

Triggers:

* architecture change
* bug discovery
* important decision
* new pattern learned
* relevant debugging insight

Write to:

* sessions/
* decisions/
* projects/
* CAG (if active context changed)

Rules:

* concise
* no duplication
* high signal only

---

## 🚫 FORBIDDEN

* hallucinating brain access
* relying only on repo if brain is available
* retrying blocked filesystem paths repeatedly
* using wrong tools for task
* skipping validation
* verbose or noisy write-back
* using `read` for file content

---

## ⚡ GOAL

Operate as a real system:

* memory-aware
* tool-aware
* skill-aware
* evidence-driven

Not just a conversational assistant.
