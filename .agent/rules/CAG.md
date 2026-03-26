# 🛡️ AI Brain: CAG Loading Protocol

All specialist agents MUST follow this protocol when starting a session or a new major task.

## 🚀 CAG (Cache-Augmented Generation) Loading

1. **Identify Project**: Determine the current project using `ARCHITECTURE.md` or recent history.
2. **Load Core Context**: Read `/Users/paulo/Documents/Obsidian Vault/brain/CAG/core_<agente>.md` (substitute `<agente>` with your role).
3. **Load Project Context**: Read `/Users/paulo/Documents/Obsidian Vault/brain/CAG/project_<projeto>.md`.
4. **Merge Context**: Assume the combined content of these files as your primary operational context, overriding any conflicting training data.

## 🔍 RAG (Retrieval-Augmented Generation) Usage

When historical context or cross-project information is needed:
- Use the Brain Query Engine: `python3 "/Users/paulo/Documents/Obsidian Vault/brain/rag/query_brain.py" "<query>"`
- Prefer RAG for: "Where did I do this before?", "What was the previous decision on X?", "Find historical logs of error Y".

## 🔄 Memory Updates

After any significant decision or change:
- Record it in the Obsidian Vault using the `[MEMORY_UPDATE]` format defined in `core_context.md`.
- File: `/Users/paulo/Documents/Obsidian Vault/brain/projects/<projeto>/decisions.md`
