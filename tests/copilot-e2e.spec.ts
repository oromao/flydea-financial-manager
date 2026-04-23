import { test, expect, devices } from '@playwright/test';

test.use({
  ...devices['iPhone 16'],
  browserName: 'webkit',
});

test.describe('Intelligent Copilot E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Basic setup - assuming dev mode or mock auth session
    await page.goto('/login');
    // ... auth logic if needed ...
    await page.goto('/dashboard');
  });

  test('Deve abrir o copiloto e enviar uma pergunta', async ({ page }) => {
    // 1. Verificar se o botão flutuante existe
    const copilotBtn = page.getByText('Copiloto IA');
    await expect(copilotBtn).toBeVisible();

    // 2. Abrir o chat
    await copilotBtn.click();
    await expect(page.getByText('Sou seu copiloto financeiro inteligente')).toBeVisible();

    // 3. Enviar pergunta
    const input = page.getByPlaceholder('Pergunte sobre suas finanças...');
    await input.fill('Qual é meu saldo?');
    await page.keyboard.press('Enter');

    // 4. Aguardar resposta da IA
    // Como estamos em E2E, o PicoClaw real vai rodar.
    // O saldo deve aparecer na resposta formatado.
    await expect(page.getByText(/saldo|R\$/i).last()).toBeVisible({ timeout: 15000 });
    
    // 5. Testar feedback
    const helpfulBtn = page.getByTitle('Útil').first();
    if (await helpfulBtn.isVisible()) {
      await helpfulBtn.click();
      await expect(page.getByText('Obrigado pelo feedback!')).toBeVisible();
    }
  });

  test('Deve sugerir perguntas contextuais', async ({ page }) => {
    await page.getByText('Copiloto IA').click();
    
    // Verificar sugestões iniciais
    await expect(page.getByText('Sugestões:')).toBeVisible();
    const suggestion = page.getByRole('button', { name: 'Qual é minha situação financeira atual?' });
    await expect(suggestion).toBeVisible();
    
    // Clicar na sugestão
    await suggestion.click();
    
    // Verificar se preencheu o input
    const input = page.getByPlaceholder('Pergunte sobre suas finanças...');
    await expect(input).toHaveValue('Qual é minha situação financeira atual?');
  });
});
