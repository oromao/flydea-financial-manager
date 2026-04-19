# Testing Guide - Flydea Financial Manager

Complete testing strategy covering unit tests, integration tests, E2E tests, smoke tests, and real user monitoring.

## Test Suite Overview

```
├── Unit Tests (Vitest)
│   ├── Domain layer (Money, Transaction, etc)
│   ├── Utilities (date-utils, validations, etc)
│   └── 90%+ coverage threshold
├── E2E Tests (Playwright)
│   ├── Smoke tests (critical paths)
│   ├── Real user flows (mobile & desktop)
│   └── Upload integration
├── Smoke Tests (Shell script)
│   └── Quick API health checks
└── Real User Monitoring (RUM)
    ├── Web Vitals (LCP, FID, CLS)
    ├── API performance
    ├── Error tracking
    └── Session monitoring
```

## Running Tests

### Unit Tests (Vitest)

```bash
# Run all unit tests
npm test

# Run with watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage

# Run specific test file
npm test -- domain-money.test.ts
```

**Coverage Thresholds:**
- Lines: 90%
- Branches: 80%
- Functions: 90%
- Statements: 90%

### E2E Tests (Playwright)

```bash
# Run all E2E tests
npm run test:e2e

# Run specific suite
npx playwright test tests/e2e/smoke.spec.ts

# Run in headed mode (see browser)
npx playwright test --headed

# Run single test
npx playwright test -g "should load home page"

# Run on specific browser
npx playwright test --project=chromium
npx playwright test --project="Mobile Chrome"

# Generate HTML report
npx playwright test && npx playwright show-report
```

**Browser Coverage:**
- Chrome (Desktop & Mobile)
- Firefox (Desktop)
- Safari (Desktop)
- Mobile Chrome (Pixel 5)

### Smoke Tests (Shell Script)

```bash
# Run against localhost
bash tests/smoke-tests.sh

# Run against production
bash tests/smoke-tests.sh https://flydea-financial-manager.vercel.app

# CI/CD integration
# Automatically runs in GitHub Actions
```

**Tests:**
1. Home page loads (HTTP 200/307)
2. API /transactions accessible
3. API /accounts accessible
4. API /categories accessible
5. Upload endpoint exists
6. Static assets load

### Run All Tests

```bash
# Unit + E2E tests
npm run test:all

# With coverage
npm run test:coverage && npm run test:e2e
```

## Test Structure

### Unit Tests (Vitest)

**Domain Layer Tests:**
```typescript
// __tests__/domain-money.test.ts
- Money value object creation
- Negative amount rejection
- Addition/subtraction operations
- Multiplication
- Comparison operations
```

```typescript
// __tests__/domain-transaction.test.ts
- Transaction creation
- Payment status transitions
- Partial payments
- Ownership validation
- Entity updates
```

**Utility Tests:**
- Date utilities
- Format helpers
- Validations
- Export helpers
- Financial engine

### E2E Tests (Playwright)

**Smoke Tests** (`tests/e2e/smoke.spec.ts`):
- Page loads without errors
- Navigation works
- API endpoints respond
- Console errors check

**Real User Flow** (`tests/e2e/real-user-flow.spec.ts`):
- Mobile layout validation
- Filter button responsiveness
- Transaction list display
- Button organization on mobile
- Search/filter operations
- Modal responsiveness

**Upload Tests** (`tests/e2e/upload-flow.spec.ts`):
- Upload input visibility
- File upload form
- File size validation
- Error handling
- Blob token verification

## Real User Monitoring (RUM)

Located in: `src/lib/real-user-monitoring.ts`

**Monitored Metrics:**

1. **Web Vitals**
   - LCP (Largest Contentful Paint): < 2.5s = Good
   - FID (First Input Delay): < 100ms = Good
   - CLS (Cumulative Layout Shift): < 0.1 = Good
   - TTFB (Time to First Byte): < 600ms = Good
   - FCP (First Contentful Paint): < 1.8s = Good

2. **API Performance**
   - Request duration
   - HTTP status codes
   - Failed requests

3. **Error Tracking**
   - JavaScript errors
   - Unhandled promise rejections
   - Network failures

4. **Session Monitoring**
   - Session ID generation
   - Page views
   - User actions
   - Custom metrics

**Integration in Application:**

```typescript
// src/app/layout.tsx or _app.tsx
import { rum } from '@/lib/real-user-monitoring';

// Automatically initialized on client side
// Tracks metrics and sends to analytics
rum.trackPageView('Home');
rum.trackUserAction('transaction_created', { amount: 100 });
rum.recordCustomMetric('form_validation_time', 125);
```

## CI/CD Integration

Tests run automatically on:
1. **Pull Requests**: Unit + E2E tests
2. **Main Branch**: Full test suite + coverage check
3. **Deployment**: Smoke tests on production

```yaml
# .github/workflows/test.yml
- Run unit tests
- Generate coverage reports
- Run E2E tests (multiple browsers)
- Run smoke tests on deployed URL
```

## Known Limitations & Gaps

1. **Authentication in E2E**: Tests currently don't authenticate. Add test user credentials for authenticated flows.

2. **API Mocking**: E2E tests use real API. Consider Playwright mocking for isolation.

3. **Performance Testing**: Add Lighthouse CI for performance regression detection.

4. **Visual Regression**: Consider Percy or Chromatic for screenshot comparisons.

5. **Load Testing**: Add k6 or Artillery for load/stress testing.

## Debugging Tests

### Debug Vitest

```bash
# Inspect test failures
npm test -- --reporter=verbose

# Debug single test
node --inspect-brk node_modules/vitest/vitest.mjs domain-money.test.ts
```

### Debug Playwright

```bash
# Interactive mode
npx playwright test --debug

# With trace viewer
npx playwright test --trace on

# View traces
npx playwright show-trace trace.zip
```

### Check RUM Logs

Open browser console and filter for `[RUM]` logs:
```javascript
// In browser console
console.log(localStorage.getItem('rum-session'))
```

## Performance Baselines

Expected baseline metrics (set from production):

| Metric | Baseline | Target |
|--------|----------|--------|
| LCP | 1.8s | < 2.5s |
| FCP | 1.2s | < 1.8s |
| CLS | 0.05 | < 0.1 |
| TTFB | 350ms | < 600ms |
| API Response | 150ms | < 500ms |

## Future Improvements

1. **Mutation Testing**: Add Stryker to detect weak tests
2. **Contract Testing**: Add Pact for API contract testing
3. **Accessibility Testing**: Add axe-core for a11y checks
4. **Security Testing**: Add OWASP ZAP scanning
5. **Cost Analysis**: Monitor test infrastructure costs

## References

- [Vitest Documentation](https://vitest.dev)
- [Playwright Documentation](https://playwright.dev)
- [Web Vitals Guide](https://web.dev/vitals/)
- [Testing Library Best Practices](https://testing-library.com)
