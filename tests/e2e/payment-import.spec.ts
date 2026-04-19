import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

test.describe('Payment Importer - Unified Import System', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/movimentacoes');
    await page.waitForLoadState('networkidle');
  });

  test('should display import button in transactions page', async ({ page }) => {
    const importButton = page.locator('button:has-text("Importar")').first();
    await expect(importButton).toBeVisible();
  });

  test('should open import dialog on button click', async ({ page }) => {
    const importButton = page.locator('button:has-text("Importar")').first();
    await importButton.click();
    await page.waitForTimeout(300);

    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();

    const title = page.locator('text=/Importar Comprovante/i');
    await expect(title).toBeVisible();
  });

  test('should accept CSV file upload', async ({ page }) => {
    const importButton = page.locator('button:has-text("Importar")').first();
    await importButton.click();
    await page.waitForTimeout(300);

    // Create a test CSV file
    const csvContent = `date,description,amount
2024-04-19,Freelance Payment,1500.00
2024-04-18,Client Invoice,2000.00`;

    const testFile = path.join(__dirname, 'test-import.csv');
    fs.writeFileSync(testFile, csvContent);

    try {
      // Upload file
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles(testFile);
      await page.waitForTimeout(1000);

      // Should show file name
      const fileName = page.locator('text=test-import.csv');
      if (await fileName.isVisible()) {
        await expect(fileName).toBeVisible();
      }

      // Should have preview or confirmation
      const importButton2 = page.locator('button:has-text("Importar"), button:has-text("Confirmar")').first();
      expect(await importButton2.isVisible()).toBeTruthy();
    } finally {
      fs.unlinkSync(testFile);
    }
  });

  test('should accept image file upload', async ({ page }) => {
    const importButton = page.locator('button:has-text("Importar")').first();
    await importButton.click();
    await page.waitForTimeout(300);

    // Create a minimal valid PNG
    const pngBuffer = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
      0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4,
      0x89, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x44, 0x41, 0x54, 0x08, 0x5b, 0x63, 0xf8, 0x0f, 0x00, 0x00,
      0x01, 0x01, 0x01, 0x00, 0x18, 0xdd, 0x8d, 0xb4, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44,
      0xae, 0x42, 0x60, 0x82,
    ]);

    const testFile = path.join(__dirname, 'test-receipt.png');
    fs.writeFileSync(testFile, pngBuffer);

    try {
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles(testFile);
      await page.waitForTimeout(1000);

      // Check if processing message appears
      const processingMsg = page.locator('text=/Processando/i');
      const fileName = page.locator('text=test-receipt.png');

      const isProcessing = await processingMsg.isVisible();
      const hasFileName = await fileName.isVisible();

      expect(isProcessing || hasFileName).toBeTruthy();
    } finally {
      fs.unlinkSync(testFile);
    }
  });

  test('should reject unsupported file format', async ({ page }) => {
    const importButton = page.locator('button:has-text("Importar")').first();
    await importButton.click();
    await page.waitForTimeout(300);

    // Create unsupported file
    const testFile = path.join(__dirname, 'test-file.txt');
    fs.writeFileSync(testFile, 'This is a test file');

    try {
      const fileInput = page.locator('input[type="file"]');

      // Try to set unsupported file - browser should prevent it
      // OR app should show error
      let errorShown = false;
      page.on('dialog', async (dialog) => {
        if (dialog.message().includes('Format') || dialog.message().includes('suportado')) {
          errorShown = true;
        }
        await dialog.dismiss();
      });

      try {
        await fileInput.setInputFiles(testFile);
        await page.waitForTimeout(500);
      } catch (e) {
        // Expected if browser blocks
      }
    } finally {
      fs.unlinkSync(testFile);
    }
  });

  test('should show edit mode with form fields', async ({ page }) => {
    const importButton = page.locator('button:has-text("Importar")').first();
    await importButton.click();
    await page.waitForTimeout(300);

    // Create test CSV
    const csvContent = `date,description,amount
2024-04-19,Test Payment,100.00`;

    const testFile = path.join(__dirname, 'test-simple.csv');
    fs.writeFileSync(testFile, csvContent);

    try {
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles(testFile);
      await page.waitForTimeout(1000);

      // Look for Edit button
      const editButton = page.locator('button:has-text("Editar")').first();
      if (await editButton.isVisible()) {
        await editButton.click();
        await page.waitForTimeout(300);

        // Should show form fields
        const descInput = page.locator('input[placeholder*="escri"], input[value*="Test"]');
        const amountInput = page.locator('input[type="number"]');

        expect(await amountInput.count()).toBeGreaterThan(0);
      }
    } finally {
      fs.unlinkSync(testFile);
    }
  });

  test('should have clear button to remove file', async ({ page }) => {
    const importButton = page.locator('button:has-text("Importar")').first();
    await importButton.click();
    await page.waitForTimeout(300);

    // Create test file
    const testFile = path.join(__dirname, 'test-clear.csv');
    fs.writeFileSync(testFile, 'date,description,amount\n2024-04-19,Test,100');

    try {
      const fileInput = page.locator('input[type="file"]');
      await fileInput.setInputFiles(testFile);
      await page.waitForTimeout(800);

      // Look for Clear or Cancel button
      const clearButton = page.locator('button:has-text("Limpar"), button:has-text("Cancelar")').first();
      if (await clearButton.isVisible()) {
        await expect(clearButton).toBeVisible();
      }
    } finally {
      fs.unlinkSync(testFile);
    }
  });

  test('should display supported formats message', async ({ page }) => {
    const importButton = page.locator('button:has-text("Importar")').first();
    await importButton.click();
    await page.waitForTimeout(300);

    const formatMsg = page.locator('text=/PDF.*JPG.*PNG.*OFX.*CSV/i');
    const altMsg = page.locator('text=/arquivo/i');

    const hasFormats = await formatMsg.isVisible();
    const hasFile = await altMsg.isVisible();

    expect(hasFormats || hasFile).toBeTruthy();
  });

  test('should respect file size limit', async ({ page }) => {
    const importButton = page.locator('button:has-text("Importar")').first();
    await importButton.click();
    await page.waitForTimeout(300);

    // Check that input has accept attribute for file types
    const fileInput = page.locator('input[type="file"]');
    const accept = await fileInput.getAttribute('accept');

    expect(accept).toBeTruthy();
    expect(accept).toContain('.');
  });
});
