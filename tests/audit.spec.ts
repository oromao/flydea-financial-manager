import { test, expect } from '@playwright/test';

test.describe('Audit Logs', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'augusto@flydea.com');
    await page.fill('input[type="password"]', 'flydea2024');
    await page.click('button[type="submit"]');
  });

  test('Deve visualizar logs de auditoria no Admin', async ({ page }) => {
    await page.goto('/admin/logs');
    await expect(page.locator('h1')).toContainText('Logs de Auditoria');
    
    // There should be at least some logs (from my previous batch actions or seed)
    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('text=CREATE').or(page.locator('text=IMPORT'))).toBeVisible();
  });
});
