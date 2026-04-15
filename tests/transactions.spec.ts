import { test, expect } from '@playwright/test';

test.describe('Movimentações Financeiras', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'augusto@flydea.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/$/);
  });

  test('Deve carregar a página de movimentações', async ({ page }) => {
    await page.goto('/movimentacoes');
    await expect(page.getByRole('heading', { name: /Movimentações/i })).toBeVisible({ timeout: 10000 });
  });

  test('Deve filtrar movimentações por tipo (Despesas)', async ({ page }) => {
    await page.goto('/movimentacoes');
    await page.getByRole('button', { name: /Despesas/i }).click();
    await expect(page.getByRole('button', { name: /Despesas/i })).toBeVisible();
  });
});
