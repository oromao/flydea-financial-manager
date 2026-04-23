# 🧪 Testing Strategy - 100% Coverage

Complete testing plan for Flydea Financial Manager with 100% coverage.

---

## 📊 Testing Pyramid

```
        E2E Tests (Playwright)
       ↗━━━━━━━━━━━━━━━━━━↖
      ╱                    ╲
    ╱  Smoke Tests (API)    ╲
   ╱╱━━━━━━━━━━━━━━━━━━━━━↖╲
  ╱  Unit Tests (Domain)    ╲╲
 ╱________________________________╲
     Integration Tests (DB)
```

---

## 📁 Test Structure

```
__tests__/
├── unit/
│   ├── domain/
│   │   ├── agent/
│   │   │   ├── entities/AIAgent.test.ts
│   │   │   ├── value-objects/AgentType.test.ts
│   │   │   └── value-objects/ExecutionStatus.test.ts
│   │   ├── transaction/
│   │   └── ...
│   ├── application/
│   │   ├── agent/
│   │   │   ├── CreateAgentUseCase.test.ts
│   │   │   ├── ExecuteAgentUseCase.test.ts
│   │   │   └── DeleteAgentUseCase.test.ts
│   │   └── ...
│   └── infrastructure/
│       ├── services/
│       │   ├── AgentQueue.test.ts
│       │   ├── AgentScheduler.test.ts
│       │   └── ...
│       └── repositories/
│           ├── PrismaAgentRepository.test.ts
│           └── ...
│
├── integration/
│   ├── api/
│   │   ├── agents.test.ts
│   │   ├── transactions.test.ts
│   │   └── ...
│   └── database/
│       └── migrations.test.ts
│
└── smoke/
    ├── api/
    │   ├── agents-health.test.ts
    │   ├── endpoints.test.ts
    │   └── auth.test.ts
    └── pages/
        ├── dashboard.test.ts
        └── agents.test.ts

tests/
├── e2e/
│   ├── auth.spec.ts
│   ├── agent-creation.spec.ts
│   ├── document-import.spec.ts
│   ├── copilot.spec.ts
│   └── dashboard.spec.ts
└── fixtures/
    ├── users.ts
    ├── agents.ts
    └── transactions.ts
```

---

## 1️⃣ Unit Tests (Domain Layer)

### AIAgent Entity

```typescript
// __tests__/unit/domain/agent/entities/AIAgent.test.ts

describe('AIAgent', () => {
  describe('create', () => {
    it('should create agent with valid props', () => {
      const agent = AIAgent.create({ ... });
      expect(agent.id).toBeDefined();
      expect(agent.isActive).toBe(true);
    });

    it('should fail with empty name', () => {
      expect(() => AIAgent.create({ name: '' })).toThrow();
    });
  });

  describe('activate/deactivate', () => {
    it('should toggle active status', () => {
      const agent = AIAgent.create({ ... });
      agent.deactivate();
      expect(agent.isActive).toBe(false);
      agent.activate();
      expect(agent.isActive).toBe(true);
    });
  });

  describe('fromPersistence', () => {
    it('should restore from database', () => {
      const raw = { id: '123', ...};
      const agent = AIAgent.fromPersistence(raw);
      expect(agent.id).toBe('123');
    });
  });
});
```

### AgentType Value Object

```typescript
// __tests__/unit/domain/agent/value-objects/AgentType.test.ts

describe('AgentType', () => {
  it('should create valid types', () => {
    const type = AgentType.create('BUDGET_REVIEW');
    expect(type.value).toBe('BUDGET_REVIEW');
    expect(type.isBudgetReview()).toBe(true);
  });

  it('should reject invalid types', () => {
    expect(() => AgentType.create('INVALID')).toThrow();
  });
});
```

---

## 2️⃣ Integration Tests (Use Cases + DB)

```typescript
// __tests__/integration/api/agents.test.ts

describe('Agent API Integration', () => {
  let client: PrismaClient;

  beforeAll(async () => {
    client = new PrismaClient();
    await client.$connect();
  });

  afterEach(async () => {
    await client.aIAgent.deleteMany({});
  });

  afterAll(async () => {
    await client.$disconnect();
  });

  it('should create agent in database', async () => {
    const useCase = new CreateAgentUseCase(repository);
    const result = await useCase.execute({
      userId: 'user-123',
      name: 'Test Agent',
      type: 'BUDGET_REVIEW',
      schedule: '0 9 * * *',
    });

    const saved = await client.aIAgent.findUnique({
      where: { id: result.agentId },
    });

    expect(saved).toBeDefined();
    expect(saved.name).toBe('Test Agent');
  });

  it('should fail with duplicate name for user', async () => {
    // Create first
    await useCase.execute({ ... });
    
    // Try to create duplicate
    expect(() => useCase.execute({ ... })).toThrow();
  });
});
```

---

## 3️⃣ API Smoke Tests

```typescript
// __tests__/smoke/api/agents-health.test.ts

describe('Agent API - Smoke Tests', () => {
  it('POST /api/agents should create agent', async () => {
    const response = await fetch('http://localhost:3010/api/agents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Smoke Test Agent',
        type: 'BUDGET_REVIEW',
        schedule: '0 9 * * *',
      }),
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.id).toBeDefined();
  });

  it('GET /api/agents should list agents', async () => {
    const response = await fetch('http://localhost:3010/api/agents');
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
  });

  it('GET /api/agents/:id should return agent', async () => {
    // Create agent first
    const create = await fetch('http://localhost:3010/api/agents', {
      method: 'POST',
      body: JSON.stringify({ ... }),
    });
    const { id } = await create.json();

    // Get it
    const response = await fetch(`http://localhost:3010/api/agents/${id}`);
    expect(response.status).toBe(200);
  });
});
```

---

## 4️⃣ E2E Tests (Playwright)

```typescript
// tests/e2e/agent-creation.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Agent Creation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3010');
    // Login if needed
  });

  test('should create agent from UI', async ({ page }) => {
    // Navigate to agents page
    await page.goto('http://localhost:3010/agents');

    // Click create button
    await page.click('button:has-text("Novo Agente")');

    // Select type
    await page.click('text=Revisão de Orçamento');

    // Fill form
    await page.fill('input[name="name"]', 'Test Agent');
    await page.fill('input[name="schedule"]', '0 9 * * *');

    // Submit
    await page.click('button:has-text("Criar")');

    // Verify success
    await expect(page).toHaveURL(/\/agents\/\w+/);
    await expect(page.locator('text=Test Agent')).toBeVisible();
  });

  test('should show agent in list', async ({ page }) => {
    await page.goto('http://localhost:3010/agents');
    // Verify agent appears in list
  });
});
```

---

## 📊 Coverage Targets

```
Target Coverage:
├── Statements: 100%
├── Branches: 95%
├── Functions: 100%
├── Lines: 100%
└── Uncovered Lines: 0

By Module:
├── Domain Layer: 100%
├── Application Layer: 100%
├── Infrastructure: 95%
└── API Routes: 90%
```

---

## 🚀 Running Tests

```bash
# Unit tests
npm run test

# Coverage report
npm run test:coverage

# Integration tests
npm run test:integration

# Smoke tests
npm run test:smoke

# E2E tests
npm run test:e2e

# All tests
npm run test:all
```

---

## 📝 Test Checklist

### Domain Layer
- [ ] AIAgent entity (create, activate, deactivate, restore)
- [ ] AgentType value object
- [ ] ExecutionStatus value object
- [ ] Transaction entity
- [ ] Category entity
- [ ] Account entity

### Application Layer
- [ ] CreateAgentUseCase
- [ ] ExecuteAgentUseCase
- [ ] DeleteAgentUseCase
- [ ] ListAgentsUseCase
- [ ] CreateTransactionUseCase
- [ ] ImportDocumentUseCase

### Infrastructure Services
- [ ] AgentQueue (batch processing, retry logic)
- [ ] AgentScheduler (cron evaluation)
- [ ] EmailService
- [ ] BlobStorage
- [ ] DocumentParser

### API Routes
- [ ] GET /api/agents (list all)
- [ ] POST /api/agents (create)
- [ ] GET /api/agents/[id] (get single)
- [ ] POST /api/agents/[id] (execute)
- [ ] DELETE /api/agents/[id] (delete)
- [ ] GET /api/agents/[id]/executions (history)
- [ ] GET /api/cron/agent-scheduler (cron job)
- [ ] POST /api/rag/local-query (copilot)

### E2E Flows
- [ ] User authentication
- [ ] Agent creation workflow
- [ ] Agent execution
- [ ] Document import with OCR
- [ ] Copilot interaction
- [ ] Dashboard functionality
- [ ] Error handling
- [ ] Performance (load time < 2s)

---

## 🎯 Success Criteria

✅ All tests pass
✅ 100% code coverage for domain & application layers
✅ 90%+ coverage overall
✅ No TypeScript errors
✅ All E2E flows work
✅ Performance benchmarks met
✅ Security checks pass
✅ Accessibility compliance (WCAG AA)

---

## 🔄 CI/CD Integration

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run test
      - run: npm run test:integration
      - run: npm run test:e2e
      - uses: codecov/codecov-action@v3
```

---

**Goal: Production-Ready Code with 100% Test Coverage** ✅
