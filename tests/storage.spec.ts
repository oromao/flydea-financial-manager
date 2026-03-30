import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

test.describe('File Upload (Storage Fallback)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'augusto@flydea.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/$/);
  });

  test('Deve tentar enviar comprovante no fluxo de lançamento', async ({ page }) => {
    await page.goto('/movimentacoes');
    
    // Create a dummy file for upload
    const filePath = path.join(__dirname, 'test-receipt.txt');
    fs.writeFileSync(filePath, 'conteudo de teste do comprovante');

    await page.getByRole('button', { name: /NOVO LANÇAMENTO/i }).click();

    const uploadResponsePromise = page.waitForResponse((res) =>
      res.url().includes('/api/upload') && res.request().method() === 'POST'
    );
    await page.locator('input[type="file"]').setInputFiles(filePath);

    const descricao = `Teste Upload E2E ${Date.now()}`;
    await page.getByPlaceholder('Ex: Assinatura mensal Cloud').fill(descricao);
    await page.locator('input[type="number"]').first().fill('50');

    const uploadResponse = await uploadResponsePromise;
    expect(uploadResponse.status()).toBeGreaterThanOrEqual(200);
    await expect(page.getByText(/Comprovante/i).first()).toBeVisible();

    // Cleanup
    fs.unlinkSync(filePath);
  });
});
