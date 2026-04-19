import { test, expect } from '@playwright/test';

test.describe('RAG Chat System', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button:has-text("Sign In")');
    await page.waitForURL('/');
  });

  test('Insights page should load with chat component', async ({ page }) => {
    await page.goto('/insights');

    // Wait for page to load
    await page.waitForSelector('text=Insights Financeiros');

    // Check header
    expect(await page.isVisible('text=Insights Financeiros')).toBeTruthy();
    expect(await page.isVisible('text=IA analisando seus padrões de gastos')).toBeTruthy();
  });

  test('Chat component should display info cards', async ({ page }) => {
    await page.goto('/insights');

    // Check for info cards
    expect(await page.isVisible('text=Análise com IA')).toBeTruthy();
    expect(await page.isVisible('text=Previsões Precisas')).toBeTruthy();
    expect(await page.isVisible('text=Alertas Inteligentes')).toBeTruthy();
    expect(await page.isVisible('text=Recomendações Personalizadas')).toBeTruthy();
  });

  test('Chat interface should have input field and send button', async ({ page }) => {
    await page.goto('/insights');

    // Check for input field
    const input = page.locator('input[placeholder="Faça uma pergunta sobre suas finanças..."]');
    expect(await input.isVisible()).toBeTruthy();

    // Check for send button
    const sendButton = page.locator('button:has-text("Enviar")');
    expect(await sendButton.isVisible()).toBeTruthy();
  });

  test('Should display initial assistant message', async ({ page }) => {
    await page.goto('/insights');

    // Wait for initial message
    await page.waitForSelector('text=Sou seu assistente financeiro IA');
    expect(await page.isVisible('text=Sou seu assistente financeiro IA')).toBeTruthy();
  });

  test('Should show quick questions when no messages yet', async ({ page }) => {
    await page.goto('/insights');

    // Wait for initial message to load
    await page.waitForSelector('text=Sou seu assistente financeiro IA');

    // Check for quick question buttons
    expect(await page.isVisible('text=Como posso economizar mais?')).toBeTruthy();
    expect(await page.isVisible('text=Qual meu padrão de gastos?')).toBeTruthy();
  });

  test('Should send message and receive response', async ({ page }) => {
    await page.goto('/insights');

    // Wait for initial message
    await page.waitForSelector('text=Sou seu assistente financeiro IA');

    // Type and send message
    const input = page.locator('input[placeholder="Faça uma pergunta sobre suas finanças..."]');
    await input.fill('Como posso economizar mais?');

    // Click send button
    await page.click('button:has-text("Enviar")');

    // Wait for response
    await page.waitForTimeout(2000); // Wait for API response

    // Check that message was sent
    expect(await page.isVisible('text=Como posso economizar mais?')).toBeTruthy();

    // Check that response is visible (should contain "Economia" or similar)
    const messages = await page.locator('text=Economia|Despesa|economizar').all();
    expect(messages.length).toBeGreaterThan(0);
  });

  test('Should disable input while processing', async ({ page }) => {
    await page.goto('/insights');

    await page.waitForSelector('text=Sou seu assistente financeiro IA');

    const input = page.locator('input[placeholder="Faça uma pergunta sobre suas finanças..."]');
    const sendButton = page.locator('button:has-text("Enviar")');

    // Fill and submit
    await input.fill('Teste');
    await sendButton.click();

    // Button should be disabled while processing
    expect(await sendButton.isDisabled()).toBeTruthy();

    // Wait for response
    await page.waitForTimeout(2000);

    // Button should be enabled again
    expect(await sendButton.isDisabled()).toBeFalsy();
  });

  test('Should handle quick question click', async ({ page }) => {
    await page.goto('/insights');

    await page.waitForSelector('text=Sou seu assistente financeiro IA');

    // Click quick question
    await page.click('text=Como posso economizar mais?');

    // Wait for response
    await page.waitForTimeout(2000);

    // Check that question was sent and response received
    expect(await page.isVisible('text=Como posso economizar mais?')).toBeTruthy();
  });

  test('Should append multiple messages to conversation', async ({ page }) => {
    await page.goto('/insights');

    await page.waitForSelector('text=Sou seu assistente financeiro IA');

    const input = page.locator('input[placeholder="Faça uma pergunta sobre suas finanças..."]');
    const sendButton = page.locator('button:has-text("Enviar")');

    // Send first message
    await input.fill('Como economizar?');
    await sendButton.click();
    await page.waitForTimeout(2000);

    // Send second message
    await input.fill('Como aumentar receita?');
    await sendButton.click();
    await page.waitForTimeout(2000);

    // Both questions should be visible
    const messages = await page.locator('[class*="justify-end"]').all();
    expect(messages.length).toBeGreaterThanOrEqual(2);
  });

  test('RAG local-query endpoint should respond to authenticated requests', async ({ page }) => {
    // Get auth token from page
    await page.goto('/insights');

    // Call the API endpoint directly
    const response = await page.request.post('/api/rag/local-query', {
      data: {
        query: 'Como posso economizar?'
      }
    });

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('response');
    expect(data).toHaveProperty('sources');
    expect(data).toHaveProperty('metrics');
    expect(typeof data.response).toBe('string');
    expect(Array.isArray(data.sources)).toBeTruthy();
  });

  test('RAG endpoint should return 401 for unauthenticated requests', async ({ page }) => {
    // Try to call API without auth
    const response = await page.request.post('/api/rag/local-query', {
      data: { query: 'test' }
    });

    expect(response.status()).toBe(401);
  });

  test('Should auto-scroll to latest message', async ({ page }) => {
    await page.goto('/insights');

    await page.waitForSelector('text=Sou seu assistente financeiro IA');

    const input = page.locator('input[placeholder="Faça uma pergunta sobre suas finanças..."]');
    const sendButton = page.locator('button:has-text("Enviar")');

    // Scroll to top
    await page.evaluate(() => window.scrollTo(0, 0));

    // Send message
    await input.fill('Como economizar?');
    await sendButton.click();

    await page.waitForTimeout(2000);

    // Get scroll position
    const scrollPos = await page.evaluate(() => window.scrollY);

    // Should have scrolled down
    expect(scrollPos).toBeGreaterThan(0);
  });

  test('Chat header should display correct title and description', async ({ page }) => {
    await page.goto('/insights');

    await page.waitForSelector('text=Assistente Financeiro IA');

    // Check header content
    expect(await page.isVisible('text=Assistente Financeiro IA')).toBeTruthy();
    expect(await page.isVisible('text=Análise inteligente de seus gastos')).toBeTruthy();
  });
});
