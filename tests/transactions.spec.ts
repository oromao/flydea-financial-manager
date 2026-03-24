import { test, expect } from '@playwright/test';

test.describe('Movimentações Financeiras', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('input[type="email"]', 'augusto@flydea.com');
    await page.fill('input[type="password"]', 'flydea2024');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/');
  });

  test('Deve criar uma nova despesa com sucesso', async ({ page }) => {
    await page.goto('/movimentacoes');
    
    // Click "NOVO LANÇAMENTO"
    await page.click('button:has-text("NOVO LANÇAMENTO")');
    
    // Fill the form
    await page.fill('label:has-text("Descrição") + input', 'Teste E2E Despesa');
    await page.fill('label:has-text("Valor") + input', '150.50');
    
    // Select Category "Outros" (default)
    
    await page.click('button:has-text("CONFIRMAR")');
    
    // Verify it appeared in the list (table or cards)
    await expect(page.locator('text=Teste E2E Despesa')).toBeVisible();
    await expect(page.locator('text=R$ 150,50')).toBeVisible();
  });

  test('Deve filtrar movimentações por tipo (Saídas)', async ({ page }) => {
    await page.goto('/movimentacoes');
    await page.click('button:has-text("Saídas")');
    
    // All visible currency values should be from expenses
    // (This is a simplified check for the demo)
    await expect(page.locator('text=Saídas')).toHaveClass(/bg-rose-500/);
  });
});
