import { test, expect } from '@playwright/test';

test.describe('Perfil do usuário', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'augusto@flydea.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/$/);
  });

  test('deve abrir a página de perfil e mostrar as ações principais', async ({ page }) => {
    await page.goto('/perfil');
    await expect(page.getByRole('heading', { name: /Seu perfil/i })).toBeVisible();
    await expect(page.getByText(/Trocar foto/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /Salvar perfil/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Perfil/i }).or(page.getByText(/Conta ativa/i))).toBeVisible();
  });
});
