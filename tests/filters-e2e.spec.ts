import { test, expect, devices } from '@playwright/test';

test.use({
  ...devices['iPhone 15 Pro Max'],
  browserName: 'chromium',
});

test.describe('Movimentações - Filtros Avançados', () => {
  test.beforeEach(async ({ page }) => {
    // 1. Login
    await page.goto('/login');
    await page.waitForSelector('input#email');
    await page.fill('input#email', 'augusto@flydea.com');
    await page.fill('input#password', 'password123');
    await page.click('button[type="submit"]');
    
    // Esperar redirecionamento
    await page.waitForURL('**/', { timeout: 30000 });
    
    // Navegar para movimentacoes
    await page.goto('/movimentacoes');
    await expect(page.getByRole('heading', { name: 'Movimentações' })).toBeVisible({ timeout: 20000 });
  });

  test('Deve filtrar por descrição e persistir na URL', async ({ page }) => {
    const uniqueDesc = `SearchTest${Date.now()}`;
    
    // Criar transação para o teste
    await page.locator('button:has-text("NOVO")').first().click();
    await page.fill('input[placeholder="O que você pagou ou recebeu?"]', uniqueDesc);
    await page.fill('input[inputmode="numeric"]', '10,50');
    
    // Selecionar categoria
    const categoryTrigger = page.locator('div').filter({ has: page.locator('label:text("Categoria")') }).locator('button[data-slot="select-trigger"]').first();
    await categoryTrigger.click();
    await page.locator('[data-slot="select-item"]').first().click();

    await page.click('button:has-text("CONFIRMAR LANÇAMENTO")');
    
    // Esperar processar
    await expect(page.locator('div.group').filter({ hasText: uniqueDesc }).first()).toBeVisible({ timeout: 15000 });

    // Buscar
    await page.fill('input[placeholder="Pesquisar lançamentos..."]', uniqueDesc);
    
    // Verificar URL
    await expect(page).toHaveURL(/search=SearchTest/);
    
    // Reload e verificar se continua filtrado
    await page.reload();
    await expect(page.locator('input[placeholder="Pesquisar lançamentos..."]')).toHaveValue(uniqueDesc);
    await expect(page.locator('div.group').filter({ hasText: uniqueDesc }).first()).toBeVisible({ timeout: 15000 });
  });

  test('Deve filtrar por Tipo e Status', async ({ page }) => {
    // Clicar em Receitas
    await page.click('button:has-text("Receitas")');
    await expect(page).toHaveURL(/type=INCOME/, { timeout: 10000 });
    
    // Clicar em Pagas
    await page.click('button:has-text("Pagas")');
    await expect(page).toHaveURL(/paymentStatus=PAID/, { timeout: 10000 });
    
    // Limpar
    await page.click('button:has-text("Limpar")');
    await expect(page).not.toHaveURL(/type=INCOME/, { timeout: 10000 });
    await expect(page).not.toHaveURL(/paymentStatus=PAID/, { timeout: 10000 });
  });

  test('Deve filtrar por período', async ({ page }) => {
    const futureDate = '2099-12-31';
    const dateDeInput = page.locator('input[type="date"]').first();
    await dateDeInput.fill(futureDate);
    
    await expect(page).toHaveURL(/startDate=2099-12-31/, { timeout: 10000 });
    await expect(page.getByText('Sem resultados').first()).toBeVisible({ timeout: 15000 });
  });
});
