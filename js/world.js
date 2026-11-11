/* Mapa do mundo: os lugares do jogo + os lugares criados pela família (Minha casa, Casa da vó...). */
'use strict';

const PLACE_ICONS = ['🏡', '🏠', '👵', '👴', '🏖️', '🏢', '🌳', '⛺'];
const PLACE_COLORS = ['#FF8FB8', '#7C5CFF', '#5BC0FF', '#5CC46B', '#FF9F43', '#E2464A'];
const MAX_PLACES = 6;

const World = {
  cv: null, g: null, walk: null, hover: null,
  /* 10 terrenos: 2 ruas com 5 lotes cada */
  SLOTS: [[105, 250], [295, 250], [485, 250], [675, 250], [865, 250], [105, 520], [295, 520], [485, 520], [675, 520], [865, 520]],
  BUILTIN: { casa: 0, escola: 1, parque: 3, castelo: 4 },
  USER_SLOTS: [2, 5, 6, 7, 8, 9],

  init() {
    this.cv = $('#mapCanvas'); this.g = setupCanvas(this.cv, W, H);
    this.cv.addEventListener('pointerdown', e => {
      const r = this.cv.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width * W, y = (e.clientY - r.top) / r.height * H;
      const it = this.items().find(i => x > i.x - 80 && x < i.x + 80 && y > i.y - 150 && y < i.y + 40);
      if (it) this.choose(it);
    });
    $('#mapBack').addEventListener('click', () => startGame());
  },
  items() {
    const out = SCENES.map(s => ({ kind: 'builtin', id: s.id, name: s.name, emoji: s.emoji, slot: this.BUILTIN[s.id] }));
    Home.places().slice(0, MAX_PLACES).forEach((p, i) => out.push({ kind: 'place', id: p.id, name: p.name, emoji: p.icon, color: p.color, place: p, slot: this.USER_SLOTS[i] }));
    const n = Math.min(Home.places().length, MAX_PLACES);
    if (n < MAX_PLACES) out.push({ kind: 'new', id: 'new', name: 'Novo lugar', emoji: '＋', slot: this.USER_SLOTS[n] });
    out.forEach(i => { i.x = this.SLOTS[i.slot][0]; i.y = this.SLOTS[i.slot][1]; });
    return out;
  },
  currentItem() {
    const sc = App.profile ? App.profile.scene : 'casa'; const pl = Home.placeOfScene(sc);
    return this.items().find(i => pl ? (i.kind === 'place' && i.id === pl.id) : (i.kind === 'builtin' && i.id === sc)) || this.items()[0];
  },
  open() { this.walk = null; show('s-map'); },
  choose(it) {
    Sound.tap();
    if (it.kind === 'new') { parentGate(() => openPlaceForm(null)); return; }
    const from = this.currentItem();
    this.walk = { it, t: 0, x0: from.x + 70, y0: from.y + 40, x1: it.x + 70, y1: it.y + 40 };
  },
  arrive(it) {
    this.walk = null;
    if (it.kind === 'builtin') { App.profile.scene = it.id; Store.save(); startGame(); return; }
    const rooms = Home.roomsOf(it.id), fac = Home.facadeOf(it.id);
    if (!rooms.length) {
      openSheet(it.emoji + ' ' + it.name, body => {
        body.innerHTML = '<p>Esse lugar ainda não tem foto. Peça para um adulto fotografar a fachada!</p>';
        const b = document.createElement('button'); b.className = 'btn pink'; b.textContent = '📷 Fotografar a fachada (adulto)';
        b.addEventListener('click', () => parentGate(() => { closeSheet(); RoomEd.open(null, it.id, 'fachada'); })); body.appendChild(b);
      });
      return;
    }
    /* chegando pelo mapa: começa na frente da casa */
    const last = it.place.lastRoom && rooms.find(r => r.id === it.place.lastRoom);
    App.profile.scene = Home.sceneId(fac || last || rooms[0]); Store.save(); startGame();
  },

  /* ---------- desenho ---------- */
  drawGround(g) {
    const sky = g.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, '#A8E38A'); sky.addColorStop(1, '#86CF6A'); g.fillStyle = sky; g.fillRect(0, 0, W, H);
    const r = rng(11);
    for (let i = 0; i < 160; i++) { g.strokeStyle = 'rgba(40,120,40,.22)'; g.lineWidth = 2; const x = r() * W, y = r() * H; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 2, y - 7); g.stroke(); }
    const road = (y) => { fr(g, -10, y, W + 20, 34, 12, '#9B95B5'); g.setLineDash([22, 18]); g.strokeStyle = '#fff'; g.lineWidth = 3; g.beginPath(); g.moveTo(0, y + 17); g.lineTo(W, y + 17); g.stroke(); g.setLineDash([]); };
    fr(g, 563, 284, 34, 252, 0, '#9B95B5'); g.setLineDash([18, 16]); g.strokeStyle = '#fff'; g.lineWidth = 3; g.beginPath(); g.moveTo(580, 300); g.lineTo(580, 530); g.stroke(); g.setLineDash([]);
    road(266); road(536);
    const tr = rng(5);
    for (let i = 0; i < 14; i++) {
      const x = 20 + tr() * (W - 40), y = 320 + tr() * 140; if (Math.abs(x - 580) < 50) continue;
      g.fillStyle = '#8E5E33'; g.fillRect(x - 3, y, 6, 14); circ(g, x, y - 4, 14, '#4FAE58'); circ(g, x - 7, y + 2, 9, '#5CC46B');
    }
    const fl = rng(9); for (let i = 0; i < 40; i++) circ(g, fl() * W, 300 + fl() * 200, 3.5, ['#FF8FB8', '#FFD34D', '#fff'][i % 3]);
  },
  photos: {},
  facadeImg(room) {
    const c = this.photos[room.id]; if (c && c.src === room.photo) return c.im.complete ? c.im : null;
    const im = new Image(); im.src = room.photo; this.photos[room.id] = { src: room.photo, im }; return null;
  },
  drawPhotoHouse(g, x, y, im, col, icon) {
    g.fillStyle = col; g.beginPath(); g.moveTo(x - 70, y - 104); g.lineTo(x, y - 146); g.lineTo(x + 70, y - 104); g.closePath(); g.fill();
    fr(g, x - 64, y - 108, 128, 108, 12, '#fff');
    g.save(); rr(g, x - 59, y - 103, 118, 98, 9); g.clip();
    const s = Math.max(118 / im.width, 98 / im.height), w = im.width * s, h = im.height * s; g.drawImage(im, x - w / 2, y - 54 - h / 2, w, h);
    g.restore();
    g.font = '24px ' + FONT; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(icon, x, y - 118);
  },
  drawHouse(g, x, y, col, icon, wall) {
    fr(g, x - 52, y - 82, 104, 82, 8, wall || '#FFF6EA'); g.strokeStyle = 'rgba(0,0,0,.08)'; g.lineWidth = 2; rr(g, x - 52, y - 82, 104, 82, 8); g.stroke();
    g.fillStyle = col; g.beginPath(); g.moveTo(x - 64, y - 78); g.lineTo(x, y - 132); g.lineTo(x + 64, y - 78); g.closePath(); g.fill();
    fr(g, x - 14, y - 42, 28, 42, 6, shade(col, -0.2)); circ(g, x + 7, y - 20, 2.5, '#FFD34D');
    fr(g, x - 44, y - 66, 22, 20, 4, '#9FD8FF'); fr(g, x + 22, y - 66, 22, 20, 4, '#9FD8FF');
    g.font = '30px ' + FONT; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(icon, x, y - 98);
  },
  drawBuiltin(g, it, t) {
    const { x, y } = it;
    if (it.id === 'casa') this.drawHouse(g, x, y, '#7C5CFF', '⭐');
    if (it.id === 'escola') {
      fr(g, x - 66, y - 90, 132, 90, 8, '#FFE9A8'); g.fillStyle = '#E2464A'; g.beginPath(); g.moveTo(x - 74, y - 86); g.lineTo(x, y - 122); g.lineTo(x + 74, y - 86); g.closePath(); g.fill();
      for (let i = 0; i < 4; i++) fr(g, x - 56 + i * 30, y - 72, 20, 18, 3, '#9FD8FF'); fr(g, x - 14, y - 40, 28, 40, 4, '#B07A45');
      g.strokeStyle = '#6B6380'; g.lineWidth = 3; g.beginPath(); g.moveTo(x, y - 122); g.lineTo(x, y - 150); g.stroke();
      g.fillStyle = '#5CC46B'; g.beginPath(); g.moveTo(x, y - 150); g.lineTo(x + 24 + Math.sin(t * 4) * 3, y - 143); g.lineTo(x, y - 136); g.fill();
    }
    if (it.id === 'parque') {
      circ(g, x - 34, y - 60, 30, '#4FAE58'); circ(g, x - 50, y - 40, 22, '#5CC46B'); g.fillStyle = '#8E5E33'; g.fillRect(x - 40, y - 30, 10, 30);
      g.strokeStyle = '#5B3FD9'; g.lineWidth = 4; g.beginPath(); g.moveTo(x + 10, y); g.lineTo(x + 10, y - 70); g.moveTo(x + 26, y); g.lineTo(x + 26, y - 70); g.stroke();
      g.strokeStyle = '#FF6FA8'; g.lineWidth = 10; g.beginPath(); g.moveTo(x + 30, y - 68); g.quadraticCurveTo(x + 58, y - 56, x + 64, y - 4); g.stroke();
    }
    if (it.id === 'castelo') {
      fr(g, x - 50, y - 80, 100, 80, 4, '#A9A2C8'); fr(g, x - 66, y - 112, 30, 112, 4, '#9790B8'); fr(g, x + 36, y - 112, 30, 112, 4, '#9790B8');
      g.fillStyle = '#D9435B'; [[x - 51, y - 112], [x + 51, y - 112]].forEach(([a, b]) => { g.beginPath(); g.moveTo(a - 19, b); g.lineTo(a, b - 26); g.lineTo(a + 19, b); g.closePath(); g.fill(); });
      fr(g, x - 16, y - 44, 32, 44, 16, '#6E6595'); g.fillStyle = '#FFD34D'; starPath(g, x, y - 62, 5, 9, 4); g.fill();
    }
  },
  label(g, it, sel) {
    const txt = (it.kind === 'new' ? '' : it.emoji + ' ') + it.name;
    g.font = '800 17px ' + FONT; const w = g.measureText(txt).width + 22;
    fr(g, it.x - w / 2, it.y + 4, w, 30, 15, sel ? '#5B3FD9' : 'rgba(255,255,255,.95)');
    g.fillStyle = sel ? '#fff' : '#2B2238'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(txt, it.x, it.y + 20);
  },
  render(t, dt) {
    const g = this.g; g.setTransform(DPR, 0, 0, DPR, 0, 0);
    if (!this.bg) { this.bg = document.createElement('canvas'); this.bg.width = W * DPR; this.bg.height = H * DPR; const bg = this.bg.getContext('2d'); bg.setTransform(DPR, 0, 0, DPR, 0, 0); this.drawGround(bg); }
    g.drawImage(this.bg, 0, 0, W, H);
    for (let i = 0; i < 3; i++) { const x = ((t * 14 + i * 360) % (W + 200)) - 100; g.fillStyle = 'rgba(255,255,255,.85)'; [[0, 0, 22], [24, -8, 26], [50, 0, 20]].forEach(([a, b, r]) => circ(g, x + a, 60 + i * 30 + b, r)); }
    const cur = this.currentItem();
    this.items().forEach(it => {
      if (it.kind === 'builtin') this.drawBuiltin(g, it, t);
      else if (it.kind === 'place') {
        const fac = Home.facadeOf(it.id), im = fac && fac.photo && !isOnline() ? this.facadeImg(fac) : null;
        if (im) this.drawPhotoHouse(g, it.x, it.y, im, it.color, it.emoji);
        else this.drawHouse(g, it.x, it.y, it.color, it.emoji, fac && fac.colors ? shade(fac.colors.wall, 0.1) : null);
      }
      else {
        g.setLineDash([10, 8]); g.strokeStyle = 'rgba(255,255,255,.95)'; g.lineWidth = 4; rr(g, it.x - 56, it.y - 110, 112, 106, 16); g.stroke(); g.setLineDash([]);
        circ(g, it.x, it.y - 58, 26 + Math.sin(t * 3) * 2, 'rgba(255,255,255,.9)'); g.fillStyle = '#5B3FD9'; g.font = '800 34px ' + FONT; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('+', it.x, it.y - 56);
      }
      this.label(g, it, it === cur || (cur && it.kind === cur.kind && it.id === cur.id));
    });
    /* personagem no mapa */
    let px = cur.x + 70, py = cur.y + 40, moving = false;
    if (this.walk) {
      const w = this.walk; w.t += dt / 1.0; const k = Math.min(1, w.t);
      const e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      px = w.x0 + (w.x1 - w.x0) * e; py = w.y0 + (w.y1 - w.y0) * e; moving = true;
      if (k >= 1) { const it = w.it; setTimeout(() => this.arrive(it), 0); this.walk = null; }
    }
    if (App.profile) drawChar(g, currentCostume(), getPlayerFace(), px, py, 0.62, t, moving);
  },
};

/* ---------- criar / editar lugar (área dos pais) ---------- */
function openPlaceForm(place) {
  const draft = place ? Object.assign({}, place) : { id: uid(), name: '', icon: '👵', color: PLACE_COLORS[Home.places().length % PLACE_COLORS.length], created: Date.now() };
  openSheet(place ? 'Editar lugar' : 'Novo lugar no mapa', body => {
    const lab = document.createElement('label'); lab.className = 'fl'; lab.setAttribute('for', 'placeName'); lab.textContent = 'Nome do lugar'; body.appendChild(lab);
    const inp = document.createElement('input'); inp.type = 'text'; inp.id = 'placeName'; inp.maxLength = 20; inp.placeholder = 'Ex.: Casa da vó'; inp.value = draft.name; body.appendChild(inp);
    const l2 = document.createElement('label'); l2.className = 'fl'; l2.textContent = 'Ícone'; body.appendChild(l2);
    const icons = document.createElement('div'); icons.className = 'toggles';
    PLACE_ICONS.forEach(ic => { const b = document.createElement('button'); b.type = 'button'; b.className = 'tg big-emoji' + (draft.icon === ic ? ' sel' : ''); b.textContent = ic; b.addEventListener('click', () => { draft.icon = ic; icons.querySelectorAll('.tg').forEach(x => x.classList.toggle('sel', x === b)); }); icons.appendChild(b); });
    body.appendChild(icons);
    const l3 = document.createElement('label'); l3.className = 'fl'; l3.textContent = 'Cor do telhado'; body.appendChild(l3);
    const cols = document.createElement('div'); cols.className = 'swatches';
    PLACE_COLORS.forEach(c => { const b = document.createElement('button'); b.type = 'button'; b.className = 'sw' + (draft.color === c ? ' sel' : ''); b.style.background = c; b.setAttribute('aria-label', 'cor'); b.addEventListener('click', () => { draft.color = c; cols.querySelectorAll('.sw').forEach(x => x.classList.toggle('sel', x === b)); }); cols.appendChild(b); });
    body.appendChild(cols);
    const p = document.createElement('p'); p.className = 'small'; p.style.marginTop = '14px'; p.textContent = '🔒 A foto da fachada cria a casa no mapa. Ela fica só neste aparelho (dá para borrar número e placa). No modo online aparece só uma casinha desenhada.'; body.appendChild(p);
    const row = document.createElement('div'); row.className = 'row'; row.style.marginTop = '8px';
    const ok = document.createElement('button'); ok.className = 'btn pink'; ok.textContent = place ? 'Salvar' : '📷 Criar e fotografar a fachada →';
    ok.addEventListener('click', () => {
      draft.name = inp.value.trim(); if (!draft.name) { inp.focus(); toast('Dê um nome para o lugar 🙂'); return; }
      if (place) { Object.assign(place, draft); Store.save(); closeSheet(); toast('Lugar salvo ✅'); World.bg = null; return; }
      Store.data.places.push(draft); Store.save(); closeSheet(); RoomEd.open(null, draft.id, 'fachada');
    });
    row.appendChild(ok); body.appendChild(row);
    setTimeout(() => inp.focus(), 60);
  });
}
