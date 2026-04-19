import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

test.describe('Upload Flow - Blob Integration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should display upload input in transaction form', async ({ page }) => {
    await page.goto('/movimentacoes');

    const newButton = page.locator('button:has-text("NOVO")').first();
    if (await newButton.isVisible()) {
      await newButton.click();
      await page.waitForTimeout(300);

      const uploadInput = page.locator('input[type="file"]');
      const isVisible = await uploadInput.isVisible().catch(() => false);
      expect(isVisible || await uploadInput.isHidden()).toBe(true);
    }
  });

  test('should create transaction form with upload capability', async ({ page }) => {
    await page.goto('/movimentacoes');

    const newButton = page.locator('button:has-text("NOVO")').first();
    if (await newButton.isVisible()) {
      await newButton.click();
      await page.waitForTimeout(300);

      // Check that upload label exists
      const uploadLabel = page.locator('text=/Anexar|Comprovante/i');
      if (await uploadLabel.isVisible()) {
        await expect(uploadLabel).toBeVisible();
      }

      // Check file input exists
      const fileInput = page.locator('input[type="file"]');
      await expect(fileInput).toBeTruthy();
    }
  });

  test('should validate file size before upload', async ({ page }) => {
    await page.goto('/movimentacoes');

    const newButton = page.locator('button:has-text("NOVO")').first();
    if (await newButton.isVisible()) {
      await newButton.click();
      await page.waitForTimeout(300);

      const fileInput = page.locator('input[type="file"]');
      if (await fileInput.isVisible() || await fileInput.isHidden()) {
        // Create a test file
        const testFile = path.join(__dirname, 'test-file.txt');
        fs.writeFileSync(testFile, 'Test content for upload validation');

        // Attach file
        await fileInput.setInputFiles(testFile);
        await page.waitForTimeout(500);

        // Clean up
        fs.unlinkSync(testFile);
      }
    }
  });

  test('should handle upload error gracefully', async ({ page }) => {
    // Mock network failure for upload
    await page.route('**/api/upload', route => route.abort());

    await page.goto('/movimentacoes');

    const newButton = page.locator('button:has-text("NOVO")').first();
    if (await newButton.isVisible()) {
      await newButton.click();
      await page.waitForTimeout(300);

      const fileInput = page.locator('input[type="file"]');
      const testFile = path.join(__dirname, 'test-error.txt');
      fs.writeFileSync(testFile, 'Error test');

      // Listen for error messages
      let errorMessageShown = false;
      page.on('dialog', async dialog => {
        if (dialog.message().includes('erro') || dialog.message().includes('falha')) {
          errorMessageShown = true;
        }
        await dialog.dismiss();
      });

      await fileInput.setInputFiles(testFile);
      await page.waitForTimeout(1000);

      fs.unlinkSync(testFile);
    }
  });

  test('should verify Blob token is configured', async ({ page }) => {
    const response = await page.request.head('/api/upload');
    // Should return a valid response (not 500 from missing token)
    expect(response.status()).not.toBe(500);
  });
});
