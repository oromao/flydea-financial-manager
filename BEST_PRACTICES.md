# 🏆 Best Practices & Architecture Guidelines

Guia de padrões, conventions e boas práticas para manter o projeto limpo e escalável.

---

## 🏗️ Architecture Overview

### Clean Architecture + DDD

```
┌─────────────────────────────────────────────────────┐
│  Presentation Layer                                 │
│  (React Components, Pages)                          │
└────────────────┬────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────┐
│  Application Layer                                  │
│  (Use Cases, Orchestration)                         │
└────────────────┬────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────┐
│  Domain Layer                                       │
│  (Entities, Value Objects, Business Rules)         │
└────────────────┬────────────────────────────────────┘
                 │
┌────────────────▼────────────────────────────────────┐
│  Infrastructure Layer                              │
│  (Repositories, Services, External APIs)           │
└─────────────────────────────────────────────────────┘
```

### Dependências (sempre para baixo)
```
Components → UseCase → Entity → Infrastructure
```

---

## 📁 Directory Structure

```
src/
├── app/
│   ├── api/                    # API routes (server only)
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Home page
│   └── (authenticated)/         # Protected routes
│
├── components/
│   ├── ui/                     # Base components (Button, Input)
│   ├── copilot/                # Copiloto components
│   ├── agents/                 # Agent components
│   ├── importer.tsx            # Document import
│   └── ...
│
├── domain/                     # Business logic (IMMUTABLE)
│   ├── agent/
│   │   ├── entities/           # AIAgent.ts, AgentExecution.ts
│   │   └── value-objects/      # AgentType.ts, ExecutionStatus.ts
│   └── ...
│
├── application/                # Use Cases
│   ├── agent/
│   │   └── use-cases/          # CreateAgentUseCase.ts
│   └── ...
│
├── infrastructure/             # Technical implementations
│   ├── repositories/           # PrismaAgentRepository.ts
│   ├── services/               # AgentQueue.ts, AgentScheduler.ts
│   └── ...
│
└── lib/
    ├── prisma.ts               # Prisma singleton
    ├── utils.ts                # Helper functions
    └── ...
```

---

## 🧠 Domain Layer

### Entities (Objetos com Identidade)

```typescript
// src/domain/agent/entities/AIAgent.ts

export class AIAgent {
  // Properties são readonly
  readonly id: string;
  readonly userId: string;
  readonly name: string;
  readonly type: AgentType;
  readonly schedule: string;
  readonly isActive: boolean;
  readonly createdAt: Date;

  // Constructor privado (force factory pattern)
  private constructor(props: AIAgentProps) {
    this.id = props.id || generateId();
    this.name = props.name;
    // ...
  }

  // Factory method
  static create(props: CreateAgentProps): AIAgent {
    // Validações
    if (!props.name.trim()) {
      throw new Error("Agent name is required");
    }

    return new AIAgent({
      ...props,
      id: props.id || generateId(),
      createdAt: props.createdAt || new Date(),
      isActive: true,
    });
  }

  // Business methods
  activate(): void {
    if (!this.isActive) {
      this.isActive = true;
    }
  }

  deactivate(): void {
    if (this.isActive) {
      this.isActive = false;
    }
  }
}
```

### Value Objects (Imutáveis)

```typescript
// src/domain/agent/value-objects/AgentType.ts

export class AgentType {
  readonly value: string;

  private constructor(value: string) {
    if (!AgentType.isValid(value)) {
      throw new Error(`Invalid agent type: ${value}`);
    }
    this.value = value;
  }

  static create(value: string): AgentType {
    return new AgentType(value);
  }

  static readonly BUDGET_REVIEW = "BUDGET_REVIEW";
  static readonly EXPENSE_ALERT = "EXPENSE_ALERT";
  // ...

  isBudgetReview(): boolean {
    return this.value === AgentType.BUDGET_REVIEW;
  }

  private static isValid(value: string): boolean {
    return Object.values(AgentType).includes(value);
  }
}
```

---

## 📱 Application Layer

### Use Cases (Orquestração)

```typescript
// src/application/agent/use-cases/CreateAgentUseCase.ts

export class CreateAgentUseCase {
  constructor(
    private agentRepository: IAgentRepository,
    private eventPublisher: IEventPublisher
  ) {}

  async execute(input: CreateAgentInput): Promise<CreateAgentOutput> {
    // 1. Validar input
    const validation = CreateAgentInput.validate(input);
    if (!validation.valid) {
      throw new ValidationError(validation.errors);
    }

    // 2. Criar entity
    const agent = AIAgent.create(input);

    // 3. Persistir
    await this.agentRepository.save(agent);

    // 4. Publicar evento
    await this.eventPublisher.publish(
      new AgentCreatedEvent(agent.id, agent.userId)
    );

    // 5. Retornar output
    return { agentId: agent.id };
  }
}
```

---

## 🔌 Infrastructure Layer

### Repositories (Data Abstraction)

```typescript
// src/infrastructure/repositories/PrismaAgentRepository.ts

export class PrismaAgentRepository implements IAgentRepository {
  async save(agent: AIAgent): Promise<void> {
    await prisma.aIAgent.upsert({
      where: { id: agent.id },
      update: agent.toPersistence(),
      create: agent.toPersistence(),
    });
  }

  async findById(id: string): Promise<AIAgent | null> {
    const raw = await prisma.aIAgent.findUnique({
      where: { id },
      include: { actions: true },
    });

    return raw ? AIAgent.fromPersistence(raw) : null;
  }

  async findActiveByUserId(userId: string): Promise<AIAgent[]> {
    const raw = await prisma.aIAgent.findMany({
      where: { userId, isActive: true },
    });

    return raw.map(AIAgent.fromPersistence);
  }
}
```

### Services (Comportamento)

```typescript
// src/infrastructure/services/AgentQueue.ts

export class AgentQueue {
  async processQueue(queue: QueueItem[]): Promise<ProcessResult> {
    // Processa em batches
    for (let i = 0; i < queue.length; i += this.maxConcurrent) {
      const batch = queue.slice(i, i + this.maxConcurrent);
      
      // Retry logic
      const results = await Promise.allSettled(
        batch.map(item => this.executeAgent(item))
      );
    }
  }
}
```

---

## 🚦 Naming Conventions

### Arquivos

```typescript
// Components
ComponentName.tsx          // Componente React
component-name.tsx        // Componente utilitário

// Entities
AIAgent.ts                 // Entity (PascalCase)
AgentType.ts               // Value Object
agent.types.ts             // Types

// Use Cases
CreateAgentUseCase.ts      // UseCase (PascalCase + UseCase suffix)
create-agent.input.ts      // Input/Output types

// Repositories
PrismaAgentRepository.ts   // Repository (PascalCase)
IAgentRepository.ts        // Interface (I prefix)

// Services
AgentScheduler.ts          // Service
AgentQueue.ts              // Service
```

### Variáveis

```typescript
// Constantes
const MAX_CONCURRENT = 5;
const DEFAULT_TIMEOUT = 5000;

// Booleans
const isActive = true;
const hasError = false;
const shouldRetry = true;

// Collections
const agents: AIAgent[] = [];
const agentMap: Map<string, AIAgent> = new Map();

// Callbacks
const onSuccess = () => {};
const handleSubmit = () => {};
```

---

## 🧪 Testing

### Unit Tests (Domain)

```typescript
// src/domain/agent/entities/AIAgent.test.ts

describe("AIAgent", () => {
  it("should create agent with valid props", () => {
    const agent = AIAgent.create({
      userId: "user-123",
      name: "Test Agent",
      type: AgentType.create("BUDGET_REVIEW"),
      schedule: "0 9 * * *",
    });

    expect(agent.id).toBeDefined();
    expect(agent.name).toBe("Test Agent");
  });

  it("should fail with empty name", () => {
    expect(() => {
      AIAgent.create({
        userId: "user-123",
        name: "",  // Invalid
        type: AgentType.create("BUDGET_REVIEW"),
        schedule: "0 9 * * *",
      });
    }).toThrow("Agent name is required");
  });
});
```

### Integration Tests (Use Cases)

```typescript
// src/application/agent/use-cases/CreateAgentUseCase.test.ts

describe("CreateAgentUseCase", () => {
  let useCase: CreateAgentUseCase;
  let repository: MockAgentRepository;

  beforeEach(() => {
    repository = new MockAgentRepository();
    useCase = new CreateAgentUseCase(repository);
  });

  it("should create agent and save to repository", async () => {
    const output = await useCase.execute({
      userId: "user-123",
      name: "Test Agent",
      type: "BUDGET_REVIEW",
      schedule: "0 9 * * *",
    });

    expect(output.agentId).toBeDefined();
    expect(repository.saved).toHaveLength(1);
  });
});
```

---

## 🔒 Security

### Input Validation

```typescript
// Use Zod para validação
import { z } from "zod";

const CreateAgentSchema = z.object({
  name: z.string().min(1).max(255),
  type: z.enum(["BUDGET_REVIEW", "EXPENSE_ALERT"]),
  schedule: z.string().regex(/^(\d+|\*) (\d+|\*) (\d+|\*) (\d+|\*) (\d+|\*)$/),
});

type CreateAgentInput = z.infer<typeof CreateAgentSchema>;
```

### Authorization

```typescript
// Sempre verificar ownership
async function getAgent(agentId: string, userId: string) {
  const agent = await repository.findById(agentId);
  
  if (!agent || agent.userId !== userId) {
    throw new UnauthorizedError();
  }
  
  return agent;
}
```

### Rate Limiting

```typescript
// API route
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const limited = await rateLimit(request);
  if (limited) {
    return new Response("Too many requests", { status: 429 });
  }
  
  // Handle request
}
```

---

## 📊 Logging & Monitoring

### Structured Logging

```typescript
// ✅ Good
console.log("[AgentQueue] Processing batch", {
  batchSize: batch.length,
  timestamp: new Date().toISOString(),
  userId: userId,
});

// ❌ Bad
console.log("Processing...");
console.log(agent); // Pode expor dados sensíveis
```

### Error Handling

```typescript
// ✅ Good
try {
  await executeAgent(item);
} catch (error) {
  console.error("[AgentQueue] Failed to execute agent", {
    agentId: item.agentId,
    retry: item.retries,
    error: error instanceof Error ? error.message : "Unknown",
  });
  
  throw new AgentExecutionError(
    `Failed to execute agent: ${error.message}`,
    { agentId: item.agentId, cause: error }
  );
}

// ❌ Bad
try {
  await executeAgent(item);
} catch (error) {
  console.log("Error:", error);
  throw error;
}
```

---

## 🎯 Code Style

### Imports

```typescript
// ✅ Organize by: Standard > Internal > Relative
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { AIAgent } from "@/domain/agent/entities/AIAgent";
import { AgentQueue } from "./services/AgentQueue";
```

### Async/Await

```typescript
// ✅ Good - explicit error handling
async function processAgents() {
  try {
    const agents = await repository.findActive();
    const results = await Promise.allSettled(
      agents.map(agent => execute(agent))
    );
  } catch (error) {
    console.error("Error", error);
  }
}

// ❌ Bad - fire and forget
agents.forEach(agent => execute(agent));
```

### Nullability

```typescript
// ✅ Explicit handling
const agent = await repository.findById(id);
if (!agent) {
  throw new NotFoundError("Agent not found");
}

// ❌ Implicit null check
const agent = await repository.findById(id);
agent.activate(); // Pode falhar se agent é null
```

---

## 🚀 Performance Tips

### Database Queries

```typescript
// ✅ Use includes para evitar N+1
const agents = await prisma.aIAgent.findMany({
  where: { isActive: true },
  include: { actions: true }, // ← Carrega relações
});

// ❌ Lazy loading pode causar N+1
const agents = await prisma.aIAgent.findMany();
for (const agent of agents) {
  const actions = await prisma.agentAction.findMany({
    where: { agentId: agent.id },
  }); // ← N queries!
}
```

### Batch Processing

```typescript
// ✅ Processa em lotes
for (let i = 0; i < items.length; i += BATCH_SIZE) {
  const batch = items.slice(i, i + BATCH_SIZE);
  await Promise.all(batch.map(item => process(item)));
}

// ❌ Processa sequencialmente (lento)
for (const item of items) {
  await process(item);
}
```

### Caching

```typescript
// ✅ Cache com SWR no frontend
const { data } = useSWR('/api/agents', fetcher, {
  revalidateOnFocus: false,
  dedupingInterval: 60000,
});

// ❌ Sem cache (refetch a cada render)
const [agents, setAgents] = useState([]);
useEffect(() => {
  fetch('/api/agents').then(r => r.json()).then(setAgents);
}, []); // Pode refetch em cada mount
```

---

## 📝 Commit Message Convention

```bash
# Format: <type>(<scope>): <subject>

feat(agent): add batch processing for queue
fix(ocr): handle image rotation correctly
docs(readme): update installation instructions
refactor(repository): extract db logic
test(scheduler): add edge case tests
chore(deps): upgrade prisma to latest
```

---

## 🔄 Pull Request Process

1. **Branch Naming**: `feature/xxx`, `fix/xxx`, `docs/xxx`
2. **PR Description**: Explicar o quê e por quê
3. **Code Review**: Self-review antes de submeter
4. **Tests**: Mínimo um teste por mudança
5. **Documentation**: Atualizar README/docs se necessário

---

## 🎓 Recursos Recomendados

- [Clean Architecture](https://www.amazon.com/Clean-Architecture-Craftsmans-Software-Structure/dp/0134494164)
- [Domain-Driven Design](https://www.domainlanguage.com/ddd/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs/)

---

**Mantendo o código limpo, testado e escalável! 🎯**
