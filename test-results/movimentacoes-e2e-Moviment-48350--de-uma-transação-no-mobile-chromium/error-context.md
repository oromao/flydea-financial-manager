# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: movimentacoes-e2e.spec.ts >> Movimentações E2E - Mobile-First >> Deve completar o ciclo de vida de uma transação no mobile
- Location: tests/movimentacoes-e2e.spec.ts:9:7

# Error details

```
Test timeout of 90000ms exceeded.
```

```
Error: page.goto: Test timeout of 90000ms exceeded.
Call log:
  - navigating to "http://localhost:3010/movimentacoes", waiting until "load"

```

# Test source

```ts
  1  | import { test, expect, devices } from '@playwright/test';
  2  | 
  3  | test.use({
  4  |   ...devices['iPhone 15 Pro Max'], // Representing iPhone 16
  5  |   browserName: 'chromium',
  6  | });
  7  | 
  8  | test.describe('Movimentações E2E - Mobile-First', () => {
  9  |   test('Deve completar o ciclo de vida de uma transação no mobile', async ({ page }) => {
  10 |     // 1. Login
  11 |     await page.goto('/login');
  12 |     await page.waitForSelector('input#email');
  13 |     await page.type('input#email', 'augusto@flydea.com', { delay: 50 });
  14 |     await page.type('input#password', 'password123', { delay: 50 });
  15 |     
  16 |     await Promise.all([
  17 |       page.waitForNavigation({ waitUntil: 'networkidle' }),
  18 |       page.click('button[type="submit"]')
  19 |     ]);
  20 |     
  21 |     // Abrir /movimentacoes diretamente
> 22 |     await page.goto('/movimentacoes');
     |                ^ Error: page.goto: Test timeout of 90000ms exceeded.
  23 |     await expect(page.getByRole('heading', { name: 'Movimentações' })).toBeVisible({ timeout: 20000 });
  24 | 
  25 |     // 3. Criar uma transação
  26 |     const desc = `E2E Test ${Date.now()}`;
  27 |     // Mobile FAB or Top Button
  28 |     await page.locator('button:has-text("NOVO")').first().click();
  29 |     
  30 |     // Preencher campos
  31 |     await page.fill('input[placeholder="O que você pagou ou recebeu?"]', desc);
  32 |     await page.fill('input[inputmode="numeric"]', '150,00'); 
  33 |     
  34 |     // Abrir select de categoria - O trigger pode ter "Selecione..." ou o nome da categoria padrão
  35 |     const categoryTrigger = page.locator('div').filter({ has: page.locator('label:text("Categoria")') }).locator('button[data-slot="select-trigger"]').first();
  36 |     await categoryTrigger.click();
  37 |     
  38 |     // Selecionar a primeira opção de categoria que aparecer
  39 |     await page.locator('[data-slot="select-item"]').first().click();
  40 | 
  41 |     await page.click('button:has-text("CONFIRMAR LANÇAMENTO")');
  42 | 
  43 |     // 4. Validar renderização no novo TransactionCard
  44 |     // O TransactionCard tem a descrição em um h3
  45 |     const card = page.locator('div.group').filter({ hasText: desc }).first();
  46 |     await expect(card).toBeVisible({ timeout: 15000 });
  47 |     await expect(card).toContainText('R$ 150,00');
  48 | 
  49 |     // 5. Editar a transação
  50 |     // No TransactionCard (pago), o primeiro botão é Editar, o segundo é Excluir
  51 |     await card.locator('button').first().click();
  52 |     
  53 |     // Garantir que o modal abriu
  54 |     await expect(page.getByRole('heading', { name: 'Editar Lançamento' })).toBeVisible({ timeout: 10000 });
  55 |     
  56 |     const newDesc = `${desc} Modificado`;
  57 |     await page.fill('input[placeholder="O que você pagou ou recebeu?"]', newDesc);
  58 |     await page.fill('input[inputmode="numeric"]', '200,00'); // Mudar valor também
  59 |     
  60 |     await page.click('button:has-text("SALVAR ALTERAÇÕES")');
  61 | 
  62 |     // Verificar alteração
  63 |     await expect(page.locator('div.group').filter({ hasText: newDesc }).first()).toBeVisible({ timeout: 15000 });
  64 |     
  65 |     // Esperar o modal fechar - Aumentar timeout pois o PUT está demorando (quase 6s nos logs)
  66 |     await expect(page.getByRole('heading', { name: 'Editar Lançamento' })).not.toBeVisible({ timeout: 15000 });
  67 |     
  68 |     // Validar alteração
  69 |     const cardEdited = page.locator('div.group').filter({ hasText: newDesc });
  70 |     await expect(cardEdited).toBeVisible({ timeout: 10000 });
  71 |     await expect(cardEdited).toContainText('R$ 200,00');
  72 | 
  73 |     // 6. Excluir a transação
  74 |     await cardEdited.locator('button').last().click();
  75 |     
  76 |     // Confirmar no dialog
  77 |     await page.click('button:has-text("Excluir")');
  78 |     
  79 |     await expect(page.locator('div.group').filter({ hasText: newDesc })).not.toBeVisible();
  80 | 
  81 |     // 7. Recarregar a página e confirmar persistência/remoção
  82 |     await page.reload();
  83 |     await expect(page.locator('div.group').filter({ hasText: newDesc })).not.toBeVisible();
  84 | 
  85 |     // 8. Validar ausência de scroll horizontal no viewport iPhone 16
  86 |     const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  87 |     const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
  88 |     expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
  89 |     
  90 |     // Verificar se não há nenhum elemento transbordando
  91 |     const hasOverflow = await page.evaluate(() => {
  92 |       return document.documentElement.scrollWidth > window.innerWidth;
  93 |     });
  94 |     expect(hasOverflow).toBe(false);
  95 |   });
  96 | });
  97 | 
```