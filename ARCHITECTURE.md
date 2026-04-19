# Flydea - Clean Architecture + DDD

## Visão Geral

Este projeto segue os princípios de:
- **Clean Architecture** - Separação clara de responsabilidades em camadas
- **Domain-Driven Design (DDD)** - Foco na lógica de negócio (domínio)
- **Clean Code** - Código limpo, legível e manutenível

## Estrutura de Diretórios

```
src/
├── domain/                     # Camada de Domínio (Lógica de Negócio)
│   ├── shared/                 # Conceitos compartilhados
│   │   ├── errors/            # Exceções de domínio
│   │   └── value-objects/     # Value Objects reutilizáveis (Money, UserId)
│   ├── transaction/            # Agregado de Transação
│   │   ├── entities/          # Transaction Entity
│   │   ├── value-objects/     # TransactionType, PaymentStatus
│   │   └── repositories/      # ITransactionRepository (interface)
│   ├── account/               # Agregado de Conta
│   ├── budget/                # Agregado de Orçamento
│   └── recurrence/            # Agregado de Recorrência
│
├── application/               # Camada de Aplicação (Use Cases)
│   ├── transaction/
│   │   ├── use-cases/        # CreateTransactionUseCase, DeleteTransactionUseCase
│   │   ├── dtos/             # DTOs (CreateTransactionDTO, TransactionDTO)
│   │   └── mappers/          # Mappers (Transaction -> TransactionDTO)
│   ├── account/
│   ├── budget/
│   └── shared/
│       └── errors/           # Erros de aplicação
│
├── infrastructure/           # Camada de Infraestrutura
│   ├── repositories/        # Implementações de Repositories (PrismaTransactionRepository)
│   ├── external-services/   # Serviços externos (Email, Storage)
│   ├── di/                  # Dependency Injection Container
│   └── middleware/          # Middleware de infraestrutura
│
├── presentation/            # Camada de Apresentação
│   ├── controllers/         # Controllers (TransactionController)
│   ├── api/                # Next.js API routes (usam Controllers)
│   └── components/         # React components (UI)
│
└── lib/                     # Utilities compartilhadas
    ├── logger.ts
    ├── prisma.ts
    ├── auth.ts
    └── constants.ts
```

## Princípios Aplicados

### 1. Domain-Driven Design (DDD)

#### Entities
Objetos com identidade única que encapsulam regras de negócio:
```typescript
// Transaction Entity
class Transaction {
  private id: string;
  private userId: UserId;
  private type: TransactionType;
  private description: string;
  private amount: Money;
  // ... mais propriedades

  // Comportamentos (métodos que refletem lógica de negócio)
  markAsPaid(amountPaid: Money, paidAt: Date): void { ... }
  update(...): void { ... }
  isOwnedBy(userId: UserId): boolean { ... }
}
```

#### Value Objects
Objetos imutáveis que representam conceitos:
```typescript
class Money {
  private readonly amount: number;
  
  static create(amount: number): Money { ... }
  add(other: Money): Money { ... }
  isPositive(): boolean { ... }
}

class TransactionType {
  private readonly value: TransactionTypeEnum;
  
  static income(): TransactionType { ... }
  static expense(): TransactionType { ... }
  isIncome(): boolean { ... }
}
```

#### Repositories
Interfaces que abstraem o acesso a dados:
```typescript
interface ITransactionRepository {
  findById(id: string): Promise<Transaction | null>;
  save(transaction: Transaction): Promise<void>;
  delete(id: string): Promise<void>;
}
```

#### Domain Services
Lógica que não pertence a uma Entity específica:
```typescript
class TransactionDomainService {
  calculateBalance(transactions: Transaction[]): Money { ... }
  validateOwnership(transaction: Transaction, userId: UserId): void { ... }
}
```

### 2. Clean Architecture

#### Separação de Responsabilidades

**Domain Layer (Domínio)**
- Contém a lógica de negócio pura
- Independente de frameworks
- Regras validadas em tempo de construção (Entities/Value Objects)

**Application Layer (Aplicação)**
- Use Cases que orquestram o domínio
- DTOs para comunicação entre camadas
- Mappers para conversão de dados

**Infrastructure Layer (Infraestrutura)**
- Implementações de Repositories
- Acesso a banco de dados (Prisma)
- Serviços externos (Email, Storage)
- Dependency Injection

**Presentation Layer (Apresentação)**
- Controllers que orquestram Use Cases
- API routes (Next.js)
- React components

#### Dependências apontam para dentro
```
Presentation → Application → Domain
Infrastructure → Application → Domain
            ↘      ↙
          Shared/Utils
```

### 3. Clean Code

#### Nomes Significativos
```typescript
// ❌ Ruim
function getTx(u: string): void { ... }

// ✅ Bom
function getTransaction(userId: string): Promise<Transaction> { ... }
```

#### Funções Pequenas com Uma Responsabilidade
```typescript
// ❌ Ruim
async function processTransaction(userId, data) {
  const user = await getUser(userId);
  const category = await getCategory(data.categoryId);
  const transaction = new Transaction(...);
  const saved = await transactionRepository.save(transaction);
  await updateBalance(user, transaction);
  await sendNotification(user);
  return mapToDTO(saved);
}

// ✅ Bom
async function createTransaction(userId: string, dto: CreateTransactionDTO): Promise<TransactionDTO> {
  const useCase = new CreateTransactionUseCase(transactionRepository);
  return await useCase.execute(userId, dto);
}
```

#### Tratamento de Erros Apropriado
```typescript
// ❌ Ruim
try {
  await repository.save(transaction);
} catch (e) {
  console.log("erro");
}

// ✅ Bom
try {
  await repository.save(transaction);
} catch (error) {
  if (error instanceof ValidationError) {
    throw error;
  }
  logger.error('Failed to save transaction', { error, transactionId: transaction.getId() });
  throw new ApplicationError('Erro ao salvar transação');
}
```

#### DRY (Don't Repeat Yourself)
```typescript
// ✅ Consolidado em Value Object
class Money {
  static create(amount: number): Money {
    if (amount < 0) throw new ValidationError('...');
    if (!isNumber(amount)) throw new ValidationError('...');
    return new Money(amount);
  }
}

// Usado em múltiplos lugares
const amount = Money.create(100);
```

## Como Usar

### Exemplo: Criar uma Nova Use Case

```typescript
// 1. Domain Layer
// src/domain/transaction/entities/Transaction.ts (já existe)

// 2. Application Layer
// src/application/transaction/dtos/UpdateTransactionDTO.ts
export interface UpdateTransactionDTO {
  description: string;
  amount: number;
  categoryId: string;
  date: string;
}

// src/application/transaction/use-cases/UpdateTransactionUseCase.ts
export class UpdateTransactionUseCase {
  constructor(private transactionRepository: ITransactionRepository) {}

  async execute(
    userId: string,
    transactionId: string,
    dto: UpdateTransactionDTO
  ): Promise<TransactionDTO> {
    const userIdVO = UserId.create(userId);
    const transaction = await this.transactionRepository.findByIdAndUserId(
      transactionId,
      userIdVO
    );

    if (!transaction) {
      throw new NotFoundError('Transação não encontrada');
    }

    const amount = Money.create(dto.amount);
    transaction.update(
      dto.description,
      amount,
      dto.categoryId,
      new Date(dto.date)
    );

    await this.transactionRepository.update(transaction);
    return TransactionMapper.toDTO(transaction);
  }
}

// 3. Presentation Layer
// Adicionar ao TransactionController
async update(
  userId: string,
  transactionId: string,
  dto: UpdateTransactionDTO
): Promise<NextResponse> {
  try {
    const useCase = new UpdateTransactionUseCase(this.transactionRepository);
    const result = await useCase.execute(userId, transactionId, dto);
    return NextResponse.json(result);
  } catch (error) {
    return this.handleError(error);
  }
}

// 4. Usar no Controller (não precisa mudar a rota API)
const controller = container.createTransactionController(userRole);
return await controller.update(userId, transactionId, dto);
```

## Benefícios

1. **Testabilidade** - Cada camada pode ser testada independentemente
2. **Manutenibilidade** - Código organizado e fácil de entender
3. **Escalabilidade** - Fácil adicionar novas features sem quebrar existentes
4. **Flexibilidade** - Trocar implementações (ex: banco de dados) sem afetar lógica
5. **Reusabilidade** - Use Cases e Entities podem ser reutilizados

## Próximas Etapas

- [ ] Refatorar todos os endpoints seguindo este padrão
- [ ] Criar testes unitários para cada Use Case
- [ ] Criar testes de integração para Repositories
- [ ] Adicionar mais Domain Services
- [ ] Implementar Domain Events
