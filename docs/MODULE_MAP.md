# FlyDea Financial Manager — Mapa de Módulos

## Visão Hierárquica

```
FLYDEA FINANCIAL MANAGER
├── AUTENTICAÇÃO
│   ├── Tela: /login
│   ├── Fluxo: email + senha (NextAuth credentials)
│   ├── Entidades: User (id, email, password, role, name, avatarUrl)
│   ├── APIs: /api/auth/[...nextauth]
│   ├── Gaps: LG-01 (sem "esqueci senha"), LG-03 (erros crus do NextAuth)
│   └── Dependências: Prisma User, NextAuth config
│
├── DASHBOARD (Core)
│   ├── Tela: / (page.tsx)
│   ├── Componentes: src/app/page.tsx, components/dashboard/
│   ├── Dados exibidos:
│   │   ├── Saldo Geral (all-time Σ income - Σ expense)
│   │   ├── Receita do Mês / Despesa do Mês
│   │   ├── Desp. Pendentes / Atrasadas
│   │   ├── Top Gastos (barras por categoria)
│   │   ├── Gráfico receitas vs despesas (Recharts)
│   │   ├── Alertas de orçamento
│   │   ├── WeeklyCashflowForecast
│   │   └── SpendDecisionIndicator
│   ├── APIs: /api/dashboard, /api/cashflow, /api/decision
│   ├── Engine: financial-engine.ts → computeMonthlySummary, computeWeeklyForecast, computeSpendDecision
│   ├── Gaps: D-01 (Y-axis sem label), D-04 (Quick Actions não acionáveis), D-06 (3 APIs separadas sem coordenação)
│   └── Dependências: Transaction, Account, Budget, Category
│
├── MOVIMENTAÇÕES (Core)
│   ├── Tela: /movimentacoes (page.tsx)
│   ├── Componentes: src/app/movimentacoes/page.tsx
│   ├── Fluxos:
│   │   ├── Listar (tabela desktop + cards mobile)
│   │   ├── Criar/Editar (dialog fullscreen no mobile)
│   │   ├── Filtrar (busca, categoria, tipo, payment status)
│   │   ├── Paginar (prev/next apenas, sem números de página)
│   │   ├── Exportar (CSV/XLSX via /api/transactions/export)
│   │   └── Deletar (usa confirm() nativo — GAP M-04)
│   ├── Entidades: Transaction (type, description, amount, date, dueDate, paidAt, paymentStatus, categoryId, accountId, recurrenceId)
│   ├── APIs: /api/transactions (GET, POST), /api/transactions/[id] (GET, PUT, DELETE)
│   ├── Domain: src/domain/transaction/entities/Transaction.ts
│   ├── Use Cases: CreateTransactionUseCase, DeleteTransactionUseCase
│   ├── Gaps: M-01 (dialog mobile sem header sticky), M-02 (12 campos sem seção), M-06 (tabela renderiza no mobile junto com cards)
│   └── Dependências: Category, Account, Recurrence, Tag
│
├── CONTAS (Core)
│   ├── Tela: /contas (page.tsx)
│   ├── Entidades: Account (name, type, balance, color, userId)
│   ├── APIs: /api/accounts
│   ├── Gaps: C-01 (confirm() nativo), C-04 (sem archive/deactivate), C-05 (touch target pequeno no mobile)
│   └── Dependências: Transaction (saldo calculado via transações)
│
├── CONTAS A PAGAR (Core)
│   ├── Tela: /contas-a-pagar (page.tsx)
│   ├── Fluxos:
│   │   ├── Seção: Atrasadas (dueDate < today)
│   │   ├── Seção: Vencem em breve (today ≤ dueDate ≤ today+7)
│   │   ├── Seção: Sem vencimento (dueDate is null)
│   │   └── Marcar como pago (onClick sem confirmação — GAP P-03)
│   ├── Entidades: Transaction onde type=EXPENSE e paymentStatus=PENDING
│   ├── APIs: /api/transactions (filtra PENDING)
│   ├── Gaps: P-01 (filtro é FAKE — não filtra dados), P-03 (sem confirmação ao marcar como pago)
│   └── Dependências: Transaction, Category
│
├── FLUXO DE CAIXA (Core)
│   ├── Tela: /fluxo-caixa (page.tsx)
│   ├── Componentes: components/weekly-cashflow.tsx, components/weekly-cashflow-forecast.tsx, components/invoice-manager.tsx
│   ├── Lógica: W1(1-7), W2(8-14), W3(15-21), W4(22-fim) — definido em financial-engine.ts
│   ├── Entidades: Revenue + RevenueInstallment (receitas parceladas), Transaction (despesas)
│   ├── APIs: /api/cashflow, /api/invoices, /api/revenues
│   ├── Gaps: F-02 (InvoiceManager usa alert() nativo), F-06 (cores hardcoded gray-* em vez de tokens)
│   └── Dependências: Revenue, Transaction, Recurrence
│
├── ORÇAMENTOS (Core)
│   ├── Tela: /orcamentos (page.tsx)
│   ├── Entidades: Budget (categoryId, amount, period, alertAt)
│   ├── APIs: /api/budgets
│   ├── Gaps: O-01 (confirm() nativo), O-04 (sem seletor de período para ver orçamentos passados)
│   └── Dependências: Category, Transaction (para cálculo de gastos vs orçado)
│
├── RECORRÊNCIAS (Core)
│   ├── Tela: /recorrencias (page.tsx)
│   ├── Entidades: Recurrence (description, amount, type, frequency, startDate, nextDate, dayOfMonth, isActive)
│   ├── APIs: /api/recurrences, /api/cron/recurrence (gera transações)
│   ├── Gaps: 🔴 R-01 (delete button sem onClick), 🔴 R-02 (handleDelete nem existe), R-03 (form não reseta ao reabrir)
│   └── Dependências: Transaction (gerada a partir da recorrência), Category
│
├── FECHAMENTO MENSAL (Core)
│   ├── Tela: /fechamento (page.tsx)
│   ├── Lógica: computeClosingSummary = computeMonthlySummary com estrutura específica
│   ├── Export: /api/fechamento/export (CSV), /api/fechamento/export/pdf (PDF)
│   ├── APIs: /api/fechamento
│   ├── Gaps: FE-01 (botões de período transbordam no mobile), FE-03 (sem lista de transações detalhada)
│   └── Dependências: Transaction, Account
│
├── RELATÓRIOS (Core)
│   ├── Tela: /relatorios (page.tsx)
│   ├── Gráficos: Recharts (Pie: gastos por categoria, Bar: evolução mensal)
│   ├── APIs: /api/metrics (dados para gráficos)
│   ├── Gaps: RE-01 (labels do Pie sobrepõem no mobile), RE-03 (sem print styles)
│   └── Dependências: Transaction, Category
│
├── AGENTES IA (Diferencial)
│   ├── Tela: /agents (page.tsx)
│   ├── Componentes: components/agents/agents-dashboard.tsx, agent-form.tsx, agent-execution-history.tsx
│   ├── Entidades: AIAgent, AgentAction, AgentExecution
│   ├── Tipos: BUDGET_REVIEW, EXPENSE_ALERT, INCOME_CHECK, CASHFLOW_FORECAST, SAVINGS_GOAL, CUSTOM
│   ├── Agendamento: /api/cron/agent-scheduler → AgentScheduler.ts → AgentQueue.ts
│   ├── APIs: /api/agents, /api/agents/[id], /api/agents/[id]/executions
│   └── Dependências: Prisma AIAgent, Resend (email), Vercel Cron
│
├── INSIGHTS / INTELIGÊNCIA (Diferencial)
│   ├── Tela: /insights (page.tsx)
│   ├── Entidades: Insight, Prediction, UserIntelligence, InsightTemplate, InsightInteraction, UserBehavioralLog
│   ├── Engine: PicoClaw (src/lib/ai/) — evita repetição, detecta drift comportamental
│   ├── Gaps: Usa "roteamento heurístico local" como fallback — LLM não é chamado
│   └── Dependências: Transaction, Category, UserIntelligence
│
├── COPILOTO (Diferencial)
│   ├── Tela: componente flutuante (financial-ai-chat.tsx)
│   ├── Entidades: CopilotConversation, CopilotMessage
│   ├── RAG: local TF-IDF, sem APIs externas
│   ├── APIs: /api/rag
│   └── Dependências: CopilotConversation, CopilotMessage
│
├── UPLOAD / OCR / IMPORTAÇÃO (Core)
│   ├── Tela: /movimentacoes (dialog), componente: importer.tsx, document-importer.tsx, payment-importer.tsx
│   ├── Fluxo: Upload → Sharp (otimiza) → Tesseract.js (OCR) → document-parser.ts (extração) → document-import/confirm (revisão)
│   ├── Entidades: ImportedDocument, DocumentImportAttempt
│   ├── APIs: /api/document-import, /api/document-import/confirm, /api/upload, /api/blob-download
│   ├── Gaps: extractInstallments() não processa "3x de R$ 1.000,00" adequadamente
│   └── Dependências: Vercel Blob, Tesseract.js, Sharp, Prisma ImportedDocument
│
├── NOTIFICAÇÕES / ALERTAS
│   ├── Tela: /alertas (page.tsx)
│   ├── Entidades: Notification, NotificationPreference
│   ├── APIs: /api/notifications
│   ├── Gaps: AL-01 (mark all read faz N chamadas paralelas em vez de batch)
│   └── Dependências: Resend (email), Prisma Notification
│
├── PERFIL
│   ├── Tela: /perfil (page.tsx)
│   ├── Fluxo: editar nome, upload avatar (Vercel Blob)
│   ├── Gaps: PE-01 (window.location.reload() após salvar), PE-04 (ícone de lixeira para "recarregar")
│   └── Dependências: User, Vercel Blob
│
├── ADMIN (Infra)
│   ├── LOGS: /admin/logs — AuditLog, sem paginação (L-01)
│   ├── APROVAÇÕES: /admin/aprovacoes — ApprovalRequest, sem role check (A-05)
│   └── Dependências: AuditLog, ApprovalRequest, User (role=ADMIN)
│
├── MAIS (NAVEGAÇÃO)
│   ├── Tela: /mais (page.tsx)
│   ├── Função: atalhos para módulos que não cabem na bottom nav
│   └── Gaps: MB-01 (67% dos módulos estão 2+ taps abaixo no mobile)
│
└── INFRAESTRUTURA COMPARTILHADA
    ├── Design System: src/components/ui/ (button, dialog, toast, empty-state, skeleton, etc.)
    ├── Lib: financial-engine.ts, document-parser.ts, blob-storage.ts, ocr/, validations.ts
    ├── Hooks: useCurrencyInput, useCountUp
    ├── Middleware: middleware.ts (auth check)
    └── Prisma: schema.prisma (32 models/tabelas)
```

---

## Entidades Principais (Prisma)

| Entidade | Relacionamento | Observações |
|----------|---------------|-------------|
| User | 1:N com todas | role: ADMIN/MEMBER |
| Transaction | N:1 User, Category, Account | paymentStatus: PENDING/PAID |
| Category | 1:N Transaction, Budget, Recurrence | type: INCOME/EXPENSE |
| Account | 1:N Transaction | type: BANK/WALLET/CREDIT |
| Recurrence | 1:N Transaction | frequency: MONTHLY/WEEKLY |
| Budget | N:1 Category | period: MONTHLY/YEARLY |
| Revenue/RevenueInstallment | Receitas parceladas | separate from Transaction |
| Invoice/InvoiceInstallment | Faturas | separate from Revenue |
| AIAgent | Agentes de automação | schedule: CRON |
| CopilotConversation | Chat com RAG | pageContext: JSON |
| UserIntelligence | Scores comportamentais | riskScore, savingsRate, etc. |
| Insight | Insights gerados | type, priority, impactScore |
| ImportedDocument | OCR results | status: PENDING_REVIEW/IMPORTED/REJECTED |

---

## APIs por Módulo

| Módulo | Rotas |
|--------|-------|
| Auth | `/api/auth/[...nextauth]` |
| Dashboard | `/api/dashboard` |
| Transactions | `/api/transactions`, `/api/transactions/[id]` |
| Accounts | `/api/accounts` |
| Budgets | `/api/budgets` |
| Recurrences | `/api/recurrences`, `/api/cron/recurrence` |
| Cashflow | `/api/cashflow` |
| Fechamento | `/api/fechamento`, `/api/fechamento/export` |
| Reports/Metrics | `/api/metrics` |
| Agents | `/api/agents`, `/api/agents/[id]`, `/api/agents/[id]/executions` |
| Agent Scheduler | `/api/cron/agent-scheduler` |
| Notifications | `/api/notifications` |
| Import/OCR | `/api/document-import`, `/api/upload` |
| RAG | `/api/rag` |
| Invoices | `/api/invoices` |
| Revenues | `/api/revenues` |
| Profile | `/api/profile` |
| Admin Logs | `/api/logs` |
| Admin Aprovacoes | `/api/approvals` |

---

## Gaps Conhecidos por Módulo

### Críticos (P0)
- **Recorrências:** Delete não funciona (R-01, R-02)
- **Contas a Pagar:** Filtro fake (P-01)
- **UI:** glass-card CSS undefined (DS-05, DS-10)
- **UI:** --color-muted undefined (DS-08)
- **Logs:** Sem paginação (L-01)
- **Admin Aprovações:** Sem role check (A-05)

### Alto (P1)
- **Movimentações:** Dialog mobile sem header sticky (M-01), Tabela duplicada no mobile (M-06), FAB overlap (M-09)
- **Global:** confirm() nativo em 3 páginas (M-04, C-01, O-01)
- **Global:** Toast local em 3 páginas (M-05, C-06, O-05)
- **Mobile:** Navegação 2+ taps (MB-01), Dialog swipe-to-close (DS-02)

### Médio (P2)
- **Fluxo de Caixa:** alert() nativo (F-02), cores hardcoded (F-06)
- **Orçamentos:** Sem período histórico (O-04)
- **Relatórios:** Pie labels overlap (RE-01), sem print styles (RE-03)
- **Fechamento:** Botões período overflow (FE-01)

---

## Dependências Técnicas

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                       │
│  (React Components, Pages, Hooks, shadcn/ui)               │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                    APPLICATION LAYER                         │
│  (Use Cases: CreateTransactionUseCase, ExecuteAgentUseCase) │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                      DOMAIN LAYER                            │
│  (Entities: Transaction, Account, AIAgent, etc.)             │
│  (Value Objects: Money, TransactionType, AgentType)         │
│  (Domain Services: computeSpendDecision, computeMonthly)   │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                   INFRASTRUCTURE LAYER                      │
│  (Prisma Repositories, External Services: Blob, Resend)     │
│  (Services: AgentScheduler, AgentQueue, PicoClaw)           │
└─────────────────────────────────────────────────────────────┘
```

---

## Arquivos Essenciais

| Arquivo | Propósito |
|---------|-----------|
| `src/lib/financial-engine.ts` | Engine financeiro (567 linhas, pura) |
| `prisma/schema.prisma` | 32 modelos de dados |
| `src/app/page.tsx` | Dashboard |
| `src/components/ui/` | Design system shadcn/ui |
| `src/domain/` | Entidades e regras de domínio |
| `src/application/` | Use cases |
| `src/infrastructure/` | Repositories e serviços |
| `src/app/api/` | Todas as rotas de API |

---

*Última atualização: 2026-04-30*