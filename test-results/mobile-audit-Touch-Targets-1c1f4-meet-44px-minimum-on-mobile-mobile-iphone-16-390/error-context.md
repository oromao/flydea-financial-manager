# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: mobile-audit.spec.ts >> Touch Targets - Global Audit >> all buttons meet 44px minimum on mobile
- Location: tests/mobile-audit.spec.ts:357:7

# Error details

```
ReferenceError: window is not defined
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - link "Pular para o conteudo" [ref=e2] [cursor=pointer]:
    - /url: "#main-content"
  - alert [ref=e3]
  - generic [ref=e4]:
    - navigation [ref=e5]:
      - generic [ref=e6]:
        - generic [ref=e7]:
          - img [ref=e9]
          - generic [ref=e12]:
            - heading [level=1] [ref=e13]: FlyDea
            - generic [ref=e14]: Premium
        - button [ref=e15]:
          - img [ref=e16]
      - navigation [ref=e20]:
        - link [ref=e21] [cursor=pointer]:
          - /url: /
          - generic [ref=e22]:
            - img [ref=e23]
            - generic [ref=e28]: Dashboard
        - link [ref=e30] [cursor=pointer]:
          - /url: /movimentacoes
          - generic [ref=e31]:
            - img [ref=e32]
            - generic [ref=e34]: Movimentações
        - link [ref=e35] [cursor=pointer]:
          - /url: /contas
          - generic [ref=e36]:
            - img [ref=e37]
            - generic [ref=e39]: Contas
        - link [ref=e40] [cursor=pointer]:
          - /url: /fluxo-caixa
          - generic [ref=e41]:
            - img [ref=e42]
            - generic [ref=e45]: Fluxo de Caixa
        - link [ref=e46] [cursor=pointer]:
          - /url: /contas-a-pagar
          - generic [ref=e47]:
            - img [ref=e48]
            - generic [ref=e51]: Contas a Pagar
        - link [ref=e52] [cursor=pointer]:
          - /url: /orcamentos
          - generic [ref=e53]:
            - img [ref=e54]
            - generic [ref=e58]: Planejamento
        - link [ref=e59] [cursor=pointer]:
          - /url: /recorrencias
          - generic [ref=e60]:
            - img [ref=e61]
            - generic [ref=e64]: Recorrências
        - link [ref=e65] [cursor=pointer]:
          - /url: /fechamento
          - generic [ref=e66]:
            - img [ref=e67]
            - generic [ref=e69]: Fechamento
        - link [ref=e70] [cursor=pointer]:
          - /url: /relatorios
          - generic [ref=e71]:
            - img [ref=e72]
            - generic [ref=e74]: Relatórios
      - generic [ref=e75]:
        - generic [ref=e76]:
          - generic [ref=e78]: AF
          - generic [ref=e79]:
            - paragraph [ref=e80]: Augusto Flydea
            - link [ref=e81] [cursor=pointer]:
              - /url: /perfil
              - text: Ver perfil
              - img [ref=e82]
        - button [ref=e84]:
          - img [ref=e85]
          - text: Encerrar Sessão
    - banner "Cabeçalho" [ref=e88]:
      - button "Abrir menu" [ref=e89]:
        - img [ref=e90]
      - generic [ref=e91]:
        - img [ref=e93]
        - generic [ref=e96]: FlyDea
      - generic [ref=e97]:
        - button "Alternar tema" [ref=e98]:
          - img
        - button "Abrir menu do usuário" [ref=e99]:
          - generic [ref=e101]: AF
    - main "Conteúdo principal" [ref=e102]
    - navigation "Navegação principal" [ref=e129]:
      - generic [ref=e130]:
        - link "Inicio" [ref=e131] [cursor=pointer]:
          - /url: /
          - img [ref=e134]
          - generic [ref=e139]: Inicio
        - link "Transações" [ref=e140] [cursor=pointer]:
          - /url: /movimentacoes
          - img [ref=e142]
          - generic [ref=e144]: Transações
        - button "Adicionar transação" [ref=e145]:
          - img [ref=e147]
          - generic [ref=e148]: Novo
        - button "Explorar mais módulos" [ref=e149]:
          - img [ref=e151]
          - generic [ref=e155]: Mais
  - generic "Notificações"
```

# Test source

```ts
  265 |       await submitBtn.click();
  266 |       await page.waitForTimeout(2000);
  267 |       // Check for toast success
  268 |       const successToast = page.locator('[role="status"]').filter({ hasText: /sucesso|confirmado|criada/ }).first();
  269 |       const hasToast = await successToast.isVisible({ timeout: 3000 }).catch(() => false);
  270 |       console.log(`Success toast visible: ${hasToast}`);
  271 |     }
  272 | 
  273 |     // Screenshot after submit
  274 |     await takeScreenshot(page, 'modal_submit');
  275 |   });
  276 | 
  277 |   test('all form fields visible without scrolling on 390px', async ({ page }) => {
  278 |     // Only run on iPhone 16 viewport
  279 |     const viewport = page.viewportSize();
  280 |     if (viewport?.width !== 390) {
  281 |       test.skip();
  282 |       return;
  283 |     }
  284 | 
  285 |     await clickNewTransaction(page);
  286 |     await page.waitForTimeout(1000);
  287 | 
  288 |     // Check all fields are reachable (either visible or scrollable to)
  289 |     const fields = [
  290 |       'input[name="description"]',
  291 |       'input[name="amount"]',
  292 |       '[role="combobox"]',
  293 |       'input[type="date"]',
  294 |       'button[type="submit"]',
  295 |     ];
  296 | 
  297 |     for (const field of fields) {
  298 |       const el = page.locator(field).first();
  299 |       await expect(el).toBeAttached({ timeout: 3000 });
  300 |       // Try to scroll to it if not visible
  301 |       await el.scrollIntoViewIfNeeded();
  302 |       await page.waitForTimeout(100);
  303 |       const visible = await el.isVisible();
  304 |       console.log(`Field ${field} visible: ${visible}`);
  305 |       expect(visible).toBe(true);
  306 |     }
  307 |   });
  308 | });
  309 | 
  310 | // ============================================================
  311 | // 4. BUDGET MODAL — Mobile audit
  312 | // ============================================================
  313 | test.describe('Budget Modal - Mobile Audit', () => {
  314 |   test.beforeEach(async ({ page }) => {
  315 |     await page.goto('/login');
  316 |     await page.fill('input[type="email"]', 'augusto@flydea.com');
  317 |     await page.fill('input[type="password"]', 'password123');
  318 |     await page.click('button[type="submit"]');
  319 |     await page.waitForURL('**/');
  320 |     await page.waitForLoadState('networkidle');
  321 |   });
  322 | 
  323 |   test('budget modal opens and has proper scroll behavior', async ({ page }) => {
  324 |     await page.goto('/orcamentos');
  325 |     await page.waitForLoadState('networkidle');
  326 | 
  327 |     await takeScreenshot(page, 'orcamentos_page');
  328 | 
  329 |     // Click Novo Orçamento
  330 |     const newBudgetBtn = page.locator('text=Novo Orçamento').first();
  331 |     if (await newBudgetBtn.isVisible()) {
  332 |       await newBudgetBtn.click();
  333 |       await page.waitForTimeout(1000);
  334 |       await takeScreenshot(page, 'modal_budget');
  335 | 
  336 |       // Check dialog
  337 |       const dialog = page.locator('[role="dialog"]');
  338 |       const visible = await dialog.isVisible();
  339 |       console.log(`Budget dialog visible: ${visible}`);
  340 |     }
  341 |   });
  342 | });
  343 | 
  344 | // ============================================================
  345 | // 5. TOUCH TARGETS — Global audit
  346 | // ============================================================
  347 | test.describe('Touch Targets - Global Audit', () => {
  348 |   test.beforeEach(async ({ page }) => {
  349 |     await page.goto('/login');
  350 |     await page.fill('input[type="email"]', 'augusto@flydea.com');
  351 |     await page.fill('input[type="password"]', 'password123');
  352 |     await page.click('button[type="submit"]');
  353 |     await page.waitForURL('**/');
  354 |     await page.waitForLoadState('networkidle');
  355 |   });
  356 | 
  357 |   test('all buttons meet 44px minimum on mobile', async ({ page }) => {
  358 |     const viewport = page.viewportSize();
  359 |     if (!viewport || viewport.width > 768) {
  360 |       test.skip(); // Only test on mobile viewports
  361 |       return;
  362 |     }
  363 | 
  364 |     // Check all VISIBLE buttons in the viewport (exclude off-screen sidebar drawer)
> 365 |     const viewportW = window.innerWidth;
      |                       ^ ReferenceError: window is not defined
  366 |     const viewportH = window.innerHeight;
  367 |     const smallButtons = await page.evaluate(({ viewportW, viewportH }) => {
  368 |       const results: { tag: string; text: string; size: string; x: number; y: number }[] = [];
  369 |       const buttons = document.querySelectorAll('button, a[href], [role="button"], input[type="submit"], input[type="button"]');
  370 |       buttons.forEach((btn) => {
  371 |         const rect = btn.getBoundingClientRect();
  372 |         // Only check buttons that are actually within the viewport (not off-screen sidebar drawers)
  373 |         const isInViewport = rect.left >= 0 && rect.top >= 0 && rect.left < viewportW && rect.top < viewportH;
  374 |         if (isInViewport && rect.width > 0 && rect.height > 0 && rect.height < 44 && rect.width < 100) {
  375 |           results.push({
  376 |             tag: btn.tagName,
  377 |             text: (btn.textContent || '').trim().slice(0, 40),
  378 |             size: `${Math.round(rect.width)}x${Math.round(rect.height)}`,
  379 |             x: Math.round(rect.x),
  380 |             y: Math.round(rect.y),
  381 |           });
  382 |         }
  383 |       });
  384 |       return results;
  385 |     }, { viewportW, viewportH });
  386 | 
  387 |     if (smallButtons.length > 0) {
  388 |       console.log(`Found ${smallButtons.length} small buttons:`, JSON.stringify(smallButtons.slice(0, 10), null, 2));
  389 |     }
  390 |     // Only fail if there are buttons under 44px that aren't decorative SVGs or small layout elements
  391 |     // Only count buttons that aren't accessibility skip-links or hidden
  392 |     const realButtons = smallButtons.filter(b => 
  393 |       !b.text.includes('Pular para') && 
  394 |       !b.text.includes('Skip') &&
  395 |       !b.text.includes('pular') &&
  396 |       !b.text.includes('conteudo') &&
  397 |       b.size !== '1x1'
  398 |     );
  399 |     console.log(`Real small buttons after filter: ${realButtons.length}`, JSON.stringify(realButtons));
  400 |     expect(realButtons.length).toBe(0);
  401 |   });
  402 | });
  403 | 
  404 | // ============================================================
  405 | // 6. RESPONSIVE LAYOUT — Pages audit
  406 | // ============================================================
  407 | test.describe('Responsive Layout - Pages Audit', () => {
  408 |   test.beforeEach(async ({ page }) => {
  409 |     await page.goto('/login');
  410 |     await page.fill('input[type="email"]', 'augusto@flydea.com');
  411 |     await page.fill('input[type="password"]', 'password123');
  412 |     await page.click('button[type="submit"]');
  413 |     await page.waitForURL('**/');
  414 |     await page.waitForLoadState('networkidle');
  415 |   });
  416 | 
  417 |   const pages = [
  418 |     { name: 'dashboard', url: '/' },
  419 |     { name: 'movimentacoes', url: '/movimentacoes' },
  420 |     { name: 'contas', url: '/contas' },
  421 |     { name: 'orcamentos', url: '/orcamentos' },
  422 |     { name: 'recorrencias', url: '/recorrencias' },
  423 |     { name: 'fluxo-caixa', url: '/fluxo-caixa' },
  424 |     { name: 'fechamento', url: '/fechamento' },
  425 |     { name: 'relatorios', url: '/relatorios' },
  426 |     { name: 'alertas', url: '/alertas' },
  427 |     { name: 'perfil', url: '/perfil' },
  428 |   ];
  429 | 
  430 |   for (const { name, url } of pages) {
  431 |     test(`${name} page has no horizontal overflow on mobile`, async ({ page }) => {
  432 |       await page.goto(url);
  433 |       await page.waitForLoadState('networkidle');
  434 |       await page.waitForTimeout(1000);
  435 | 
  436 |       const overflow = await page.evaluate(() => {
  437 |         return {
  438 |           scrollWidth: document.body.scrollWidth,
  439 |           viewportWidth: window.innerWidth,
  440 |           hasOverflow: document.body.scrollWidth > window.innerWidth,
  441 |           overflowX: getComputedStyle(document.documentElement).overflowX,
  442 |         };
  443 |       });
  444 |       console.log(`${name}: scroll=${overflow.scrollWidth}, viewport=${overflow.viewportWidth}, overflow=${overflow.hasOverflow}`);
  445 | 
  446 |       if (overflow.hasOverflow) {
  447 |         await takeScreenshot(page, `overflow_${name}`);
  448 |       }
  449 |       expect(overflow.hasOverflow).toBe(false);
  450 |     });
  451 |   }
  452 | });
  453 | 
  454 | // ============================================================
  455 | // 7. BOTTOM NAV — Mobile audit
  456 | // ============================================================
  457 | test.describe('Bottom Navigation - Mobile Audit', () => {
  458 |   test.beforeEach(async ({ page }) => {
  459 |     await page.goto('/login');
  460 |     await page.fill('input[type="email"]', 'augusto@flydea.com');
  461 |     await page.fill('input[type="password"]', 'password123');
  462 |     await page.click('button[type="submit"]');
  463 |     await page.waitForURL('**/');
  464 |     await page.waitForLoadState('networkidle');
  465 |   });
```