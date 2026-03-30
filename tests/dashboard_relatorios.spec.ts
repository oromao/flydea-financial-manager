import { test, expect } from '@playwright/test';

test.describe('Dashboard e Relatórios', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'augusto@flydea.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/$/);
  });

  test('Dashboard deve exibir cards de resumo', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText(/SALDO CONSOLIDADO/i)).toBeVisible();
    await expect(page.getByText(/ENTRADAS/i)).toBeVisible();
    await expect(page.getByText(/SAÍDAS/i)).toBeVisible();
  });

  test('Relatórios deve exibir categorias e progresso', async ({ page }) => {
    await page.goto('/relatorios');
    await expect(page.getByRole('heading', { level: 1, name: /Relatórios/i })).toBeVisible();
    await expect(page.getByText(/Gastos por Categoria/i)).toBeVisible();
    await expect(page.getByText(/Distribuição Detalhada/i)).toBeVisible();
  });
});
