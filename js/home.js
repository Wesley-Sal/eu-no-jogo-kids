/* Minha casa: cômodos criados a partir de fotos da casa da família.
 *
 * PRIVACIDADE: a foto do cômodo fica SÓ no aparelho e só aparece no modo offline.
 * No modo online, o cômodo é redesenhado como cartoon a partir de uma "receita"
 * (cores da parede e do chão + tipo e posição dos móveis). Ver Home.recipe().
 */
'use strict';

const HOME_TYPES = [
  { id: 'cama', n: 'Cama', e: '🛏️', pose: 'lie', dur: 5, s1: 'Hora da soneca... 😴', s2: 'Que soneca boa! ☀️', fx: 'zzz', col: '#8A6BE0' },
  { id: 'sofa', n: 'Sofá', e: '🛋️', pose: 'sit', dur: 4, s1: 'Que sofá fofinho!', s2: 'Descansei! 😌', fx: 'hearts', col: '#E2464A' },
  { id: 'tv', n: 'TV', e: '📺', pose: 'stand', dur: 5, s1: 'Meu desenho favorito! 📺', s2: 'Que episódio legal!', fx: 'tv', col: '#2B2238' },
  { id: 'mesa', n: 'Mesa', e: '🍽️', pose: 'stand', dur: 4, s1: 'Hora de comer! 🍽️', s2: 'Hum, que delícia! 😋', fx: 'food', col: '#B07A45' },
  { id: 'cadeira', n: 'Cadeira', e: '🪑', pose: 'sit', dur: 3, s1: 'Vou sentar um pouco', s2: 'Pronto! 🙂', fx: null, col: '#B07A45' },
  { id: 'geladeira', n: 'Geladeira', e: '🧊', pose: 'stand', dur: 2.6, s1: 'O que tem aqui? 🤔', s2: 'Peguei uma fruta! 🍎', fx: 'fridge', col: '#DCE6F2' },
  { id: 'fogao', n: 'Fogão', e: '🍳', pose: 'stand', dur: 4.5, s1: 'Cozinhando... 🍳', s2: 'Panqueca pronta! 🥞', fx: 'steam', col: '#9AA5B5' },
  { id: 'pia', n: 'Pia', e: '🚰', pose: 'stand', dur: 3.5, s1: 'Lavando as mãos... 🧼', s2: 'Mãos limpinhas! ✨', fx: 'bubbles', col: '#BFE6FF' },
  { id: 'banho', n: 'Banho', e: '🛁', pose: 'stand', dur: 4.5, s1: 'Hora do banho! 🛁', s2: 'Cheirosinho! ✨', fx: 'bath', col: '#6EC6FF' },
  { id: 'livros', n: 'Livros', e: '📚', pose: 'stand', dur: 5, s1: null, s2: 'Que história legal! 📖', fx: 'read', col: '#5B3FD9' },
  { id: 'brinquedos', n: 'Brinquedos', e: '🧸', pose: 'stand', dur: 3.5, s1: 'Vamos brincar! 🧸', s2: 'Que divertido!', fx: 'toys', col: '#FF9F43' },
  { id: 'computador', n: 'Computador', e: '💻', pose: 'stand', dur: 4, s1: 'Fazendo a lição 💻', s2: 'Lição feita! ✅', fx: 'screen', col: '#5B3FD9' },
  { id: 'janela', n: 'Janela', e: '🌤️', pose: 'stand', dur: 2.6, s1: null, s2: null, fx: 'sky', col: '#8FD3FF' },
  { id: 'planta', n: 'Planta', e: '🌱', pose: 'stand', dur: 3, s1: 'Regando a plantinha 💧', s2: 'Cresce, plantinha! 🌱', fx: 'water', col: '#5CC46B' },
  { id: 'porta', n: 'Porta (entrar)', e: '🚪', pose: 'stand', dur: 0, door: true, col: '#8E5E33' },
  { id: 'carro', n: 'Carro', e: '🚗', pose: 'stand', dur: 3.5, s1: 'Vrum, vrum! 🚗', s2: 'Chegamos! 🏁', fx: 'car', col: '#E2464A' },
  { id: 'esconder', n: 'Esconder (borrar)', e: '🙈', privacy: true, col: '#9AA5B5' },
];
const FACADE_EMOJI = '🏠';
function isFacade(r) { return !!r && r.emoji === FACADE_EMOJI; }

/* borra (pixeliza) uma região: usado para esconder número da casa, placa etc. */
function pixelateRect(g, src, o, block) {
  block = block || 16;
  const w = Math.max(1, Math.round(o.w / block)), h = Math.max(1, Math.round(o.h / block));
  const t = document.createElement('canvas'); t.width = w; t.height = h;
  t.getContext('2d').drawImage(src, o.x * src.width / W, o.y * src.height / H, o.w * src.width / W, o.h * src.height / H, 0, 0, w, h);
  g.save(); g.imageSmoothingEnabled = false; g.drawImage(t, 0, 0, w, h, o.x, o.y, o.w, o.h); g.restore();
}
const ROOM_KINDS = [{ e: '🏠', n: 'Fachada' }, { e: '🛏️', n: 'Quarto' }, { e: '🛋️', n: 'Sala' }, { e: '🍳', n: 'Cozinha' }, { e: '🛁', n: 'Banheiro' }, { e: '🏡', n: 'Outro' }];

/* cor predominante de uma região (ignora janelas, porta etc. melhor que a média) */
function dominantRegion(fc, x0, y0, x1, y1) {
  try {
    const S = fc.width, T = fc.height, g = fc.getContext('2d');
    const d = g.getImageData(Math.round(S * x0), Math.round(T * y0), Math.max(1, Math.round(S * (x1 - x0))), Math.max(1, Math.round(T * (y1 - y0)))).data;
    const b = {};
    for (let i = 0; i < d.length; i += 8) { const k = (d[i] >> 4) + ',' + (d[i + 1] >> 4) + ',' + (d[i + 2] >> 4); const e = b[k] || (b[k] = [0, 0, 0, 0]); e[0] += d[i]; e[1] += d[i + 1]; e[2] += d[i + 2]; e[3]++; }
    let best = null; for (const k in b) if (!best || b[k][3] > best[3]) best = b[k];
    return best ? [best[0] / best[3], best[1] / best[3], best[2] / best[3]] : null;
  } catch (e) { return null; }
}
function homeType(id) { return HOME_TYPES.find(t => t.id === id) || HOME_TYPES[0]; }
function rgbHex(rgb) { return '#' + rgb.map(v => clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0')).join(''); }

const Home = {
  photoCache: {}, cartoonCache: {}, loading: {},

  rooms() { return Store.data.homes || []; },
  places() { return Store.data.places || []; },
  placeById(id) { return this.places().find(p => p.id === id) || null; },
  roomsOf(placeId) { return this.rooms().filter(r => r.placeId === placeId).sort((a, b) => (isFacade(b) ? 1 : 0) - (isFacade(a) ? 1 : 0)); },
  facadeOf(placeId) { return this.rooms().find(r => r.placeId === placeId && isFacade(r)) || null; },
  insideOf(placeId) { return this.roomsOf(placeId).filter(r => !isFacade(r)); },
  placeOfScene(sceneId) { const r = this.byScene(sceneId); return r ? this.placeById(r.placeId) : null; },
  byScene(sceneId) { if (!sceneId || sceneId.indexOf('home:') !== 0) return null; const id = sceneId.slice(5); return this.rooms().find(r => r.id === id) || null; },
  sceneId(room) { return 'home:' + room.id; },
  invalidate(room) { delete this.photoCache[room.id]; delete this.cartoonCache[room.id]; delete this.loading[room.id]; },

  /* cores da parede, do chão e de cada móvel, tiradas da foto (no aparelho) */
  sampleColors(room, photoCanvas) {
    const fy = room.floorY / H;
    const wall = isFacade(room) ? dominantRegion(photoCanvas, 0.25, Math.max(0.05, fy - 0.3), 0.75, Math.max(0.08, fy - 0.03)) : dominantRegion(photoCanvas, 0.05, 0.05, 0.95, Math.max(0.08, fy - 0.05));
    const floor = dominantRegion(photoCanvas, 0.05, Math.min(0.95, fy + 0.04), 0.95, 0.97);
    room.colors = { wall: wall ? rgbHex(wall) : '#FFE9D2', floor: floor ? rgbHex(floor) : '#E0A96D' };
    room.objects.forEach(o => {
      const c = avgRegion(photoCanvas, o.x / W + 0.01, o.y / H + 0.01, (o.x + o.w) / W - 0.01, (o.y + o.h) / H - 0.01);
      o.color = c ? rgbHex(c) : homeType(o.type).col;
    });
  },

  /* a "receita" do cômodo: é isso que iria para o servidor. Nenhuma foto. */
  recipe(room) {
    return {
      nome: room.name, tipo: room.emoji, parede: room.colors.wall, chao: room.colors.floor, linhaChao: Math.round(room.floorY),
      moveis: room.objects.map(o => ({ tipo: o.type, x: Math.round(o.x), y: Math.round(o.y), w: Math.round(o.w), h: Math.round(o.h), cor: o.color })),
    };
  },

  /* fundo: foto no offline, cartoon no online */
  bg(sceneId) {
    const room = this.byScene(sceneId); if (!room) return getBg('casa');
    if (!isOnline() && room.photo) {
      if (this.photoCache[room.id]) return this.photoCache[room.id];
      this.loadPhoto(room);
    }
    return this.cartoon(room);
  },
  loadPhoto(room) {
    if (this.loading[room.id]) return; this.loading[room.id] = true;
    const im = new Image();
    im.onload = () => { const cv = document.createElement('canvas'); cv.width = W * DPR; cv.height = H * DPR; const g = cv.getContext('2d'); g.drawImage(im, 0, 0, cv.width, cv.height); this.photoCache[room.id] = cv; };
    im.src = room.photo;
  },
  cartoon(room) {
    if (!this.cartoonCache[room.id]) {
      const cv = document.createElement('canvas'); cv.width = W * DPR; cv.height = H * DPR;
      const g = cv.getContext('2d'); g.setTransform(DPR, 0, 0, DPR, 0, 0); this.drawCartoon(g, room); this.cartoonCache[room.id] = cv;
    }
    return this.cartoonCache[room.id];
  },
  drawCartoon(g, room) {
    const fy = room.floorY, wall = room.colors.wall, floor = room.colors.floor;
    g.fillStyle = shade(wall, 0.12); g.fillRect(0, 0, W, fy);
    for (let y = 18; y < fy - 10; y += 46) for (let x = 0; x < W + 46; x += 46) circ(g, x + ((y / 46 | 0) % 2 ? 23 : 0), y, 4, 'rgba(255,255,255,.18)');
    g.fillStyle = shade(wall, -0.18); g.fillRect(0, fy - 12, W, 12);
    g.fillStyle = shade(floor, 0.05); g.fillRect(0, fy, W, H - fy);
    g.strokeStyle = 'rgba(0,0,0,.1)'; g.lineWidth = 2;
    for (let y = fy, i = 0; y < H; y += 36, i++) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); for (let x = (i % 2) * 90; x < W; x += 180) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 36); g.stroke(); } }
    room.objects.filter(o => !homeType(o.type).privacy).sort((a, b) => (a.y + a.h) - (b.y + b.h)).forEach(o => this.drawFurniture(g, o));
  },
  drawFurniture(g, o) {
    const t = homeType(o.type), col = o.color || t.col, { x, y, w, h } = o;
    const dark = shade(col, -0.25), light = shade(col, 0.35);
    switch (o.type) {
      case 'cama':
        fr(g, x + w * 0.02, y, w * 0.96, h * 0.5, 16, dark); fr(g, x + w * 0.06, y + h * 0.06, w * 0.88, h * 0.1, 8, 'rgba(255,255,255,.15)');
        fr(g, x, y + h * 0.36, w, h * 0.42, 14, '#fff'); fr(g, x + w * 0.04, y + h * 0.28, w * 0.24, h * 0.2, 12, '#F4F1FF');
        fr(g, x + w * 0.3, y + h * 0.42, w * 0.7, h * 0.5, 14, shade(col, 0.15)); g.fillStyle = 'rgba(255,255,255,.35)';
        for (let i = 1; i < 4; i++) circ(g, x + w * 0.3 + w * 0.7 * i / 4, y + h * 0.67, Math.max(3, h * 0.03));
        g.fillStyle = dark; g.fillRect(x + w * 0.04, y + h * 0.9, 8, h * 0.1); g.fillRect(x + w * 0.96 - 8, y + h * 0.9, 8, h * 0.1);
        break;
      case 'sofa':
        fr(g, x, y, w, h * 0.6, 16, dark); fr(g, x + w * 0.05, y + h * 0.4, w * 0.9, h * 0.4, 12, col);
        fr(g, x, y + h * 0.3, w * 0.12, h * 0.6, 12, dark); fr(g, x + w * 0.88, y + h * 0.3, w * 0.12, h * 0.6, 12, dark);
        g.fillStyle = '#5A3A22'; g.fillRect(x + w * 0.08, y + h * 0.88, 6, h * 0.12); g.fillRect(x + w * 0.9, y + h * 0.88, 6, h * 0.12);
        break;
      case 'tv':
        fr(g, x, y, w, h, 8, '#2B2238'); fr(g, x + 6, y + 6, w - 12, h - 12, 5, '#3A4E8C');
        fr(g, x + 10, y + 10, (w - 20) * 0.4, (h - 20) * 0.25, 4, 'rgba(255,255,255,.15)');
        break;
      case 'mesa': case 'computador':
        fr(g, x, y + h * 0.15, w, Math.max(10, h * 0.16), 6, col);
        g.fillStyle = dark; g.fillRect(x + w * 0.08, y + h * 0.3, 7, h * 0.7); g.fillRect(x + w * 0.92 - 7, y + h * 0.3, 7, h * 0.7);
        if (o.type === 'computador') { fr(g, x + w * 0.3, y - h * 0.25, w * 0.4, h * 0.38, 4, '#2B2238'); fr(g, x + w * 0.33, y - h * 0.22, w * 0.34, h * 0.3, 3, '#7FC4FF'); }
        break;
      case 'cadeira':
        fr(g, x + w * 0.15, y, w * 0.7, h * 0.5, 8, col); fr(g, x + w * 0.1, y + h * 0.48, w * 0.8, h * 0.14, 5, dark);
        g.fillStyle = dark; g.fillRect(x + w * 0.15, y + h * 0.6, 6, h * 0.4); g.fillRect(x + w * 0.85 - 6, y + h * 0.6, 6, h * 0.4);
        break;
      case 'geladeira':
        fr(g, x, y, w, h, 10, light); g.strokeStyle = shade(col, -0.2); g.lineWidth = 3; rr(g, x, y, w, h, 10); g.stroke();
        g.beginPath(); g.moveTo(x, y + h * 0.35); g.lineTo(x + w, y + h * 0.35); g.stroke(); fr(g, x + w * 0.8, y + h * 0.12, 5, h * 0.14, 2, '#9AA5B5'); fr(g, x + w * 0.8, y + h * 0.45, 5, h * 0.2, 2, '#9AA5B5');
        break;
      case 'porta':
        fr(g, x, y, w, h, 8, shade(col, -0.1)); fr(g, x + w * 0.12, y + h * 0.08, w * 0.76, h * 0.38, 6, shade(col, 0.12)); fr(g, x + w * 0.12, y + h * 0.52, w * 0.76, h * 0.4, 6, shade(col, 0.12));
        circ(g, x + w * 0.8, y + h * 0.55, Math.max(3, w * 0.05), '#FFD34D'); break;
      case 'janela': {
        fr(g, x - 6, y - 6, w + 12, h + 12, 10, '#fff'); const gr = g.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, '#8FD3FF'); gr.addColorStop(1, '#DFF3FF'); fr(g, x, y, w, h, 6, gr);
        g.fillStyle = '#fff'; g.fillRect(x + w / 2 - 3, y, 6, h); g.fillRect(x, y + h / 2 - 3, w, 6); break;
      }
      default:
        fr(g, x, y, w, h, 14, col); g.strokeStyle = dark; g.lineWidth = 3; rr(g, x, y, w, h, 14); g.stroke();
    }
    if (!['cama', 'sofa', 'tv', 'mesa', 'cadeira', 'janela', 'geladeira', 'computador', 'porta'].includes(o.type)) {
      g.font = Math.round(clamp(Math.min(w, h) * 0.5, 18, 64)) + 'px ' + FONT; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(t.e, x + w / 2, y + h / 2 + 2);
    }
  },

  /* objetos interativos no formato do jogo */
  objects(sceneId) {
    const room = this.byScene(sceneId); if (!room) return [];
    const top = room.floorY + 20;
    const inside = this.insideOf(room.placeId);
    return room.objects.filter(o => !homeType(o.type).privacy).map(o => {
      const t = homeType(o.type);
      const sx = clamp(o.x + o.w / 2, WALK.x0, WALK.x1), sy = clamp(o.y + o.h + 14, top, WALK.y1);
      if (t.door) {
        const tgt = inside.find(r => r.id !== room.id);
        return { id: o.id, icon: '🚪', hit: [o.x, o.y, o.w, o.h], spot: [sx, sy], door: true, side: 'in', target: tgt ? this.sceneId(tgt) : null, label: tgt ? 'Entrar: ' + tgt.emoji + ' ' + tgt.name : 'Entrar' };
      }
      return { id: o.id, icon: t.e, hit: [o.x, o.y, o.w, o.h], spot: [sx, sy], act: 'home', home: true, type: o.type, rect: o };
    }).concat(this.doors(room));
  },
  /* portas automáticas para os outros cômodos do mesmo lugar */
  doors(room) {
    if (isFacade(room)) return [];
    const sib = this.insideOf(room.placeId); if (sib.length < 2) return [];
    const i = sib.indexOf(room), out = [];
    const y = clamp(WALK.y0 + 70, WALK.y0 + 30, WALK.y1 - 40);
    const prev = sib[(i - 1 + sib.length) % sib.length], next = sib[(i + 1) % sib.length];
    out.push({ id: 'door-l', icon: '🚪', hit: [6, y - 70, 70, 110], spot: [WALK.x0, y], door: true, side: 'l', target: this.sceneId(prev), label: '← ' + prev.emoji + ' ' + prev.name });
    if (next !== prev) out.push({ id: 'door-r', icon: '🚪', hit: [W - 76, y - 70, 70, 110], spot: [WALK.x1, y], door: true, side: 'r', target: this.sceneId(next), label: next.emoji + ' ' + next.name + ' →' });
    else out[0].label = '🚪 ' + prev.emoji + ' ' + prev.name;
    return out;
  },

  act(o) {
    const t = homeType(o.type);
    return {
      dur: t.dur,
      start(P) {
        if (t.fx === 'read') { P.act = 'ler'; P.actT = 0; }
        if (t.id === 'janela') { const hr = new Date().getHours(); playerSay(hr >= 6 && hr < 18 ? 'Que dia bonito! ☀️' : 'Olha a lua! 🌙', 2.4); }
        else if (t.s1) playerSay(t.s1, 1.8);
      },
      end(P) {
        if (t.fx === 'read') P.act = null;
        if (t.s2) playerSay(t.s2, 2.4);
        if (t.fx === 'toys') burst(P.x, P.y - 80, 24);
      },
    };
  },

  pose(sc, t) {
    const o = sc.obj.rect, ty = homeType(o.type), s = depthScale(sc.obj.spot[1]);
    if (ty.pose === 'lie') return { x: o.x + o.w * 0.5 + 45 * s, y: o.y + o.h * 0.45, s, rot: -Math.PI / 2, lying: true, opt: { noShadow: true } };
    if (ty.pose === 'sit') return { x: o.x + o.w / 2, y: Math.min(o.y + o.h * 0.85, H - 10), s, rot: 0, opt: { sit: true, noShadow: true } };
    return null;
  },

  drawFx(c, sc, t, pose) {
    const o = sc.obj.rect, ty = homeType(o.type), u = sc.t, cx = o.x + o.w / 2;
    c.save();
    switch (ty.fx) {
      case 'zzz': {
        const s = pose.s; fr(c, pose.x - 62 * s, pose.y - 20 * s, 66 * s, 40 * s, 14 * s, '#6EC6FF');
        for (let x = pose.x - 52 * s; x < pose.x; x += 16 * s) circ(c, x, pose.y, 4 * s, 'rgba(255,255,255,.5)');
        c.font = '800 22px ' + FONT; c.fillStyle = '#5B3FD9'; c.textAlign = 'center'; c.textBaseline = 'middle';
        for (let i = 0; i < 3; i++) { const p = (t * 0.5 + i / 3) % 1; c.globalAlpha = 1 - p; c.fillText('z', pose.x - 95 * s + p * 30 + i * 6, pose.y - 40 - p * 50); }
        break;
      }
      case 'hearts': c.font = '20px ' + FONT; c.textAlign = 'center'; for (let i = 0; i < 3; i++) { const p = (t * 0.5 + i / 3) % 1; c.globalAlpha = 1 - p; c.fillText('💜', pose.x + (i - 1) * 22, pose.y - 120 - p * 50); } break;
      case 'tv': {
        const hue = (t * 120) % 360; c.globalAlpha = 0.5; c.fillStyle = `hsl(${hue},80%,60%)`; rr(c, o.x + 4, o.y + 4, o.w - 8, o.h - 8, 6); c.fill();
        c.globalAlpha = 0.9; c.font = Math.round(clamp(o.h * 0.4, 18, 48)) + 'px ' + FONT; c.textAlign = 'center'; c.textBaseline = 'middle';
        c.fillText(['🦖', '🚀', '🐱', '🌈'][Math.floor(t / 1.2) % 4], cx + Math.sin(t * 2) * o.w * 0.2, o.y + o.h / 2); break;
      }
      case 'food': ell(c, cx, o.y + o.h * 0.18, 26, 8, 0, '#fff'); c.font = '30px ' + FONT; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(u < ty.dur * 0.6 ? '🍝' : '🍰', cx, o.y + o.h * 0.18 - 14); break;
      case 'fridge': { const k = Math.min(1, u / 1.5); c.font = '34px ' + FONT; c.textAlign = 'center'; c.textBaseline = 'middle'; c.globalAlpha = Math.min(1, u * 2); c.fillText('🍎', cx, o.y + o.h * 0.4 - k * 60); break; }
      case 'steam': {
        c.font = '30px ' + FONT; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(u < ty.dur * 0.7 ? '🍳' : '🥞', cx, o.y + 6);
        for (let i = 0; i < 4; i++) { const p = (t * 0.6 + i / 4) % 1; c.globalAlpha = 0.6 * (1 - p); circ(c, cx + Math.sin(p * 8 + i) * 10, o.y - 14 - p * 70, 8 + p * 10, '#fff'); }
        break;
      }
      case 'bubbles': case 'bath': {
        const bx = ty.fx === 'bath' ? pose.x : cx, by = ty.fx === 'bath' ? pose.y - 60 : o.y + o.h * 0.3;
        c.strokeStyle = 'rgba(120,190,255,.9)'; c.lineWidth = 2;
        for (let i = 0; i < 7; i++) { const p = (t * 0.5 + i / 7) % 1; c.globalAlpha = 1 - p; c.beginPath(); c.arc(bx + Math.sin(i * 2 + p * 5) * 30, by - p * 80, 5 + (i % 3) * 3, 0, TAU); c.stroke(); }
        if (ty.fx === 'bath') { c.globalAlpha = 0.8; for (let i = 0; i < 8; i++) { const p = (t * 1.5 + i / 8) % 1; circ(c, pose.x - 30 + i * 8, pose.y - 150 + p * 90, 2.5, '#5BC0FF'); } }
        break;
      }
      case 'toys': c.font = '30px ' + FONT; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('🧸', pose.x + 40 * pose.s, pose.y - 30 - Math.abs(Math.sin(t * 5)) * 25); break;
      case 'screen': c.globalAlpha = 0.35; fr(c, o.x + 4, o.y + 4, o.w - 8, o.h - 8, 6, '#7FC4FF'); c.globalAlpha = 1; c.font = '28px ' + FONT; c.textAlign = 'center'; c.fillText(u > ty.dur * 0.7 ? '✅' : '✏️', pose.x, pose.y - 150 * pose.s); break;
      case 'sky': { const hr = new Date().getHours(), day = hr >= 6 && hr < 18; c.globalAlpha = 0.45 + Math.sin(t * 3) * 0.1; fr(c, o.x, o.y, o.w, o.h, 8, day ? '#FFE27A' : '#2B2F6B'); c.globalAlpha = 1; c.font = '34px ' + FONT; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(day ? '☀️' : '🌙', cx, o.y + o.h / 2); break; }
      case 'car': {
        c.font = '30px ' + FONT; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('🚗', pose.x + 46 * pose.s + Math.sin(t * 10) * 2, pose.y - 24);
        for (let i = 0; i < 4; i++) { const p = (t * 0.9 + i / 4) % 1; c.globalAlpha = 0.5 * (1 - p); circ(c, pose.x + 20 * pose.s - p * 40, pose.y - 18 - p * 10, 6 + p * 8, '#C9D1DD'); }
        break;
      }
      case 'water': c.fillStyle = '#5BC0FF'; for (let i = 0; i < 6; i++) { const p = (t * 1.6 + i / 6) % 1; circ(c, pose.x + 20 + (cx - pose.x - 20) * p, pose.y - 50 + (o.y + o.h * 0.3 - pose.y + 50) * p - Math.sin(p * Math.PI) * 30, 3, '#5BC0FF'); } break;
    }
    c.restore();
  },
};
