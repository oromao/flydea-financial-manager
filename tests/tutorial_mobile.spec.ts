import { test, expect } from '@playwright/test';

test.describe('Tutorial Mobile', () => {
  test('Tutorial completo e guiado de uso no mobile', async ({ page }) => {
    const showCaption = async (text: string, waitMs = 2600) => {
      await page.evaluate((message) => {
        const id = '__tutorial_caption__';
        let el = document.getElementById(id);
        if (!el) {
          el = document.createElement('div');
          el.id = id;
          el.setAttribute(
            'style',
            [
              'position:fixed','left:12px','right:12px','bottom:16px','z-index:999999',
              'padding:12px 14px','border-radius:12px',
              'background:linear-gradient(135deg, rgba(11,18,32,0.90), rgba(13,39,70,0.90))',
              'color:#fff','pointer-events:none',
              'font:700 14px/1.5 -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif',
              'box-shadow:0 8px 24px rgba(0,0,0,.35)','border:1px solid rgba(56,189,248,.65)'
            ].join(';')
          );
          document.body.appendChild(el);
        }
        el.textContent = message;
      }, text);
      await page.waitForTimeout(waitMs);
    };

    const emphasize = async (locator: ReturnType<typeof page.locator>, waitMs = 1000) => {
      await locator.first().scrollIntoViewIfNeeded();
      const handle = await locator.first().elementHandle();
      if (!handle) return;
      await page.evaluate((el) => {
        const target = el as HTMLElement;
        target.setAttribute('data-tutorial-old-style', target.getAttribute('style') || '');
        target.style.transition = 'all 180ms ease';
        target.style.outline = '3px solid #22d3ee';
        target.style.outlineOffset = '3px';
        target.style.boxShadow = '0 0 0 6px rgba(34,211,238,0.22)';
        target.style.borderRadius = target.style.borderRadius || '10px';
      }, handle);
      await page.waitForTimeout(waitMs);
      await page.evaluate((el) => {
        const target = el as HTMLElement;
        const prev = target.getAttribute('data-tutorial-old-style');
        if (prev !== null) {
          target.setAttribute('style', prev);
          target.removeAttribute('data-tutorial-old-style');
        }
      }, handle);
    };

    await page.goto('/login');
    await expect(page.getByRole('heading', { name: /Flydea/i })).toBeVisible();
    await showCaption('Bem-vindo. Neste tutorial mobile, vamos percorrer todas as funções principais do sistema.');

    await emphasize(page.locator('input[type="email"]'));
    await page.fill('input[type="email"]', 'augusto@flydea.com');
    await emphasize(page.locator('input[type="password"]'));
    await page.fill('input[type="password"]', 'password123');
    await showCaption('Primeiro fazemos o login.');
    await emphasize(page.locator('button[type="submit"]'));
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/$/);
    await showCaption('Login concluído. Estamos no Dashboard.');

    await expect(page.getByText(/SALDO CONSOLIDADO/i)).toBeVisible();
    await showCaption('Aqui você visualiza saldo consolidado, entradas e saídas.');

    await page.goto('/movimentacoes');
    await expect(page.getByText(/Fluxo de Caixa/i)).toBeVisible();
    await showCaption('Na tela de Movimentações, você acompanha e registra lançamentos.');

    await emphasize(page.getByRole('button', { name: /Exportar Excel/i }));
    const exportMov = page.waitForResponse((res) =>
      res.url().includes('/api/transactions/export') && res.request().method() === 'GET'
    );
    await page.getByRole('button', { name: /Exportar Excel/i }).click();
    await exportMov;
    await showCaption('Este botão exporta suas movimentações para Excel.');

    await emphasize(page.getByRole('button', { name: /NOVO LANÇAMENTO/i }));
    await page.getByRole('button', { name: /NOVO LANÇAMENTO/i }).click();
    await showCaption('Agora vamos criar um novo lançamento.');

    const descricao = `Tutorial Mobile ${Date.now()}`;
    await page.getByPlaceholder('Ex: Assinatura mensal Cloud').fill(descricao);
    await page.locator('input[type="number"]').first().fill('99');
    const createTxResponse = page.waitForResponse((res) =>
      res.url().includes('/api/transactions') && res.request().method() === 'POST'
    );
    await emphasize(page.getByRole('button', { name: /Confirmar Lançamento/i }));
    await page.getByRole('button', { name: /Confirmar Lançamento/i }).click();
    const txRes = await createTxResponse;
    expect(txRes.status()).toBe(200);
    await showCaption('Lançamento criado com sucesso.');

    await page.goto('/contas');
    await expect(page.getByRole('heading', { level: 1, name: /Contas/i })).toBeVisible();
    await showCaption('Aqui em Contas, você pode conectar ou cadastrar suas contas.');

    await emphasize(page.getByRole('button', { name: /NOVA CONTA/i }));
    await page.getByRole('button', { name: /NOVA CONTA/i }).click();
    await page.getByPlaceholder('Ex: Nubank, Carteira Principal').fill(`Conta Tutorial ${Date.now()}`);
    await page.locator('input[type="number"]').first().fill('1000');
    const createAccount = page.waitForResponse((res) =>
      res.url().includes('/api/accounts') && res.request().method() === 'POST'
    );
    await emphasize(page.getByRole('button', { name: /Criar Conta/i }));
    await page.getByRole('button', { name: /Criar Conta/i }).click();
    const accountRes = await createAccount;
    expect(accountRes.ok()).toBeTruthy();
    await showCaption('Conta criada. Esse é o fluxo para conectar/cadastrar uma conta no sistema.');

    await page.goto('/recorrencias');
    await expect(page.getByRole('heading', { level: 1, name: /Recorrências/i })).toBeVisible();
    await showCaption('Agora vamos criar uma recorrência para automatizar lançamentos periódicos.');

    await emphasize(page.getByRole('button', { name: /NOVA RECORRÊNCIA/i }));
    await page.getByRole('button', { name: /NOVA RECORRÊNCIA/i }).click();
    await page.getByPlaceholder('Ex: Aluguel, Netflix, Salários...').fill(`Recorrência Tutorial ${Date.now()}`);
    await page.getByPlaceholder('0,00').fill('59.9');
    const createRec = page.waitForResponse((res) =>
      res.url().includes('/api/recurrences') && res.request().method() === 'POST'
    );
    await emphasize(page.getByRole('button', { name: /Confirmar Agendamento/i }));
    await page.getByRole('button', { name: /Confirmar Agendamento/i }).click();
    const recRes = await createRec;
    expect(recRes.ok()).toBeTruthy();
    await showCaption('Recorrência criada com sucesso.');

    await page.goto('/relatorios');
    await expect(page.getByRole('heading', { level: 1, name: /Relatórios/i })).toBeVisible();
    await showCaption('Em Relatórios, você analisa os indicadores e exporta dados.');

    await emphasize(page.getByRole('button', { name: /Excel \(CSV\)/i }));
    const exportCsv = page.waitForResponse((res) =>
      res.url().includes('/api/transactions/export') && res.request().method() === 'GET'
    );
    await page.getByRole('button', { name: /Excel \(CSV\)/i }).click();
    await exportCsv;
    await showCaption('Aqui você gera o relatório em formato Excel/CSV.');

    await page.goto('/admin/logs');
    await expect(page.getByRole('heading', { level: 1, name: /Logs de Auditoria/i })).toBeVisible();
    await showCaption('Nos logs você acompanha o histórico de ações do sistema.');

    await showCaption('Para sair do sistema, localize o botão Sair no menu lateral e toque nele.', 3000);
    await emphasize(page.getByRole('button', { name: /Sair/i }).first());
    await page.getByRole('button', { name: /Sair/i }).first().click();
    await expect(page).toHaveURL(/\/login/);
    await showCaption('Logout concluído. Você voltou à tela de login.', 3000);
  });
});
