import { test, expect } from '@playwright/test';

test.describe('Dashboard e Relatórios', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'augusto@flydea.com');
    await page.fill('input[type="password"]', 'flydea2024');
    await page.click('button[type="submit"]');
  });

  test('Dashboard deve exibir cards de resumo', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=Entradas')).toBeVisible();
    await expect(page.locator('text=Saídas')).toBeVisible();
    await expect(page.locator('text=Saldo Consolidado')).toBeVisible();
  });

  test('Relatórios deve exibir categorias e progresso', async ({ page }) => {
    await page.goto('/relatorios');
    await expect(page.getByRole('heading', { level: 1, name: /Relatórios/i })).toBeVisible();
    // Check if categories seeded are visible
    await expect(page.locator('text=Marketing').or(page.locator('text=Outros'))).toBeVisible();
  });
});
