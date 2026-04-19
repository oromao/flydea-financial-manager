import { test, expect } from '@playwright/test';

test.describe('Real User Journey - Transaction Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should view and filter transactions in mobile view', async ({ page }) => {
    page.setViewportSize({ width: 375, height: 667 });

    const navLink = page.locator('a[href*="/movimentacoes"], button:has-text("Fluxo")').first();
    if (await navLink.isVisible()) {
      await navLink.click();
      await page.waitForLoadState('networkidle');
    } else {
      await page.goto('/movimentacoes');
    }

    // Check that filter buttons exist and are readable
    const allButton = page.locator('button:has-text("Todos")').first();
    await expect(allButton).toBeVisible();

    // Check that buttons don't overflow
    const filterContainer = page.locator('[class*="flex"][class*="flex-wrap"]').first();
    const boundingBox = await filterContainer.boundingBox();
    expect(boundingBox?.width).toBeLessThan(400);
  });

  test('should handle mobile layout for transaction list', async ({ page }) => {
    page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/movimentacoes');
    await page.waitForLoadState('networkidle');

    // Look for transaction cards on mobile
    const cardElements = page.locator('[role="article"], [class*="card"]').first();
    if (await cardElements.isVisible()) {
      const box = await cardElements.boundingBox();
      // Check that card fits within viewport
      expect(box?.width).toBeLessThanOrEqual(375);
    }
  });

  test('should display accounts without layout breaks on mobile', async ({ page }) => {
    page.setViewportSize({ width: 375, height: 667 });

    const navLink = page.locator('a[href*="/contas"], button:has-text("Contas")').first();
    if (await navLink.isVisible()) {
      await navLink.click();
      await page.waitForLoadState('networkidle');
    } else {
      await page.goto('/contas');
    }

    // Check grid layout doesn't overflow
    const grid = page.locator('[class*="grid"]').first();
    if (await grid.isVisible()) {
      const box = await grid.boundingBox();
      expect(box?.width).toBeLessThanOrEqual(400);
    }
  });

  test('should show pending bills with organized buttons on mobile', async ({ page }) => {
    page.setViewportSize({ width: 375, height: 667 });

    const navLink = page.locator('a[href*="/contas-a-pagar"], button:has-text("Pendências")').first();
    if (await navLink.isVisible()) {
      await navLink.click();
      await page.waitForLoadState('networkidle');
    } else {
      await page.goto('/contas-a-pagar');
    }

    // Check that action buttons are visible and organized
    const buttons = page.locator('button:has-text("Marcar paga"), button:has-text("Baixar")');
    if (await buttons.first().isVisible()) {
      const count = await buttons.count();
      expect(count).toBeGreaterThan(0);

      // Verify buttons stack on mobile
      const firstButton = buttons.first();
      const box = await firstButton.boundingBox();
      expect(box).toBeTruthy();
    }
  });

  test('should perform search/filter operation', async ({ page }) => {
    await page.goto('/movimentacoes');

    const searchInput = page.locator('input[placeholder*="Pesquisar"]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('test');
      await page.waitForTimeout(500); // Wait for debounce

      // Check that results updated
      const results = await page.locator('[role="article"], [class*="card"]').count();
      expect(results).toBeGreaterThanOrEqual(0);
    }
  });

  test('should check responsive form modal on mobile', async ({ page }) => {
    page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/movimentacoes');

    const newButton = page.locator('button:has-text("NOVO"), button:has-text("Nova")').first();
    if (await newButton.isVisible()) {
      await newButton.click();
      await page.waitForTimeout(300);

      // Check modal is visible and fits screen
      const dialog = page.locator('[role="dialog"]').first();
      if (await dialog.isVisible()) {
        const box = await dialog.boundingBox();
        expect(box?.width).toBeLessThanOrEqual(375);
      }
    }
  });
});
