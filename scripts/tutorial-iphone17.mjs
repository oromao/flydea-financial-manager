/**
 * Tutorial Recorder — Flydea PWA Install
 * iPhone 17 Pro Max (430x932) | Sem legendas | Com animações de toque
 */
import { webkit } from 'playwright';
import { readFileSync, mkdirSync, existsSync, writeFileSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

const CWD = process.cwd();
const OUT  = join(CWD, 'tutorial_v2_output');
const APP_URL = 'https://flydea-financial-manager.vercel.app';

// iPhone 17 Pro Max
const W = 430;
const H = 932;
const FPS = 15;
const TOTAL_SEC = 72;

if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });
const FRAMES = join(OUT, 'frames');
if (!existsSync(FRAMES)) mkdirSync(FRAMES, { recursive: true });

/* ── helpers ─────────────────────────────────────────────── */
const sleep = ms => new Promise(r => setTimeout(r, ms));

/** Render a ripple/tap at (x,y) in page coords */
async function tapEffect(page, x, y, label = '') {
  await page.evaluate(({ x, y, label }) => {
    // ripple
    const ripple = document.createElement('div');
    ripple.style.cssText = `
      position:fixed;left:${x - 40}px;top:${y - 40}px;
      width:80px;height:80px;border-radius:50%;
      background:rgba(0,122,255,0.35);
      border:3px solid #007AFF;
      z-index:999999;pointer-events:none;
      animation:tapRipple 0.8s ease-out forwards;
    `;
    // inner dot
    const dot = document.createElement('div');
    dot.style.cssText = `
      position:fixed;left:${x - 12}px;top:${y - 12}px;
      width:24px;height:24px;border-radius:50%;
      background:rgba(0,122,255,0.8);
      z-index:999999;pointer-events:none;
      animation:tapDot 0.6s ease-out forwards;
    `;

    const style = document.createElement('style');
    style.textContent = `
      @keyframes tapRipple {
        0%  { transform:scale(0.3);opacity:1; }
        100%{ transform:scale(1.8);opacity:0; }
      }
      @keyframes tapDot {
        0%  { transform:scale(1);opacity:1; }
        100%{ transform:scale(0);opacity:0; }
      }
      @keyframes labelFade {
        0%  { opacity:0;transform:translateY(4px); }
        20% { opacity:1;transform:translateY(0); }
        80% { opacity:1; }
        100%{ opacity:0; }
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(ripple);
    document.body.appendChild(dot);

    if (label) {
      const lbl = document.createElement('div');
      lbl.textContent = label;
      lbl.style.cssText = `
        position:fixed;left:${x - 80}px;top:${y + 44}px;
        width:160px;text-align:center;
        background:rgba(0,0,0,0.75);color:white;
        font-family:-apple-system,sans-serif;font-size:13px;font-weight:600;
        padding:5px 10px;border-radius:10px;
        z-index:999999;pointer-events:none;
        animation:labelFade 1.4s ease forwards;
      `;
      document.body.appendChild(lbl);
      setTimeout(() => lbl.remove(), 1500);
    }
    setTimeout(() => { ripple.remove(); dot.remove(); style.remove(); }, 900);
  }, { x, y, label });
}

/** Arrow badge pointing to element */
async function arrowBadge(page, x, y, text, dir = 'up') {
  await page.evaluate(({ x, y, text, dir }) => {
    const old = document.querySelectorAll('.arrow-badge');
    old.forEach(el => el.remove());

    const badge = document.createElement('div');
    badge.className = 'arrow-badge';
    const offY = dir === 'up' ? -70 : 24;
    badge.style.cssText = `
      position:fixed;
      left:${x - 90}px;top:${y + offY}px;
      width:180px;text-align:center;
      background:rgba(255,59,48,0.9);color:white;
      font-family:-apple-system,sans-serif;font-size:14px;font-weight:700;
      padding:9px 14px;border-radius:20px;
      z-index:999998;pointer-events:none;
      box-shadow:0 4px 16px rgba(255,59,48,0.5);
      animation:badgePulse 1.2s ease-in-out infinite alternate;
    `;
    badge.innerHTML = (dir === 'up' ? '👇 ' : '👆 ') + text;

    const style = document.createElement('style');
    style.className = 'arrow-style';
    style.textContent = `
      @keyframes badgePulse {
        from { transform:scale(0.97);box-shadow:0 4px 16px rgba(255,59,48,0.4); }
        to   { transform:scale(1.03);box-shadow:0 6px 24px rgba(255,59,48,0.7); }
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(badge);
  }, { x, y, text, dir });
}

/** Remove all badges/arrows */
async function clearUI(page) {
  await page.evaluate(() => {
    document.querySelectorAll('.arrow-badge,.arrow-style').forEach(e => e.remove());
  });
}

/* ── iOS Chrome overlay (status bar + notch) ────────────── */
async function addIosChrome(page) {
  await page.evaluate(({ W, H }) => {
    const old = document.getElementById('ios-chrome');
    if (old) old.remove();

    const chrome = document.createElement('div');
    chrome.id = 'ios-chrome';
    chrome.style.cssText = `
      position:fixed;inset:0;pointer-events:none;z-index:99998;
    `;
    chrome.innerHTML = `
      <!-- Dynamic Island -->
      <div style="
        position:absolute;top:14px;left:50%;transform:translateX(-50%);
        width:126px;height:37px;background:#000;border-radius:20px;
        z-index:99999;
      "></div>
      <!-- Status bar time -->
      <div style="
        position:absolute;top:18px;left:24px;
        font-family:-apple-system,sans-serif;font-size:16px;font-weight:600;
        color:#000;z-index:99999;
      ">18:30</div>
      <!-- Battery / signal -->
      <div style="
        position:absolute;top:18px;right:20px;
        font-family:-apple-system,sans-serif;font-size:13px;font-weight:500;
        color:#000;z-index:99999;display:flex;gap:6px;align-items:center;
      ">
        <span>📶</span><span>🔋</span>
      </div>
    `;
    document.body.appendChild(chrome);
  }, { W, H });
}

/* ── iOS Share Sheet overlay ────────────────────────────── */
async function showShareSheet(page) {
  await page.evaluate(() => {
    const old = document.getElementById('share-overlay');
    if (old) old.remove();

    const sheet = document.createElement('div');
    sheet.id = 'share-overlay';
    sheet.style.cssText = `
      position:fixed;bottom:0;left:0;right:0;top:38%;
      background:#f2f2f7;border-radius:20px 20px 0 0;
      z-index:99990;font-family:-apple-system,BlinkMacSystemFont,sans-serif;
      box-shadow:0 -4px 32px rgba(0,0,0,0.18);
      animation:slideUpSheet 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards;
    `;
    sheet.innerHTML = `
      <style>
        @keyframes slideUpSheet{from{transform:translateY(100%)}to{transform:translateY(0)}}
      </style>
      <!-- handle -->
      <div style="text-align:center;padding:10px 0 6px;">
        <div style="width:40px;height:5px;background:#c7c7cc;border-radius:3px;margin:0 auto;"></div>
      </div>
      <!-- app preview -->
      <div style="background:white;margin:8px 16px;border-radius:14px;padding:16px;display:flex;align-items:center;gap:14px;">
        <div style="width:52px;height:52px;border-radius:12px;background:linear-gradient(135deg,#667eea,#764ba2);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
          <span style="color:white;font-weight:800;font-size:22px;">F</span>
        </div>
        <div>
          <div style="font-weight:700;font-size:16px;color:#000;">Flydea Financial Manager</div>
          <div style="font-size:12px;color:#8e8e93;margin-top:2px;">flydea-financial-manager.vercel.app</div>
        </div>
      </div>
      <!-- share icons -->
      <div style="display:flex;gap:18px;padding:14px 22px;overflow-x:auto;">
        ${[
          {n:'Mensagens',c:'#34C759',e:'💬'},
          {n:'Mail',c:'#007AFF',e:'✉️'},
          {n:'WhatsApp',c:'#25D366',e:'📱'},
          {n:'Notas',c:'#FFCC00',e:'📝'},
          {n:'Mais',c:'#E5E5EA',e:'···'},
        ].map(a=>`
          <div style="text-align:center;min-width:58px;">
            <div style="width:56px;height:56px;border-radius:14px;background:${a.c};margin:0 auto 6px;display:flex;align-items:center;justify-content:center;">
              <span style="font-size:26px;">${a.e}</span>
            </div>
            <span style="font-size:11px;color:#3c3c43;">${a.n}</span>
          </div>
        `).join('')}
      </div>
      <!-- action list -->
      <div style="background:white;margin:6px 16px;border-radius:14px;overflow:hidden;font-size:17px;">
        ${[
          {l:'Copiar',e:'📋'},
          {l:'Favorito',e:'⭐'},
          {l:'Adicionar à Lista de Leitura',e:'📖'},
          {l:'Adicionar à Tela de Início',e:'📲',highlight:true},
          {l:'Imprimir',e:'🖨️'},
        ].map((item,i,arr)=>`
          <div style="
            padding:15px 18px;display:flex;align-items:center;justify-content:space-between;
            ${i<arr.length-1?'border-bottom:0.5px solid #c6c6c8;':''}
            ${item.highlight?'background:rgba(0,122,255,0.06);':''}
          ">
            <span style="${item.highlight?'font-weight:700;color:#007AFF;font-size:18px;':'color:#000;'}">${item.l}</span>
            <span style="font-size:22px;">${item.e}</span>
          </div>
        `).join('')}
      </div>
    `;
    document.body.appendChild(sheet);
  });
}

async function hideShareSheet(page) {
  await page.evaluate(() => {
    const el = document.getElementById('share-overlay');
    if (el) el.remove();
  });
}

/* ── Confirmation screen ────────────────────────────────── */
async function showAddToHome(page) {
  await page.evaluate(() => {
    const old = document.getElementById('add-to-home');
    if (old) old.remove();

    const modal = document.createElement('div');
    modal.id = 'add-to-home';
    modal.style.cssText = `
      position:fixed;inset:0;background:#f2f2f7;
      z-index:99995;font-family:-apple-system,BlinkMacSystemFont,sans-serif;
      animation:fadeSlide 0.3s ease forwards;
    `;
    modal.innerHTML = `
      <style>@keyframes fadeSlide{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}</style>
      <!-- nav -->
      <div style="display:flex;justify-content:space-between;align-items:center;padding:18px 20px 14px;border-bottom:0.5px solid #c6c6c8;background:#f8f8f8;">
        <span style="font-size:17px;color:#007AFF;">Cancelar</span>
        <span style="font-size:17px;font-weight:700;">Tela de Início</span>
        <span id="btn-adicionar" style="font-size:17px;color:#007AFF;font-weight:700;">Adicionar</span>
      </div>
      <!-- icon preview -->
      <div style="padding:48px 24px 24px;text-align:center;">
        <div style="width:76px;height:76px;border-radius:18px;background:linear-gradient(135deg,#667eea,#764ba2);margin:0 auto 20px;display:flex;align-items:center;justify-content:center;box-shadow:0 6px 20px rgba(118,75,162,0.4);">
          <span style="color:white;font-weight:800;font-size:32px;">F</span>
        </div>
        <div style="background:white;border-radius:14px;padding:16px 18px;margin:0 8px 16px;text-align:left;">
          <div style="font-size:12px;color:#8e8e93;margin-bottom:4px;letter-spacing:0.3px;">NOME</div>
          <div style="font-size:18px;font-weight:600;color:#000;">Flydea</div>
        </div>
        <div style="background:white;border-radius:14px;padding:16px 18px;margin:0 8px;text-align:left;">
          <div style="font-size:12px;color:#8e8e93;margin-bottom:4px;letter-spacing:0.3px;">URL</div>
          <div style="font-size:14px;color:#3c3c43;">flydea-financial-manager.vercel.app</div>
        </div>
        <div style="margin-top:24px;font-size:13px;color:#8e8e93;line-height:1.6;padding:0 20px;">
          O ícone do site será adicionado à sua Tela de Início para que você possa acessá-lo rapidamente.
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  });
}

/* ── Home screen ────────────────────────────────────────── */
async function showHomeScreen(page) {
  await page.evaluate(() => {
    const old = document.getElementById('home-screen');
    if (old) old.remove();

    const home = document.createElement('div');
    home.id = 'home-screen';
    home.style.cssText = `
      position:fixed;inset:0;
      background:linear-gradient(180deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%);
      z-index:99995;font-family:-apple-system,BlinkMacSystemFont,sans-serif;
      animation:fadeIn 0.4s ease;
    `;
    home.innerHTML = `
      <style>
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes flydeaPop{0%{transform:scale(0.5);opacity:0}60%{transform:scale(1.15)}100%{transform:scale(1);opacity:1}}
        @keyframes successBounce{0%{transform:scale(0);opacity:0}60%{transform:scale(1.1)}100%{transform:scale(1);opacity:1}}
      </style>
      <!-- Dynamic Island -->
      <div style="position:absolute;top:14px;left:50%;transform:translateX(-50%);width:126px;height:37px;background:#000;border-radius:20px;z-index:2;"></div>
      <!-- time -->
      <div style="position:absolute;top:68px;left:0;right:0;text-align:center;">
        <div style="font-size:68px;font-weight:200;color:white;letter-spacing:-3px;">18:30</div>
        <div style="font-size:16px;color:rgba(255,255,255,0.75);margin-top:4px;">domingo, 30 de março</div>
      </div>
      <!-- app grid -->
      <div style="position:absolute;top:240px;left:0;right:0;padding:0 24px;display:grid;grid-template-columns:repeat(4,1fr);gap:26px 12px;">
        ${[
          {n:'Safari',  c:'#007AFF',e:'🧭'},
          {n:'Fotos',   c:'#FF9500',e:'🖼️'},
          {n:'WhatsApp',c:'#25D366',e:'💬'},
          {n:'Instagram',c:'#E1306C',e:'📸'},
          {n:'Spotify', c:'#1DB954',e:'🎵'},
          {n:'Maps',    c:'#34C759',e:'🗺️'},
          {n:'Flydea',  c:'',e:'',special:true},
          {n:'Banco',   c:'#FF3B30',e:'🏦'},
        ].map(app=>`
          <div style="text-align:center;">
            <div style="
              width:64px;height:64px;border-radius:16px;margin:0 auto 8px;
              display:flex;align-items:center;justify-content:center;
              ${app.special
                ? 'background:linear-gradient(135deg,#667eea,#764ba2);box-shadow:0 0 0 3px rgba(255,255,255,0.4),0 0 28px rgba(102,126,234,0.8);animation:flydeaPop 0.6s 0.3s both;'
                : `background:${app.c};`}
            ">
              ${app.special
                ? '<span style="color:white;font-weight:800;font-size:28px;">F</span>'
                : `<span style="font-size:30px;">${app.e}</span>`}
            </div>
            <span style="font-size:12px;color:rgba(255,255,255,0.9);${app.special?'font-weight:700;':'font-weight:400;'}">${app.n}</span>
          </div>
        `).join('')}
      </div>
      <!-- success badge -->
      <div style="position:absolute;bottom:100px;left:0;right:0;text-align:center;animation:successBounce 0.5s 0.6s both;">
        <div style="display:inline-flex;align-items:center;gap:10px;background:rgba(52,199,89,0.22);border:1.5px solid rgba(52,199,89,0.5);border-radius:24px;padding:14px 28px;backdrop-filter:blur(8px);">
          <span style="font-size:22px;">✅</span>
          <span style="color:#34C759;font-weight:700;font-size:17px;">Instalado com sucesso!</span>
        </div>
      </div>
    `;
    document.body.appendChild(home);
  });
}

/* ── Safari bottom bar ──────────────────────────────────── */
async function addSafariBar(page, url = '') {
  await page.evaluate(url => {
    const old = document.getElementById('safari-bar');
    if (old) old.remove();

    const bar = document.createElement('div');
    bar.id = 'safari-bar';
    bar.style.cssText = `
      position:fixed;bottom:0;left:0;right:0;
      background:rgba(249,249,249,0.96);border-top:0.5px solid #c6c6c8;
      z-index:99990;padding:8px 10px 28px;
      display:flex;justify-content:space-around;align-items:center;
      font-family:-apple-system,sans-serif;font-size:22px;
      backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);
    `;
    bar.innerHTML = `
      <span style="opacity:0.35;">←</span>
      <span style="opacity:0.35;">→</span>
      <div id="share-btn" style="width:38px;height:38px;display:flex;align-items:center;justify-content:center;cursor:pointer;">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#007AFF" stroke-width="2.2">
          <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/>
          <polyline points="16 6 12 2 8 6"/>
          <line x1="12" y1="2" x2="12" y2="15"/>
        </svg>
      </div>
      <span>⊞</span>
      <span style="opacity:0.5;">⊙</span>
    `;
    document.body.appendChild(bar);
  }, url);
}

function removeSafariBar(page) {
  return page.evaluate(() => {
    const el = document.getElementById('safari-bar');
    if (el) el.remove();
  });
}

/* ══════════════════════════════════════════════════════════
   MAIN
══════════════════════════════════════════════════════════ */
async function main() {
  console.log('🚀 Iniciando gravação — iPhone 17 Pro Max (430×932)...\n');

  const browser = await webkit.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: W, height: H },
    deviceScaleFactor: 3,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15',
    locale: 'pt-BR',
  });
  const page = await context.newPage();

  let frameIdx = 0;
  async function snap(label = '') {
    const p = join(FRAMES, `f${String(frameIdx).padStart(5,'0')}.png`);
    await page.screenshot({ path: p });
    if (label) console.log(`  📸 ${frameIdx.toString().padStart(4)} — ${label}`);
    frameIdx++;
  }

  // how many frames per second each moment lasts
  async function hold(secs, label = '') {
    const n = Math.ceil(secs * FPS);
    for (let i = 0; i < n; i++) await snap(i === 0 ? label : '');
  }

  /* ─── Passo 1: carregar o site ─────────────────────────── */
  console.log('── Passo 1: Carregar o site');
  await page.goto(APP_URL, { waitUntil: 'networkidle', timeout: 40000 });
  await addIosChrome(page);
  await addSafariBar(page, APP_URL);
  await hold(3, 'site carregado');

  // scroll suave para mostrar conteúdo
  await page.evaluate(() => window.scrollBy({ top: 180, behavior: 'smooth' }));
  await hold(1.5, 'scroll down');
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  await hold(1.5, 'scroll up');

  /* ─── Passo 2: ênfase no botão Compartilhar ─────────────── */
  console.log('── Passo 2: Ênfase no botão Compartilhar');
  // The share button is centered at x≈215, y≈(H - 76)
  const shareX = Math.round(W / 2);
  const shareY = H - 76;

  await arrowBadge(page, shareX, shareY, 'Toque em Compartilhar', 'up');
  await hold(2.5, 'badge: compartilhar');

  await clearUI(page);
  await tapEffect(page, shareX, shareY, 'Compartilhar');
  await hold(1.2, 'tap compartilhar');

  /* ─── Passo 3: Share Sheet ─────────────────────────────── */
  console.log('── Passo 3: Share Sheet');
  await removeSafariBar(page);
  await showShareSheet(page);
  await hold(2, 'share sheet aberta');

  // highlight "Adicionar à Tela de Início"
  // 4th item in action list — approx y=75%
  const addItemX = Math.round(W / 2);
  const addItemY = Math.round(H * 0.805);
  await arrowBadge(page, addItemX, addItemY, 'Adicionar à Tela de Início', 'up');
  await hold(2.5, 'badge: adicionar');
  await clearUI(page);

  await tapEffect(page, addItemX, addItemY, 'Toque aqui!');
  await hold(1, 'tap adicionar à tela');

  /* ─── Passo 4: Tela de confirmação ─────────────────────── */
  console.log('── Passo 4: Confirmação');
  await hideShareSheet(page);
  await showAddToHome(page);
  await addIosChrome(page);
  await hold(2.5, 'tela confirmação');

  // highlight "Adicionar" button top-right — badge centered so it's fully visible
  const btnAdicionarX = Math.round(W * 0.75); // ~322px, well within screen
  const btnAdicionarY = 66;
  await arrowBadge(page, btnAdicionarX, btnAdicionarY, 'Toque em Adicionar', 'down');
  await hold(2.5, 'badge: btn adicionar');
  await clearUI(page);

  // actual button is at top-right corner
  const realBtnX = W - 42;
  await tapEffect(page, realBtnX, btnAdicionarY, 'Adicionar!');
  await hold(1, 'tap confirmar');

  /* ─── Passo 5: Home Screen com ícone ─────────────────────  */
  console.log('── Passo 5: Home Screen');
  await page.evaluate(() => {
    const el = document.getElementById('add-to-home');
    if (el) el.remove();
  });
  await showHomeScreen(page);
  await hold(4, 'home screen - ícone Flydea');

  // tap no ícone do Flydea (posição no grid)
  const flydeaX = Math.round(W * 0.545);
  const flydeaY = 490;
  await hold(0.5);
  await tapEffect(page, flydeaX, flydeaY, 'Abrir Flydea!');
  await hold(1.5, 'tap ícone flydea');

  /* ─── Passo 6: App em modo standalone ─────────────────────  */
  console.log('── Passo 6: App standalone');
  await page.evaluate(() => {
    const el = document.getElementById('home-screen');
    if (el) el.remove();
  });
  await page.reload({ waitUntil: 'networkidle' });
  await addIosChrome(page);

  // badge: "App em tela cheia — sem barra do Safari!"
  await page.evaluate(() => {
    const badge = document.createElement('div');
    badge.style.cssText = `
      position:fixed;top:70px;left:50%;transform:translateX(-50%);
      background:rgba(0,122,255,0.15);border:1.5px solid rgba(0,122,255,0.4);
      border-radius:24px;padding:10px 20px;z-index:99999;
      font-family:-apple-system,sans-serif;font-size:14px;font-weight:600;
      color:#007AFF;white-space:nowrap;
      backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);
      animation:badgeIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both;
    `;
    badge.innerHTML = '📱 Modo tela cheia — sem barra do Safari!';
    const style = document.createElement('style');
    style.textContent = `@keyframes badgeIn{from{opacity:0;transform:translateX(-50%) translateY(-12px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`;
    document.head.appendChild(style);
    document.body.appendChild(badge);
  });
  await hold(3.5, 'app standalone badge');

  /* ─── Passo 7: Tela final ─────────────────────────────── */
  console.log('── Passo 7: Tela final');
  await page.evaluate(() => {
    // clear badge
    document.querySelectorAll('[style*="Modo tela cheia"]').forEach(e => e.remove());

    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position:fixed;inset:0;
      background:linear-gradient(135deg,rgba(102,126,234,0.96),rgba(118,75,162,0.96));
      z-index:99999;font-family:-apple-system,BlinkMacSystemFont,sans-serif;
      display:flex;flex-direction:column;align-items:center;justify-content:center;
      text-align:center;padding:40px 28px;
      animation:fadeIn 0.4s ease;
    `;
    overlay.innerHTML = `
      <style>@keyframes fadeIn{from{opacity:0}to{opacity:1}}</style>
      <div style="font-size:72px;margin-bottom:28px;">🎉</div>
      <h1 style="color:white;font-size:34px;font-weight:800;margin:0 0 16px;letter-spacing:-1px;">Pronto!</h1>
      <p style="color:rgba(255,255,255,0.88);font-size:18px;line-height:1.6;max-width:320px;margin:0 0 44px;">
        Seu Flydea está instalado como app no iPhone. Acesse direto da tela inicial!
      </p>
      <div style="background:rgba(255,255,255,0.15);border-radius:20px;padding:28px 24px;width:100%;max-width:340px;backdrop-filter:blur(12px);">
        <h3 style="color:white;font-size:17px;margin:0 0 20px;font-weight:700;letter-spacing:0.3px;">RESUMO DOS PASSOS</h3>
        ${[
          'Abrir Safari e acessar o site',
          'Tocar em Compartilhar ⬆️',
          'Tap em "Adicionar à Tela de Início"',
          'Confirmar com "Adicionar"',
          'Abrir o app na tela inicial 🚀',
        ].map((s,i)=>`
          <div style="display:flex;align-items:center;gap:14px;margin-bottom:${i<4?'16px':'0'};text-align:left;">
            <div style="width:32px;height:32px;border-radius:50%;background:rgba(52,199,89,0.25);border:2px solid #34C759;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
              <span style="color:#34C759;font-size:15px;font-weight:800;">✓</span>
            </div>
            <span style="color:white;font-size:16px;">${s}</span>
          </div>
        `).join('')}
      </div>
    `;
    document.body.appendChild(overlay);
  });
  await hold(5, 'tela final');

  await browser.close();
  console.log(`\n✅ ${frameIdx} frames gerados\n`);

  /* ── Montar vídeo com FFmpeg ─────────────────────────── */
  console.log('🔧 Montando vídeo (sem legendas) + áudio narrado...');
  const outMp4 = join(CWD, 'tutorial_iphone17_final.mp4');
  execSync(
    `ffmpeg -y -framerate ${FPS} -i "${FRAMES}/f%05d.png" \
     -i "${join(CWD,'tutorial_install_narracao.mp3')}" \
     -c:v libx264 -pix_fmt yuv420p -r 30 \
     -c:a aac -b:a 128k -shortest \
     "${outMp4}"`,
    { stdio: 'inherit' }
  );

  const size = (readFileSync(outMp4).length / 1024 / 1024).toFixed(1);
  console.log(`\n🎬 tutorial_iphone17_final.mp4 — ${size} MB`);
  console.log('   ✅ Resolução iPhone 17 Pro Max (430×932, 3× retina)');
  console.log('   ✅ Áudio narrado pt-BR (voz Francisca)');
  console.log('   ✅ Sem legendas');
  console.log('   ✅ Animações de toque, setas e badges nos pontos de clique');
}

main().catch(err => { console.error('❌', err.message); process.exit(1); });
