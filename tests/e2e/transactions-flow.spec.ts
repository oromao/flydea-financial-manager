import { test, expect, devices } from '@playwright/test';

// Configurando para iPhone 16 (Mobile)
test.use({
  ...devices['iPhone 13'], // iPhone 13/14/15/16 compartilham dimensões similares de viewport
  baseURL: 'http://localhost:3010',
});

const TEST_USER = {
  email: 'luiz@flydea.com',
  password: 'luiz2026'
};

test.describe('Fluxo de Movimentações - Premium Redesign', () => {
  
  test('deve completar o ciclo de vida de uma transação no mobile sem scroll horizontal', async ({ page }) => {
    // 1. Login
    await page.goto('/login');
    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL('/');
    
    // 2. Abrir /movimentacoes
    await page.goto('/movimentacoes');
    await expect(page.locator('h1')).toContainText('Movimentações');

    // 3. Validar ausência de scroll horizontal (iPhone 16 Viewport)
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBe(clientWidth);

    // 4. Criar uma transação (Usando o FAB no Mobile)
    // No mobile, o botão de novo é um motion.button flutuante
    await page.click('button:has(svg.w-8.h-8)'); 
    
    const description = `E2E Test - ${Date.now()}`;
    await page.fill('input[placeholder="O que você pagou ou recebeu?"]', description);
    await page.fill('input[name="amount"]', '150,00');
    
    // Selecionar categoria (primeira disponível)
    await page.click('button:has-text("Selecione...")');
    await page.click('div[role="option"] >> nth=0');

    await page.click('button:has-text("CONFIRMAR LANÇAMENTO")');

    // 5. Validar renderização no novo TransactionCard
    const transactionCard = page.locator(`text=${description}`).locator('xpath=./ancestor::div[contains(@class, "group")]');
    await expect(transactionCard).toBeVisible();
    await expect(transactionCard).toContainText('R$ 150,00');

    // 6. Editar a transação
    await transactionCard.locator('button:has(svg.w-4.h-4)').nth(1).click(); // Botão de edição (segundo botão no card)
    await page.fill('input[placeholder="O que você pagou ou recebeu?"]', `${description} - EDITADO`);
    await page.click('button:has-text("SALVAR ALTERAÇÕES")');
    
    await expect(page.locator(`text=${description} - EDITADO`)).toBeVisible();

    // 7. Excluir a transação
    await transactionCard.locator('button:has(svg.w-4.h-4)').nth(2).click(); // Botão de exclusão (terceiro botão no card)
    await page.click('button:has-text("Excluir")'); // Confirmar no modal

    // 8. Recarregar a página e confirmar remoção
    await page.reload();
    await expect(page.locator(`text=${description} - EDITADO`)).not.toBeVisible();
    
    console.log('✅ Teste E2E concluído com sucesso: Fluxo Premium validado.');
  });
});
