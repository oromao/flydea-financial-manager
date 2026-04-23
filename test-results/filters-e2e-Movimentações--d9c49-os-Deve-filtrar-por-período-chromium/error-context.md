# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: filters-e2e.spec.ts >> Movimentações - Filtros Avançados >> Deve filtrar por período
- Location: tests/filters-e2e.spec.ts:70:7

# Error details

```
Test timeout of 90000ms exceeded while running "beforeEach" hook.
```

```
Error: page.goto: Test timeout of 90000ms exceeded.
Call log:
  - navigating to "http://localhost:3010/movimentacoes", waiting until "load"

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - navigation [ref=e3]:
      - generic [ref=e4]:
        - generic [ref=e5]:
          - img [ref=e7]
          - generic [ref=e10]:
            - heading [level=1] [ref=e11]: FlyDea
            - paragraph [ref=e12]: Sovereign
        - button [ref=e13]:
          - img [ref=e14]
      - navigation [ref=e18]:
        - link [ref=e19] [cursor=pointer]:
          - /url: /
          - generic [ref=e20]:
            - img [ref=e21]
            - generic [ref=e26]: Painel Geral
        - link [ref=e27] [cursor=pointer]:
          - /url: /movimentacoes
          - generic [ref=e28]:
            - img [ref=e29]
            - generic [ref=e31]: Movimentações
        - link [ref=e33] [cursor=pointer]:
          - /url: /contas
          - generic [ref=e34]:
            - img [ref=e35]
            - generic [ref=e37]: Contas e Cartões
        - link [ref=e38] [cursor=pointer]:
          - /url: /fluxo-caixa
          - generic [ref=e39]:
            - img [ref=e40]
            - generic [ref=e43]: Fluxo de Caixa
        - link [ref=e44] [cursor=pointer]:
          - /url: /contas-a-pagar
          - generic [ref=e45]:
            - img [ref=e46]
            - generic [ref=e49]: Contas a Pagar
        - link [ref=e50] [cursor=pointer]:
          - /url: /orcamentos
          - generic [ref=e51]:
            - img [ref=e52]
            - generic [ref=e56]: Planejamento
        - link [ref=e57] [cursor=pointer]:
          - /url: /recorrencias
          - generic [ref=e58]:
            - img [ref=e59]
            - generic [ref=e62]: Recorrências
        - link [ref=e63] [cursor=pointer]:
          - /url: /fechamento
          - generic [ref=e64]:
            - img [ref=e65]
            - generic [ref=e67]: Fechamento
        - link [ref=e68] [cursor=pointer]:
          - /url: /agents
          - generic [ref=e69]:
            - img [ref=e70]
            - generic [ref=e78]: Inteligência IA
        - link [ref=e79] [cursor=pointer]:
          - /url: /relatorios
          - generic [ref=e80]:
            - img [ref=e81]
            - generic [ref=e83]: Análises
      - generic [ref=e84]:
        - generic [ref=e85]:
          - img [ref=e87]
          - generic [ref=e88]:
            - paragraph [ref=e89]: Augusto Auditado
            - link [ref=e90] [cursor=pointer]:
              - /url: /perfil
              - text: Ver perfil
              - img [ref=e91]
        - button [ref=e93]:
          - img [ref=e94]
          - text: Encerrar Sessão
    - banner [ref=e97]:
      - button [ref=e98]:
        - img [ref=e99]
      - generic [ref=e100]:
        - img [ref=e102]
        - generic [ref=e105]: FlyDea
    - main [ref=e106]:
      - generic [ref=e108]:
        - generic [ref=e109]:
          - generic [ref=e110]:
            - img [ref=e112]
            - generic [ref=e115]:
              - heading "Movimentações" [level=1] [ref=e116]
              - paragraph [ref=e117]: Gerencie seu fluxo financeiro real
          - generic [ref=e118]:
            - button "Exportar" [ref=e119]:
              - img
              - text: Exportar
            - button "NOVO" [ref=e120]:
              - img
              - text: NOVO
        - generic [ref=e121]:
          - generic [ref=e122]:
            - paragraph [ref=e123]: Saldo Geral
            - heading "R$ 0,00" [level=2] [ref=e124]
            - generic [ref=e125]:
              - img [ref=e126]
              - generic [ref=e129]: Total Líquido
          - generic [ref=e130]:
            - paragraph [ref=e131]: Receitas
            - heading "R$ 0,00" [level=2] [ref=e132]
          - generic [ref=e133]:
            - paragraph [ref=e134]: Despesas
            - heading "R$ 0,00" [level=2] [ref=e135]
          - generic [ref=e136]:
            - paragraph [ref=e137]: Pendências
            - heading "R$ 0,00" [level=2] [ref=e138]
        - generic [ref=e139]:
          - generic [ref=e140]:
            - generic [ref=e141]:
              - img [ref=e142]
              - textbox "Pesquisar lançamentos..." [ref=e145]
            - generic [ref=e146]:
              - combobox [ref=e147]:
                - generic [ref=e148]:
                  - img
                  - text: TODAS CATEGORIAS
                - img: ▼
              - textbox [ref=e149]: Todos
              - generic [ref=e150]:
                - button "Importar Comprovante" [ref=e151]:
                  - img
                  - text: Importar Comprovante
                - button "IMPORTAR" [ref=e152]:
                  - img
                  - generic [ref=e153]: IMPORTAR
          - generic [ref=e154]:
            - generic [ref=e155]:
              - generic [ref=e156]: Período De
              - textbox [ref=e157]
            - generic [ref=e158]:
              - generic [ref=e159]: Período Até
              - textbox [ref=e160]
            - generic [ref=e161]:
              - button "Todos" [ref=e162]
              - button "Receitas" [ref=e163]
              - button "Despesas" [ref=e164]
            - generic [ref=e165]:
              - button "Todos Status" [ref=e166]
              - button "Pagas" [ref=e167]
              - button "Pendentes" [ref=e168]
        - img [ref=e171]
        - button [ref=e174]:
          - img [ref=e175]
    - navigation [ref=e176]:
      - generic [ref=e177]:
        - link "Início" [ref=e178] [cursor=pointer]:
          - /url: /
          - img [ref=e179]
          - generic [ref=e184]: Início
        - link "Fluxo" [ref=e185] [cursor=pointer]:
          - /url: /movimentacoes
          - img [ref=e186]
          - generic [ref=e188]: Fluxo
        - link "IA" [ref=e190] [cursor=pointer]:
          - /url: /insights
          - img [ref=e191]
          - generic [ref=e203]: IA
        - link "Perfil" [ref=e204] [cursor=pointer]:
          - /url: /perfil
          - img [ref=e205]
          - generic [ref=e208]: Perfil
    - link "Nova transação" [ref=e210] [cursor=pointer]:
      - /url: /movimentacoes?action=new
      - img [ref=e211]
  - button "Copiloto IA" [ref=e212]:
    - img [ref=e214]
    - generic [ref=e223]: Copiloto IA
  - generic "Notificações"
  - button "Open Next.js Dev Tools" [ref=e229] [cursor=pointer]:
    - img [ref=e230]
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
  18 |     await page.waitForURL('**/', { timeout: 30000 });
  19 |     
  20 |     // Navegar para movimentacoes
> 21 |     await page.goto('/movimentacoes');
     |                ^ Error: page.goto: Test timeout of 90000ms exceeded.
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