import { test, expect } from '@playwright/test';

test.describe('Audit Logs', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'augusto@flydea.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/$/);
  });

  test('Deve visualizar logs de auditoria no Admin', async ({ page }) => {
    await page.goto('/admin/logs');
    await expect(page.getByRole('heading', { level: 1, name: /Logs de Auditoria/i })).toBeVisible();
    
    await expect(page.locator('table')).toBeVisible();
    await expect(page.getByText(/CREATE|IMPORT/i).first()).toBeVisible();
  });
});
