# 🔧 Stack de Skills e MCPs — FlyDea Financial Manager

> **Configurado em:** 2026-04-30  
> **OpenCode:** v1.14.30 | **Node:** v22.22.2  
> **Responsável:** IA Arquiteta de Ambiente

---

## 🎯 Objetivo

Stack enxuto e forte para desenvolvimento full stack SaaS mobile-first com:
- Next.js 16 + React 19 + TypeScript + Tailwind + shadcn/ui
- Prisma + PostgreSQL (Neon) + Vercel
- Documentação viva, debugging real, QA, multi-agente

---

## 📊 MCPs Configurados (4)

### ✅ `playwright` — Debug visual e screenshots
| Campo | Valor |
|-------|-------|
| Pacote | `@playwright/mcp` v0.0.72 |
| Status | **Funcionando** (chromium instalado) |
| Token | Não precisa |
| Prioridade | 🔴 Essencial |

**Usar para:** debug de UI mobile-first, screenshot de telas, inspeção de erros visuais, validação de responsividade iPhone 16 (390x844).

```bash
# Teste rápido
npx -y @playwright/mcp --version
```

---

### ✅ `shadcn` — Componentes shadcn/ui via IA
| Campo | Valor |
|-------|-------|
| Pacote | `shadcn@4.6.0 mcp` |
| Status | **Funcionando** |
| Token | Não precisa |
| Prioridade | 🔴 Essencial |

**Usar para:** adicionar componentes shadcn/ui, listar componentes instalados, verificar compatibilidade.

```bash
# Teste rápido
npx -y shadcn@4.6.0 mcp --help
```

---

### ⚠️ `vercel` — Deploy, logs, env vars
| Campo | Valor |
|-------|-------|
| Pacote | `@robinsonai/vercel-mcp` |
| Status | **Precisa de token** |
| Token | `VERCEL_API_TOKEN` em `.agent/mcp_config.json` |
| Prioridade | 🔴 Essencial |

**Como obter o token:**
1. Vercel Dashboard → Settings → Tokens
2. Criar token com escopo "Full Account"
3. Substituir `YOUR_VERCEL_TOKEN` em `.agent/mcp_config.json`

---

### ⚠️ `github` — PRs, issues, branches
| Campo | Valor |
|-------|-------|
| Pacote | `@fre4x/github` v1.0.64 |
| Status | **Precisa de token** |
| Token | `GITHUB_TOKEN` em `.agent/mcp_config.json` |
| Prioridade | 🟡 Recomendado |

> **Nota:** O token do MCP é separado da chave SSH. O SSH funciona para git push/pull, mas o MCP precisa de token pessoal para API GitHub.

**Como obter o token:**
1. GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens
2. Permissões: `Contents: Read`, `Pull requests: Read & Write`, `Issues: Read & Write`
3. Substituir `YOUR_GITHUB_TOKEN` em `.agent/mcp_config.json`

---

## 🧠 Skills Ativas (20)

### 🔴 Essenciais (use em toda sessão)

| Skill | Função |
|-------|--------|
| `nextjs-react-expert` | Performance Next.js/React, Server Components, cache, bundle size |
| `tailwind-patterns` | Tailwind v4, design tokens, container queries |
| `frontend-design` | Design thinking, componentes, layout, cores, tipografia |
| `systematic-debugging` | Debugging em 4 fases com root cause analysis |
| `lint-and-validate` | Lint, typecheck, validação pós-código |
| `clean-code` | Padrões de código limpo, sem over-engineering |

### 🟡 Recomendadas (use conforme demanda)

| Skill | Função |
|-------|--------|
| `api-patterns` | Design de APIs REST, paginação, versionamento |
| `database-design` | Schema, indexing, ORM Prisma decisões |
| `neon-postgres` | Conexão Neon, queries, migrations, debug de banco |
| `mobile-design` | Mobile-first, touch interactions, iPhone 16 patterns |
| `web-design-guidelines` | Audit acessibilidade, UX, design review |
| `testing-patterns` | Unit, integration, mocking strategies |
| `webapp-testing` | E2E, Playwright, deep audit |
| `deployment-procedures` | Deploy seguro, rollback, verificação |
| `nodejs-best-practices` | Async patterns, segurança, arquitetura Node |
| `performance-profiling` | Medição, análise, otimização de performance |

### 🟢 Opcionais (use quando necessário)

| Skill | Função |
|-------|--------|
| `code-review-checklist` | Checklist de code review (segurança, qualidade) |
| `documentation-templates` | Templates para docs, README, API docs |
| `tdd-workflow` | Ciclo RED-GREEN-REFACTOR |
| `i18n-localization` | Internacionalização, traduções, RTL |

---

## ❌ Skills Removidas (irrelevantes)

`game-development`, `geo-fundamentals`, `red-team-tactics`, `rust-pro`, `vulnerability-scanner`, `powershell-windows`, `bash-linux`, `behavioral-modes`, `brainstorming`, `mcp-builder`, `server-management`, `seo-fundamentals`, `python-patterns`, `app-builder`, `intelligent-routing`, `architecture`, `plan-writing`, `parallel-agents`

**Motivo:** Não aplicáveis ao stack Next.js + SaaS + mobile-first.

---

## 🚫 MCPs Descartados

| Nome | Motivo |
|------|--------|
| `context7` | Busca genérica, baixo valor vs skills de documentação do projeto |
| `@neondatabase/mcp` | Não existe como pacote oficial. Substituído pela skill `neon-postgres` |

---

## ⚡ Pendências Manuais

1. **[OBRIGATÓRIO]** Obter `VERCEL_API_TOKEN` e colocar em `.agent/mcp_config.json`
2. **[OPCIONAL]** Obter `GITHUB_TOKEN` (fine-grained) e colocar em `.agent/mcp_config.json`
3. **[VERIFICAR]** Rodar `npm run build` após mudanças para garantir que nada quebrou

---

## 📖 Como Usar Este Stack no Dia a Dia

### Ao iniciar uma sessão:
1. A IA lê `AGENTS.md` → entende o projeto
2. Skills relevantes são carregadas automaticamente via `allowed-tools`
3. MCPs são ativados via config

### Ao codar:
1. `lint-and-validate` — após cada alteração
2. `clean-code` — guia de estilo
3. `nextjs-react-expert` — otimizações específicas

### Ao debugar:
1. `systematic-debugging` — metodologia de 4 fases
2. `playwright` MCP — screenshot/inspector visual
3. `neon-postgres` — queries e schema

### Ao revisar UI/UX:
1. `frontend-design` — criação de componentes
2. `web-design-guidelines` — review de acessibilidade
3. `mobile-design` — padrões mobile
4. `tailwind-patterns` — classes e tokens

### Ao trabalhar com dados:
1. `database-design` — schema e indexing
2. `neon-postgres` — queries Neon
3. `api-patterns` — endpoints e responses

### Ao testar:
1. `testing-patterns` — unit/integration
2. `webapp-testing` — E2E
3. `tdd-workflow` — se seguir TDD

### Ao fazer deploy:
1. `deployment-procedures` — workflow seguro
2. `vercel` MCP — logs e env vars
3. `lint-and-validate` — build check final

---

## 🔝 Top 10 Recursos Mais Úteis

| # | Recurso | Tipo | Por quê |
|---|---------|------|---------|
| 1 | `@playwright/mcp` | MCP | Debug visual mobile-first, screenshots, inspeção de UI renderizada |
| 2 | `nextjs-react-expert` | Skill | Performance tuning do core stack |
| 3 | `shadcn` | MCP | Gerencia componentes shadcn/ui diretamente |
| 4 | `systematic-debugging` | Skill | Metodologia de debug que funciona em qualquer bug |
| 5 | `lint-and-validate` | Skill | Garante que código não quebra build/typecheck |
| 6 | `tailwind-patterns` | Skill | Tailwind v4 moderno e design tokens |
| 7 | `neon-postgres` | Skill | Conexão, queries, debug de banco Neon |
| 8 | `frontend-design` | Skill | Design system, componentes, UX premium |
| 9 | `testing-patterns` | Skill | Estratégias de teste consistentes |
| 10 | `@robinsonai/vercel-mcp` | MCP | Logs, env vars, deploy diagnostics (precisa token) |

---

*Documento gerado para continuidade entre agentes. Atualizar quando houver mudanças no stack.*
