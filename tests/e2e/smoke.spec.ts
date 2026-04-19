import { test, expect } from '@playwright/test';

test.describe('Smoke Tests - Critical Paths', () => {
  test('should load home page', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/.*Financial.*|.*Flydea.*/i);
    const pageContent = await page.content();
    expect(pageContent).toBeTruthy();
  });

  test('should navigate to Movimentações without errors', async ({ page }) => {
    await page.goto('/');
    const navLink = page.locator('a[href*="/movimentacoes"], button:has-text("Fluxo")').first();
    if (await navLink.isVisible()) {
      await navLink.click();
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveURL(/.*movimentacoes/i);
    }
  });

  test('should navigate to Contas without errors', async ({ page }) => {
    await page.goto('/');
    const navLink = page.locator('a[href*="/contas"], button:has-text("Contas")').first();
    if (await navLink.isVisible()) {
      await navLink.click();
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveURL(/.*contas$/i);
    }
  });

  test('should navigate to Contas a Pagar without errors', async ({ page }) => {
    await page.goto('/');
    const navLink = page.locator('a[href*="/contas-a-pagar"], button:has-text("Pendências")').first();
    if (await navLink.isVisible()) {
      await navLink.click();
      await page.waitForLoadState('networkidle');
      await expect(page).toHaveURL(/.*contas-a-pagar/i);
    }
  });

  test('should check API health - transactions endpoint', async ({ page }) => {
    const response = await page.request.get('/api/transactions?limit=1');
    expect([200, 401, 403]).toContain(response.status());
  });

  test('should check API health - accounts endpoint', async ({ page }) => {
    const response = await page.request.get('/api/accounts');
    expect([200, 401, 403]).toContain(response.status());
  });

  test('should have no console errors on home page', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    expect(errors.length).toBe(0);
  });
});
