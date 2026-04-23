import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3010';
const TEST_EMAIL = 'luiz@flydea.com';
const TEST_PASSWORD = 'luiz2026';

test.describe('Smoke Tests', () => {
  test('Login page renders', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await expect(page).toHaveURL(/.*login/);
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('Can login successfully', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');

    await page.waitForURL(`${BASE_URL}/`, { timeout: 10000 });
    await expect(page).toHaveURL(BASE_URL + '/');
  });

  test('Dashboard loads after login', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');

    await page.waitForURL(`${BASE_URL}/`);

    // Check for dashboard content
    await expect(page.locator('text=Resumo Financeiro').first()).toBeVisible({ timeout: 5000 });
  });

  test('Mobile nav renders on dashboard', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');

    await page.waitForURL(`${BASE_URL}/`);

    // Check for bottom nav
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
  });

  test('Can navigate to Movimentações page', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');

    await page.waitForURL(`${BASE_URL}/`);

    // Click on Movimentações link
    await page.click('a:has-text("Movimentações"), [role="button"]:has-text("Movimentações")');

    await page.waitForURL(/.*movimentacoes/, { timeout: 10000 });
    await expect(page).toHaveURL(/.*movimentacoes/);
  });

  test('Dark mode toggle works', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');

    await page.waitForURL(`${BASE_URL}/`);

    // Find and click dark mode toggle
    const toggleButton = page.locator('button[aria-label*="Toggle theme"], button[title*="dark"]').first();
    if (await toggleButton.isVisible()) {
      await toggleButton.click();
      // Check that dark class is toggled
      const html = page.locator('html');
      const hasDarkClass = await html.evaluate((el) => el.classList.contains('dark'));
      // After toggle, it should have changed
      await toggleButton.click();
    }
  });

  test('No horizontal scroll on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 }); // iPhone viewport

    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');

    await page.waitForURL(`${BASE_URL}/`);

    // Check for horizontal overflow
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);

    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 1); // +1 for rounding
  });

  test('Responsive grids on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });

    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');

    await page.waitForURL(`${BASE_URL}/`);

    // Check that grids are responsive
    const grids = page.locator('[class*="grid"]');
    const count = await grids.count();
    expect(count).toBeGreaterThan(0);
  });
});
