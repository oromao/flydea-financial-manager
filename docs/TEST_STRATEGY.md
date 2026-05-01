# FlyDea — Estratégia de QA e Testes

> **Data:** 2026-04-30  
> **Meta de cobertura:** 90% (linhas), 85% (branches)  
> **Cobertura atual:** ~45% (não verificável — sem coverage config)

---

## 1. MATRIZ DE TESTES

### 1.1 Por Camada

| Camada | Tipo de Teste | Qtd Atual | Meta | Prioridade |
|--------|--------------|-----------|------|------------|
| Domain (financial-engine) | Unit | 6 ✅ | 10+ | Manter |
| Domain (entities) | Unit | 2 ✅ | 8+ | P1 |
| Application (use cases) | Unit | 4 ✅ | 10+ | P1 |
| Infrastructure (repositories) | Integration | 0 🔴 | 6+ | P0 |
| Infrastructure (services) | Integration | 2 ⚠️ | 8+ | P0 |
| API Routes | Integration | 0 🔴 | 15+ | P0 |
| UI Components | Unit (render) | 1 🔴 | 15+ | P1 |
| Pages | E2E | 0 🔴 | 10+ | P0 |
| Auth flows | E2E | 0 🔴 | 3 | P0 |
| Hooks | Unit | 0 🔴 | 3+ | P2 |
| Middleware | Unit | 0 🔴 | 1 | P1 |

### 1.2 Por Criticidade de Fluxo

| Fluxo | Criticidade | Teste | Prioridade |
|-------|------------|-------|------------|
| Login/Logout | Crítico | E2E | P0 |
| CRUD Transação | Crítico | E2E | P0 |
| Delete Transação | Crítico | Integration | P0 |
| Filtro Transações | Alto | Unit | P1 |
| Geração Recorrência (cron) | Crítico | Integration | P0 |
| Delete Recorrência | Crítico | E2E | P0 |
| Orçamento alerta 80% | Alto | Unit | P1 |
| SpendDecisionIndicator | Crítico | Unit | P0 |
| OCR importação | Alto | Integration | P1 |
| Export CSV/PDF/XLSX | Alto | Integration | P1 |
| Admin role check | Crítico | Integration | P0 |
| Rate limiting | Crítico | Integration | P0 |

---

## 2. ESTRATÉGIA DE COBERTURA

### 2.1 Unit Tests (70% do esforço)
- Domain puro (financial-engine, entities, value objects): 100%
- Use cases: 80%+
- Hooks: 60%+
- Validações Zod: 100%

### 2.2 Integration Tests (20% do esforço)
- API routes com Prisma (SQLite in-memory ou mock): 70%+
- AgentScheduler, AgentQueue: 80%+
- OCR pipeline: 50%+
- Blob storage: 50%+

### 2.3 E2E Tests (10% do esforço)
- Fluxos críticos apenas (10-12 cenários)
- Playwright com chromium headless
- Login → Dashboard → Criar Transação → Verificar → Deletar
- Login → Orçamento → Verificar alerta
- Login → Recorrência → Gerar → Verificar transação

### 2.4 Smoke Tests
- GET / → 200
- GET /login → 200
- GET /api/dashboard → 401 (sem auth)
- Build passing

### 2.5 Regression Tests
- Todos os unit tests rodam em CI
- E2E para fluxos críticos em pre-push hook
- Coverage gate: < 75% bloqueia deploy

---

## 3. FERRAMENTAS

| Ferramenta | Uso | Status |
|------------|-----|--------|
| Vitest | Unit + Integration | ✅ Já configurado |
| Playwright | E2E | ✅ Package instalado, @playwright/mcp |
| Testing Library | Render de componentes | ✅ @testing-library/react |
| MSW | Mock de API em testes | ❌ Não instalado |
| Istanbul/V8 | Coverage | ❌ Sem config |

---

## 4. CONFIGURAÇÃO DE COVERAGE (vitest.config.ts)

```typescript
// A adicionar em vitest.config.ts ou criar se não existir:
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        lines: 75,
        branches: 70,
        functions: 75,
        statements: 75,
      },
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/app/layout.tsx',
        'src/types/**',
        '**/*.d.ts',
        '**/node_modules/**',
      ],
    },
  },
});
```

---

## 5. LIMITAÇÕES HONESTAS

1. **Cobertura 100% literal é inviável** para arquivos de config (next.config, tailwind, etc.) e wrappers de provider
2. **API routes com Prisma** são difíceis de testar sem mock pesado ou banco real — usar SQLite in-memory
3. **OCR** depende de Tesseract.js (browser) — testes limitados a parsing de texto
4. **Vercel Blob** é externo — mock apenas
5. **Cron jobs** não rodam em ambiente de teste — testar a função, não o trigger

---

## 6. PLANO DE EXPANSÃO DE COBERTURA

| Semana | Meta | O que testar |
|--------|------|-------------|
| 1 | 45% → 55% | API routes: transactions, accounts, budgets |
| 2 | 55% → 65% | API routes: recurrences, categories, agents |
| 3 | 65% → 75% | UI components: button, input, dialog, select |
| 4 | 75% → 82% | Pages: dashboard, movimentacoes, login |
| 5 | 82% → 88% | Services: AgentScheduler, notifications |
| 6 | 88% → 90% | E2E fluxos críticos, edge cases |
