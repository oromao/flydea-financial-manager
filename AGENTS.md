# 🧠 FlyDea Financial Manager — AGENTS.md

##Constituição Operacional do Projeto

Este arquivo é a **porta de entrada universal** para qualquer modelo de IA que entrar no projeto.  
Ele define como a IA deve pensar, planejar, executar, validar e documentar dentro deste repositório.

---

## 🔰 O que é o projeto

**FlyDea Financial Manager** é um sistema financeiro pessoal/premium, SaaS, mobile-first (iPhone 16), construído em:

- **Frontend:** Next.js 16 + React 19 + TypeScript + Tailwind CSS + shadcn/ui + Framer Motion
- **Backend:** Next.js API Routes + Prisma ORM
- **Database:** PostgreSQL (Neon)
- **Storage:** Vercel Blob
- **IA:** PicoClaw (insights locais), RAG (busca em documentação local), Tesseract.js (OCR)
- **Arquitetura:** Clean Architecture + Domain-Driven Design (DDD)
- **Timezone:** America/Sao_Paulo
- **Porta local:** 3010

**Live:** https://flydea-financial-manager.vercel.app

---

## 🎯 Objetivo do produto

Um sistema financeiro pessoal com foco em:
- **Clareza** — termos em português, definições financeiras oficiais, zero jargão
- **Controle** — transações, contas, recorrências, orçamentos, fechamento mensal
- **Automação** — agentes IA, OCR, recorrências geradas via cron
- **Inteligência** — insights comportamentais, predições, PicoClaw
- **UX Premium** — mobile-first, iPhone 16, design system consistente

---

## 🗂️ Como a IA deve trabalhar neste repositório

### FLUXO OBRIGATÓRIO (sempre siga esta ordem)

```
1. ENTENDER → 2. PLANEJAR → 3. EXECUTAR → 4. VALIDAR → 5. DOCUMENTAR → 6. HANDOFF
```

---

### ETAPA 1 — ENTENDER ANTES DE AGIR

**Antes de propor, editar ou codar qualquer coisa, a IA DEVE ler:**

| Arquivo | Por que |
|---------|---------|
| `docs/PROJECT_OVERVIEW.md` | Resumo do projeto em 30 linhas |
| `docs/PRODUCT_VISION.md` | Proposta de valor, usuário, dores, diferenciais |
| `docs/MODULE_MAP.md` | Mapa completo: módulos, telas, APIs, entidades, gaps |
| `docs/DOMAIN_RULES.md` | Regras de negócio oficiais (definições financeiras) |
| `docs/ARCHITECTURE_NOTES.md` | Stack, convenções, decisões técnicas ativas |
| `docs/BACKLOG_MASTER.md` | Prioridades atuais — o que fazer primeiro |
| `docs/EXECUTION_LOG.md` | O que já foi feito — evitar retrabalho |
| `docs/KNOWN_ISSUES.md` | Bugs conhecidos — não "descobrir" o que já é conhecido |
| `docs/AI_HANDOFF_CONTEXT.md` | Contexto de continuidade para IA |

**Regra:** Se não leu esses arquivos, não tem permissão para propor mudanças.

---

### ETAPA 2 — NÃO INVENTAR

**A IA NÃO pode:**

- ❌ Inventar feature sem base no backlog ou no contexto do projeto
- ❌ Duplicar feature já existente em outro lugar
- ❌ Mudar arquitetura sem justificar formalmente
- ❌ Criar task vaga ("melhorar algo")
- ❌ Ignorar dependências entre tarefas
- ❌ Ignorar regras de negócio documentadas em `docs/DOMAIN_RULES.md`
- ❌ Propor solução genérica sem conexão com o projeto real

**Regra:** Se a ideia não está no backlog ou não resolve um problema documentado, não execute.

---

### ETAPA 3 — PLANEJAR DIREITO

**Toda nova execução deve:**

1. Identificar o item do backlog (ex: E1-T1)
2. Verificar dependências (o que precisa estar pronto antes?)
3. Entender critérios de aceite (como saber que está pronto?)
4. Respeitar prioridades (P0 antes de P1, P1 antes de P2)
5. Minimizar impacto lateral (não quebrar o que já funciona)
6. **Registrar hipótese explicitamente** quando houver incerteza — marcar com `[HIPÓTESE]`

**Regra:** Planeje no papel (ou em prompts) antes de tocar código.

---

### ETAPA 4 — EXECUTAR COM DISCIPLINA

**Ao implementar qualquer coisa, a IA deve:**

- ✅ Mexer no menor escopo possível
- ✅ Preservar padrões do projeto (Clean Architecture, convenções de nomenclatura)
- ✅ Evitar duplicação de código
- ✅ Manter consistência de UX, domínio e arquitetura
- ✅ Escrever código e documentação de forma legível para outras IAs
- ✅ Usar o tema: design system, tokens Tailwind, cores consistentes

**Regra:** Se precisar refatorar código de outra camada, justificativa obrigatória.

---

### ETAPA 5 — VALIDAR

**Antes de concluir qualquer tarefa, a IA deve:**

- ✅ Verificar se entregou o objetivo real (não apenas a tarefa mecânica)
- ✅ Revisar critérios de aceite do item do backlog
- ✅ Revisar efeitos colaterais (não quebrou outro fluxo?)
- ✅ Revisar consistência com documentação (atualizou se mudou algo?)
- ✅ Marcar o que ficou pendente explicitamente

**Regra:** Não marque como "concluído" se algo ficou para trás sem documentar.

---

### ETAPA 6 — DOCUMENTAR

**Ao finalizar qualquer tarefa, a IA DEVE:**

- ✅ Atualizar `docs/EXECUTION_LOG.md` com entrada da tarefa executada
- ✅ Atualizar status em `docs/BACKLOG_MASTER.md` (pending → in_progress → completed)
- ✅ Atualizar `docs/KNOWN_ISSUES.md` se descobriu novo bug
- ✅ Atualizar `docs/DECISIONS_LOG.md` se houve decisão relevante
- ✅ Atualizar `docs/AI_HANDOFF_CONTEXT.md` se afetar continuidade

**Regra:** Se não atualizou documentação, a tarefa não está pronta.

---

### ETAPA 7 — HANDOFF

**A IA deve sempre deixar o projeto pronto para a próxima IA:**

- ✅ Contexto claro: o que foi feito, o que falta, o que mudou
- ✅ Pendências claras: o que ainda precisa ser executado
- ✅ Próximos passos claros: qual item do backlog attacking next
- ✅ Sem ambiguidades: nenhuma dúvida sobre o estado do projeto

**Regra:** Se outra IA não consegue entender o projeto em 5 minutos lendo os docs, o handoff falhou.

---

## 📋 Padrões de Comportamento

### Para qualquer modelo (GPT, Claude, Gemini, Qwen, DeepSeek, etc)

1. **Sempre leia o contexto antes de agir** — não assuma, não infira, leia os docs.
2. **Sempre respeite a stack** — Next.js, React, TypeScript, Prisma, Tailwind. Não introduza outras libs sem necessidade.
3. **Sempre mantenha a arquitetura** — Clean Architecture + DDD. Não misture camadas.
4. **Sempre siga as convenções** — nomenclatura, estrutura de arquivos, padrões de código.
5. **Sempre documente decisões** — se mudou algo que estava funcionando, registre o porquê.
6. **Sempre respeite o timezone** — America/Sao_Paulo. Datas em UTC midnight.
7. **Sempre considere o mobile** — foco em iPhone 16 (390x844). Desktop é derivado.

### Para tarefas de código

1. **Nunca quebre a build** — rode `npm run build` antes de commitar.
2. **Nunca quebre testes** — rode `npm run test` e garanta que passa.
3. **Nunca commite código com erros de lint** — rode `npm run lint`.
4. **Nunca commite sem typecheck** — rode `npm run type-check`.

### Para tarefas de documentação

1. **Mantenha consistência** — se alterou um documento, verifique se não quebrou links internos.
2. **Mantenha atualidade** — se alterou algo no código, atualize a documentação que fala sobre isso.
3. **Mantenha clareza** — use títulos, listas, tabelas. Não escreva parágrafos imensos.

---

## 🚨 Regras de Segurança

1. **Nunca exponha segredos** — não faça log de variáveis de ambiente, API keys, senhas.
2. **Nunca use dados reais** — se precisar de exemplo, use dados fictícios.
3. **Nunca modifique migrations de produção** — apenas crie novas.
4. **Nunca desative autenticação** — NextAuth é mandatório.
5. **Nunca faça commit de arquivos grandes** — (.env, node_modules, .next, etc.) — use .gitignore.

---

## 📁 Estrutura de Arquivos Obrigatória

```
/                           # Root
├── AGENTS.md              # ESTE ARQUIVO — constituição operacional
├── docs/
│   ├── PROJECT_OVERVIEW.md
│   ├── PRODUCT_VISION.md
│   ├── MODULE_MAP.md
│   ├── DOMAIN_RULES.md
│   ├── ARCHITECTURE_NOTES.md
│   ├── UX_PRINCIPLES.md
│   ├── BACKLOG_MASTER.md
│   ├── BACKLOG_DETAILED/   # Um arquivo por item do backlog
│   ├── EXECUTION_LOG.md
│   ├── DECISIONS_LOG.md
│   ├── QA_CHECKLIST.md
│   ├── RELEASE_READINESS.md
│   ├── KNOWN_ISSUES.md
│   └── AI_HANDOFF_CONTEXT.md
└── (demais arquivos do projeto)
```

---

## 🔗 Referências Essenciais

| Recurso | Caminho |
|---------|---------|
| README do projeto | `./README.md` |
| Arquitetura técnica | `./ARCHITECTURE.md` |
| Prisma Schema | `./prisma/schema.prisma` |
| Engine financeira | `./src/lib/financial-engine.ts` |
| Testes | `./__tests__/` |
| E2E | `./tests/` |
| Design System | `./src/components/ui/` |

---

## 📌 Primeira Tarefa para Qualquer IA

Se você acabou de entrar no projeto e não sabe por onde começar:

1. **Leia** `docs/PROJECT_OVERVIEW.md` (2 min)
2. **Leia** `docs/BACKLOG_MASTER.md` (3 min)
3. **Leia** `docs/EXECUTION_LOG.md` (2 min)
4. **Escolha** o primeiro item P0 no backlog (geralmente E1-T1)
5. **Execute** seguindo o template em `docs/BACKLOG_DETAILED/E1-T1.md`
6. **Documente** o que fez em `docs/EXECUTION_LOG.md`
7. **Atualize** `docs/AI_HANDOFF_CONTEXT.md` com o estado atual

---

## ⚙️ Como editar este arquivo

Se precisar alterar este `AGENTS.md`:

1. Crie um item no backlog (ex: E0-T1)
2. Discuta a mudança em `docs/DECISIONS_LOG.md`
3. Marque com versão (ex: v2.0, data)
4. Documente o reason da mudança
5. Atualize todos os arquivos que referenciam este documento

---

**Este arquivo é a constituição do projeto. Respeite-o. Atualize-o. Não oiquebre-o.**

---

*Última atualização: 2026-04-30 — Versão 1.0*