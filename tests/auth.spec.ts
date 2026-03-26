import { test, expect } from '@playwright/test';

test.describe('Autenticação', () => {
  test('Deve exibir erro com credenciais inválidas', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'errado@flydea.com');
    await page.fill('input[type="password"]', 'senha123');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=Usuário não encontrado')).toBeVisible();
  });

  test('Deve fazer login com sucesso (Augusto)', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'augusto@flydea.com');
    await page.fill('input[type="password"]', 'flydea2024'); // Default password set in seed
    await page.click('button[type="submit"]');
    
    // Should redirect to dashboard
    await expect(page).toHaveURL('/');
    await expect(page.locator('h1')).toContainText('Flydea');
  });
});
