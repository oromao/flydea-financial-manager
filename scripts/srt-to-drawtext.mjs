#!/usr/bin/env node
/**
 * Converte SRT em drawtext filter do ffmpeg
 * Gera legendas brancas com sombra/outline sobre o vídeo
 */
import { readFileSync } from 'fs';

const srt = readFileSync('tutorial_install.srt', 'utf-8');

const entries = srt.trim().split(/\n\n+/).map(block => {
  const lines = block.trim().split('\n');
  const [start, end] = lines[1].split(' --> ').map(t => {
    const [h, m, rest] = t.trim().split(':');
    const [s, ms] = rest.split(',');
    return parseInt(h)*3600 + parseInt(m)*60 + parseInt(s) + parseInt(ms)/1000;
  });
  const text = lines.slice(2).join('\\n').replace(/'/g, "'\\\\\\''").replace(/:/g, '\\:');
  return { start, end, text };
});

const filters = entries.map(e => {
  return `drawtext=text='${e.text}':fontsize=22:fontcolor=white:borderw=2:bordercolor=black:shadowx=1:shadowy=1:x=(w-text_w)/2:y=h-80-text_h:enable='between(t,${e.start},${e.end})'`;
}).join(',');

console.log(filters);
