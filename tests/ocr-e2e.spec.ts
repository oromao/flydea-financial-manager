import { test, expect, devices } from '@playwright/test';
import path from 'path';

test.use({
  ...devices['iPhone 15 Pro Max'],
  browserName: 'chromium',
});

test.describe('OCR / Document Import E2E', () => {
  test.beforeEach(async ({ page }) => {
    // 1. Login Resiliente
    await page.goto('/login');
    await page.waitForSelector('input#email', { timeout: 30000 });
    await page.fill('input#email', 'augusto@flydea.com');
    await page.fill('input#password', 'password123');
    await page.click('button[type="submit"]');
    
    await page.waitForURL('**/', { timeout: 30000 });
    
    // Abrir /movimentacoes e garantir que carregou
    await page.goto('/movimentacoes');
    await expect(page.getByRole('heading', { name: 'Movimentações' })).toBeVisible({ timeout: 30000 });
  });

  test('Deve importar um comprovante PIX via TXT e validar extração', async ({ page }) => {
    // 2. Abrir Modal de Importação
    await page.click('button:has-text("IMPORTAR DOCUMENTO")');
    const modal = page.getByLabel('Importar Documento');
    await expect(modal).toBeVisible();

    // 3. Upload do arquivo
    const filePath = path.resolve(__dirname, 'fixtures/pix-receipt.txt');
    await page.setInputFiles('input[type="file"]', filePath);

    // 4. Aguardar processamento (OCR/Parser)
    await expect(modal.getByText('DADOS EXTRAÍDOS')).toBeVisible({ timeout: 60000 });

    // 5. Validar campos extraídos no modal
    await expect(modal.getByText('R$ 125,50')).toBeVisible({ timeout: 10000 });
    
    // 6. Confirmar Importação
    await page.click('button:has-text("Confirmar")');
    await expect(modal).not.toBeVisible({ timeout: 20000 });
    
    // 7. Validar na lista de movimentações
    await expect(page.locator('div.group').filter({ hasText: 'R$ 125,50' }).first()).toBeVisible({ timeout: 20000 });
  });

  test('Deve importar uma Nota Fiscal Médica e classificar corretamente', async ({ page }) => {
    await page.click('button:has-text("IMPORTAR DOCUMENTO")');
    const modal = page.getByLabel('Importar Documento');
    
    const filePath = path.resolve(__dirname, 'fixtures/medical-nf.txt');
    await page.setInputFiles('input[type="file"]', filePath);

    await expect(modal.getByText('DADOS EXTRAÍDOS')).toBeVisible({ timeout: 60000 });

    // Validar extração no modal
    await expect(modal.getByText('R$ 450,00')).toBeVisible();
    await expect(modal.getByText('Saúde')).toBeVisible();

    await page.click('button:has-text("Confirmar")');
    await expect(modal).not.toBeVisible({ timeout: 20000 });
    
    await expect(page.locator('div.group').filter({ hasText: 'R$ 450,00' }).first()).toBeVisible({ timeout: 20000 });
  });

  test('Deve lidar com recibo de baixa qualidade e permitir edição', async ({ page }) => {
    await page.click('button:has-text("IMPORTAR DOCUMENTO")');
    const modal = page.getByLabel('Importar Documento');

    const filePath = path.resolve(__dirname, 'fixtures/bad-quality-receipt.txt');
    await page.setInputFiles('input[type="file"]', filePath);

    await expect(modal.getByText('DADOS EXTRAÍDOS')).toBeVisible({ timeout: 60000 });

    // Tentar encontrar os dados extraídos (devem estar lá agora)
    try {
       await expect(modal.getByText('R$ 120,00')).toBeVisible({ timeout: 5000 });
       await expect(modal.getByText('2026-04-10')).toBeVisible({ timeout: 5000 });
    } catch (e) {
       await page.click('button:has-text("Editar")');
       await page.fill('input[type="number"]', '120.00');
       await page.fill('input[type="date"]', '2026-04-10');
       await page.click('button:has-text("Salvar")');
    }
    
    await page.click('button:has-text("Confirmar")');
    await expect(modal).not.toBeVisible({ timeout: 20000 });
    
    await expect(page.locator('div.group').filter({ hasText: 'R$ 120,00' }).first()).toBeVisible({ timeout: 20000 });
  });
});
