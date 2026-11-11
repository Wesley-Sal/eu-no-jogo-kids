/* Rostos: foto (só no aparelho) e avatar cartoon (o que vai para o modo online) */
'use strict';

const SKINS = ['#FFE0C7', '#F6CBA5', '#E8B48A', '#D49A6A', '#B97A4E', '#9A5F38', '#7A4528', '#5A3220'];
const HAIRC = ['#1C1C1C', '#3B2A20', '#6B4226', '#A0662F', '#D9A441', '#F1D27A', '#B5482E', '#8A8F99'];
const HAIRC_N = ['preto', 'castanho-escuro', 'castanho', 'castanho-claro', 'loiro-escuro', 'loiro', 'ruivo', 'grisalho'];
const HAIR_STYLES = [
  { id: 'curto', n: 'Curto' }, { id: 'espetado', n: 'Espetado' }, { id: 'longo', n: 'Longo' },
  { id: 'cacheado', n: 'Cacheado' }, { id: 'crespo', n: 'Black power' }, { id: 'coque', n: 'Coque' },
  { id: 'chiquinhas', n: 'Chiquinhas' },
];
const EYES = [{ c: '#5A3A22', n: 'castanho' }, { c: '#1C1C1C', n: 'preto' }, { c: '#3E8E4F', n: 'verde' }, { c: '#3A7BD5', n: 'azul' }, { c: '#B07A2A', n: 'mel' }];
const EXTRAS = [{ id: 'glasses', n: '👓 Óculos' }, { id: 'freckles', n: '✨ Sardas' }, { id: 'bow', n: '🎀 Laço' }];

function defaultAvatar() { return { skin: 1, hairColor: 1, hairStyle: 'curto', eyes: 0, glasses: false, freckles: false, bow: false }; }

/* A "receita" do avatar: é SÓ isto que iria para o servidor no modo online. Nenhuma imagem. */
function avatarRecipe(av) {
  return { pele: av.skin + 1, cabelo: av.hairStyle, corCabelo: HAIRC_N[av.hairColor], olhos: EYES[av.eyes].n, oculos: !!av.glasses, sardas: !!av.freckles, laco: !!av.bow };
}

/* Desenha o rosto cartoon. Canvas 320x320 = 4x o raio da cabeça (pode ter cabelo para fora). */
function makeCartoonFace(av) {
  const S = 320, fc = document.createElement('canvas'); fc.width = fc.height = S;
  const g = fc.getContext('2d'); const r = 80;
  g.translate(160, 160);
  const sk = SKINS[av.skin], hc = HAIRC[av.hairColor], st = av.hairStyle;
  g.fillStyle = hc;
  if (st === 'longo') { rr(g, -r * 1.12, -r * 0.78, r * 2.24, r * 1.95, r * 0.95); g.fill(); }
  else if (st === 'crespo') { circ(g, 0, -r * 0.22, r * 1.36); }
  else if (st === 'cacheado') {
    for (let i = 0; i <= 12; i++) { const a = Math.PI * (0.85 + i * 1.3 / 12); circ(g, Math.cos(a) * r, Math.sin(a) * r - r * 0.05, r * 0.31); }
    circ(g, -r * 0.98, r * 0.45, r * 0.27); circ(g, r * 0.98, r * 0.45, r * 0.27);
  }
  else if (st === 'chiquinhas') { circ(g, -r * 1.16, r * 0.08, r * 0.4); circ(g, r * 1.16, r * 0.08, r * 0.4); }
  else if (st === 'coque') { circ(g, 0, -r * 1.1, r * 0.42); }
  if (st !== 'longo' && st !== 'crespo') { circ(g, -r * 0.98, r * 0.1, r * 0.18, sk); circ(g, r * 0.98, r * 0.1, r * 0.18, sk); }
  circ(g, 0, 0, r, sk); g.strokeStyle = 'rgba(43,34,56,.12)'; g.lineWidth = 4; g.beginPath(); g.arc(0, 0, r, 0, TAU); g.stroke();
  g.fillStyle = hc;
  if (st === 'espetado') {
    for (let i = 0; i < 5; i++) { const x = -r * 0.6 + i * r * 0.3; g.beginPath(); g.moveTo(x - r * 0.22, -r * 0.7); g.lineTo(x + (i - 2) * r * 0.04, -r * 1.32); g.lineTo(x + r * 0.22, -r * 0.7); g.closePath(); g.fill(); }
  }
  if (st === 'crespo') {
    g.beginPath(); g.arc(0, 0, r * 1.02, Math.PI, 0); g.lineTo(r * 1.02, -r * 0.12); g.quadraticCurveTo(r * 0.6, -r * 0.74, 0, -r * 0.64);
    g.quadraticCurveTo(-r * 0.6, -r * 0.74, -r * 1.02, -r * 0.12); g.closePath(); g.fill();
  } else {
    g.beginPath(); g.arc(0, 0, r * 1.03, Math.PI, 0); g.lineTo(r * 1.03, 0); g.quadraticCurveTo(r * 0.6, -r * 0.6, 0, -r * 0.42);
    g.quadraticCurveTo(-r * 0.6, -r * 0.6, -r * 1.03, 0); g.closePath(); g.fill();
  }
  if (st === 'longo') { rr(g, -r * 1.1, -r * 0.2, r * 0.26, r * 1.2, r * 0.13); g.fill(); rr(g, r * 0.84, -r * 0.2, r * 0.26, r * 1.2, r * 0.13); g.fill(); }
  if (st === 'cacheado') { for (let i = 0; i < 7; i++) circ(g, -r * 0.75 + i * r * 0.25, -r * 0.46 - Math.sin(i / 6 * Math.PI) * r * 0.12, r * 0.17); }
  if (st === 'chiquinhas') { circ(g, -r * 0.86, r * 0.02, r * 0.1, '#FF6FA8'); circ(g, r * 0.86, r * 0.02, r * 0.1, '#FF6FA8'); }
  if (st === 'coque') circ(g, 0, -r * 0.8, r * 0.1, '#FF6FA8');
  g.strokeStyle = shade(hc, -0.25); g.lineWidth = r * 0.07; g.lineCap = 'round';
  [-1, 1].forEach(sg => { g.beginPath(); g.moveTo(sg * r * 0.48, -r * 0.15); g.quadraticCurveTo(sg * r * 0.34, -r * 0.25, sg * r * 0.18, -r * 0.18); g.stroke(); });
  const ec = EYES[av.eyes].c;
  [-1, 1].forEach(sg => {
    const x = sg * r * 0.33, y = r * 0.1;
    circ(g, x, y, r * 0.17, '#fff'); circ(g, x, y + r * 0.01, r * 0.12, ec); circ(g, x, y + r * 0.01, r * 0.06, '#1A1420'); circ(g, x + r * 0.045, y - r * 0.035, r * 0.035, '#fff');
  });
  g.strokeStyle = shade(sk, -0.22); g.lineWidth = r * 0.05; g.beginPath(); g.arc(0, r * 0.28, r * 0.07, 0.2 * Math.PI, 0.8 * Math.PI); g.stroke();
  circ(g, -r * 0.58, r * 0.4, r * 0.14, 'rgba(255,110,140,.3)'); circ(g, r * 0.58, r * 0.4, r * 0.14, 'rgba(255,110,140,.3)');
  if (av.freckles) { g.fillStyle = shade(sk, -0.32); [[0.45, 0.3], [0.56, 0.36], [0.5, 0.42], [0.62, 0.28]].forEach(([a, b]) => { circ(g, -r * a, r * b, r * 0.028); circ(g, r * a, r * b, r * 0.028); }); }
  g.fillStyle = '#8A2E3B'; g.beginPath(); g.moveTo(-r * 0.22, r * 0.47); g.quadraticCurveTo(0, r * 0.76, r * 0.22, r * 0.47); g.closePath(); g.fill();
  g.fillStyle = '#fff'; g.beginPath(); g.moveTo(-r * 0.16, r * 0.48); g.lineTo(r * 0.16, r * 0.48); g.lineTo(r * 0.13, r * 0.54); g.lineTo(-r * 0.13, r * 0.54); g.closePath(); g.fill();
  if (av.glasses) {
    g.strokeStyle = '#2B2238'; g.lineWidth = r * 0.06;
    [-1, 1].forEach(sg => { g.beginPath(); g.arc(sg * r * 0.33, r * 0.1, r * 0.24, 0, TAU); g.stroke(); });
    g.beginPath(); g.moveTo(-r * 0.09, r * 0.06); g.quadraticCurveTo(0, 0, r * 0.09, r * 0.06); g.stroke();
  }
  if (av.bow) {
    const bx = r * 0.62, by = -r * 0.82; g.fillStyle = '#FF6FA8';
    g.beginPath(); g.moveTo(bx, by); g.lineTo(bx - r * 0.32, by - r * 0.2); g.lineTo(bx - r * 0.32, by + r * 0.2); g.closePath(); g.fill();
    g.beginPath(); g.moveTo(bx, by); g.lineTo(bx + r * 0.32, by - r * 0.2); g.lineTo(bx + r * 0.32, by + r * 0.2); g.closePath(); g.fill();
    circ(g, bx, by, r * 0.1, '#E0457F');
  }
  fc.full = true; fc.skin = sk; return fc;
}

/* Rosto desenhado simples (placeholder da tela de foto) */
function makeDefaultFace(skin, hair) {
  const S = 160, fc = document.createElement('canvas'); fc.width = fc.height = S; const g = fc.getContext('2d'); const r = 80;
  g.translate(80, 80); circ(g, 0, 0, r, skin);
  g.fillStyle = hair; g.beginPath(); g.arc(0, 0, r, Math.PI, 0); g.lineTo(r, -r * 0.02); g.quadraticCurveTo(r * 0.55, -r * 0.6, 0, -r * 0.42); g.quadraticCurveTo(-r * 0.55, -r * 0.6, -r, -r * 0.02); g.closePath(); g.fill();
  circ(g, -r * 0.33, r * 0.14, r * 0.12, '#2B2238'); circ(g, r * 0.33, r * 0.14, r * 0.12, '#2B2238');
  g.strokeStyle = '#2B2238'; g.lineWidth = r * 0.07; g.lineCap = 'round'; g.beginPath(); g.arc(0, r * 0.3, r * 0.24, 0.18 * Math.PI, 0.82 * Math.PI); g.stroke();
  fc.skin = skin; return fc;
}

/* Média de cor numa região (frações 0..1 do canvas) */
function avgRegion(fc, x0, y0, x1, y1) {
  try {
    const S = fc.width, g = fc.getContext('2d');
    const d = g.getImageData(Math.round(S * x0), Math.round(S * y0), Math.max(1, Math.round(S * (x1 - x0))), Math.max(1, Math.round(S * (y1 - y0)))).data;
    let R = 0, G = 0, B = 0, n = 0;
    for (let i = 0; i < d.length; i += 4) { if (d[i + 3] < 200) continue; R += d[i]; G += d[i + 1]; B += d[i + 2]; n++; }
    return n ? [R / n, G / n, B / n] : null;
  } catch (e) { return null; }
}
function nearestColor(rgb, list) {
  let bi = 0, bd = 1e12;
  list.forEach((h, i) => { const n = parseInt(h.slice(1), 16); const d = (rgb[0] - (n >> 16)) ** 2 + (rgb[1] - (n >> 8 & 255)) ** 2 + (rgb[2] - (n & 255)) ** 2; if (d < bd) { bd = d; bi = i; } });
  return bi;
}
/* Detecta pele (bochechas) e cabelo (topo) no recorte da foto. Tudo acontece no aparelho. */
function detectFromPhoto(fc, av) {
  const found = { skin: false, hair: false };
  const s = [avgRegion(fc, .22, .52, .38, .66), avgRegion(fc, .62, .52, .78, .66)].filter(Boolean);
  if (s.length) { const m = [0, 1, 2].map(i => s.reduce((a, b) => a + b[i], 0) / s.length); av.skin = nearestColor(m, SKINS); found.skin = true; }
  const h = avgRegion(fc, .32, .05, .68, .16);
  if (h) { av.hairColor = nearestColor(h, HAIRC); found.hair = true; }
  return found;
}
/* Cor média da pele da foto (para as mãos do personagem no modo offline) */
function photoSkin(fc) {
  const s = [avgRegion(fc, .25, .55, .38, .66), avgRegion(fc, .62, .55, .75, .66)].filter(Boolean);
  if (!s.length) return '#F2C9A0';
  const m = [0, 1, 2].map(i => Math.round(s.reduce((a, b) => a + b[i], 0) / s.length));
  return `rgb(${m[0]},${m[1]},${m[2]})`;
}
/* Recria o canvas do rosto a partir da foto guardada (dataURL) */
function faceFromDataURL(url) {
  return new Promise(res => {
    if (!url) return res(null);
    const im = new Image();
    im.onload = () => { const fc = document.createElement('canvas'); fc.width = fc.height = 160; fc.getContext('2d').drawImage(im, 0, 0, 160, 160); fc.skin = photoSkin(fc); res(fc); };
    im.onerror = () => res(null);
    im.src = url;
  });
}
