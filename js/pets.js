/* Bichinhos de estimação: a criança adota, dá nome e brinca com eles na casa da família. */
'use strict';

const PET_KINDS = [
  { id: 'cachorro', n: 'Cachorro', e: '🐶', colors: ['#D9A066', '#F4F1EA', '#3B2A20', '#E8C07A'], sound: 'Au au!' },
  { id: 'gato', n: 'Gato', e: '🐱', colors: ['#FF9F43', '#9AA5B5', '#2B2238', '#F4F1EA'], sound: 'Miau!' },
  { id: 'passaro', n: 'Pássaro', e: '🐦', colors: ['#FFD34D', '#5BC0FF', '#5CC46B', '#E2464A'], sound: 'Piu piu!' },
  { id: 'tartaruga', n: 'Tartaruga', e: '🐢', colors: ['#5CC46B', '#8EBF5A', '#4FAE58', '#A0C85A'], sound: '...' },
];
function petKind(id) { return PET_KINDS.find(k => k.id === id) || PET_KINDS[0]; }

const Pets = {
  live: [],     // bichinhos presentes no cômodo atual
  list() { return (App.profile && App.profile.pets) || []; },
  /* os bichinhos aparecem nos lugares da família (Minha casa) e na Casa do jogo */
  showHere(scene) { return scene === 'casa' || !!Home.byScene(scene); },
  enter(scene) {
    this.live = [];
    if (!this.showHere(scene)) return;
    this.list().forEach((p, i) => {
      const r = randWalk();
      this.live.push({ pet: p, x: r.x, y: r.y, tx: r.x, ty: r.y, wait: 1 + i, moving: false, dir: 1, happy: 0, follow: 0, say: null, sayT: 0, eat: 0, play: 0, ph: Math.random() * 6, fly: 0 });
    });
  },
  at(x, y) {
    return this.live.find(l => Math.hypot(x - l.x, (y - (l.y - 20 - (l.fly || 0))) * 1.2) < 46);
  },
  tap(l) {
    const P = game.player;
    P.act = null; P.goal = { pet: l }; P.tx = clamp(l.x + (P.x < l.x ? -55 : 55), WALK.x0, WALK.x1); P.ty = clamp(l.y, WALK.y0, WALK.y1);
    l.wait = Math.max(l.wait, 2.5); game.marker = { x: P.tx, y: P.ty, t: 0 };
  },
  /* menu de ações ao chegar perto */
  menu(l) {
    const k = petKind(l.pet.kind);
    openSheet(k.e + ' ' + l.pet.name, body => {
      const g = document.createElement('div'); g.className = 'hobs';
      [['carinho', '💛', 'Fazer carinho'], ['comida', k.id === 'passaro' ? '🌾' : k.id === 'tartaruga' ? '🥬' : '🦴', 'Dar comida'], ['brincar', k.id === 'gato' ? '🧶' : k.id === 'passaro' ? '🎵' : '⚾', 'Brincar'], ['passear', '🐾', 'Vem comigo!']].forEach(([a, e, n]) => {
        const b = document.createElement('button'); b.type = 'button'; b.className = 'hob'; b.innerHTML = '<b>' + e + '</b>' + n;
        b.addEventListener('click', () => { closeSheet(); this.action(l, a); }); g.appendChild(b);
      });
      body.appendChild(g);
    });
  },
  action(l, a) {
    const k = petKind(l.pet.kind), P = game.player; l.dir = P.x > l.x ? 1 : -1; l.say = k.sound; l.sayT = 1.8;
    if (a === 'carinho') { l.happy = 3; l.wait = 3; playerSay(pick(['Que fofinho! 💛', 'Te amo, ' + l.pet.name + '!', 'Quem é o bichinho mais lindo?']), 2.4); burst(l.x, l.y - 30, 12, false, ['#FFD34D', '#FF8FB8']); }
    if (a === 'comida') { l.eat = 3; l.wait = 3.2; playerSay('Hora de comer, ' + l.pet.name + '! 🍽️', 2.4); }
    if (a === 'brincar') { l.play = 3.5; l.happy = 3.5; l.wait = 3.6; playerSay(pick(['Pega!', 'Vamos brincar! 🎉', 'Uhuu!']), 2.2); }
    if (a === 'passear') { l.follow = 25; l.happy = 2; playerSay('Vem comigo, ' + l.pet.name + '! 🐾', 2.2); }
    Sound.pop(); if (k.id === 'cachorro') Sound.bark();
    const key = 'pet:' + l.pet.id + ':' + a;
    if (!game.used.has(key)) { game.used.add(key); setTimeout(() => giveStars(1, l.x, l.y - 80), 500); }
  },
  update(dt) {
    const P = game.player;
    this.live.forEach(l => {
      l.moving = false; l.ph += dt;
      if (l.happy > 0) l.happy -= dt; if (l.eat > 0) l.eat -= dt; if (l.play > 0) l.play -= dt;
      if (l.sayT > 0) { l.sayT -= dt; if (l.sayT <= 0) l.say = null; }
      const speed = l.pet.kind === 'tartaruga' ? 40 : l.pet.kind === 'passaro' ? 150 : 110;
      l.fly = l.pet.kind === 'passaro' ? (l.moving || l.follow > 0 ? 40 : 0) : 0;
      if (l.follow > 0) {
        l.follow -= dt;
        const tx = clamp(P.x + (l.x < P.x ? -60 : 60), WALK.x0, WALK.x1), ty = clamp(P.y + 6, WALK.y0, WALK.y1);
        if (Math.hypot(tx - l.x, ty - l.y) > 12) { const ox = l.x; l.moving = true; moveToward(l, tx, ty, Math.max(speed, 150), dt); if (Math.abs(l.x - ox) > .1) l.dir = l.x > ox ? 1 : -1; }
        return;
      }
      if (l.wait > 0) { l.wait -= dt; return; }
      const ox = l.x; l.moving = true;
      if (moveToward(l, l.tx, l.ty, speed, dt)) {
        l.moving = false; l.wait = 1.5 + Math.random() * 3; const r = randWalk(); l.tx = r.x; l.ty = r.y;
        if (Math.random() < 0.2) { l.say = petKind(l.pet.kind).sound; l.sayT = 1.5; }
      }
      if (Math.abs(l.x - ox) > .1) l.dir = l.x > ox ? 1 : -1;
    });
  },
  draw(items, c, t) {
    this.live.forEach(l => items.push({ y: l.y, draw: () => {
      const s = depthScale(l.y);
      drawPet(c, l.pet, l.x, l.y, s, t + l.ph, l.moving, l.dir, l.happy > 0, l.fly, l.play > 0);
      if (l.eat > 0) { const e = l.pet.kind === 'passaro' ? '🌾' : l.pet.kind === 'tartaruga' ? '🥬' : l.pet.kind === 'gato' ? '🐟' : '🦴'; ell(c, l.x + 30 * l.dir * s, l.y - 2, 16 * s, 5 * s, 0, '#E2464A'); c.font = Math.round(20 * s) + 'px ' + FONT; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(e, l.x + 30 * l.dir * s, l.y - 10 * s); }
      if (l.play > 0) { const toy = l.pet.kind === 'gato' ? '🧶' : l.pet.kind === 'passaro' ? '🎵' : '⚾'; c.font = Math.round(22 * s) + 'px ' + FONT; c.textAlign = 'center'; c.fillText(toy, l.x + Math.sin(t * 6) * 30, l.y - 40 - Math.abs(Math.sin(t * 6)) * 40); }
      nameTag(c, l.x, l.y + 6, petKind(l.pet.kind).e + ' ' + l.pet.name, false);
    } }));
  },
  bubbles(c, t) {
    this.live.forEach(l => {
      if (l.say) bubble(c, l.x, l.y - 70 - l.fly, l.say);
      if (l.happy > 0) { c.font = '20px ' + FONT; c.textAlign = 'center'; for (let i = 0; i < 2; i++) { const p = (t * .7 + i / 2) % 1; c.globalAlpha = 1 - p; c.fillText('💛', l.x + (i ? 16 : -14), l.y - 60 - l.fly - p * 40); } c.globalAlpha = 1; }
    });
  },
};

/* ---------- desenho dos bichinhos ---------- */
function drawPet(c, pet, x, y, s, t, moving, dir, happy, fly, playing) {
  const col = pet.color || petKind(pet.kind).colors[0], dark = shade(col, -0.3), light = shade(col, 0.45);
  c.save(); c.translate(x, y); c.scale(s * dir, s);
  ell(c, 0, 0, 22, 6, 0, 'rgba(30,20,60,.16)');
  const bob = moving ? Math.abs(Math.sin(t * 14)) * 2 : 0, leg = moving ? Math.sin(t * 14) * 4 : 0;
  if (pet.kind === 'cachorro') { c.restore(); drawDog(c, x, y - (fly || 0), s * 0.95, t, moving, dir, happy, col); return; }
  c.translate(0, -bob - (fly || 0));
  if (pet.kind === 'gato') {
    const wag = Math.sin(t * (happy ? 10 : 3)) * 0.4;
    [[-14, leg], [-7, -leg], [7, leg], [14, -leg]].forEach(([lx, o]) => fr(c, lx - 2.5 + o * .5, -15, 5, 15, 2.5, dark));
    c.save(); c.translate(-18, -22); c.rotate(-1.1 + wag); c.strokeStyle = col; c.lineWidth = 6; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(-4, -16, 4, -26); c.stroke(); c.restore();
    ell(c, 0, -21, 20, 10, 0, col); ell(c, -4, -18, 9, 5, 0, light);
    circ(c, 18, -33, 12, col);
    c.fillStyle = col; [[10, -42], [24, -42]].forEach(([ex, ey]) => { c.beginPath(); c.moveTo(ex - 5, ey + 4); c.lineTo(ex, ey - 9); c.lineTo(ex + 5, ey + 4); c.fill(); });
    c.fillStyle = '#FF8FB8'; [[10, -41], [24, -41]].forEach(([ex, ey]) => { c.beginPath(); c.moveTo(ex - 2.5, ey + 3); c.lineTo(ex, ey - 4); c.lineTo(ex + 2.5, ey + 3); c.fill(); });
    if (happy) { c.strokeStyle = '#2B2238'; c.lineWidth = 1.8; c.beginPath(); c.arc(14, -34, 2.6, Math.PI, 0); c.stroke(); c.beginPath(); c.arc(23, -34, 2.6, Math.PI, 0); c.stroke(); }
    else { circ(c, 14, -34, 2.3, '#2B2238'); circ(c, 23, -34, 2.3, '#2B2238'); }
    circ(c, 19, -29, 1.8, '#FF6F8A');
    c.strokeStyle = 'rgba(43,34,56,.5)'; c.lineWidth = 1; [[-1, -29], [1, -27]].forEach(([dx, dy]) => { c.beginPath(); c.moveTo(24, dy); c.lineTo(34, dy + dx * 3); c.stroke(); });
  } else if (pet.kind === 'passaro') {
    const flap = Math.sin(t * (fly ? 22 : 4)) * (fly ? 0.9 : 0.2);
    if (!fly) { c.strokeStyle = '#FF9F43'; c.lineWidth = 2; c.beginPath(); c.moveTo(-3, -10); c.lineTo(-3, 0); c.moveTo(3, -10); c.lineTo(3, 0); c.stroke(); }
    c.fillStyle = dark; c.beginPath(); c.moveTo(-12, -18); c.lineTo(-24, -24); c.lineTo(-22, -12); c.closePath(); c.fill();
    ell(c, 0, -18, 13, 11, 0, col); ell(c, 2, -14, 7, 6, 0, light);
    c.save(); c.translate(-2, -20); c.rotate(-0.3 - flap); ell(c, -4, -2, 11, 6, -0.4, dark); c.restore();
    circ(c, 11, -29, 8, col); circ(c, 14, -31, 2, '#2B2238');
    c.fillStyle = '#FF9F43'; c.beginPath(); c.moveTo(18, -30); c.lineTo(25, -28); c.lineTo(18, -26); c.closePath(); c.fill();
    c.fillStyle = dark; c.beginPath(); c.moveTo(8, -36); c.lineTo(10, -42); c.lineTo(13, -36); c.fill();
  } else {
    const lg = moving ? Math.sin(t * 6) * 2 : 0;
    [[-12, lg], [12, -lg]].forEach(([lx, o]) => ell(c, lx + o, -4, 6, 4, 0, '#8EBF5A'));
    c.save(); c.translate(0, -12);
    ell(c, 0, 0, 22, 14, 0, dark);
    c.fillStyle = col; c.beginPath(); c.ellipse(0, -2, 20, 13, 0, Math.PI, 0); c.fill();
    c.strokeStyle = shade(col, -0.45); c.lineWidth = 1.6;
    [[-10, -6], [0, -9], [10, -6]].forEach(([hx, hy]) => { c.beginPath(); for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; c.lineTo(hx + Math.cos(a) * 5, hy + Math.sin(a) * 4); } c.closePath(); c.stroke(); });
    c.restore();
    const peek = playing || happy ? 4 : 0;
    ell(c, 24 + peek, -14, 8, 7, 0, '#8EBF5A'); circ(c, 27 + peek, -16, 1.8, '#2B2238');
    if (happy) { c.strokeStyle = '#2B2238'; c.lineWidth = 1.2; c.beginPath(); c.arc(25 + peek, -12, 2.5, 0.2, Math.PI - 0.2); c.stroke(); }
    ell(c, -22, -10, 4, 3, 0, '#8EBF5A');
  }
  c.restore();
}
/* coleira com a cor escolhida no cachorro (reaproveita o desenho do Bolinha) */
function recolorHint(c, x, y, s, col, dir) {
  c.save(); c.translate(x, y); c.scale(s * 0.95 * dir, s * 0.95); fr(c, 11, -30, 11, 4, 2, col); circ(c, 16, -24, 2.2, '#FFD34D'); c.restore();
}

/* ---------- adotar ---------- */
function openPetAdopt(edit) {
  const draft = edit ? Object.assign({}, edit) : { id: uid(), kind: 'cachorro', name: '', color: PET_KINDS[0].colors[0] };
  const prev = document.createElement('canvas'); const pg = setupCanvas(prev, 200, 140);
  let raf = 0, t0 = performance.now();
  const loopPrev = now => { const t = (now - t0) / 1000; pg.setTransform(DPR, 0, 0, DPR, 0, 0); pg.clearRect(0, 0, 200, 140); drawPet(pg, draft, 100, 120, 1.7, t, false, 1, true, 0, false); if ($('#sheet').classList.contains('open')) raf = requestAnimationFrame(loopPrev); };
  openSheet(edit ? 'Editar bichinho' : 'Adotar um bichinho 🐾', body => {
    prev.className = 'pet-prev'; body.appendChild(prev);
    const l1 = document.createElement('label'); l1.className = 'fl'; l1.textContent = 'Qual bichinho?'; body.appendChild(l1);
    const kinds = document.createElement('div'); kinds.className = 'hobs';
    PET_KINDS.forEach(k => { const b = document.createElement('button'); b.type = 'button'; b.className = 'hob' + (draft.kind === k.id ? ' sel' : ''); b.innerHTML = '<b>' + k.e + '</b>' + k.n;
      b.addEventListener('click', () => { draft.kind = k.id; draft.color = k.colors[0]; kinds.querySelectorAll('.hob').forEach(x => x.classList.toggle('sel', x === b)); buildCols(); Sound.tap(); }); kinds.appendChild(b); });
    body.appendChild(kinds);
    const l2 = document.createElement('label'); l2.className = 'fl'; l2.textContent = 'Cor'; body.appendChild(l2);
    const cols = document.createElement('div'); cols.className = 'swatches'; body.appendChild(cols);
    const buildCols = () => { cols.innerHTML = ''; petKind(draft.kind).colors.forEach(cl => { const b = document.createElement('button'); b.type = 'button'; b.className = 'sw' + (draft.color === cl ? ' sel' : ''); b.style.background = cl; b.setAttribute('aria-label', 'cor'); b.addEventListener('click', () => { draft.color = cl; buildCols(); }); cols.appendChild(b); }); };
    buildCols();
    const l3 = document.createElement('label'); l3.className = 'fl'; l3.setAttribute('for', 'petName'); l3.textContent = 'Nome do bichinho'; body.appendChild(l3);
    const inp = document.createElement('input'); inp.type = 'text'; inp.id = 'petName'; inp.maxLength = 14; inp.placeholder = 'Ex.: Pipoca'; inp.value = draft.name; body.appendChild(inp);
    const ok = document.createElement('button'); ok.className = 'btn pink'; ok.style.marginTop = '14px'; ok.textContent = edit ? 'Salvar' : '💛 Adotar';
    ok.addEventListener('click', () => {
      draft.name = inp.value.trim(); if (!draft.name) { inp.focus(); toast('Dê um nome para o bichinho 🙂'); return; }
      const p = App.profile; p.pets = p.pets || [];
      if (edit) Object.assign(edit, draft); else p.pets.push(draft);
      Store.save(); closeSheet(); Sound.unlock();
      toast(edit ? 'Bichinho salvo ✅' : petKind(draft.kind).e + ' ' + draft.name + ' agora é seu!');
      Pets.enter(game.scene);
      if (!Pets.showHere(game.scene)) toast(draft.name + ' está esperando você em casa 🏡');
      else { const l = Pets.live.find(x => x.pet.id === draft.id); if (l) { l.x = clamp(game.player.x + 70, WALK.x0, WALK.x1); l.y = game.player.y; l.happy = 3; l.say = petKind(draft.kind).sound; l.sayT = 2; } }
    });
    body.appendChild(ok);
    const list = (App.profile.pets || []).filter(x => !edit || x.id !== edit.id);
    if (!edit && list.length) {
      const h = document.createElement('h3'); h.className = 'sub'; h.textContent = 'Meus bichinhos'; body.appendChild(h);
      list.forEach(pt => { const row = document.createElement('div'); row.className = 'prow';
        const info = document.createElement('div'); info.className = 'pinfo'; info.textContent = petKind(pt.kind).e + ' ' + pt.name;
        const e = document.createElement('button'); e.className = 'btn small alt'; e.textContent = 'Editar'; e.addEventListener('click', () => openPetAdopt(pt));
        const d = document.createElement('button'); d.className = 'btn small danger'; d.textContent = 'Tirar'; d.addEventListener('click', () => { if (!d.classList.contains('armed')) { d.classList.add('armed'); d.textContent = 'Tem certeza?'; return; } App.profile.pets = App.profile.pets.filter(x => x !== pt); Store.save(); Pets.enter(game.scene); openPetAdopt(); });
        row.append(info, e, d); body.appendChild(row); });
    }
    setTimeout(() => inp.focus(), 60);
  });
  raf = requestAnimationFrame(loopPrev);
}
