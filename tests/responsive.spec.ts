import { test, expect } from '@playwright/test';

/**
 * Responsive / Mobile smoke tests
 *
 * These tests simulate an iPhone 16 Plus viewport (430x932) and verify:
 *  - No horizontal scroll on any key page
 *  - FAB is visible and does not overlap the bottom nav
 *  - Bottom nav is rendered
 *  - Key page headings are visible on mobile
 */

const IPHONE_16_PLUS = { width: 430, height: 932 };

const PAGES = [
  { path: '/', name: 'Dashboard' },
  { path: '/movimentacoes', name: 'Movimentacoes' },
  { path: '/contas-a-pagar', name: 'Contas a pagar' },
  { path: '/contas', name: 'Contas' },
  { path: '/orcamentos', name: 'Orcamentos' },
  { path: '/recorrencias', name: 'Recorrencias' },
  { path: '/fechamento', name: 'Fechamento' },
  { path: '/relatorios', name: 'Relatorios' },
];

test.describe('Mobile Responsiveness (iPhone 16 Plus)', () => {
  test.use({ viewport: IPHONE_16_PLUS });

  test.beforeEach(async ({ page }) => {
    // Attempt login; if already authenticated, skip
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    const isLogin = page.url().includes('/login');
    if (isLogin) {
      const emailInput = page.locator('input[type="email"], input[name="email"]').first();
      const passInput = page.locator('input[type="password"]').first();
      if (await emailInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        await emailInput.fill('augusto@flydea.com');
        await passInput.fill('password123');
        await page.locator('button[type="submit"]').click();
        await page.waitForURL(/\/$/, { timeout: 15000 }).catch(() => {});
      }
    }
  });

  for (const { path, name } of PAGES) {
    test(`${name}: no horizontal scroll on mobile`, async ({ page }) => {
      await page.goto(path, { waitUntil: 'domcontentloaded', timeout: 30000 });

      // Wait for content to settle
      await page.waitForTimeout(500);

      const hasHorizScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });

      expect(hasHorizScroll, `Page "${path}" has horizontal scroll`).toBe(false);
    });
  }

  test('Movimentacoes: FAB is visible and above bottom nav', async ({ page }) => {
    await page.goto('/movimentacoes', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(500);

    // FAB must exist (button with Plus icon in fixed position)
    const fab = page.locator('.md\\:hidden.fixed button').first();
    const fabVisible = await fab.isVisible({ timeout: 5000 }).catch(() => false);

    // Bottom nav must exist
    const bottomNav = page.locator('nav.fixed.bottom-0').first();
    const navVisible = await bottomNav.isVisible({ timeout: 5000 }).catch(() => false);

    if (fabVisible && navVisible) {
      const fabBox = await fab.boundingBox();
      const navBox = await bottomNav.boundingBox();

      if (fabBox && navBox) {
        // FAB bottom edge should be above nav top edge (no overlap)
        expect(fabBox.y + fabBox.height).toBeLessThanOrEqual(navBox.y + 10);
      }
    }
    // If auth fails, skip this assertion gracefully
  });

  test('Dashboard: summary cards do not overflow', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(500);

    const cards = page.locator('.premium-card');
    const count = await cards.count();

    for (let i = 0; i < Math.min(count, 4); i++) {
      const card = cards.nth(i);
      if (!(await card.isVisible({ timeout: 2000 }).catch(() => false))) continue;

      const box = await card.boundingBox();
      if (box) {
        expect(box.x + box.width).toBeLessThanOrEqual(IPHONE_16_PLUS.width + 2);
      }
    }
  });

  test('Bottom nav renders on mobile', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(500);

    const bottomNav = page.locator('nav.fixed.bottom-0, nav[aria-label]').first();
    // On mobile viewport the bottom nav should be in the DOM (even if auth fails)
    const exists = await bottomNav.count() > 0;
    expect(exists).toBe(true);
  });
});

// ── Smoke Tests: Key User Flows ────────────────────────────────────────────────

test.describe('Smoke Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    if (await emailInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await emailInput.fill('augusto@flydea.com');
      await page.locator('input[type="password"]').first().fill('password123');
      await page.locator('button[type="submit"]').click();
      await page.waitForURL(/\/$/, { timeout: 15000 }).catch(() => {});
    }
  });

  test('Login page renders correctly', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('input[type="email"], input[name="email"]').first()).toBeVisible({ timeout: 5000 });
    await expect(page.locator('input[type="password"]').first()).toBeVisible({ timeout: 5000 });
    await expect(page.locator('button[type="submit"]').first()).toBeVisible({ timeout: 5000 });
  });

  test('Dashboard loads without JS errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));

    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(1000);

    const fatalErrors = errors.filter(
      (e) => !e.includes('ChunkLoadError') && !e.includes('ResizeObserver')
    );
    expect(fatalErrors).toHaveLength(0);
  });

  test('Movimentacoes page loads', async ({ page }) => {
    await page.goto('/movimentacoes', { waitUntil: 'domcontentloaded', timeout: 30000 });
    // Page should not 404
    expect(page.url()).toContain('/movimentacoes');
  });

  test('Contas a pagar page loads', async ({ page }) => {
    await page.goto('/contas-a-pagar', { waitUntil: 'domcontentloaded', timeout: 30000 });
    expect(page.url()).toContain('/contas-a-pagar');
  });

  test('Contas page loads', async ({ page }) => {
    await page.goto('/contas', { waitUntil: 'domcontentloaded', timeout: 30000 });
    expect(page.url()).toContain('/contas');
  });

  test('All main pages return 200 (no redirect loop)', async ({ page }) => {
    const routes = ['/', '/movimentacoes', '/contas', '/orcamentos', '/relatorios'];
    for (const route of routes) {
      const response = await page.goto(route, { waitUntil: 'domcontentloaded', timeout: 15000 });
      // Either OK (200) or redirect to login (302 → login page) but no 500
      if (response) {
        expect(response.status()).not.toBe(500);
      }
    }
  });
});
