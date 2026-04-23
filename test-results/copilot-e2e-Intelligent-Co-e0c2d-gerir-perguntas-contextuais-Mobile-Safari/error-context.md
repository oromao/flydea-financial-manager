# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: copilot-e2e.spec.ts >> Intelligent Copilot E2E >> Deve sugerir perguntas contextuais
- Location: tests/copilot-e2e.spec.ts:43:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('Sugestões:')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText('Sugestões:')

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e3]:
    - generic [ref=e4]:
      - img [ref=e6]
      - generic [ref=e9]:
        - heading "Flydea" [level=1] [ref=e10]
        - paragraph [ref=e11]: Seu assistente financeiro pessoal
    - generic [ref=e12]:
      - generic [ref=e13]:
        - generic [ref=e14]:
          - text: E-mail
          - textbox "E-mail" [ref=e15]:
            - /placeholder: nome@empresa.com
        - generic [ref=e16]:
          - text: Senha
          - textbox "Senha" [ref=e17]
        - button "Entrar" [ref=e18]:
          - text: Entrar
          - img [ref=e19]
      - generic [ref=e21]:
        - img [ref=e22]
        - text: Infraestrutura Segura
    - paragraph [ref=e26]: Copyright © 2026 Flydea • Todos os direitos reservados
  - button "Copiloto IA" [active] [ref=e27]:
    - img [ref=e29]
    - text: Copiloto IA
  - generic "Notificações"
```

# Test source

```ts
  1  | import { test, expect, devices } from '@playwright/test';
  2  | 
  3  | test.use({
  4  |   ...devices['iPhone 16'],
  5  |   browserName: 'webkit',
  6  | });
  7  | 
  8  | test.describe('Intelligent Copilot E2E', () => {
  9  |   test.beforeEach(async ({ page }) => {
  10 |     // Basic setup - assuming dev mode or mock auth session
  11 |     await page.goto('/login');
  12 |     // ... auth logic if needed ...
  13 |     await page.goto('/dashboard');
  14 |   });
  15 | 
  16 |   test('Deve abrir o copiloto e enviar uma pergunta', async ({ page }) => {
  17 |     // 1. Verificar se o botão flutuante existe
  18 |     const copilotBtn = page.getByText('Copiloto IA');
  19 |     await expect(copilotBtn).toBeVisible();
  20 | 
  21 |     // 2. Abrir o chat
  22 |     await copilotBtn.click();
  23 |     await expect(page.getByText('Sou seu copiloto financeiro inteligente')).toBeVisible();
  24 | 
  25 |     // 3. Enviar pergunta
  26 |     const input = page.getByPlaceholder('Pergunte sobre suas finanças...');
  27 |     await input.fill('Qual é meu saldo?');
  28 |     await page.keyboard.press('Enter');
  29 | 
  30 |     // 4. Aguardar resposta da IA
  31 |     // Como estamos em E2E, o PicoClaw real vai rodar.
  32 |     // O saldo deve aparecer na resposta formatado.
  33 |     await expect(page.getByText(/saldo|R\$/i).last()).toBeVisible({ timeout: 15000 });
  34 |     
  35 |     // 5. Testar feedback
  36 |     const helpfulBtn = page.getByTitle('Útil').first();
  37 |     if (await helpfulBtn.isVisible()) {
  38 |       await helpfulBtn.click();
  39 |       await expect(page.getByText('Obrigado pelo feedback!')).toBeVisible();
  40 |     }
  41 |   });
  42 | 
  43 |   test('Deve sugerir perguntas contextuais', async ({ page }) => {
  44 |     await page.getByText('Copiloto IA').click();
  45 |     
  46 |     // Verificar sugestões iniciais
> 47 |     await expect(page.getByText('Sugestões:')).toBeVisible();
     |                                                ^ Error: expect(locator).toBeVisible() failed
  48 |     const suggestion = page.getByRole('button', { name: 'Qual é minha situação financeira atual?' });
  49 |     await expect(suggestion).toBeVisible();
  50 |     
  51 |     // Clicar na sugestão
  52 |     await suggestion.click();
  53 |     
  54 |     // Verificar se preencheu o input
  55 |     const input = page.getByPlaceholder('Pergunte sobre suas finanças...');
  56 |     await expect(input).toHaveValue('Qual é minha situação financeira atual?');
  57 |   });
  58 | });
  59 | 
```