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
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByText(/V8\.0 PREMIUM/i)).toBeVisible();
  });
});
