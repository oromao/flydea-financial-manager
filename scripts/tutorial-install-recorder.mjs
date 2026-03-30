/**
 * Tutorial Recorder — Instalação do Flydea PWA no iPhone
 * Usa Playwright com WebKit (Safari engine) para simular iPhone
 * Grava vídeo + screenshots de cada passo
 */
import { webkit, devices } from 'playwright';
import { mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const OUTPUT_DIR = join(process.cwd(), 'tutorial_install_output');
const APP_URL = 'https://flydea-financial-manager.vercel.app';

// iPhone 14 Pro device
const iphone = devices['iPhone 14 Pro'];

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  // Ensure output directory exists
  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log('🚀 Iniciando gravação do tutorial...');

  const browser = await webkit.launch({ headless: true });
  const context = await browser.newContext({
    ...iphone,
    recordVideo: {
      dir: OUTPUT_DIR,
      size: { width: 390, height: 844 }
    },
    locale: 'pt-BR',
  });

  const page = await context.newPage();
  let step = 0;

  async function screenshot(name) {
    step++;
    const filename = `step_${String(step).padStart(2, '0')}_${name}.png`;
    await page.screenshot({ path: join(OUTPUT_DIR, filename), fullPage: false });
    console.log(`📸 Step ${step}: ${name}`);
  }

  // ===== PASSO 1: Abrir Safari e navegar =====
  console.log('\n--- Passo 1: Abrindo o site no Safari ---');
  await page.goto(APP_URL, { waitUntil: 'networkidle', timeout: 30000 });
  await sleep(2000);
  await screenshot('site_carregado');

  // ===== PASSO 2: Mostrar a tela de login =====
  console.log('\n--- Passo 2: Tela de login ---');
  await sleep(1500);
  await screenshot('tela_login');

  // ===== PASSO 3: Scroll para mostrar conteúdo =====
  console.log('\n--- Passo 3: Scroll na página ---');
  await page.evaluate(() => window.scrollBy(0, 200));
  await sleep(1000);
  await screenshot('scroll_down');

  await page.evaluate(() => window.scrollTo(0, 0));
  await sleep(1000);
  await screenshot('scroll_up');

  // ===== PASSO 4: Simular ícone Share (overlay instruction) =====
  console.log('\n--- Passo 4: Instrução - toque no ícone Compartilhar ---');
  await page.evaluate(() => {
    const overlay = document.createElement('div');
    overlay.id = 'tutorial-overlay';
    overlay.style.cssText = `
      position: fixed; bottom: 0; left: 0; right: 0;
      background: rgba(0,0,0,0.85); color: white;
      padding: 20px 16px 40px; z-index: 99999;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      text-align: center; font-size: 15px;
      backdrop-filter: blur(10px);
      border-top: 1px solid rgba(255,255,255,0.15);
    `;

    // Share icon SVG
    overlay.innerHTML = `
      <div style="margin-bottom: 12px;">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
          <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/>
          <polyline points="16 6 12 2 8 6"/>
          <line x1="12" y1="2" x2="12" y2="15"/>
        </svg>
      </div>
      <div style="font-weight: 600; font-size: 17px; margin-bottom: 6px;">
        Toque no ícone de Compartilhar
      </div>
      <div style="color: rgba(255,255,255,0.7); font-size: 13px;">
        Localizado na barra inferior do Safari
      </div>
    `;
    document.body.appendChild(overlay);
  });
  await sleep(500);
  await screenshot('instrucao_compartilhar');
  await sleep(2000);

  // ===== PASSO 5: Simular Share Sheet =====
  console.log('\n--- Passo 5: Menu Compartilhar (Share Sheet) ---');
  await page.evaluate(() => {
    const old = document.getElementById('tutorial-overlay');
    if (old) old.remove();

    const sheet = document.createElement('div');
    sheet.id = 'tutorial-overlay';
    sheet.style.cssText = `
      position: fixed; bottom: 0; left: 0; right: 0; top: 30%;
      background: #f2f2f7; color: #000;
      z-index: 99999;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      border-radius: 14px 14px 0 0;
      overflow: hidden;
      animation: slideUp 0.3s ease-out;
    `;

    sheet.innerHTML = `
      <style>@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }</style>

      <!-- Handle bar -->
      <div style="text-align: center; padding: 8px 0 4px;">
        <div style="width: 36px; height: 5px; background: #c7c7cc; border-radius: 3px; margin: 0 auto;"></div>
      </div>

      <!-- App preview -->
      <div style="background: white; margin: 8px 16px; border-radius: 12px; padding: 14px; display: flex; align-items: center; gap: 12px;">
        <div style="width: 44px; height: 44px; border-radius: 10px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center;">
          <span style="color: white; font-weight: 700; font-size: 18px;">F</span>
        </div>
        <div>
          <div style="font-weight: 600; font-size: 15px;">Flydea Financial Manager</div>
          <div style="font-size: 12px; color: #8e8e93;">flydea-financial-manager.vercel.app</div>
        </div>
      </div>

      <!-- Share row icons -->
      <div style="display: flex; overflow-x: auto; gap: 16px; padding: 16px 20px; -webkit-overflow-scrolling: touch;">
        ${['Mensagens', 'Mail', 'WhatsApp', 'Notas', 'Mais'].map(name => `
          <div style="text-align: center; min-width: 60px;">
            <div style="width: 54px; height: 54px; border-radius: 14px; background: ${
              name === 'Mensagens' ? '#34C759' :
              name === 'Mail' ? '#007AFF' :
              name === 'WhatsApp' ? '#25D366' :
              name === 'Notas' ? '#FFCC00' : '#E5E5EA'
            }; margin: 0 auto 6px; display: flex; align-items: center; justify-content: center;">
              <span style="color: white; font-size: 22px;">${
                name === 'Mensagens' ? '💬' :
                name === 'Mail' ? '✉️' :
                name === 'WhatsApp' ? '📱' :
                name === 'Notas' ? '📝' : '•••'
              }</span>
            </div>
            <span style="font-size: 11px; color: #3c3c43;">${name}</span>
          </div>
        `).join('')}
      </div>

      <!-- Action list -->
      <div style="background: white; margin: 8px 16px; border-radius: 12px; overflow: hidden;">
        ${['Copiar', 'Favorito', 'Adicionar à Lista de Leitura', 'Adicionar à Tela de Início', 'Imprimir'].map((item, i, arr) => `
          <div style="padding: 13px 16px; display: flex; align-items: center; justify-content: space-between;
            ${i < arr.length - 1 ? 'border-bottom: 0.5px solid #c6c6c8;' : ''}
            ${item === 'Adicionar à Tela de Início' ? 'background: rgba(0, 122, 255, 0.08);' : ''}">
            <span style="font-size: 16px; ${item === 'Adicionar à Tela de Início' ? 'font-weight: 600; color: #007AFF;' : ''}">${item}</span>
            <span style="font-size: 20px;">${
              item === 'Copiar' ? '📋' :
              item === 'Favorito' ? '⭐' :
              item === 'Adicionar à Lista de Leitura' ? '📖' :
              item === 'Adicionar à Tela de Início' ? '📲' : '🖨️'
            }</span>
          </div>
        `).join('')}
      </div>
    `;

    document.body.appendChild(sheet);
  });
  await sleep(500);
  await screenshot('share_sheet');
  await sleep(2500);

  // ===== PASSO 6: Highlight "Adicionar à Tela de Início" =====
  console.log('\n--- Passo 6: Destacar "Adicionar à Tela de Início" ---');
  await page.evaluate(() => {
    // Add a pulsing arrow pointing to the option
    const arrow = document.createElement('div');
    arrow.style.cssText = `
      position: fixed; z-index: 999999;
      right: 20px; bottom: 215px;
      animation: pulse 1s ease-in-out infinite alternate;
    `;
    arrow.innerHTML = `
      <style>@keyframes pulse { from { transform: scale(1); opacity: 0.8; } to { transform: scale(1.15); opacity: 1; } }</style>
      <div style="background: #FF3B30; color: white; padding: 8px 14px; border-radius: 20px; font-weight: 600; font-size: 14px; font-family: -apple-system, sans-serif; box-shadow: 0 4px 12px rgba(255,59,48,0.4);">
        👆 Toque aqui!
      </div>
    `;
    document.body.appendChild(arrow);
  });
  await sleep(500);
  await screenshot('highlight_adicionar');
  await sleep(2000);

  // ===== PASSO 7: Tela "Adicionar à Tela de Início" =====
  console.log('\n--- Passo 7: Tela de confirmação ---');
  await page.evaluate(() => {
    // Remove previous overlays
    document.querySelectorAll('#tutorial-overlay, [style*="z-index: 999999"]').forEach(el => el.remove());

    const confirm = document.createElement('div');
    confirm.id = 'tutorial-overlay';
    confirm.style.cssText = `
      position: fixed; inset: 0;
      background: #f2f2f7; color: #000;
      z-index: 99999;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      animation: fadeIn 0.25s ease;
    `;

    confirm.innerHTML = `
      <style>@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }</style>

      <!-- Navigation bar -->
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px; background: #f8f8f8; border-bottom: 0.5px solid #c6c6c8;">
        <span style="font-size: 17px; color: #007AFF; font-weight: 400;">Cancelar</span>
        <span style="font-size: 17px; font-weight: 600;">Tela de Início</span>
        <span style="font-size: 17px; color: #007AFF; font-weight: 600;">Adicionar</span>
      </div>

      <!-- Preview -->
      <div style="padding: 40px 20px; text-align: center;">
        <!-- App Icon -->
        <div style="width: 64px; height: 64px; border-radius: 16px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); margin: 0 auto 16px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
          <span style="color: white; font-weight: 700; font-size: 28px;">F</span>
        </div>

        <!-- Name input -->
        <div style="background: white; border-radius: 12px; padding: 14px 16px; margin: 0 20px; text-align: left;">
          <div style="font-size: 12px; color: #8e8e93; margin-bottom: 4px;">Nome</div>
          <div style="font-size: 17px; font-weight: 500; color: #000;">Flydea</div>
        </div>

        <div style="margin-top: 20px; padding: 0 20px;">
          <div style="background: white; border-radius: 12px; padding: 14px 16px; text-align: left;">
            <div style="font-size: 12px; color: #8e8e93; margin-bottom: 4px;">URL</div>
            <div style="font-size: 14px; color: #3c3c43;">flydea-financial-manager.vercel.app</div>
          </div>
        </div>
      </div>

      <!-- Arrow pointing to Adicionar -->
      <div style="position: absolute; top: 10px; right: 10px; z-index: 100000;">
        <div style="background: #FF3B30; color: white; padding: 8px 14px; border-radius: 20px; font-weight: 600; font-size: 14px; box-shadow: 0 4px 12px rgba(255,59,48,0.4); animation: pulse 1s ease-in-out infinite alternate;">
          👆 Toque em "Adicionar"
        </div>
      </div>

      <div style="background: white; margin: 40px 40px 0; border-radius: 12px; padding: 20px; text-align: center;">
        <div style="font-size: 14px; color: #8e8e93; line-height: 1.6;">
          O ícone do site será adicionado à sua Tela de Início para que você possa acessá-lo rapidamente.
        </div>
      </div>
    `;

    document.body.appendChild(confirm);
  });
  await sleep(500);
  await screenshot('tela_confirmacao');
  await sleep(2500);

  // ===== PASSO 8: Tela de sucesso =====
  console.log('\n--- Passo 8: Ícone adicionado com sucesso ---');
  await page.evaluate(() => {
    document.querySelectorAll('#tutorial-overlay').forEach(el => el.remove());

    const success = document.createElement('div');
    success.id = 'tutorial-overlay';
    success.style.cssText = `
      position: fixed; inset: 0;
      background: linear-gradient(180deg, #1c1c1e 0%, #000000 100%);
      z-index: 99999;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      animation: fadeIn 0.3s ease;
    `;

    success.innerHTML = `
      <!-- iOS Home Screen simulation -->
      <div style="color: white; text-align: center; margin-bottom: 40px;">
        <div style="font-size: 56px; font-weight: 200; letter-spacing: -2px;">18:05</div>
        <div style="font-size: 15px; color: rgba(255,255,255,0.7); margin-top: 2px;">domingo, 30 de março</div>
      </div>

      <!-- App grid simulation -->
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px 16px; padding: 0 30px; width: 100%;">
        ${[
          { name: 'Safari', color: '#007AFF', icon: '🧭' },
          { name: 'Fotos', color: '#FF9500', icon: '🖼️' },
          { name: 'Câmera', color: '#5856D6', icon: '📷' },
          { name: 'Ajustes', color: '#8E8E93', icon: '⚙️' },
          { name: 'WhatsApp', color: '#25D366', icon: '💬' },
          { name: 'Instagram', color: '#E1306C', icon: '📸' },
          { name: 'Flydea', color: '', icon: '', special: true },
          { name: 'Banco', color: '#FF3B30', icon: '🏦' },
        ].map(app => `
          <div style="text-align: center;">
            <div style="width: 60px; height: 60px; border-radius: 14px;
              ${app.special
                ? 'background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); box-shadow: 0 0 20px rgba(102, 126, 234, 0.6), 0 4px 12px rgba(0,0,0,0.3);'
                : `background: ${app.color};`}
              margin: 0 auto 6px; display: flex; align-items: center; justify-content: center;
              transition: transform 0.3s;">
              ${app.special
                ? '<span style="color: white; font-weight: 700; font-size: 24px;">F</span>'
                : `<span style="font-size: 28px;">${app.icon}</span>`}
            </div>
            <span style="font-size: 11px; color: white; ${app.special ? 'font-weight: 600;' : ''}">${app.name}</span>
          </div>
        `).join('')}
      </div>

      <!-- Success badge -->
      <div style="margin-top: 50px; text-align: center; animation: bounceIn 0.5s ease;">
        <div style="background: rgba(52, 199, 89, 0.2); border: 1px solid rgba(52, 199, 89, 0.4); border-radius: 20px; padding: 12px 24px; display: inline-flex; align-items: center; gap: 8px;">
          <span style="font-size: 20px;">✅</span>
          <span style="color: #34C759; font-weight: 600; font-size: 15px;">Instalado com sucesso!</span>
        </div>
      </div>

      <style>@keyframes bounceIn { 0% { transform: scale(0.5); opacity: 0; } 60% { transform: scale(1.1); } 100% { transform: scale(1); opacity: 1; } }</style>
    `;

    document.body.appendChild(success);
  });
  await sleep(500);
  await screenshot('home_screen_sucesso');
  await sleep(2500);

  // ===== PASSO 9: App aberto em tela cheia (standalone) =====
  console.log('\n--- Passo 9: App aberto em modo standalone ---');
  await page.evaluate(() => {
    document.querySelectorAll('#tutorial-overlay').forEach(el => el.remove());
  });
  await page.goto(APP_URL, { waitUntil: 'networkidle', timeout: 30000 });
  await sleep(2000);

  // Add standalone mode indicator
  await page.evaluate(() => {
    const badge = document.createElement('div');
    badge.style.cssText = `
      position: fixed; top: 60px; left: 50%; transform: translateX(-50%);
      z-index: 99999;
      background: rgba(0, 122, 255, 0.15); border: 1px solid rgba(0, 122, 255, 0.3);
      border-radius: 20px; padding: 8px 16px;
      font-family: -apple-system, sans-serif;
      display: flex; align-items: center; gap: 6px;
      animation: fadeIn 0.5s ease;
    `;
    badge.innerHTML = `
      <style>@keyframes fadeIn { from { opacity: 0; transform: translateX(-50%) translateY(-10px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }</style>
      <span style="font-size: 14px;">📱</span>
      <span style="font-size: 13px; color: #007AFF; font-weight: 500;">Modo tela cheia — sem barra do Safari!</span>
    `;
    document.body.appendChild(badge);
  });
  await sleep(500);
  await screenshot('app_standalone');
  await sleep(2000);

  // ===== PASSO 10: Tela final com resumo =====
  console.log('\n--- Passo 10: Resumo final ---');
  await page.evaluate(() => {
    // Remove previous badge
    document.querySelectorAll('[style*="z-index: 99999"]').forEach(el => el.remove());

    const final_overlay = document.createElement('div');
    final_overlay.style.cssText = `
      position: fixed; inset: 0;
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.95) 0%, rgba(118, 75, 162, 0.95) 100%);
      z-index: 99999;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      text-align: center;
      padding: 40px 24px;
    `;

    final_overlay.innerHTML = `
      <div style="font-size: 60px; margin-bottom: 24px;">🎉</div>
      <h1 style="color: white; font-size: 28px; font-weight: 700; margin: 0 0 12px;">
        Pronto!
      </h1>
      <p style="color: rgba(255,255,255,0.85); font-size: 17px; line-height: 1.6; max-width: 300px; margin: 0 0 40px;">
        Seu Flydea está instalado como app no iPhone. Acesse direto da tela inicial!
      </p>

      <div style="background: rgba(255,255,255,0.15); border-radius: 16px; padding: 24px 20px; width: 100%; max-width: 300px; backdrop-filter: blur(10px);">
        <h3 style="color: white; font-size: 16px; margin: 0 0 16px; font-weight: 600;">Resumo dos passos:</h3>
        ${['Abrir no Safari', 'Tocar em Compartilhar', 'Adicionar à Tela de Início', 'Confirmar com "Adicionar"', 'Abrir o app! 🚀'].map((step, i) => `
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: ${i < 4 ? '12px' : '0'}; text-align: left;">
            <div style="width: 28px; height: 28px; border-radius: 50%; background: rgba(52, 199, 89, 0.25); border: 1.5px solid #34C759; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
              <span style="color: #34C759; font-size: 14px; font-weight: 700;">✓</span>
            </div>
            <span style="color: white; font-size: 15px;">${step}</span>
          </div>
        `).join('')}
      </div>
    `;

    document.body.appendChild(final_overlay);
  });
  await sleep(500);
  await screenshot('tela_final_resumo');
  await sleep(3000);

  // Close and save video
  console.log('\n🎬 Finalizando gravação...');
  await page.close();
  await context.close();
  await browser.close();

  console.log(`\n✅ Tutorial completo! Arquivos salvos em: ${OUTPUT_DIR}`);
  console.log('📁 Conteúdo:');
  console.log('   - Screenshots de cada passo (step_XX_*.png)');
  console.log('   - Vídeo gravado (.webm)');
}

main().catch(err => {
  console.error('❌ Erro:', err.message);
  process.exit(1);
});
