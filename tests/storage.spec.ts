import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

test.describe('File Upload (Storage Fallback)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'augusto@flydea.com');
    await page.fill('input[type="password"]', 'flydea2024');
    await page.click('button[type="submit"]');
  });

  test('Deve fazer upload de comprovante localmente', async ({ page }) => {
    await page.goto('/movimentacoes');
    
    // Create a dummy file for upload
    const filePath = path.join(__dirname, 'test-receipt.txt');
    fs.writeFileSync(filePath, 'conteudo de teste do comprovante');

    // Click "NOVO LANÇAMENTO"
    await page.getByRole('button', { name: /NOVO LANÇAMENTO/i }).click();
    
    // Upload file
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.click('div:has-text("UPLOAD")');
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(filePath);

    // Wait for upload to complete (PRONTO appears)
    await expect(page.locator('text=PRONTO')).toBeVisible({ timeout: 15000 });
    
    // Fill the rest of the form
    await page.fill('label:has-text("Descrição Detalhada") + input', 'Teste Upload E2E');
    await page.fill('label:has-text("Valor") + input', '50.00');
    
    // Confirm
    await page.click('button:has-text("CONFIRMAR LANÇAMENTO")');
    
    // Verify in table
    await expect(page.locator('text=Teste Upload E2E')).toBeVisible();
    
    // Check if the cloud icon is there (indicates blobUrl is present)
    await expect(page.locator('a.text-emerald-400')).toBeVisible();

    // Cleanup
    fs.unlinkSync(filePath);
  });
});
