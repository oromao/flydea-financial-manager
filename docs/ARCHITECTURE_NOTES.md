# FlyDea Financial Manager — Notas de Arquitetura

## Visão Geral

O projeto segue **Clean Architecture** + **Domain-Driven Design (DDD)** com separação clara de responsabilidades em camadas. O objetivo é manter o código testável, manutenível e escalável, com dependências apontando sempre para dentro (Domain é o núcleo mais protegido).

---

## Stack Tecnológica

### Frontend
- **Next.js 16** (App Router)
- **React 19** (Server Components + Client Components)
- **TypeScript** (strict mode)
- **Tailwind CSS 4** (design system)
- **shadcn/ui** (componentes base)
- **Framer Motion** (animações)
- **Lucide React** (ícones)
- **TanStack Query** (data fetching)
- **Zod** (validação)

### Backend
- **Next.js API Routes** (serverless)
- **Prisma ORM** (abstração de banco)
- **PostgreSQL** (Neon serverless)

### Infraestrutura
- **Vercel** (hosting, functions, cron)
- **Vercel Blob** (storage de documentos)
- **Resend** (email transacional)
- **Upstash** (rate limiting, Redis)

### IA & Processamento
- **Tesseract.js** (OCR no browser)
- **Sharp** (otimização de imagens)
- **PicoClaw** (engine de insights local)
- **RAG Local** (TF-IDF, sem LLM externo)

---

## Estrutura de Diretórios

```
src/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes (server only)
│   │   ├── agents/               # Agent management
│   │   ├── cron/                 # Cron jobs (Vercel)
│   │   ├── transactions/         # CRUD de transações
│   │   ├── accounts/             # CRUD de contas
│   │   ├── budgets/              # Orçamentos
│   │   ├── recurrences/          # Recorrências
│   │   ├── document-import/      # OCR e importação
│   │   └── ... (demais módulos)
│   ├── (authenticated)/          # Rotas protegidas
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Dashboard
│   └── *.tsx                     # Páginas públicas/protegadas
│
├── domain/                       # 🧠 DOMAIN LAYER (puro, sem dependências externas)
│   ├── shared/
│   │   ├── errors/               # DomainError, ValidationError
│   │   └── value-objects/        # Money, UserId
│   ├── transaction/
│   │   ├── entities/             # Transaction Entity
│   │   ├── value-objects/        # TransactionType, PaymentStatus
│   │   └── repositories/         # ITransactionRepository (interface)
│   ├── agent/
│   │   ├── entities/             # AIAgent, AgentAction, AgentExecution
│   │   ├── value-objects/        # AgentType
│   │   └── repositories/         # IAgentRepository, IAgentExecutionRepository
│   ├── copilot/
│   │   ├── entities/             # CopilotConversation
│   │   ├── value-objects/        # PageType
│   │   └── repositories/         # ICopilotConversationRepository
│   └── ... (outros agregados)
│
├── application/                  # 🎯 APPLICATION LAYER (use cases)
│   ├── transaction/
│   │   ├── use-cases/            # CreateTransactionUseCase, DeleteTransactionUseCase
│   │   ├── dtos/                 # CreateTransactionDTO, TransactionDTO
│   │   └── mappers/              # TransactionMapper
│   ├── agent/
│   │   └── use-cases/            # CreateAgentUseCase, ExecuteAgentUseCase, ListAgentsUseCase, DeleteAgentUseCase
│   └── ... (outros módulos)
│
├── infrastructure/               # 🏗️ INFRASTRUCTURE LAYER (implementações técnicas)
│   ├── repositories/             # PrismaTransactionRepository, PrismaAgentRepository
│   ├── services/                 # AgentQueue, AgentScheduler, EmailService, BehavioralIntelligenceService
│   └── di/                      # Container (Dependency Injection)
│
├── presentation/                # 🎨 PRESENTATION LAYER (controllers)
│   └── controllers/             # TransactionController, etc.
│
├── components/                   # 🧩 React Components
│   ├── ui/                      # shadcn/ui base (Button, Input, Dialog, etc.)
│   ├── dashboard/                # Componentes do dashboard
│   ├── agents/                   # Componentes de agentes
│   ├── copilot/                 # Componentes do copiloto
│   └── ... (demais componentes)
│
├── lib/                          # 🔧 Utilitários compartilhados
│   ├── prisma.ts                # Prisma client singleton
│   ├── auth.ts                  # NextAuth config
│   ├── utils.ts                 # Helpers gerais
│   ├── financial-engine.ts      # Engine financeira (567 linhas puras)
│   ├── document-parser.ts       # Parser de OCR
│   ├── blob-storage.ts          # Vercel Blob wrapper
│   ├── ocr/                    # OCR utilities
│   └── ... (demais libs)
│
├── hooks/                        # ⚓ Custom React hooks
│   ├── useCurrencyInput.ts
│   └── useCountUp.ts
│
└── types/                        # 📝 TypeScript types globais
```

---

## Convenções de Nomenclatura

### Arquivos
- **Componentes React:** PascalCase (`AgentForm.tsx`)
- **Utilitários:** kebab-case (`blob-storage.ts`)
- **Entidades DDD:** PascalCase (`AIAgent.ts`, `Money.ts`)
- **Value Objects:** PascalCase (`AgentType.ts`, `TransactionType.ts`)
- **Use Cases:** PascalCase (`CreateAgentUseCase.ts`)
- **DTOs:** PascalCase (`CreateTransactionDTO.ts`)
- **Interfaces:** Prefix `I` (`IAgentRepository.ts`)
- **Repositórios Prisma:** Prefix `Prisma` (`PrismaAgentRepository.ts`)

### Variáveis
- **Constantes:** SCREAMING_SNAKE_CASE (`MAX_CONCURRENT = 5`)
- **Booleans:** `isActive`, `hasError`, `shouldRetry`
- **Arrays:** `agents: AIAgent[]`, `agentMap: Map<string, AIAgent>`
- **Callbacks:** `onSuccess`, `handleSubmit`

---

## Padrões de Implementação

### Domain Layer (Puro)

```typescript
// Entidade com factory method
class Transaction {
  readonly id: string;
  readonly type: TransactionType;
  private _amount: Money;

  private constructor(props: TransactionProps) { ... }

  static create(props: CreateTransactionProps): Transaction {
    if (!props.description.trim()) {
      throw new ValidationError("Description is required");
    }
    return new Transaction(props);
  }

  // Comportamentos (métodos de domínio)
  markAsPaid(paidAt: Date): void { ... }
  isOwnedBy(userId: UserId): boolean { ... }
}
```

```typescript
// Value Object imutável
class Money {
  private constructor(private readonly amount: number) {}

  static create(amount: number): Money {
    if (amount < 0) throw new ValidationError("Amount must be positive");
    return new Money(amount);
  }

  add(other: Money): Money {
    return new Money(this.amount + other.amount);
  }
}
```

### Application Layer (Orquestração)

```typescript
// Use Case
class CreateTransactionUseCase {
  constructor(private transactionRepository: ITransactionRepository) {}

  async execute(input: CreateTransactionInput): Promise<TransactionDTO> {
    // 1. Validar input
    const validation = CreateTransactionInput.validate(input);
    if (!validation.valid) {
      throw new ValidationError(validation.errors);
    }

    // 2. Criar entidade
    const transaction = Transaction.create(input);

    // 3. Persistir
    await this.transactionRepository.save(transaction);

    // 4. Retornar DTO
    return TransactionMapper.toDTO(transaction);
  }
}
```

### Infrastructure Layer (Implementação)

```typescript
// Repository Prisma
class PrismaTransactionRepository implements ITransactionRepository {
  async save(transaction: Transaction): Promise<void> {
    await prisma.transaction.upsert({
      where: { id: transaction.id },
      update: transaction.toPersistence(),
      create: transaction.toPersistence(),
    });
  }

  async findById(id: string): Promise<Transaction | null> {
    const raw = await prisma.transaction.findUnique({ where: { id } });
    return raw ? Transaction.fromPersistence(raw) : null;
  }
}
```

---

## Decisões Técnicas Ativas

### 1. Timezone: UTC Storage, BRT Display

- Datas armazenadas em UTC midnight
- Display convertido para America/Sao_Paulo
- Input usa `type="date"` (YYYY-MM-DD string)

### 2. Idempotência de Recorrências

- Cron verifica `(userId, recurrenceId, recurrenceDate)` antes de criar
- Usa `format(date, "yyyy-MM-dd")` para evitar time false negatives

### 3. OCR Paralelizado

- Upload para Vercel Blob e OCR rodam em `Promise.all`
- Não bloqueia resposta da API

### 4. Background Processing com void async

- `void (async () => { ... })()` para não bloquear requests
- AuditLog e BehavioralIntelligenceService correm assíncronos

### 5. Testes com Mocks

- Engine financeira 100% testável (sem UI dependencies)
- OCR/Blob/PicoClaw precisam de mocks para cobertura

---

## O que NÃO deve ser mudado sem justificativa forte

1. **Estrutura de camadas** — Domain deve permanecer puro, sem dependências de frameworks
2. **Timezone** — UTC storage, BRT display é o padrão
3. **Porta local** — 3010 (não 3000)
4. **Stack** — Next.js, React, Prisma, Tailwind. Não introduzir outras libs sem necessidade.
5. **Arquitetura** — Clean Architecture + DDD. Não misturar camadas.

---

## Como Implementar Mudanças com Segurança

### Adicionar nova entidade

1. Criar em `src/domain/{modulo}/entities/`
2. Criar Value Objects em `src/domain/{modulo}/value-objects/`
3. Criar interface de Repository em `src/domain/{modulo}/repositories/`
4. Criar Use Cases em `src/application/{modulo}/use-cases/`
5. Implementar Repository em `src/infrastructure/repositories/`
6. Criar API route em `src/app/api/{modulo}/`
7. Criar UI em `src/components/` e página em `src/app/{modulo}/`
8. Criar testes unitários e E2E

### Modificar regra de negócio

1. Identificar se está em Domain (financial-engine) ou Application
2. Alterar função / método
3. Atualizar testes unitários
4. Verificar impacto em todas as telas que usam
5. Atualizar `docs/DOMAIN_RULES.md` se houver mudança de semântica

### Adicionar dependency

1. Justificar por que a lib atual não resolve
2. Verificar se não adiciona payload desnecessário ao bundle
3. Adicionar em `package.json`
4. Documentar em `docs/ARCHITECTURE_NOTES.md`
5. Adicionar ao .gitignore se necessário

---

## Referências

| Recurso | Caminho |
|---------|---------|
| Prisma Schema | `./prisma/schema.prisma` |
| Engine Financeira | `./src/lib/financial-engine.ts` |
| Best Practices | `./BEST_PRACTICES.md` |
| Arquitetura (legado) | `./ARCHITECTURE.md` |

---

*Última atualização: 2026-04-30*