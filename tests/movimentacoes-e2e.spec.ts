import { test, expect, devices } from '@playwright/test';

test.use({
  ...devices['iPhone 15 Pro Max'], // Representing iPhone 16
  browserName: 'chromium',
});

test.describe('Movimentações E2E - Mobile-First', () => {
  test('Deve completar o ciclo de vida de uma transação no mobile', async ({ page }) => {
    // 1. Login
    await page.goto('/login');
    await page.waitForSelector('input#email');
    await page.type('input#email', 'augusto@flydea.com', { delay: 50 });
    await page.type('input#password', 'password123', { delay: 50 });
    
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle' }),
      page.click('button[type="submit"]')
    ]);
    
    // Abrir /movimentacoes diretamente
    await page.goto('/movimentacoes');
    await expect(page.getByRole('heading', { name: 'Movimentações' })).toBeVisible({ timeout: 20000 });

    // 3. Criar uma transação
    const desc = `E2E Test ${Date.now()}`;
    // Mobile FAB or Top Button
    await page.locator('button:has-text("NOVO")').first().click();
    
    // Preencher campos
    await page.fill('input[placeholder="O que você pagou ou recebeu?"]', desc);
    await page.fill('input[inputmode="numeric"]', '150,00'); 
    
    // Abrir select de categoria - O trigger pode ter "Selecione..." ou o nome da categoria padrão
    const categoryTrigger = page.locator('div').filter({ has: page.locator('label:text("Categoria")') }).locator('button[data-slot="select-trigger"]').first();
    await categoryTrigger.click();
    
    // Selecionar a primeira opção de categoria que aparecer
    await page.locator('[data-slot="select-item"]').first().click();

    await page.click('button:has-text("CONFIRMAR LANÇAMENTO")');

    // 4. Validar renderização no novo TransactionCard
    // O TransactionCard tem a descrição em um h3
    const card = page.locator('div.group').filter({ hasText: desc }).first();
    await expect(card).toBeVisible({ timeout: 15000 });
    await expect(card).toContainText('R$ 150,00');

    // 5. Editar a transação
    // No TransactionCard (pago), o primeiro botão é Editar, o segundo é Excluir
    await card.locator('button').first().click();
    
    // Garantir que o modal abriu
    await expect(page.getByRole('heading', { name: 'Editar Lançamento' })).toBeVisible({ timeout: 10000 });
    
    const newDesc = `${desc} Modificado`;
    await page.fill('input[placeholder="O que você pagou ou recebeu?"]', newDesc);
    await page.fill('input[inputmode="numeric"]', '200,00'); // Mudar valor também
    
    await page.click('button:has-text("SALVAR ALTERAÇÕES")');

    // Verificar alteração
    await expect(page.locator('div.group').filter({ hasText: newDesc }).first()).toBeVisible({ timeout: 15000 });
    
    // Esperar o modal fechar - Aumentar timeout pois o PUT está demorando (quase 6s nos logs)
    await expect(page.getByRole('heading', { name: 'Editar Lançamento' })).not.toBeVisible({ timeout: 15000 });
    
    // Validar alteração
    const cardEdited = page.locator('div.group').filter({ hasText: newDesc });
    await expect(cardEdited).toBeVisible({ timeout: 10000 });
    await expect(cardEdited).toContainText('R$ 200,00');

    // 6. Excluir a transação
    await cardEdited.locator('button').last().click();
    
    // Confirmar no dialog
    await page.click('button:has-text("Excluir")');
    
    await expect(page.locator('div.group').filter({ hasText: newDesc })).not.toBeVisible();

    // 7. Recarregar a página e confirmar persistência/remoção
    await page.reload();
    await expect(page.locator('div.group').filter({ hasText: newDesc })).not.toBeVisible();

    // 8. Validar ausência de scroll horizontal no viewport iPhone 16
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
    
    // Verificar se não há nenhum elemento transbordando
    const hasOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    expect(hasOverflow).toBe(false);
  });
});
