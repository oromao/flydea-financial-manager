#!/usr/bin/env node
/**
 * Cria frames com legendas queimadas sobre os slides usando Playwright WebKit
 * Usa base64 para garantir que as imagens carregam corretamente
 */
import { webkit } from 'playwright';
import { readFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

const CWD = process.cwd();
const FRAMES_DIR = join(CWD, 'tutorial_install_output', 'frames');
const SLIDES_DIR = join(CWD, 'tutorial_install_output');

// Parse SRT
function parseSRT(content) {
  return content.trim().split(/\n\n+/).map(block => {
    const lines = block.trim().split('\n');
    const [startStr, endStr] = lines[1].split(' --> ');
    const parseTime = (t) => {
      const [h, m, rest] = t.trim().split(':');
      const [s, ms] = rest.split(',');
      return parseInt(h)*3600 + parseInt(m)*60 + parseInt(s) + parseInt(ms)/1000;
    };
    return {
      start: parseTime(startStr),
      end: parseTime(endStr),
      text: lines.slice(2).join('\n')
    };
  });
}

const subs = parseSRT(readFileSync(join(CWD, 'tutorial_install.srt'), 'utf-8'));

// Slide definitions with timing
const slides = [
  { img: 'step_01_site_carregado.png', start: 0,    duration: 7 },
  { img: 'step_02_tela_login.png',     start: 7,    duration: 3.5 },
  { img: 'step_03_scroll_down.png',    start: 10.5, duration: 2 },
  { img: 'step_04_scroll_up.png',      start: 12.5, duration: 2.5 },
  { img: 'step_05_instrucao_compartilhar.png', start: 15, duration: 4.5 },
  { img: 'step_06_share_sheet.png',    start: 19.5, duration: 5 },
  { img: 'step_07_highlight_adicionar.png', start: 24.5, duration: 5.5 },
  { img: 'step_08_tela_confirmacao.png', start: 30, duration: 8 },
  { img: 'step_09_home_screen_sucesso.png', start: 38, duration: 7 },
  { img: 'step_10_app_standalone.png', start: 45, duration: 8.5 },
  { img: 'step_11_tela_final_resumo.png', start: 53.5, duration: 15.5 },
];

// Pre-load all images as base64
console.log('📦 Carregando imagens como base64...');
const imageCache = {};
for (const slide of slides) {
  const imgPath = join(SLIDES_DIR, slide.img);
  const buf = readFileSync(imgPath);
  imageCache[slide.img] = `data:image/png;base64,${buf.toString('base64')}`;
}
console.log(`  ${Object.keys(imageCache).length} imagens carregadas`);

const FPS = 10;
const TOTAL_DURATION = 69;

async function main() {
  if (!existsSync(FRAMES_DIR)) mkdirSync(FRAMES_DIR, { recursive: true });

  console.log('🎬 Gerando frames com legendas...');

  const browser = await webkit.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();

  const totalFrames = Math.ceil(TOTAL_DURATION * FPS);
  let currentSlideImg = null;
  
  for (let frameIdx = 0; frameIdx < totalFrames; frameIdx++) {
    const t = frameIdx / FPS;
    
    // Find current slide
    const slide = slides.find(s => t >= s.start && t < s.start + s.duration) || slides[slides.length - 1];
    
    // Find current subtitle
    const sub = subs.find(s => t >= s.start && t <= s.end);
    const subText = sub ? sub.text.replace(/\n/g, '<br>') : '';

    // Only update page content when slide changes or subtitle changes
    const b64 = imageCache[slide.img];

    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            width: 390px; height: 844px; overflow: hidden;
            font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
            background: #000;
          }
          .slide {
            width: 390px; height: 844px;
            position: relative;
          }
          .slide img {
            width: 100%; height: 100%;
            object-fit: cover;
          }
          .subtitle {
            position: absolute;
            bottom: 50px;
            left: 12px;
            right: 12px;
            text-align: center;
            color: white;
            font-size: 16px;
            font-weight: 600;
            line-height: 1.5;
            text-shadow: 0 1px 4px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.6);
            background: rgba(0, 0, 0, 0.6);
            padding: 10px 16px;
            border-radius: 12px;
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            letter-spacing: 0.2px;
          }
          .subtitle:empty { display: none; }
        </style>
      </head>
      <body>
        <div class="slide">
          <img src="${b64}" />
          <div class="subtitle">${subText}</div>
        </div>
      </body>
      </html>
    `, { waitUntil: 'load' });

    const framePath = join(FRAMES_DIR, `frame_${String(frameIdx).padStart(5, '0')}.png`);
    await page.screenshot({ path: framePath });

    if (frameIdx % (FPS * 5) === 0) {
      console.log(`  Frame ${frameIdx}/${totalFrames} (${Math.round(t)}s / ${TOTAL_DURATION}s)`);
    }
  }

  await browser.close();
  console.log(`✅ ${totalFrames} frames gerados`);

  // Combine frames + audio
  console.log('\n🔧 Combinando frames + áudio...');
  const outputPath = join(CWD, 'tutorial_install_final_legendado.mp4');
  const cmd = `ffmpeg -y -framerate ${FPS} -i "${FRAMES_DIR}/frame_%05d.png" -i "${join(CWD, 'tutorial_install_narracao.mp3')}" -c:v libx264 -pix_fmt yuv420p -r 30 -c:a aac -b:a 128k -shortest "${outputPath}"`;
  
  execSync(cmd, { stdio: 'inherit' });

  // File size
  const { statSync } = await import('fs');
  const stats = statSync(outputPath);
  const sizeMB = (stats.size / 1024 / 1024).toFixed(1);

  console.log(`\n🎉 Vídeo final: tutorial_install_final_legendado.mp4 (${sizeMB} MB)`);
  console.log('   ✅ Áudio narrado em pt-BR');
  console.log('   ✅ Legendas queimadas');
  console.log('   ✅ Resolução iPhone 14 Pro (390x844)');
}

main().catch(err => {
  console.error('❌ Erro:', err.message);
  process.exit(1);
});
