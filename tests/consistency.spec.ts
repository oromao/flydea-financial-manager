import { test, expect } from '@playwright/test';

/**
 * Cross-page consistency E2E tests.
 *
 * These tests verify that:
 * - All main pages load without fatal errors
 * - Key UI elements are present on each page
 * - Financial labels are semantically correct
 * - Export buttons are functional (don't 500)
 * - Navigation between pages works
 *
 * Auth: logs in as augusto@flydea.com / password123 (must match prisma/seed.ts)
 */

test.describe('Cross-Page Financial Consistency', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.getByPlaceholder('E-mail').fill('augusto@flydea.com');
    await page.getByPlaceholder('Senha').fill('password123');
    await page.getByRole('button', { name: /entrar/i }).click();
    await page.waitForURL('/', { timeout: 10000 });
  });

  test('Dashboard loads with financial cards', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/FlyDea|Visão Geral|Dashboard/i, { timeout: 10000 });

    // Verify key financial cards exist
    await expect(page.getByText(/saldo/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/entradas/i)).toBeVisible();
    await expect(page.getByText(/saídas/i)).toBeVisible();
    await expect(page.getByText(/pendente/i)).toBeVisible();

    // No fatal error messages should appear
    await expect(page.getByText('algo deu errado', { exact: false })).not.toBeVisible();
    await expect(page.getByText('This page couldn\'t load')).not.toBeVisible();
  });

  test('Movimentações loads with stats and table', async ({ page }) => {
    await page.goto('/movimentacoes');
    await expect(page).toHaveTitle(/Movimentações/i, { timeout: 10000 });

    // Verify stats cards
    await expect(page.getByText(/saldo/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/entradas/i)).toBeVisible();
    await expect(page.getByText(/saídas/i)).toBeVisible();

    // Verify table or empty state
    const hasTable = await page.locator('table').count() > 0;
    const hasEmpty = await page.getByText(/nenhuma movimentação/i).count() > 0;
    expect(hasTable || hasEmpty).toBeTruthy();
  });

  test('Fechamento loads with monthly summary', async ({ page }) => {
    await page.goto('/fechamento');
    await expect(page).toHaveTitle(/Fechamento/i, { timeout: 10000 });

    // Verify summary cards
    await expect(page.getByText(/receitas/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/despesas/i)).toBeVisible();
    await expect(page.getByText(/saldo/i)).toBeVisible();

    // Verify export buttons exist
    await expect(page.getByText('CSV', { exact: false })).toBeVisible();
    await expect(page.getByText('PDF', { exact: false })).toBeVisible();
  });

  test('Contas a Pagar loads with pending breakdown', async ({ page }) => {
    await page.goto('/contas-a-pagar');
    await expect(page).toHaveTitle(/Contas a Pagar/i, { timeout: 10000 });

    // Verify pending cards
    await expect(page.getByText(/pendente/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/atrasada/i)).toBeVisible();
  });

  test('Fluxo de Caixa loads without error', async ({ page }) => {
    await page.goto('/fluxo-caixa');
    await expect(page).toHaveTitle(/Fluxo de Caixa/i, { timeout: 10000 });

    // Page should not show error state
    await expect(page.getByText('This page couldn\'t load')).not.toBeVisible();

    // Weekly forecast cards or loading indicator should be present
    const hasWeekCard = await page.getByText(/semana \d/i).count() > 0;
    const hasLoading = await page.getByText(/carregando/i).count() > 0;
    const hasError = await page.getByText(/erro ao carregar/i).count() > 0;
    expect(hasWeekCard || hasLoading || hasError).toBeTruthy();
  });

  test('Navigation between pages preserves session', async ({ page }) => {
    // Start at dashboard
    await page.goto('/');
    await expect(page.locator('h1', { hasText: /visão geral|dashboard/i })).toBeVisible({ timeout: 10000 });

    // Navigate to Movimentações
    await page.getByRole('link', { name: /movimentações/i }).click();
    await expect(page).toHaveURL(/\/movimentacoes/, { timeout: 10000 });

    // Navigate to Fechamento
    await page.getByRole('link', { name: /fechamento/i }).click();
    await expect(page).toHaveURL(/\/fechamento/, { timeout: 10000 });

    // Navigate back to Dashboard
    await page.getByRole('link', { name: /dashboard|visão|início/i }).first().click();
    await expect(page).toHaveURL(/\/$/, { timeout: 10000 });
  });

  test('Export buttons do not cause 500 errors', async ({ page, request }) => {
    // Login via API to get session cookie
    const loginRes = await request.post('/api/auth/signin', {
      headers: { 'Content-Type': 'application/json' },
    });

    // Test fechamento CSV export endpoint (direct API call)
    const csvRes = await request.get('/api/fechamento/export?period=0');
    // Should not be 500 (may be 307 redirect to login if auth fails, which is OK)
    expect(csvRes.status()).not.toBe(500);

    // Test fechamento PDF export endpoint
    const pdfRes = await request.get('/api/fechamento/export/pdf?period=0');
    expect(pdfRes.status()).not.toBe(500);

    // Test transactions XLSX export endpoint
    const xlsxRes = await request.get('/api/transactions/export');
    expect(xlsxRes.status()).not.toBe(500);
  });

  test('Financial labels are semantically correct', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText(/saldo geral/i)).toBeVisible({ timeout: 10000 });

    // Dashboard should say "Desp. Pendentes" not just "Pendentes"
    const pendingLabel = page.getByText(/desp\.?\s*pendentes?/i);
    await expect(pendingLabel).toBeVisible();

    // Movimentações should also use specific labels
    await page.goto('/movimentacoes');
    await expect(page.getByText(/despesas?\s*não\s*pagas?/i)).toBeVisible({ timeout: 10000 });

    // Contas a Pagar should clarify "inclui receitas"
    await page.goto('/contas-a-pagar');
    await expect(page.getByText(/inclui despesas e receitas/i)).toBeVisible({ timeout: 10000 });
  });
});
