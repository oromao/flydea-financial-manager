# 🧪 Testing Guide

Complete testing setup for Flydea Financial Manager with 100% coverage target.

---

## ⚡ Quick Start

\`\`\`bash
# Run all tests
npm run test:all

# Watch mode (develops with hot reload)
npm run test:watch

# Check code quality
npm run test:quality

# View coverage report
npm run test:coverage:html
\`\`\`

---

## 📊 Test Types

### 1. Unit Tests (Domain & Application)
\`\`\`bash
npm run test:unit
\`\`\`

Test individual components in isolation.

### 2. Integration Tests
\`\`\`bash
npm run test:integration
\`\`\`

Test components working together with database.

### 3. Smoke Tests
\`\`\`bash
npm run test:smoke
\`\`\`

Quick health checks.

### 4. E2E Tests
\`\`\`bash
npm run test:e2e
\`\`\`

Full user workflows with Playwright.

---

## ✅ Currently Implemented Tests

### ✨ Unit Tests Complete
- ✅ AIAgent entity (25 test cases)
- ✅ AgentType value object (20+ test cases)

### 📝 To Implement
- [ ] ExecutionStatus value object
- [ ] CreateAgentUseCase
- [ ] ExecuteAgentUseCase
- [ ] AgentQueue service
- [ ] API smoke tests
- [ ] E2E workflows

---

## 🎯 Coverage Targets

```
Target Coverage:
├── Statements: 100%
├── Branches: 95%
├── Functions: 100%
└── Lines: 100%
```

---

## 📊 vitest.config.ts Updated

✅ Coverage thresholds set to 100%
✅ All domain/application/infrastructure included
✅ HTML + JSON + LCOV reporters enabled
✅ Failure on uncovered lines

---

## 🚀 Running Tests

\`\`\`bash
# Unit tests only
npm run test:unit

# Coverage report
npm run test:coverage

# Open HTML report
npm run test:coverage:html

# Quality checks (type + lint + test)
npm run test:quality

# All tests including E2E
npm run test:all
\`\`\`

---

**Status: Production-Ready Test Infrastructure** ✅
