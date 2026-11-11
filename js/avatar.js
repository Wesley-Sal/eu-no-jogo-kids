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
function makeCartoonFace(av, opts) {
  opts = opts || {};
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
  circ(g, 0, 0, r, sk);
  if (opts.photo) {
    const ph = opts.photo, fw = r * 1.48, fh = Math.min(fw * ph.height / ph.width, r * 1.95);
    g.save(); g.beginPath(); g.arc(0, 0, r * 0.99, 0, TAU); g.clip(); g.drawImage(ph, -fw / 2, r * 0.27 - fh / 2, fw, fh); g.restore();
  }
  g.strokeStyle = 'rgba(43,34,56,.14)'; g.lineWidth = 4; g.beginPath(); g.arc(0, 0, r, 0, TAU); g.stroke();
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
  if (!opts.photo) {
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
  }
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
    im.onload = () => { const fc = document.createElement('canvas'); const S = Math.max(160, im.width); fc.width = fc.height = S; fc.getContext('2d').drawImage(im, 0, 0, S, S); fc.skin = photoSkin(fc); res(fc); };
    im.onerror = () => res(null);
    im.src = url;
  });
}

/* ---------- foto integrada ao personagem ---------- */
const PHOTO_STYLES = [
  { id: 'mistura', n: '✂️ Rosto recortado', d: 'o jogo recorta só o seu rosto e coloca na cabeça do personagem, com o cabelo do avatar' },
  { id: 'desenho', n: '✏️ Desenho', d: 'a foto vira desenho animado' },
  { id: 'natural', n: '📷 Natural', d: 'a foto do jeito que foi tirada' },
];
function hexRgb(h) { const n = parseInt(h.slice(1), 16); return [n >> 16, n >> 8 & 255, n & 255]; }
function copyCanvas(src) { const c = document.createElement('canvas'); c.width = src.width; c.height = src.height; c.getContext('2d').drawImage(src, 0, 0); return c; }

/* filtro "desenho animado": suaviza, aviva as cores, reduz tons e desenha contornos */
function toonFilter(src) {
  const S = src.width, out = copyCanvas(src), g = out.getContext('2d');
  const sm = document.createElement('canvas'); sm.width = sm.height = Math.max(8, Math.round(S / 2.4));
  sm.getContext('2d').drawImage(src, 0, 0, sm.width, sm.height);
  g.globalAlpha = 0.6; g.imageSmoothingQuality = 'high'; g.drawImage(sm, 0, 0, S, S); g.globalAlpha = 1;
  const id = g.getImageData(0, 0, S, S), d = id.data, L = new Float32Array(S * S);
  for (let p = 0; p < S * S; p++) L[p] = d[p * 4] * 0.3 + d[p * 4 + 1] * 0.59 + d[p * 4 + 2] * 0.11;
  const step = 255 / 6;
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const p = y * S + x, i = p * 4; if (d[i + 3] < 10) continue;
    let r = d[i], gg = d[i + 1], b = d[i + 2]; const avg = (r + gg + b) / 3;
    r = avg + (r - avg) * 1.3; gg = avg + (gg - avg) * 1.3; b = avg + (b - avg) * 1.3;
    r = r * 0.45 + Math.round(r / step) * step * 0.55; gg = gg * 0.45 + Math.round(gg / step) * step * 0.55; b = b * 0.45 + Math.round(b / step) * step * 0.55;
    let k = 1;
    if (x > 0 && y > 0 && x < S - 1 && y < S - 1) {
      const gx = -L[p - S - 1] - 2 * L[p - 1] - L[p + S - 1] + L[p - S + 1] + 2 * L[p + 1] + L[p + S + 1];
      const gy = -L[p - S - 1] - 2 * L[p - S] - L[p - S + 1] + L[p + S - 1] + 2 * L[p + S] + L[p + S + 1];
      const m = Math.hypot(gx, gy); if (m > 70) k = clamp(1 - (m - 70) / 170, 0.42, 1);
    }
    d[i] = clamp(r * k, 0, 255); d[i + 1] = clamp(gg * k, 0, 255); d[i + 2] = clamp(b * k, 0, 255);
  }
  g.putImageData(id, 0, 0); return out;
}
/* aproxima a cor da pele da foto da cor da pele do avatar (para não ficar "emenda") */
function matchSkin(src, av, amount) {
  const out = copyCanvas(src), g = out.getContext('2d'), S = out.width;
  const have = avgRegion(out, .28, .52, .72, .72); if (!have) return out;
  const want = hexRgb(SKINS[av.skin]), dr = (want[0] - have[0]) * amount, dg = (want[1] - have[1]) * amount, db = (want[2] - have[2]) * amount;
  const id = g.getImageData(0, 0, S, S), d = id.data;
  for (let i = 0; i < d.length; i += 4) { d[i] = clamp(d[i] + dr, 0, 255); d[i + 1] = clamp(d[i + 1] + dg, 0, 255); d[i + 2] = clamp(d[i + 2] + db, 0, 255); }
  g.putImageData(id, 0, 0); return out;
}
/* recorta o rosto num oval com borda suave */
function featherOval(src) {
  const S = src.width, out = copyCanvas(src), g = out.getContext('2d');
  g.globalCompositeOperation = 'destination-in'; g.save(); g.translate(S / 2, S * 0.53); g.scale(0.78, 1);
  const gr = g.createRadialGradient(0, 0, S * 0.25, 0, 0, S * 0.42); gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = gr; g.beginPath(); g.arc(0, 0, S * 0.5, 0, TAU); g.fill(); g.restore(); return out;
}
/* rosto que aparece no jogo no modo offline, conforme o estilo escolhido */
function stylizePhoto(photo, av, style) {
  if (!photo) return null;
  if (style === 'natural') return photo;
  if (style === 'desenho') { const t = toonFilter(photo); t.skin = photo.skin; return t; }
  /* rosto recortado, com um toque de desenho para combinar com o personagem */
  const soft = copyCanvas(photo), sg = soft.getContext('2d'); sg.globalAlpha = 0.45; sg.drawImage(toonFilter(photo), 0, 0);
  const face = cutFace(matchSkin(soft, av, 0.5));
  return makeCartoonFace(av, { photo: face });
}

/* ---------- recorte automático do rosto (tudo no aparelho) ----------
   1) pega a cor da pele nas bochechas; 2) marca os pixels parecidos (espaço YCbCr);
   3) fica com a região ligada ao centro; 4) encaixa uma elipse nessa região = o rosto. */
function ycc(r, g, b) { return [0.299 * r + 0.587 * g + 0.114 * b, 128 - 0.1687 * r - 0.3313 * g + 0.5 * b, 128 + 0.5 * r - 0.4187 * g - 0.0813 * b]; }
function findFace(src) {
  const S = src.width, d = src.getContext('2d').getImageData(0, 0, S, S).data;
  const ref = avgRegion(src, .36, .5, .64, .68); const fb = { cx: .5, cy: .52, rx: .34, ry: .42, ok: false };
  if (!ref) return fb;
  const [, cb0, cr0] = ycc(...ref), N = S * S, m = new Uint8Array(N);
  for (let p = 0; p < N; p++) {
    const i = p * 4; if (d[i + 3] < 200) continue;
    const [y, cb, cr] = ycc(d[i], d[i + 1], d[i + 2]);
    if (y > 35 && Math.hypot(cb - cb0, cr - cr0) < 15) m[p] = 1;
  }
  /* região conectada ao centro do rosto */
  const seen = new Uint8Array(N), q = [];
  for (const [fx, fy] of [[.5, .6], [.42, .58], [.58, .58], [.5, .5], [.5, .7]]) { const p = Math.round(fy * S) * S + Math.round(fx * S); if (m[p] && !seen[p]) { seen[p] = 1; q.push(p); } }
  let n = 0; const xs = [], ys = [];
  while (q.length) {
    const p = q.pop(), x = p % S, y = (p / S) | 0; n++; xs.push(x); ys.push(y);
    for (const nb of [p - 1, p + 1, p - S, p + S]) { if (nb < 0 || nb >= N || seen[nb] || !m[nb]) continue; if ((nb % S === 0 && x === S - 1) || (x === 0 && nb % S === S - 1)) continue; seen[nb] = 1; q.push(nb); }
  }
  if (n < N * 0.06) return fb;
  xs.sort((a, b) => a - b); ys.sort((a, b) => a - b);
  const pc = (a, k) => a[Math.min(a.length - 1, Math.max(0, Math.round(k * (a.length - 1))))];
  const x0 = pc(xs, .03), x1 = pc(xs, .97), y0 = pc(ys, .02);
  let rx = (x1 - x0) / 2 / S, ry = Math.min((pc(ys, .97) - y0) / 2 / S, rx * 1.32);
  rx = clamp(rx * 1.06, .1, .48); ry = clamp(Math.max(ry, rx * 1.12), .12, .5);
  return { cx: (x0 + x1) / 2 / S, cy: y0 / S + ry, rx, ry, ok: true };
}
/* devolve só o rosto, recortado em elipse com borda suave */
function cutFace(src) {
  const f = findFace(src), S = src.width, O = 256;
  const out = document.createElement('canvas'); out.width = O; out.height = Math.round(O * f.ry / f.rx);
  const g = out.getContext('2d');
  const sx = (f.cx - f.rx) * S, sy = (f.cy - f.ry) * S, sw = 2 * f.rx * S, sh = 2 * f.ry * S;
  g.drawImage(src, sx, sy, sw, sh, 0, 0, out.width, out.height);
  g.globalCompositeOperation = 'destination-in';
  g.save(); g.translate(out.width / 2, out.height / 2); g.scale(1, out.height / out.width);
  const gr = g.createRadialGradient(0, 0, O * 0.36, 0, 0, O * 0.5); gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = gr; g.beginPath(); g.arc(0, 0, O * 0.5, 0, TAU); g.fill(); g.restore();
  out.found = f.ok; return out;
}
