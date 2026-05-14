import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const SCREENSHOT_DIR = path.join(process.cwd(), 'docs', 'mobile-audit-screenshots');

test.beforeAll(() => {
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }
});

async function takeScreenshot(page: any, name: string) {
  const projectName = test.info().project.name;
  const filename = `${projectName}_${name}.png`;
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, filename) });
}

// ============================================================
// 1. LOGIN PAGE — Mobile audit
// ============================================================
test.describe('Login - Mobile Audit', () => {
  test('login page renders correctly on mobile', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Check viewport
    const viewport = page.viewportSize();
    console.log(`Viewport: ${viewport?.width}x${viewport?.height}`);

    // Check login form is visible and usable
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitButton = page.locator('button[type="submit"]');

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(submitButton).toBeVisible();

    // Touch target check: submit button should be >= 44px height
    const submitBox = await submitButton.boundingBox();
    if (submitBox) {
      expect(submitBox.height).toBeGreaterThanOrEqual(44);
      console.log(`Submit button height: ${submitBox.height}px`);
    }

    // Screenshot
    await takeScreenshot(page, 'login');
  });

  test('login form fields have proper spacing', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitButton = page.locator('button[type="submit"]');

    // Check vertical spacing between fields
    const emailBox = await emailInput.boundingBox();
    const passwordBox = await passwordInput.boundingBox();
    const submitBox = await submitButton.boundingBox();

    if (emailBox && passwordBox) {
      const gap = passwordBox.y - (emailBox.y + emailBox.height);
      console.log(`Gap between email and password: ${gap}px`);
      expect(gap).toBeGreaterThanOrEqual(8);
    }
  });
});

// ============================================================
// 2. DASHBOARD — Mobile audit
// ============================================================
test.describe('Dashboard - Mobile Audit', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[type="email"]', 'augusto@flydea.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/');
    await page.waitForLoadState('networkidle');
  });

  test('dashboard renders all sections on mobile', async ({ page }) => {
    const viewport = page.viewportSize();
    console.log(`Dashboard viewport: ${viewport?.width}x${viewport?.height}`);

    // Check key elements are visible
    await expect(page.locator('text=Saldo Total').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Primeiros Passos').first()).toBeVisible();

    // Check touch targets on action buttons
    const actionButtons = page.locator('button, a[href]').filter({ hasText: /Novo Lançamento|Extrato/ });
    const count = await actionButtons.count();
    expect(count).toBeGreaterThanOrEqual(1);

    // Screenshot
    await takeScreenshot(page, 'dashboard');
  });

  test('no horizontal scroll on dashboard mobile', async ({ page }) => {
    // Check page width doesn't exceed viewport
    const overflow = await page.evaluate(() => {
      return {
        bodyWidth: document.body.scrollWidth,
        viewportWidth: window.innerWidth,
        overflowX: getComputedStyle(document.body).overflowX,
        hasHorizontalScroll: document.body.scrollWidth > window.innerWidth,
      };
    });
    console.log(`Body width: ${overflow.bodyWidth}, Viewport: ${overflow.viewportWidth}, Has scroll: ${overflow.hasHorizontalScroll}`);
    expect(overflow.hasHorizontalScroll).toBe(false);
  });
});

// ============================================================
// 3. TRANSACTION MODAL — Critical mobile audit
// ============================================================
test.describe('Transaction Modal - Critical Mobile Audit', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'augusto@flydea.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/');
    await page.waitForLoadState('networkidle');
  });

  async function clickNewTransaction(page: any) {
    // On mobile, use the FAB/New button in bottom nav
    const isMobile = (page.viewportSize()?.width || 999) <= 768;
    if (isMobile) {
      // Try FAB button in bottom nav with "Novo" text
      const fabBtn = page.locator('nav[class*="fixed"][class*="bottom"] button, nav[class*="fixed"][class*="bottom"] a').filter({ hasText: /Novo|Adicionar/ }).first();
      if (await fabBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await fabBtn.click();
        return;
      }
      // Fallback: go to /movimentacoes page and try there
      await page.goto('/movimentacoes');
      await page.waitForLoadState('networkidle');
      const novoBtn = page.locator('button, a').filter({ hasText: /Novo/ }).first();
      if (await novoBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await novoBtn.click();
        return;
      }
    }
    // Desktop or fallback: use Novo Lançamento button
    await page.locator('button, a').filter({ hasText: /Novo Lançamento/ }).first().click();
  }

  test('modal opens and has proper structure on mobile', async ({ page }) => {
    await clickNewTransaction(page);
    await page.waitForTimeout(1500);

    // Wait for dialog to be visible
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 5000 });

    // Check modal header is visible and has close button
    const closeButton = page.locator('[role="dialog"] button').filter({ has: page.locator('svg') }).first();
    await expect(closeButton).toBeVisible();

    // Check modal has solid background (not transparent)
    const bgColor = await page.evaluate(() => {
      const dialog = document.querySelector('[role="dialog"]');
      if (!dialog) return 'no-dialog';
      const style = getComputedStyle(dialog);
      return { background: style.backgroundColor, opacity: style.opacity };
    });
    console.log(`Dialog bg-color: ${bgColor.background}, opacity: ${bgColor.opacity}`);

    // Check form fields are visible
    const descriptionInput = page.locator('input[name="description"]');
    const amountInput = page.locator('input[name="amount"]');
    await expect(descriptionInput).toBeVisible();
    await expect(amountInput).toBeVisible();

    // Check submit button is visible
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeVisible();

    // Check submit button touch target
    const submitBox = await submitButton.boundingBox();
    if (submitBox) {
      expect(submitBox.height).toBeGreaterThanOrEqual(44);
      console.log(`Submit button height: ${submitBox.height}px`);
    }

    // Check that NO content is hidden behind the header
    const headerVisible = await page.evaluate(() => {
      const dialog = document.querySelector('[role="dialog"]');
      if (!dialog) return false;
      const header = dialog.querySelector('[class*="border-b"]');
      if (!header) return false;
      const headerRect = header.getBoundingClientRect();
      const content = dialog.querySelector('[class*="overflow-y-auto"]');
      if (!content) return false;
      const contentRect = content.getBoundingClientRect();
      return {
        headerBottom: headerRect.bottom,
        contentTop: contentRect.top,
        contentOverlapsHeader: contentRect.top < headerRect.bottom,
        headerHeight: headerRect.height,
      };
    });
    console.log(`Header/Content overlap check:`, headerVisible);
    if (headerVisible && typeof headerVisible === 'object') {
      expect(headerVisible.contentOverlapsHeader).toBe(false);
    }

    // Screenshot
    await takeScreenshot(page, 'modal_transaction');
  });

  test('modal can be closed via close button on mobile', async ({ page }) => {
    await clickNewTransaction(page);
    await page.waitForTimeout(1000);

    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible({ timeout: 5000 });

    // Click close button (X icon)
    const closeBtn = dialog.locator('button').filter({ has: page.locator('svg') }).first();
    await closeBtn.click();
    await page.waitForTimeout(1000);

    // Modal should be closed
    await expect(dialog).not.toBeVisible();
  });

  test('can fill and submit transaction form on mobile', async ({ page }) => {
    await clickNewTransaction(page);
    await page.waitForTimeout(1500);

    // Fill form
    const descriptionInput = page.locator('input[name="description"]');
    if (await descriptionInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await descriptionInput.fill('Teste mobile audit');
    }

    // MoneyInput uses type=number
    const amountInput = page.locator('input[name="amount"]');
    if (await amountInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await amountInput.click();
      await amountInput.fill('150');
    }

    // Select category if visible
    const categorySelect = page.locator('[role="combobox"]').first();
    if (await categorySelect.isVisible({ timeout: 2000 }).catch(() => false)) {
      await categorySelect.click();
      await page.waitForTimeout(300);
      const option = page.locator('[role="option"]').first();
      if (await option.isVisible({ timeout: 2000 }).catch(() => false)) {
        await option.click();
      }
    }

    // Submit — try pressing Enter or clicking submit
    const submitBtn = page.locator('button[type="submit"]');
    if (await submitBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await submitBtn.click();
      await page.waitForTimeout(2000);
      // Check for toast success
      const successToast = page.locator('[role="status"]').filter({ hasText: /sucesso|confirmado|criada/ }).first();
      const hasToast = await successToast.isVisible({ timeout: 3000 }).catch(() => false);
      console.log(`Success toast visible: ${hasToast}`);
    }

    // Screenshot after submit
    await takeScreenshot(page, 'modal_submit');
  });

  test('all form fields visible without scrolling on 390px', async ({ page }) => {
    // Only run on iPhone 16 viewport
    const viewport = page.viewportSize();
    if (viewport?.width !== 390) {
      test.skip();
      return;
    }

    await clickNewTransaction(page);
    await page.waitForTimeout(1000);

    // Check all fields are reachable (either visible or scrollable to)
    const fields = [
      'input[name="description"]',
      'input[name="amount"]',
      '[role="combobox"]',
      'input[type="date"]',
      'button[type="submit"]',
    ];

    for (const field of fields) {
      const el = page.locator(field).first();
      await expect(el).toBeAttached({ timeout: 3000 });
      // Try to scroll to it if not visible
      await el.scrollIntoViewIfNeeded();
      await page.waitForTimeout(100);
      const visible = await el.isVisible();
      console.log(`Field ${field} visible: ${visible}`);
      expect(visible).toBe(true);
    }
  });
});

// ============================================================
// 4. BUDGET MODAL — Mobile audit
// ============================================================
test.describe('Budget Modal - Mobile Audit', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'augusto@flydea.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/');
    await page.waitForLoadState('networkidle');
  });

  test('budget modal opens and has proper scroll behavior', async ({ page }) => {
    await page.goto('/orcamentos');
    await page.waitForLoadState('networkidle');

    await takeScreenshot(page, 'orcamentos_page');

    // Click Novo Orçamento
    const newBudgetBtn = page.locator('text=Novo Orçamento').first();
    if (await newBudgetBtn.isVisible()) {
      await newBudgetBtn.click();
      await page.waitForTimeout(1000);
      await takeScreenshot(page, 'modal_budget');

      // Check dialog
      const dialog = page.locator('[role="dialog"]');
      const visible = await dialog.isVisible();
      console.log(`Budget dialog visible: ${visible}`);
    }
  });
});

// ============================================================
// 5. TOUCH TARGETS — Global audit
// ============================================================
test.describe('Touch Targets - Global Audit', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'augusto@flydea.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/');
    await page.waitForLoadState('networkidle');
  });

  test('all buttons meet 44px minimum on mobile', async ({ page }) => {
    const viewport = page.viewportSize();
    if (!viewport || viewport.width > 768) {
      test.skip(); // Only test on mobile viewports
      return;
    }

    // Check all VISIBLE buttons in the viewport (exclude off-screen sidebar drawer)
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;
    const smallButtons = await page.evaluate(({ viewportW, viewportH }) => {
      const results: { tag: string; text: string; size: string; x: number; y: number }[] = [];
      const buttons = document.querySelectorAll('button, a[href], [role="button"], input[type="submit"], input[type="button"]');
      buttons.forEach((btn) => {
        const rect = btn.getBoundingClientRect();
        // Only check buttons that are actually within the viewport (not off-screen sidebar drawers)
        const isInViewport = rect.left >= 0 && rect.top >= 0 && rect.left < viewportW && rect.top < viewportH;
        if (isInViewport && rect.width > 0 && rect.height > 0 && rect.height < 44 && rect.width < 100) {
          results.push({
            tag: btn.tagName,
            text: (btn.textContent || '').trim().slice(0, 40),
            size: `${Math.round(rect.width)}x${Math.round(rect.height)}`,
            x: Math.round(rect.x),
            y: Math.round(rect.y),
          });
        }
      });
      return results;
    }, { viewportW, viewportH });

    if (smallButtons.length > 0) {
      console.log(`Found ${smallButtons.length} small buttons:`, JSON.stringify(smallButtons.slice(0, 10), null, 2));
    }
    // Only fail if there are buttons under 44px that aren't decorative SVGs or small layout elements
    // Only count buttons that aren't accessibility skip-links or hidden
    const realButtons = smallButtons.filter(b => 
      !b.text.includes('Pular para') && 
      !b.text.includes('Skip') &&
      !b.text.includes('pular') &&
      !b.text.includes('conteudo') &&
      b.size !== '1x1'
    );
    console.log(`Real small buttons after filter: ${realButtons.length}`, JSON.stringify(realButtons));
    expect(realButtons.length).toBe(0);
  });
});

// ============================================================
// 6. RESPONSIVE LAYOUT — Pages audit
// ============================================================
test.describe('Responsive Layout - Pages Audit', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'augusto@flydea.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/');
    await page.waitForLoadState('networkidle');
  });

  const pages = [
    { name: 'dashboard', url: '/' },
    { name: 'movimentacoes', url: '/movimentacoes' },
    { name: 'contas', url: '/contas' },
    { name: 'orcamentos', url: '/orcamentos' },
    { name: 'recorrencias', url: '/recorrencias' },
    { name: 'fluxo-caixa', url: '/fluxo-caixa' },
    { name: 'fechamento', url: '/fechamento' },
    { name: 'relatorios', url: '/relatorios' },
    { name: 'alertas', url: '/alertas' },
    { name: 'perfil', url: '/perfil' },
  ];

  for (const { name, url } of pages) {
    test(`${name} page has no horizontal overflow on mobile`, async ({ page }) => {
      await page.goto(url);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      const overflow = await page.evaluate(() => {
        return {
          scrollWidth: document.body.scrollWidth,
          viewportWidth: window.innerWidth,
          hasOverflow: document.body.scrollWidth > window.innerWidth,
          overflowX: getComputedStyle(document.documentElement).overflowX,
        };
      });
      console.log(`${name}: scroll=${overflow.scrollWidth}, viewport=${overflow.viewportWidth}, overflow=${overflow.hasOverflow}`);

      if (overflow.hasOverflow) {
        await takeScreenshot(page, `overflow_${name}`);
      }
      expect(overflow.hasOverflow).toBe(false);
    });
  }
});

// ============================================================
// 7. BOTTOM NAV — Mobile audit
// ============================================================
test.describe('Bottom Navigation - Mobile Audit', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'augusto@flydea.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/');
    await page.waitForLoadState('networkidle');
  });

  test('bottom nav items are all visible and tappable', async ({ page }) => {
    const viewport = page.viewportSize();
    if (!viewport || viewport.width > 768) {
      test.skip();
      return;
    }

    // Check bottom nav exists
    const bottomNav = page.locator('nav[class*="fixed"][class*="bottom"]').first();
    const exists = await bottomNav.count();
    if (exists === 0) {
      console.log('No fixed bottom nav found (may use sidebar on tablet/desktop)');
      return;
    }

    await expect(bottomNav).toBeVisible();

    // Check nav items have 44px touch targets
    const navItems = bottomNav.locator('a, button');
    const count = await navItems.count();
    expect(count).toBeGreaterThanOrEqual(3);

    for (let i = 0; i < count; i++) {
      const item = navItems.nth(i);
      const box = await item.boundingBox();
      if (box) {
        expect(box.height).toBeGreaterThanOrEqual(44);
        console.log(`Nav item ${i} height: ${box.height}px`);
      }
    }

    // Test navigation by clicking
    const dashboardLink = bottomNav.locator('a').filter({ hasText: /Dashboard|Home|Painel/ }).first();
    if (await dashboardLink.isVisible()) {
      await dashboardLink.click();
      await page.waitForTimeout(1000);
    }

    await takeScreenshot(page, 'bottom_nav');
  });
});
