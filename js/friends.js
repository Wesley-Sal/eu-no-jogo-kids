/* Amigos no modo online.
 *
 * HOJE: amigos SIMULADOS (Lia, Theo e Bia), para testar a experiência sem servidor.
 *
 * VERSÃO ONLINE (próxima etapa): este módulo é trocado por um que conversa com o servidor
 * (ex.: Firebase). Cada amigo real aprovado pelos pais aparece na sala com:
 *   - name     → apelido
 *   - recipe   → a "receita" do avatar (avatarRecipe), NUNCA a foto
 *   - costume  → fantasia escolhida
 *   - x, y, act, say → posição, hobby em andamento e frase pronta (sem chat livre)
 * O resto do jogo não precisa mudar: ele só lê `game.bots`.
 */
'use strict';

const Friends = {
  IDLE: ['Que dia legal!', 'Vamos correr?', 'Lá-lá-lá 🎵', 'Olha uma estrela! ⭐', 'Brinca comigo?'],
  REPLY: ['Oba! 🎉', 'Vamos!', 'Hahaha 😂', 'Que fantasia linda!', 'Oi, {n}! 👋', 'Pega as estrelas! ⭐', 'Você é demais!'],
  OBJ_TALK: {
    dormir: 'Shhh, tá dormindo! 🤫', blocos: 'Posso ajudar na torre?', ler: 'Depois me empresta? 📚',
    quadro: 'Desenha um gato! 🐱', estudar: 'Você é muito inteligente!', relogio: 'Nossa, o tempo voa!',
    escorregar: 'Minha vez depois! 😄', balancar: 'Mais alto! Mais alto!', patos: 'Que patinhos fofos!',
    trono: 'Sim, majestade! 🙇', bau: 'Uau, um tesouro!', areia: 'Posso ajudar no castelo? 🏰',
  },

  make() {
    game.bots = [
      { name: 'Lia', recipe: { skin: 4, hairColor: 0, hairStyle: 'chiquinhas', eyes: 1, glasses: false, freckles: false, bow: false }, costume: 'princesa', hobbies: ['dancar', 'cantar'] },
      { name: 'Theo', recipe: { skin: 0, hairColor: 5, hairStyle: 'espetado', eyes: 3, glasses: false, freckles: true, bow: false }, costume: 'astronauta', hobbies: ['bola', 'ler'] },
      { name: 'Bia', recipe: { skin: 6, hairColor: 0, hairStyle: 'crespo', eyes: 0, glasses: true, freckles: false, bow: false }, costume: 'dino', hobbies: ['desenhar', 'corda'] },
    ].map(b => {
      const p = randWalk();
      return Object.assign(b, { face: makeCartoonFace(b.recipe), x: p.x, y: p.y, tx: p.x, ty: p.y, wait: Math.random() * 2, moving: false, say: null, sayT: 0, t0: Math.random() * 10, act: null, actT: 0, joinAct: null });
    });
  },
  join() {
    this.make(); game.pending = [];
    game.bots.forEach((b, i) => {
      b.x = i % 2 ? WALK.x1 : WALK.x0; b.wait = 0; const p = randWalk(); b.tx = p.x; b.ty = p.y;
      this.later(0.5 + i * 0.6, b, ['Oi, {n}! 👋', 'Cheguei! 🎉', 'Vamos brincar?'][i % 3]);
    });
  },
  leave() { game.bots = []; game.pending = []; },
  later(t, bot, text) { game.pending.push({ t, bot, text: text.replace('{n}', playerName()) }); },
  nearest() {
    const P = game.player; let best = null, bd = 1e9;
    game.bots.forEach(b => { const d = Math.hypot(b.x - P.x, b.y - P.y); if (d < bd) { bd = d; best = b; } });
    return { bot: best, dist: bd };
  },

  onPlayerSay() {
    const { bot, dist } = this.nearest(); if (!bot) return;
    this.later(0.9, bot, pick(this.REPLY));
    if (dist > 160) { const P = game.player; bot.act = null; bot.tx = clamp(P.x + (bot.x < P.x ? -80 : 80), WALK.x0, WALK.x1); bot.ty = clamp(P.y + 10, WALK.y0, WALK.y1); bot.wait = 0; }
  },
  onPlayerHobby(id) {
    const P = game.player;
    const fan = game.bots.find(b => b.hobbies.includes(id));
    if (fan) {
      this.later(1.1, fan, 'Eu também adoro ' + HOBBY_VERB[id] + '! 🙌');
      fan.act = null; fan.joinAct = id; fan.wait = 0;
      const side = id === 'desenhar' ? (P.x > WALK.x0 + 140 ? -1 : 1) : (fan.x < P.x ? -1 : 1);
      fan.tx = clamp(P.x + side * (id === 'desenhar' ? (side < 0 ? 95 : 120) : 90), WALK.x0, WALK.x1);
      fan.ty = clamp(P.y + 6, WALK.y0, WALK.y1);
    }
    const other = game.bots.find(b => b !== fan); if (other) this.later(2.8, other, HOBBY_PRAISE[id]);
  },
  onPlayerObject(act) {
    if (Math.random() < 0.7 && game.bots.length && this.OBJ_TALK[act]) this.later(1.2, pick(game.bots), this.OBJ_TALK[act]);
  },
  onRoundDone() {
    game.bots.forEach((b, j) => this.later(0.6 + j * 0.5, b, ['Uhuul! 🎉', 'Parabéns, {n}!', 'Demais! ⭐'][j % 3]));
  },

  update(dt) {
    const P = game.player;
    game.bots.forEach(b => {
      b.moving = false;
      if (b.act) b.actT += dt;
      if (b.wait > 0) b.wait -= dt;
      else {
        b.act = null; b.moving = true;
        if (moveToward(b, b.tx, b.ty, b.joinAct ? 140 : 85, dt)) {
          b.moving = false;
          if (b.joinAct) { b.act = b.joinAct; b.actT = 0; b.joinAct = null; b.wait = 6 + Math.random() * 3; }
          else { b.wait = 1 + Math.random() * 2.5; if (Math.random() < 0.55) { b.act = pick(b.hobbies); b.actT = 0; b.wait = 3.5 + Math.random() * 3; } }
          const p = randWalk(); b.tx = p.x; b.ty = p.y;
        }
      }
      if (b.sayT > 0) { b.sayT -= dt; if (b.sayT <= 0) b.say = null; }
    });
    /* evita que um fique em cima do outro */
    game.bots.forEach(b => {
      [P, ...game.bots].forEach(o => {
        if (o === b) return; const ox = o === P ? playerPose(game.t).x : o.x, oy = o === P ? playerPose(game.t).y : o.y;
        const dx = b.x - ox, dy = (b.y - oy) * 1.6, d = Math.hypot(dx, dy) || 0.01;
        if (d < 70) { const f = (70 - d) * dt * 4; b.x = clamp(b.x + dx / d * f, WALK.x0, WALK.x1); b.y = clamp(b.y + dy / d * f * 0.6, WALK.y0, WALK.y1); }
      });
    });
    game.chatT -= dt;
    if (game.chatT <= 0) { game.chatT = 7 + Math.random() * 7; const b = pick(game.bots); if (b && !b.say) { b.say = pick(this.IDLE); b.sayT = 2.6; } }
    for (let i = game.pending.length - 1; i >= 0; i--) {
      const q = game.pending[i]; q.t -= dt;
      if (q.t <= 0) { q.bot.say = q.text; q.bot.sayT = 2.6; game.pending.splice(i, 1); Sound.chat(); }
    }
  },
};
