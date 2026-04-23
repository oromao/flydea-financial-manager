# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: filters-e2e.spec.ts >> Movimentações - Filtros Avançados >> Deve filtrar por Tipo e Status
- Location: tests/filters-e2e.spec.ts:55:7

# Error details

```
TimeoutError: page.waitForURL: Timeout 30000ms exceeded.
=========================== logs ===========================
waiting for navigation to "**/" until "load"
============================================================
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - button "Open Next.js Dev Tools" [ref=e7] [cursor=pointer]:
    - generic [ref=e10]:
      - text: Rendering
      - generic [ref=e11]:
        - generic [ref=e12]: .
        - generic [ref=e13]: .
        - generic [ref=e14]: .
  - alert [ref=e15]
  - generic [ref=e17]:
    - generic [ref=e18]:
      - img [ref=e20]
      - generic [ref=e23]:
        - heading "Flydea" [level=1] [ref=e24]
        - paragraph [ref=e25]: Seu assistente financeiro pessoal
    - generic [ref=e26]:
      - generic [ref=e27]:
        - generic [ref=e28]:
          - generic [ref=e29]: E-mail
          - textbox "E-mail" [ref=e30]:
            - /placeholder: nome@empresa.com
            - text: augusto@flydea.com
        - generic [ref=e31]:
          - generic [ref=e32]: Senha
          - textbox "Senha" [ref=e33]: password123
        - button "Entrar" [ref=e34]:
          - text: Entrar
          - img
      - generic [ref=e35]:
        - img [ref=e36]
        - generic [ref=e39]: Infraestrutura Segura
    - paragraph [ref=e41]: Copyright © 2026 Flydea • Todos os direitos reservados
  - button "Copiloto IA" [ref=e42]:
    - img [ref=e44]
    - generic [ref=e53]: Copiloto IA
  - generic "Notificações"
```

# Test source

```ts
  1  | import { test, expect, devices } from '@playwright/test';
  2  | 
  3  | test.use({
  4  |   ...devices['iPhone 15 Pro Max'],
  5  |   browserName: 'chromium',
  6  | });
  7  | 
  8  | test.describe('Movimentações - Filtros Avançados', () => {
  9  |   test.beforeEach(async ({ page }) => {
  10 |     // 1. Login
  11 |     await page.goto('/login');
  12 |     await page.waitForSelector('input#email');
  13 |     await page.fill('input#email', 'augusto@flydea.com');
  14 |     await page.fill('input#password', 'password123');
  15 |     await page.click('button[type="submit"]');
  16 |     
  17 |     // Esperar redirecionamento
> 18 |     await page.waitForURL('**/', { timeout: 30000 });
     |                ^ TimeoutError: page.waitForURL: Timeout 30000ms exceeded.
  19 |     
  20 |     // Navegar para movimentacoes
  21 |     await page.goto('/movimentacoes');
  22 |     await expect(page.getByRole('heading', { name: 'Movimentações' })).toBeVisible({ timeout: 20000 });
  23 |   });
  24 | 
  25 |   test('Deve filtrar por descrição e persistir na URL', async ({ page }) => {
  26 |     const uniqueDesc = `SearchTest${Date.now()}`;
  27 |     
  28 |     // Criar transação para o teste
  29 |     await page.locator('button:has-text("NOVO")').first().click();
  30 |     await page.fill('input[placeholder="O que você pagou ou recebeu?"]', uniqueDesc);
  31 |     await page.fill('input[inputmode="numeric"]', '10,50');
  32 |     
  33 |     // Selecionar categoria
  34 |     const categoryTrigger = page.locator('div').filter({ has: page.locator('label:text("Categoria")') }).locator('button[data-slot="select-trigger"]').first();
  35 |     await categoryTrigger.click();
  36 |     await page.locator('[data-slot="select-item"]').first().click();
  37 | 
  38 |     await page.click('button:has-text("CONFIRMAR LANÇAMENTO")');
  39 |     
  40 |     // Esperar processar
  41 |     await expect(page.locator('div.group').filter({ hasText: uniqueDesc }).first()).toBeVisible({ timeout: 15000 });
  42 | 
  43 |     // Buscar
  44 |     await page.fill('input[placeholder="Pesquisar lançamentos..."]', uniqueDesc);
  45 |     
  46 |     // Verificar URL
  47 |     await expect(page).toHaveURL(/search=SearchTest/);
  48 |     
  49 |     // Reload e verificar se continua filtrado
  50 |     await page.reload();
  51 |     await expect(page.locator('input[placeholder="Pesquisar lançamentos..."]')).toHaveValue(uniqueDesc);
  52 |     await expect(page.locator('div.group').filter({ hasText: uniqueDesc }).first()).toBeVisible({ timeout: 15000 });
  53 |   });
  54 | 
  55 |   test('Deve filtrar por Tipo e Status', async ({ page }) => {
  56 |     // Clicar em Receitas
  57 |     await page.click('button:has-text("Receitas")');
  58 |     await expect(page).toHaveURL(/type=INCOME/, { timeout: 10000 });
  59 |     
  60 |     // Clicar em Pagas
  61 |     await page.click('button:has-text("Pagas")');
  62 |     await expect(page).toHaveURL(/paymentStatus=PAID/, { timeout: 10000 });
  63 |     
  64 |     // Limpar
  65 |     await page.click('button:has-text("Limpar")');
  66 |     await expect(page).not.toHaveURL(/type=INCOME/, { timeout: 10000 });
  67 |     await expect(page).not.toHaveURL(/paymentStatus=PAID/, { timeout: 10000 });
  68 |   });
  69 | 
  70 |   test('Deve filtrar por período', async ({ page }) => {
  71 |     const futureDate = '2099-12-31';
  72 |     const dateDeInput = page.locator('input[type="date"]').first();
  73 |     await dateDeInput.fill(futureDate);
  74 |     
  75 |     await expect(page).toHaveURL(/startDate=2099-12-31/, { timeout: 10000 });
  76 |     await expect(page.getByText('Sem resultados').first()).toBeVisible({ timeout: 15000 });
  77 |   });
  78 | });
  79 | 
```