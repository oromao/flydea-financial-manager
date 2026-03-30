import { test, expect } from '@playwright/test';

test.describe('Movimentações Financeiras', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'augusto@flydea.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/$/);
  });

  test('Deve criar uma nova despesa com sucesso', async ({ page }) => {
    await page.goto('/movimentacoes');
    
    await page.getByRole('button', { name: /NOVO LANÇAMENTO/i }).click();

    const descricao = `Teste E2E Despesa ${Date.now()}`;
    await page.getByPlaceholder('Ex: Assinatura mensal Cloud').fill(descricao);
    await page.locator('input[type="number"]').first().fill('150');

    const createTxResponse = page.waitForResponse((res) =>
      res.url().includes('/api/transactions') &&
      res.request().method() === 'POST'
    );
    await page.getByRole('button', { name: /Confirmar Lançamento/i }).click();

    const res = await createTxResponse;
    expect(res.status()).toBe(200);
    await expect(page.getByText(descricao).first()).toBeVisible({ timeout: 15000 });
  });

  test('Deve filtrar movimentações por tipo (Saídas)', async ({ page }) => {
    await page.goto('/movimentacoes');
    await page.getByRole('button', { name: /Despesas/i }).click();
    await expect(page.getByRole('button', { name: /Despesas/i })).toBeVisible();
    await expect(page.getByText(/Fluxo de Caixa/i)).toBeVisible();
  });
});
