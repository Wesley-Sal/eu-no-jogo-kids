/* Eu no Jogo Kids — utilidades compartilhadas (desenho, matemática, DOM) */
'use strict';

const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const TAU = Math.PI * 2;
const DPR = Math.min(2, window.devicePixelRatio || 1);

/* Mundo do jogo: coordenadas lógicas fixas, escaladas para a tela */
const W = 960, H = 600;
const WALK = { x0: 50, x1: 910, y0: 340, y1: 575 };   // área do chão onde dá para andar
const FONT = '"Baloo 2", system-ui, sans-serif';

function rr(c, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  c.beginPath(); c.moveTo(x + r, y); c.lineTo(x + w - r, y); c.quadraticCurveTo(x + w, y, x + w, y + r);
  c.lineTo(x + w, y + h - r); c.quadraticCurveTo(x + w, y + h, x + w - r, y + h); c.lineTo(x + r, y + h);
  c.quadraticCurveTo(x, y + h, x, y + h - r); c.lineTo(x, y + r); c.quadraticCurveTo(x, y, x + r, y); c.closePath();
}
function fr(c, x, y, w, h, r, col) { c.fillStyle = col; rr(c, x, y, w, h, r); c.fill(); }
function circ(c, x, y, r, col) { if (col) c.fillStyle = col; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); }
function ell(c, x, y, rx, ry, rot, col) { if (col) c.fillStyle = col; c.beginPath(); c.ellipse(x, y, rx, ry, rot || 0, 0, TAU); c.fill(); }
function starPath(c, x, y, n, ro, ri, rot) {
  c.beginPath(); rot = rot == null ? -Math.PI / 2 : rot;
  for (let i = 0; i < n * 2; i++) { const r = i % 2 ? ri : ro; const a = rot + i * Math.PI / n; c.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); }
  c.closePath();
}
function rng(seed) { let s = seed % 2147483647; if (s <= 0) s += 2147483646; return () => (s = s * 16807 % 2147483647) / 2147483647; }
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function uid() { return Math.random().toString(36).slice(2, 10); }
function setupCanvas(cv, w, h) {
  cv.width = Math.round(w * DPR); cv.height = Math.round(h * DPR);
  const c = cv.getContext('2d'); c.setTransform(DPR, 0, 0, DPR, 0, 0); return c;
}
/* clareia (f>0) ou escurece (f<0) uma cor #rrggbb */
function shade(hex, f) {
  const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = n >> 8 & 255, b = n & 255;
  const t = f < 0 ? 0 : 255, p = Math.abs(f);
  r = Math.round((t - r) * p + r); g = Math.round((t - g) * p + g); b = Math.round((t - b) * p + b);
  return `rgb(${r},${g},${b})`;
}
function esc(s) { return String(s).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch])); }
