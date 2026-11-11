/* Motor do jogo: movimento, objetos interativos, estrelas, hobbies e desenho da cena.
   Depende de funções do app.js: getPlayerFace(), currentCostume(), playerName(), isOnline(), addStars(), refreshDoRow() */
'use strict';

const game = {
  started: false, scene: 'casa', t: 0,
  player: { x: 480, y: 470, tx: null, ty: null, moving: false, say: null, sayT: 0, act: null, actT: 0, goal: null, script: null },
  bots: [], stars: [], roundGot: 0, roundTotal: 5, doneT: 0,
  parts: [], floats: [], pending: [], marker: null, keys: {}, chatT: 6,
  used: new Set(),          // objetos já usados nesta visita (dão estrela 1x)
  ss: {},                   // estado do cenário (torre, quadro, baú...)
};

function randWalk() { return { x: WALK.x0 + Math.random() * (WALK.x1 - WALK.x0), y: WALK.y0 + Math.random() * (WALK.y1 - WALK.y0) }; }
function moveToward(o, tx, ty, speed, dt) {
  const dx = tx - o.x, dy = ty - o.y, d = Math.hypot(dx, dy);
  if (d < 3) { o.x = tx; o.y = ty; return true; }
  const st = Math.min(d, speed * dt); o.x += dx / d * st; o.y += dy / d * st; return false;
}
function depthScale(y) { return (0.92 + (y - WALK.y0) / (WALK.y1 - WALK.y0) * 0.32) * (game.scaleMul || 1); }
function playerSay(text, secs) { game.player.say = text; game.player.sayT = secs || 2.4; }

/* ---------- ações dos objetos ---------- */
const ACTS = {
  dormir: { dur: 5, start(P) { playerSay('Hora da soneca... 😴', 1.6); }, end(P) { playerSay('Que soneca boa! ☀️'); } },
  blocos: { dur: 4.2, start(P) { playerSay('Vou montar uma torre!', 1.8); game.ss.blocks = 0; }, end(P) { playerSay('Que torre alta! 🏰'); } },
  ler: { dur: 5, start(P) { P.act = 'ler'; P.actT = 0; }, end(P) { P.act = null; playerSay('Que história legal! 📖'); } },
  quadro: {
    dur: 0,
    start(P) {
      DrawPad.open('board', (url, changed) => {
        if (!url || !changed) return;
        saveDrawing('board', url); playerSay('Ficou lindo! 🌟', 2.6); burst(480, 180, 24);
        if (!game.used.has('escola:quadro')) { game.used.add('escola:quadro'); giveStars(1, 480, 240); }
        if (isOnline() && game.bots.length) Friends.later(1, pick(game.bots), pick(['Que desenho lindo! 🎨', 'Uau! Você desenha muito bem!', 'Desenha um pra mim também?']));
      }, getDrawing('board'));
      return 'pad';
    },
  },
  estudar: { dur: 4, start(P) { playerSay('Hora de estudar! 🤓', 1.5); }, end(P) { const a = 1 + Math.floor(Math.random() * 5), b = 1 + Math.floor(Math.random() * 5); playerSay(a + ' + ' + b + ' = ' + (a + b) + '! 🤓', 2.6); } },
  relogio: { dur: 0, start(P) { const d = new Date(); playerSay('Agora são ' + d.getHours() + ':' + String(d.getMinutes()).padStart(2, '0') + '! 🕘', 2.6); } },
  escorregar: { dur: 2.2, start() { }, end(P) { P.x = 805; P.y = 365; playerSay('Uhuuu! 🎢', 2.2); } },
  balancar: { dur: 5.5, start(P) { playerSay('Weee! 🎵', 1.6); }, end(P) { playerSay('Muito divertido!', 2); } },
  patos: { dur: 4, start(P) { playerSay('Oi, patinhos! 🦆', 2); }, end(P) { playerSay('Os patos gostaram de mim!', 2.2); } },
  trono: { dur: 4, start(P) { playerSay('Eu sou a realeza! 👑', 2.6); } },
  areia: { dur: 5, start(P) { playerSay('Vou fazer um castelo de areia! 🏖️', 2); game.ss.sand = 0; }, end(P) { game.ss.sand = 1; playerSay('Meu castelo ficou incrível! 🏰', 2.6); } },
  bau: {
    dur: 1.6,
    start(P) {
      if (game.ss.chestOpen) { playerSay('O baú está vazio... 🤔', 2.2); return 'empty'; }
      game.ss.chestOpen = true; game.ss.chestT = 0; playerSay('Um tesouro! 💰', 2.4); Sound.coin();
      burst(857, 360, 26, false, ['#FFD34D', '#F0A800', '#FFE27A']);
    },
  },
};

function gameGoRoom(o) {
  const P = game.player;
  if (!o.target) { playerSay('Ainda não tem cômodos aqui dentro! Peça para um adulto fotografar 📷', 3.2); return; }
  game.fade = 1; Sound.pop();
  gameSetScene(o.target);
  if (o.side === 'in') { P.x = 480; P.y = clamp(WALK.y0 + 120, WALK.y0, WALK.y1); }
  else { P.x = o.side === 'r' ? WALK.x0 + 40 : WALK.x1 - 40; P.y = clamp(WALK.y0 + 90, WALK.y0, WALK.y1); }
}
function startObject(o) {
  if (o.door) { gameGoRoom(o); return; }
  const P = game.player, A = o.home ? Home.act(o) : ACTS[o.act]; if (!A) return;
  P.act = null; P.tx = null; P.x = o.spot[0]; P.y = o.spot[1];
  const res = A.start ? A.start(P, o) : null;
  const key = game.scene + ':' + o.id;
  let reward = 0;
  if (!game.used.has(key) && res !== 'empty' && res !== 'pad') { game.used.add(key); reward = o.act === 'bau' ? 3 : 1; }
  if (A.dur > 0) P.script = { obj: o, act: o.act, t: 0, dur: A.dur, reward, A };
  else if (reward) giveStars(reward, P.x, P.y - 110);
  if (isOnline()) Friends.onPlayerObject(o.act);
  Sound.pop(); refreshDoRow();
}
function endScript() {
  const P = game.player, sc = P.script; if (!sc) return;
  P.script = null; const A = sc.A || ACTS[sc.act];
  if (A.end) A.end(P, sc.obj);
  if (sc.act === 'blocos') game.ss.blocks = 6;
  if (sc.reward) giveStars(sc.reward, P.x, P.y - 110);
  refreshDoRow();
}

/* ---------- estrelas ---------- */
function spawnStars() {
  game.stars = []; game.roundGot = 0;
  const P = game.player;
  for (let i = 0; i < game.roundTotal; i++) {
    let p, tries = 0;
    const onObj = q => (sceneObjects(game.scene)).some(o => q.x > o.hit[0] - 30 && q.x < o.hit[0] + o.hit[2] + 30 && q.y > o.hit[1] - 10 && q.y < o.hit[1] + o.hit[3] + 40);
    do { p = randWalk(); tries++; } while (tries < 60 && (Math.hypot(p.x - P.x, p.y - P.y) < 120 || onObj(p) || game.stars.some(s => Math.hypot(s.x - p.x, s.y - p.y) < 90)));
    game.stars.push({ x: p.x, y: p.y, ph: Math.random() * TAU });
  }
}
function giveStars(n, x, y) {
  addStars(n);
  game.floats.push({ x, y, text: '+' + n + ' ⭐', life: 1.4 });
  burst(x, y + 20, 10 + n * 4);
  Sound.star();
}

/* ---------- partículas ---------- */
function burst(x, y, n, confetti, colors) {
  const cols = colors || ['#FFD34D', '#FF6FA8', '#5BC0FF', '#5CE08A', '#7C5CFF', '#FF9F43'];
  for (let i = 0; i < n; i++) {
    const a = Math.random() * TAU, v = confetti ? 120 + Math.random() * 260 : 60 + Math.random() * 160;
    game.parts.push({
      x: confetti ? Math.random() * W : x, y: confetti ? -10 - Math.random() * 80 : y,
      vx: confetti ? (Math.random() - .5) * 80 : Math.cos(a) * v, vy: confetti ? 60 + Math.random() * 120 : Math.sin(a) * v - 60,
      life: confetti ? 3.2 : 0.9, max: confetti ? 3.2 : 0.9, col: cols[i % cols.length], sz: confetti ? 5 + Math.random() * 4 : 3 + Math.random() * 3, rot: Math.random() * TAU, conf: !!confetti,
    });
  }
}

/* ---------- controle ---------- */
function gameSetScene(id) {
  const room = Home.byScene(id);
  if (id.indexOf('home:') === 0 && !room) id = 'casa';
  game.scene = id; game.used.clear();
  WALK.y0 = room ? clamp(room.floorY + 22, 200, 520) : 340;
  game.scaleMul = room ? (room.scale || 1) : 1;
  game.ss = { blocks: 0, board: 0, chestOpen: false, chestT: 0 };
  const P = game.player; P.x = 480; P.y = clamp(470, WALK.y0, WALK.y1); P.tx = null; P.goal = null; P.script = null; P.act = null;
  spawnStars();
  game.dog = id === 'parque' ? { name: 'Bolinha', x: 300, y: 450, tx: 300, ty: 450, wait: 1, moving: false, dir: 1, happy: 0, follow: 0, say: null, sayT: 0 } : null;
  if (isOnline()) Friends.make();
  playerSay(room ? 'Cheguei: ' + room.emoji + ' ' + room.name : 'Cheguei! 👋', 2.4);
  refreshDoRow();
  if (typeof onSceneChange === 'function') onSceneChange(game.scene);
}
function gameTap(x, y) {
  const P = game.player; Sound.tap();
  if (P.script) { if (P.script.act === 'escorregar') return; endScript(); }
  const d = game.dog;
  if (d && Math.hypot(x - d.x, (y - (d.y - 22)) * 1.2) < 48) {
    P.act = null; P.goal = { dog: true }; P.tx = clamp(d.x + (P.x < d.x ? -55 : 55), WALK.x0, WALK.x1); P.ty = clamp(d.y, WALK.y0, WALK.y1);
    d.wait = Math.max(d.wait, 2.5); game.marker = { x: P.tx, y: P.ty, t: 0 }; refreshDoRow(); return;
  }
  for (const o of sceneObjects(game.scene)) {
    const [hx, hy, hw, hh] = o.hit;
    if (x >= hx - 10 && x <= hx + hw + 10 && y >= hy - 10 && y <= hy + hh + 10) {
      P.act = null; P.goal = o; P.tx = o.spot[0]; P.ty = o.spot[1]; game.marker = { x: P.tx, y: P.ty, t: 0 }; refreshDoRow(); return;
    }
  }
  P.act = null; P.goal = null; P.tx = clamp(x, WALK.x0, WALK.x1); P.ty = clamp(y, WALK.y0, WALK.y1);
  game.marker = { x: P.tx, y: P.ty, t: 0 }; refreshDoRow();
}
function gameHobby(id) {
  const P = game.player; if (P.script) { if (P.script.act === 'escorregar') return; endScript(); }
  if (P.act === id) { P.act = null; refreshDoRow(); return; }
  const begin = () => { P.act = id; P.actT = id === 'desenhar' ? 6 : 0; P.tx = null; P.goal = null; refreshDoRow(); Sound.pop(); if (isOnline()) Friends.onPlayerHobby(id); };
  if (id === 'desenhar') {
    P.tx = null; P.goal = null;
    DrawPad.open('easel', (url, changed) => { if (!url) return; if (changed) saveDrawing('easel', url); begin(); playerSay('Olha o meu desenho! 🎨', 2.6); }, getDrawing('easel'));
    return;
  }
  begin();
}
function gameSay(text) { playerSay(text, 2.8); Sound.chat(); if (isOnline()) Friends.onPlayerSay(); }

/* ---------- atualização ---------- */
function gameUpdate(dt) {
  game.t += dt; const P = game.player;
  if (P.act) P.actT += dt;
  P.moving = false;
  if (P.script) {
    const sc = P.script; sc.t += dt;
    if (sc.act === 'escorregar' && !sc.snd && sc.t > 1.2) { sc.snd = true; Sound.slide(); }
    if (sc.act === 'escorregar' && sc.t < 0.9) P.moving = true;
    if (sc.act === 'blocos') { const n = Math.min(6, Math.floor(sc.t / 0.6) + 1); if (n !== game.ss.blocks) { game.ss.blocks = n; Sound.tap(); } }
    if (sc.act === 'quadro') game.ss.board = Math.min(1, sc.t / 4.2);
    if (sc.act === 'areia') { game.ss.sand = Math.min(1, sc.t / 4.6); if (Math.random() < dt * 8) burst(795 + (Math.random() - .5) * 60, 515, 2, false, ['#E8C67E', '#F3D99B', '#D9B26A']); }
    if (sc.act === 'trono' && Math.random() < dt * 6) burst(480 + (Math.random() - .5) * 60, 200 + Math.random() * 40, 2, false, ['#FFD34D', '#fff']);
    if (sc.t >= sc.dur) endScript();
  } else {
    const kx = (game.keys.r ? 1 : 0) - (game.keys.l ? 1 : 0), ky = (game.keys.d ? 1 : 0) - (game.keys.u ? 1 : 0);
    if (kx || ky) {
      const n = Math.hypot(kx, ky); P.x = clamp(P.x + kx / n * 230 * dt, WALK.x0, WALK.x1); P.y = clamp(P.y + ky / n * 230 * dt, WALK.y0, WALK.y1);
      P.moving = true; P.goal = null; P.tx = null;
    } else if (P.tx !== null) {
      P.moving = true;
      if (moveToward(P, P.tx, P.ty, 230, dt)) { P.tx = null; P.moving = false; if (P.goal) { const o = P.goal; P.goal = null; if (o.dog) petDog(); else startObject(o); } }
    }
    /* estrelas */
    for (let i = game.stars.length - 1; i >= 0; i--) {
      const s = game.stars[i];
      if (Math.hypot(s.x - P.x, (s.y - P.y) * 1.3) < 38) {
        game.stars.splice(i, 1); game.roundGot++; giveStars(1, s.x, s.y - 30);
        if (game.roundGot >= game.roundTotal) {
          playerSay('Peguei todas! 🎉', 2.8); burst(0, 0, 140, true); game.doneT = 3; Sound.win();
          setTimeout(() => giveStars(3, game.player.x, game.player.y - 120), 700);
          if (isOnline()) Friends.onRoundDone();
        }
      }
    }
  }
  game.stars.forEach(s => s.ph += dt * 3);
  if (game.doneT > 0) { game.doneT -= dt; if (game.doneT <= 0) spawnStars(); }
  if (P.sayT > 0) { P.sayT -= dt; if (P.sayT <= 0) P.say = null; }
  game.ss.chestT = (game.ss.chestT || 0) + dt;
  if (game.dog) dogUpdate(dt);
  if (isOnline()) Friends.update(dt);
  for (let i = game.parts.length - 1; i >= 0; i--) {
    const p = game.parts[i]; p.life -= dt; if (p.life <= 0) { game.parts.splice(i, 1); continue; }
    p.x += p.vx * dt; p.y += p.vy * dt; p.vy += (p.conf ? 30 : 300) * dt; p.rot += dt * 6;
  }
  for (let i = game.floats.length - 1; i >= 0; i--) { const f = game.floats[i]; f.life -= dt; f.y -= 40 * dt; if (f.life <= 0) game.floats.splice(i, 1); }
  if (game.marker) { game.marker.t += dt; if (game.marker.t > 0.7) game.marker = null; }
  if (game.fade > 0) game.fade = Math.max(0, game.fade - dt * 2.2);
}

/* ---------- pose do jogador (para ações especiais) ---------- */
function swingAngle(t) {
  const P = game.player;
  if (P.script && P.script.act === 'balancar') return Math.sin(P.script.t * 3) * 0.55 * Math.min(1, P.script.t);
  return Math.sin(t * 1.3) * 0.04;
}
function playerPose(t) {
  const P = game.player, sc = P.script;
  const base = { x: P.x, y: P.y, s: depthScale(P.y), rot: 0, opt: actOpts(P, t) || {} };
  if (!sc) return base;
  if (sc.obj && sc.obj.home) return Home.pose(sc, t) || base;
  const u = sc.t;
  switch (sc.act) {
    case 'dormir': return { x: 898, y: 258, s: 0.92, rot: -Math.PI / 2, lying: true, opt: { noShadow: true } };
    case 'estudar': return { x: 150, y: 340, s: depthScale(340), rot: 0, opt: { sit: true } };
    case 'trono': return { x: 480, y: 276, s: 0.92, rot: 0, opt: { sit: true, noShadow: true } };
    case 'areia': return { x: 795, y: 466, s: depthScale(466), rot: 0, opt: { sit: true } };
    case 'balancar': { const a = swingAngle(t), L = 112; return { x: 505 + Math.sin(a) * L, y: 192 + Math.cos(a) * L + 14, s: 0.86, rot: -a, opt: { sit: true, noShadow: true } }; }
    case 'escorregar': {
      if (u < 0.9) { const k = u / 0.9; return { x: 655, y: 348 - (348 - 196) * k, s: 0.86, rot: 0, opt: { noShadow: true } }; }
      if (u < 1.2) return { x: 694, y: 196, s: 0.86, rot: 0, opt: { sit: true, noShadow: true } };
      const k = Math.min(1, (u - 1.2) / 0.8), q = 1 - k;
      return { x: q * q * 694 + 2 * k * q * 746 + k * k * 784, y: q * q * 196 + 2 * k * q * 214 + k * k * 328, s: 0.86, rot: 0.2, opt: { sit: true, noShadow: true } };
    }
  }
  return base;
}

/* ---------- desenho ---------- */
function nameTag(c, x, y, text, me) {
  c.font = '800 15px ' + FONT; const w = c.measureText(text).width + 16;
  fr(c, x - w / 2, y, w, 22, 11, me ? '#5B3FD9' : 'rgba(255,255,255,.92)');
  c.fillStyle = me ? '#fff' : '#2B2238'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(text, x, y + 12);
}
function bubble(c, x, y, text) {
  c.font = '700 19px ' + FONT; const w = c.measureText(text).width + 26, h = 36;
  const bx = clamp(x - w / 2, 6, W - w - 6), by = Math.max(6, y - h - 12), tx = clamp(x, bx + 16, bx + w - 16);
  c.fillStyle = 'rgba(43,34,56,.12)'; rr(c, bx + 2, by + 4, w, h, 16); c.fill();
  fr(c, bx, by, w, h, 16, '#fff');
  c.fillStyle = '#fff'; c.beginPath(); c.moveTo(tx - 8, by + h - 1); c.lineTo(tx + 8, by + h - 1); c.lineTo(tx, by + h + 10); c.closePath(); c.fill();
  c.strokeStyle = '#D9CEFF'; c.lineWidth = 2; rr(c, bx, by, w, h, 16); c.stroke();
  c.fillStyle = '#2B2238'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(text, bx + w / 2, by + h / 2 + 1);
}
function drawDuck(c, x, y, dir, t) {
  c.strokeStyle = 'rgba(255,255,255,.6)'; c.lineWidth = 1.5; c.beginPath(); c.ellipse(x, y + 7, 18, 4, 0, 0, TAU); c.stroke();
  ell(c, x, y, 13, 8, 0, '#FFD34D'); c.fillStyle = '#FFD34D'; c.beginPath(); c.moveTo(x - 11 * dir, y - 2); c.lineTo(x - 19 * dir, y - 8); c.lineTo(x - 13 * dir, y + 3); c.fill();
  circ(c, x + 9 * dir, y - 9 + Math.sin(t * 4) * 0.8, 6.5, '#FFD34D');
  c.fillStyle = '#FF9F43'; c.beginPath(); c.moveTo(x + 14 * dir, y - 10); c.lineTo(x + 21 * dir, y - 8); c.lineTo(x + 14 * dir, y - 6); c.fill();
  circ(c, x + 11 * dir, y - 11, 1.4, '#2B2238');
}
function drawSceneBack(c, t) {
  const P = game.player, sc = P.script, ss = game.ss;
  if (game.scene === 'casa' && ss.blocks > 0) {
    const cols = ['#FF6FA8', '#5BC0FF', '#FFD34D', '#5CE08A', '#7C5CFF', '#FF9F43'];
    for (let i = 0; i < ss.blocks; i++) { const x = 240 + (i % 2 ? 3 : -3); fr(c, x, 372 - 22 * (i + 1), 26, 22, 4, cols[i % 6]); fr(c, x + 4, 372 - 22 * (i + 1) + 4, 8, 5, 2, 'rgba(255,255,255,.45)'); }
  }
  const bimg = game.scene === 'escola' ? getDrawing('board') : null;
  if (bimg) { fr(c, 302, 94, 356, 166, 4, '#2F5D46'); c.drawImage(bimg, 302, 94, 356, 166); }
  else if (game.scene === 'escola' && ss.board > 0) {
    const p = ss.board;
    c.save(); c.globalAlpha = Math.min(1, p * 6); fr(c, 302, 94, 356, 166, 4, '#2F5D46'); c.restore();
    c.strokeStyle = 'rgba(255,255,255,.92)'; c.lineWidth = 3.5; c.lineCap = 'round';
    if (p > 0.15) { c.beginPath(); c.arc(390, 168, 42, -Math.PI / 2, -Math.PI / 2 + TAU * Math.min(1, (p - 0.15) / 0.3)); c.stroke(); }
    if (p > 0.45) { circ(c, 376, 158, 4, 'rgba(255,255,255,.92)'); circ(c, 404, 158, 4, 'rgba(255,255,255,.92)'); c.beginPath(); c.arc(390, 172, 20, 0.15 * Math.PI, 0.85 * Math.PI); c.stroke(); }
    if (p > 0.6) { c.save(); c.translate(520, 150); const k = Math.min(1, (p - 0.6) / 0.15); c.scale(k, k); starPath(c, 0, 0, 5, 30, 13); c.stroke(); c.restore(); }
    if (p > 0.75) { c.globalAlpha = Math.min(1, (p - 0.75) / 0.2); c.fillStyle = 'rgba(255,255,255,.92)'; c.font = '700 30px ' + FONT; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(playerName() + ' ★', 500, 228); c.globalAlpha = 1; }
  }
  if (game.scene === 'parque') {
    const a = swingAngle(t), L = 112, sx = 505 + Math.sin(a) * L, sy = 192 + Math.cos(a) * L;
    const ex = Math.cos(a) * 18, ey = -Math.sin(a) * 18;
    c.strokeStyle = '#6B6380'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(487, 192); c.lineTo(sx - ex, sy - ey); c.moveTo(523, 192); c.lineTo(sx + ex, sy + ey); c.stroke();
    c.save(); c.translate(sx, sy); c.rotate(-a); fr(c, -22, -3, 44, 8, 3, '#8E5E33'); c.restore();
    const gather = sc && sc.act === 'patos' ? Math.min(1, sc.t / 1.2) : 0;
    for (let i = 0; i < 2; i++) {
      const ang = t * 0.35 + i * Math.PI;
      let x = 130 + Math.cos(ang) * 55, y = 432 + Math.sin(ang) * 12;
      x = x + (185 + i * 22 - x) * gather; y = y + (438 - i * 4 - y) * gather;
      const dir = gather > 0.5 ? 1 : (-Math.sin(ang) >= 0 ? 1 : -1);
      drawDuck(c, x, y, dir, t + i);
      if (gather > 0.8 && Math.floor(t * 2 + i) % 2 === 0) { c.font = '800 14px ' + FONT; c.fillStyle = '#2B2238'; c.textAlign = 'center'; c.fillText('Quack!', x, y - 26); }
    }
  }
  if (game.scene === 'castelo') {
    if (ss.chestOpen) {
      ell(c, 857, 372, 34, 12, 0, 'rgba(255,211,77,' + (0.5 + Math.sin(t * 4) * 0.2) + ')');
      fr(c, 830, 372, 54, 36, 6, '#A0662F'); fr(c, 852, 372, 10, 36, 2, '#E8B64A');
      [[842, 370], [852, 366], [864, 369], [872, 371]].forEach(([x, y]) => circ(c, x, y, 5, '#FFD34D'));
      fr(c, 827, 338, 60, 14, 7, '#8E5E33'); fr(c, 852, 338, 10, 14, 2, '#E8B64A');
    } else {
      fr(c, 830, 372, 54, 36, 6, '#A0662F'); fr(c, 827, 358, 60, 18, 8, '#8E5E33'); fr(c, 852, 358, 10, 50, 2, '#E8B64A'); circ(c, 857, 378, 4, '#FFD34D');
    }
  }
}
function drawSceneFront(c, t) {
  const sc = game.player.script; if (!sc) return;
  if (sc.obj && sc.obj.home) { Home.drawFx(c, sc, t, playerPose(t)); return; }
  if (sc.act === 'dormir') {
    fr(c, 836, 248, 120, 48, 16, '#6EC6FF'); for (let x = 850; x < 950; x += 24) circ(c, x, 272, 5, 'rgba(255,255,255,.5)');
    c.font = '800 22px ' + FONT; c.fillStyle = '#5B3FD9'; c.textAlign = 'center'; c.textBaseline = 'middle';
    for (let i = 0; i < 3; i++) { const p = (t * 0.5 + i / 3) % 1; c.globalAlpha = 1 - p; c.fillText('z', 800 + p * 30 + i * 6, 220 - p * 50); }
    c.globalAlpha = 1;
  }
  if (sc.act === 'estudar') {
    fr(c, 110, 346, 6, 30, 2, '#8E5E33'); fr(c, 184, 346, 6, 30, 2, '#8E5E33'); fr(c, 100, 332, 100, 18, 5, '#F5B041');
    fr(c, 116, 322, 30, 10, 2, '#FF6FA8'); fr(c, 156, 325, 24, 7, 2, '#5BC0FF');
  }
}
function drawHints(c, t) {
  if (game.player.script) return;
  (sceneObjects(game.scene)).forEach((o, i) => {
    if (game.used.has(game.scene + ':' + o.id)) return;
    const [hx, hy, hw] = o.hit; const x = hx + hw / 2, y = Math.max(28, hy - 6) + Math.sin(t * 3 + i) * 4;
    const pulse = 1 + Math.sin(t * 4 + i) * 0.06;
    circ(c, x, y, 26 * pulse, 'rgba(255,211,77,.35)'); circ(c, x, y, 21, '#fff');
    c.strokeStyle = '#7C5CFF'; c.lineWidth = 3; c.beginPath(); c.arc(x, y, 21, 0, TAU); c.stroke();
    c.font = '23px ' + FONT; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(o.icon, x, y + 1);
    c.fillStyle = '#FFD34D'; starPath(c, x + 17, y - 16, 4, 7, 2.5, t * 2); c.fill();
    if (o.door) {
      c.font = '800 15px ' + FONT; const lw = c.measureText(o.label).width + 18;
      const lx = clamp(x - lw / 2, 4, W - lw - 4); fr(c, lx, y + 26, lw, 26, 13, 'rgba(91,63,217,.92)');
      c.fillStyle = '#fff'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(o.label, lx + lw / 2, y + 40);
    }
  });
}
function drawHud(c) {
  const x = W - 176, y = 14; fr(c, x, y, 162, 30, 15, 'rgba(255,255,255,.92)');
  c.font = '800 14px ' + FONT; c.fillStyle = '#2B2238'; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillText('Rodada', x + 12, y + 16);
  for (let i = 0; i < game.roundTotal; i++) {
    c.fillStyle = i < game.roundGot ? '#FFD34D' : '#E4DBFF'; starPath(c, x + 78 + i * 17, y + 15, 5, 7.5, 3.4); c.fill();
  }
}
function gameRender(c, t) {
  c.setTransform(DPR, 0, 0, DPR, 0, 0);
  c.drawImage(getBg(game.scene), 0, 0, W, H);
  drawSceneBack(c, t);
  if (game.marker) { const m = game.marker; c.strokeStyle = `rgba(91,63,217,${1 - m.t / 0.7})`; c.lineWidth = 3; c.beginPath(); c.ellipse(m.x, m.y, 10 + m.t * 30, 4 + m.t * 10, 0, 0, TAU); c.stroke(); }
  const items = [];
  game.stars.forEach(s => items.push({ y: s.y, draw: () => {
    const by = s.y - 26 + Math.sin(s.ph) * 5;
    ell(c, s.x, s.y, 14, 4, 0, 'rgba(30,20,60,.15)'); circ(c, s.x, by, 22, 'rgba(255,226,122,.35)');
    c.fillStyle = '#FFD34D'; starPath(c, s.x, by, 5, 16, 7, -Math.PI / 2 + Math.sin(s.ph * 0.5) * 0.2); c.fill(); c.strokeStyle = '#F0A800'; c.lineWidth = 2; c.stroke();
  } }));
  if (game.scene === 'parque' && game.ss.sand > 0) items.push({ y: 548, draw: () => drawSandCastle(c, game.ss.sand) });
  const dog = game.dog;
  if (dog) items.push({ y: dog.y, draw: () => {
    drawDog(c, dog.x, dog.y, depthScale(dog.y) * 0.95, t, dog.moving, dog.dir, dog.happy > 0);
    nameTag(c, dog.x, dog.y + 6, '🐶 ' + dog.name, false);
    if (!game.used.has('parque:cachorro') && !game.player.script) {
      const hy = dog.y - 82 + Math.sin(t * 3) * 4; circ(c, dog.x, hy, 18, '#fff'); c.strokeStyle = '#7C5CFF'; c.lineWidth = 3; c.beginPath(); c.arc(dog.x, hy, 18, 0, TAU); c.stroke();
      c.font = '19px ' + FONT; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('🐾', dog.x, hy + 1);
    }
  } });
  const online = isOnline();
  if (online) game.bots.forEach(b => items.push({ y: b.y, draw: () => {
    const s = depthScale(b.y), tt = t + b.t0;
    drawActBack(c, b, s, tt); drawChar(c, b.costume, b.face, b.x, b.y, s, tt, b.moving, actOpts(b, tt)); drawActFront(c, b, s, tt);
    nameTag(c, b.x, b.y + 6, b.name, false);
  } }));
  const P = game.player, pose = playerPose(t);
  items.push({ y: pose.y, draw: () => {
    if (!P.script || P.act === 'ler') drawActBack(c, P, pose.s, t);
    c.save(); c.translate(pose.x, pose.y); if (pose.rot) c.rotate(pose.rot);
    drawChar(c, currentCostume(), getPlayerFace(), 0, 0, pose.s, t, P.moving, pose.opt);
    c.restore();
    if (!P.script || P.act === 'ler') drawActFront(c, P, pose.s, t);
    if (!P.script) nameTag(c, P.x, P.y + 6, playerName(), true);
  } });
  items.sort((a, b) => a.y - b.y).forEach(i => i.draw());
  drawSceneFront(c, t);
  drawHints(c, t);
  (online ? game.bots : []).forEach(o => { if (o.say) bubble(c, o.x, o.y - 140 * depthScale(o.y), o.say); });
  if (dog && dog.say) bubble(c, dog.x, dog.y - 70, dog.say);
  if (dog && dog.happy > 0) { c.font = '20px ' + FONT; c.textAlign = 'center'; for (let i = 0; i < 2; i++) { const p = (t * 0.7 + i / 2) % 1; c.globalAlpha = 1 - p; c.fillText('💛', dog.x + (i ? 18 : -14), dog.y - 60 - p * 40); } c.globalAlpha = 1; }
  if (P.say) { const top = pose.lying ? pose.y - 60 : pose.y - 140 * pose.s; bubble(c, pose.lying ? pose.x - 70 : pose.x, top, P.say); }
  game.floats.forEach(f => { c.globalAlpha = Math.min(1, f.life); c.font = '800 22px ' + FONT; c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineWidth = 5; c.strokeStyle = '#fff'; c.strokeText(f.text, f.x, f.y); c.fillStyle = '#E08A00'; c.fillText(f.text, f.x, f.y); });
  c.globalAlpha = 1;
  game.parts.forEach(p => {
    c.globalAlpha = Math.min(1, p.life / p.max * 2); c.save(); c.translate(p.x, p.y); c.rotate(p.rot); c.fillStyle = p.col;
    if (p.conf) c.fillRect(-p.sz / 2, -p.sz / 4, p.sz, p.sz / 2); else { starPath(c, 0, 0, 5, p.sz, p.sz / 2.2); c.fill(); }
    c.restore();
  });
  c.globalAlpha = 1;
  drawHud(c);
  if (game.fade > 0) { c.fillStyle = 'rgba(43,34,56,' + game.fade + ')'; c.fillRect(0, 0, W, H); }
}

/* ---------- parquinho: castelo de areia e cachorro ---------- */
function drawSandCastle(c, p) {
  const sand = '#EBCB85', dark = '#D9B26A';
  const k = Math.min(1, p / 0.2); ell(c, 795, 534, 62 * k, 11 * k, 0, '#E3BE76');
  const tower = (x, y, w, h) => { fr(c, x, y, w, h, 3, sand); for (let i = 0; i < 3; i++) fr(c, x + i * (w / 3) + 1, y - 6, w / 3 - 3, 7, 1, sand); c.fillStyle = 'rgba(176,122,69,.3)'; for (let i = 0; i < 4; i++) circ(c, x + 4 + (i * 7) % (w - 6), y + 8 + i * 7, 1.3); };
  if (p > 0.25) { fr(c, 768, 506, 54, 28, 3, sand); c.fillStyle = dark; c.beginPath(); c.arc(795, 534, 9, Math.PI, 0); c.fill(); }
  if (p > 0.45) tower(749, 490, 20, 44);
  if (p > 0.6) tower(821, 490, 20, 44);
  if (p > 0.75) tower(785, 474, 20, 34);
  if (p > 0.88) { c.strokeStyle = '#8E5E33'; c.lineWidth = 2; c.beginPath(); c.moveTo(795, 468); c.lineTo(795, 446); c.stroke(); c.fillStyle = '#FF6FA8'; c.beginPath(); c.moveTo(795, 446); c.lineTo(812, 451); c.lineTo(795, 457); c.closePath(); c.fill(); }
}
function drawDog(c, x, y, s, t, moving, dir, happy) {
  c.save(); c.translate(x, y); c.scale(s * dir, s);
  ell(c, 0, 0, 26, 6, 0, 'rgba(30,20,60,.16)');
  const leg = moving ? Math.sin(t * 14) * 4 : 0, wag = Math.sin(t * (happy ? 22 : 8)) * 0.5, bob = moving ? Math.abs(Math.sin(t * 14)) * 2 : 0;
  c.translate(0, -bob);
  [[-16, leg], [-8, -leg], [8, leg], [16, -leg]].forEach(([lx, o]) => fr(c, lx - 2.5 + o * 0.5, -17, 5, 17, 2.5, '#B07A45'));
  c.save(); c.translate(-21, -26); c.rotate(-0.7 + wag); fr(c, -3, -17, 6, 17, 3, '#D9A066'); c.restore();
  ell(c, 0, -23, 24, 12, 0, '#D9A066'); ell(c, -6, -26, 8, 6, 0, '#FFF1DC');
  circ(c, 22, -38, 13, '#D9A066'); ell(c, 32, -34, 7, 5, 0, '#FFF1DC'); circ(c, 38, -35, 2.6, '#2B2238');
  circ(c, 24, -41, 2.2, '#2B2238'); ell(c, 14, -41, 5, 10, 0.45 + Math.sin(t * 6) * 0.1, '#8E5E33');
  if (happy) ell(c, 33, -28, 2.6, 4.5, 0, '#FF6F8A');
  fr(c, 11, -30, 11, 4, 2, '#E2464A'); circ(c, 16, -24, 2.2, '#FFD34D');
  c.restore();
}
function dogUpdate(dt) {
  const d = game.dog, P = game.player; d.moving = false;
  if (d.happy > 0) d.happy -= dt;
  if (d.sayT > 0) { d.sayT -= dt; if (d.sayT <= 0) d.say = null; }
  if (d.follow > 0) {
    d.follow -= dt;
    const tx = clamp(P.x + (d.x < P.x ? -60 : 60), WALK.x0, WALK.x1), ty = clamp(P.y + 4, WALK.y0, WALK.y1);
    if (Math.hypot(tx - d.x, ty - d.y) > 12) { const ox = d.x; d.moving = true; moveToward(d, tx, ty, 200, dt); if (Math.abs(d.x - ox) > 0.1) d.dir = d.x > ox ? 1 : -1; }
    else d.dir = P.x > d.x ? 1 : -1;
    if (d.follow <= 0) { d.say = 'Au! 🐾'; d.sayT = 1.5; }
    return;
  }
  if (d.wait > 0) { d.wait -= dt; return; }
  const ox = d.x; d.moving = true;
  if (moveToward(d, d.tx, d.ty, 110, dt)) {
    d.moving = false; d.wait = 1 + Math.random() * 3; const p = randWalk(); d.tx = p.x; d.ty = p.y;
    if (Math.random() < 0.25) { d.say = pick(['Au au! 🐶', 'Rrruf!', '🐾']); d.sayT = 1.6; Sound.bark(); }
  }
  if (Math.abs(d.x - ox) > 0.1) d.dir = d.x > ox ? 1 : -1;
}
function petDog() {
  const d = game.dog, P = game.player; if (!d) return;
  d.wait = 3; d.happy = 3; d.follow = 14; d.say = 'Au au! 🐶'; d.sayT = 2.2; d.dir = P.x > d.x ? 1 : -1;
  playerSay(pick(['Que cachorrinho fofo! 🐶', 'Oi, Bolinha! 💛', 'Vem comigo, Bolinha!']), 2.4);
  Sound.bark(); burst(d.x, d.y - 40, 10, false, ['#FFD34D', '#FF8FB8']);
  if (!game.used.has('parque:cachorro')) { game.used.add('parque:cachorro'); setTimeout(() => giveStars(1, d.x, d.y - 90), 600); }
  if (isOnline() && game.bots.length && Math.random() < 0.7) Friends.later(1.3, pick(game.bots), pick(['Posso fazer carinho também?', 'Que cachorro fofo! 🐶', 'Ele gostou de você!']));
}
