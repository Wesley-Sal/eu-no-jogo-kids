/* Editor "Minha casa": transforma a foto de um cômodo num cenário jogável.
   Passo 1 foto · Passo 2 chão e tamanho · Passo 3 móveis · Passo 4 nome e prévia. Tudo no aparelho. */
'use strict';

const RoomEd = {
  step: 1, img: null, off: { x: 0, y: 0 }, photo: null, room: null, isNew: true,
  sel: null, drawing: null, dragging: null, view: 'cartoon',
  cv: null, g: null,

  init() {
    this.cv = $('#roomCanvas'); this.g = setupCanvas(this.cv, W, H);
    this.cv.addEventListener('pointerdown', e => this.down(e));
    this.cv.addEventListener('pointermove', e => this.move(e));
    const up = e => this.up(e); this.cv.addEventListener('pointerup', up); this.cv.addEventListener('pointercancel', up);
    $('#roomBack').addEventListener('click', () => this.back());
    $('#roomNext').addEventListener('click', () => this.next());
    const onFile = e => {
      const f = e.target.files && e.target.files[0]; e.target.value = ''; if (!f) return;
      const im = new Image();
      im.onload = () => { this.img = im; this.off = { x: 0, y: 0 }; this.photo = null; this.tools(); };
      im.onerror = () => toast('Não consegui abrir essa imagem. Tente uma foto JPG ou PNG.');
      im.src = URL.createObjectURL(f);
    };
    $('#roomCam').addEventListener('change', onFile); $('#roomGal').addEventListener('change', onFile);
  },

  open(room, placeId, kind) {
    this.isNew = !room;
    if (!room && !Home.placeById(placeId)) {
      let pl = Home.places()[0];
      if (!pl) { pl = { id: uid(), name: 'Minha casa', icon: '🏡', color: '#FF8FB8', created: Date.now() }; Store.data.places.push(pl); Store.save(); }
      placeId = pl.id;
    }
    const fac = kind === 'fachada';
    this.room = room ? JSON.parse(JSON.stringify(room)) : { id: uid(), placeId, name: fac ? 'Fachada' : '', emoji: fac ? FACADE_EMOJI : '🛏️', photo: null, floorY: fac ? 400 : 330, scale: 1, objects: [], colors: null, created: Date.now() };
    this.img = null; this.photo = null; this.sel = null; this.drawing = null; this.view = 'cartoon';
    show('s-room');
    if (room && room.photo) {
      const im = new Image();
      im.onload = () => { const p = document.createElement('canvas'); p.width = W; p.height = H; p.getContext('2d').drawImage(im, 0, 0, W, H); this.photo = p; this.tools(); };
      im.src = room.photo; this.go(2);
    } else this.go(1);
  },
  exit() { show(App.profile && game.started ? 's-game' : 's-home'); },

  go(n) {
    if (this.step === 3 && n !== 3) this.room.objects = this.room.objects.filter(o => o.type);
    this.step = n; this.sel = null; this.drawing = null;
    if (n === 4 && this.photo) Home.sampleColors(this.room, this.photo);
    const F = isFacade(this.room);
    const T = (F ? {
      1: ['Tire uma foto da fachada', 'Fique de frente para a casa e mostre a porta e a calçada. Depois arraste a foto para enquadrar.'],
      2: ['Onde fica o chão?', 'Arraste a linha até onde começa a calçada ou o quintal. É ali que o personagem vai andar.'],
      3: ['Marque a porta e esconda detalhes', 'Marque a 🚪 Porta para entrar na casa. Use 🙈 Esconder para borrar o número da casa, a placa do carro ou o nome da rua.'],
      4: ['Pronto! Veja a sua casa', 'Com a foto (offline, só neste aparelho) e desenhada (online).'],
    } : {
      1: ['Tire uma foto do cômodo', 'Pode ser o quarto, a sala, a cozinha... Depois arraste a foto para enquadrar.'],
      2: ['Onde fica o chão?', 'Arraste a linha até onde o chão começa. É ali que o personagem vai andar.'],
      3: ['Marque os móveis', 'Desenhe um retângulo com o dedo em volta de cada coisa e escolha o que é. Use 🙈 Esconder para borrar o que não quiser mostrar.'],
      4: ['Dê um nome ao cômodo', 'Veja como ele fica: com a foto (offline) e desenhado (online).'],
    })[n];
    const pl = Home.placeById(this.room.placeId);
    $('#roomStepLbl').textContent = (pl ? pl.icon + ' ' + pl.name : 'Minha casa') + ' · Passo ' + n + ' de 4';
    $('#roomTitle').textContent = T[0]; $('#roomHelp').textContent = T[1];
    $('#roomBack').textContent = n === 1 ? '← Sair' : '← Voltar';
    $('#roomNext').textContent = n === 4 ? 'Salvar e brincar ▶' : 'Continuar →';
    this.tools();
  },
  back() { if (this.step === 1) this.exit(); else this.go(this.step - 1); },
  next() {
    if (this.step === 1) { if (!this.img && !this.photo) return; if (this.img) this.bakePhoto(); this.go(2); }
    else if (this.step < 4) this.go(this.step + 1);
    else this.save();
  },

  /* ----- controles de cada passo ----- */
  tools() {
    const el = $('#roomTools'); el.innerHTML = ''; const r = this.room;
    $('#roomNext').disabled = this.step === 1 ? !(this.img || this.photo) : (this.step >= 2 && !this.photo);
    if (this.step === 1) {
      el.innerHTML = '<div class="row"><label class="btn pink" for="roomCam">📷 Tirar foto</label><label class="btn alt" for="roomGal">🖼️ Escolher foto</label></div>' +
        (isFacade(r) ? '<div class="privacy" style="margin-top:12px">🔒 A foto da fachada fica só neste aparelho e nunca vai para a internet. No próximo passo dá para borrar o número da casa e a placa do carro.</div>'
          : '<p class="small" style="margin-top:10px">💡 Segure o celular deitado e mostre o chão e os móveis. A foto fica só neste aparelho.</p>');
    }
    if (this.step === 2) {
      const row = document.createElement('div'); row.className = 'zoom wide';
      row.innerHTML = '<span>Tamanho do personagem</span><input type="range" min="0.6" max="1.6" step="0.01" aria-label="Tamanho do personagem">';
      const inp = row.querySelector('input'); inp.value = r.scale; inp.addEventListener('input', () => { r.scale = +inp.value; });
      el.appendChild(row);
    }
    if (this.step === 3) {
      const info = document.createElement('p'); info.className = 'small';
      const n = r.objects.filter(o => o.type).length;
      info.textContent = n ? n + (n === 1 ? ' móvel marcado. ' : ' móveis marcados. ') + 'Toque num retângulo para trocar ou remover.' : 'Nenhum móvel ainda. Desenhe o primeiro retângulo na foto!';
      el.appendChild(info);
      if (this.sel) {
        const box = document.createElement('div'); box.className = 'picker';
        box.innerHTML = '<div class="flabel">O que é isso?</div>';
        const grid = document.createElement('div'); grid.className = 'types';
        const order = isFacade(r) ? ['porta', 'esconder', 'carro', 'planta', 'janela', 'brinquedos'] : null;
        (order ? order.map(homeType).concat(HOME_TYPES.filter(t => !order.includes(t.id))) : HOME_TYPES).forEach(t => {
          const b = document.createElement('button'); b.type = 'button'; b.className = 'hob' + (this.sel.type === t.id ? ' sel' : ''); b.innerHTML = '<b>' + t.e + '</b>' + t.n;
          b.addEventListener('click', () => { this.sel.type = t.id; this.sel = null; Sound.pop(); this.tools(); });
          grid.appendChild(b);
        });
        box.appendChild(grid);
        const del = document.createElement('button'); del.type = 'button'; del.className = 'btn small danger'; del.style.marginTop = '10px'; del.textContent = '🗑️ Remover';
        del.addEventListener('click', () => { this.room.objects = this.room.objects.filter(o => o !== this.sel); this.sel = null; this.tools(); });
        box.appendChild(del); el.appendChild(box);
      }
    }
    if (this.step === 4) {
      const v = document.createElement('div'); v.className = 'mode'; v.style.marginBottom = '12px';
      v.innerHTML = '<button data-v="photo">📴 Offline · foto</button><button data-v="cartoon">🌐 Online · desenho</button>';
      v.querySelectorAll('button').forEach(b => { b.classList.toggle('on', b.dataset.v === this.view); b.addEventListener('click', () => { this.view = b.dataset.v; this.tools(); }); });
      el.appendChild(v);
      const lab = document.createElement('label'); lab.className = 'fl'; lab.textContent = 'Nome'; lab.setAttribute('for', 'roomName'); el.appendChild(lab);
      const inp = document.createElement('input'); inp.type = 'text'; inp.id = 'roomName'; inp.maxLength = 18; inp.placeholder = 'Ex.: Meu quarto'; inp.value = r.name;
      inp.addEventListener('input', () => { r.name = inp.value; }); el.appendChild(inp);
      const kinds = document.createElement('div'); kinds.className = 'toggles'; kinds.style.marginTop = '10px';
      ROOM_KINDS.forEach(k => {
        const b = document.createElement('button'); b.type = 'button'; b.className = 'tg' + (r.emoji === k.e ? ' sel' : ''); b.textContent = k.e + ' ' + k.n;
        b.addEventListener('click', () => { r.emoji = k.e; if (!r.name.trim() || ROOM_KINDS.some(x => x.n === r.name)) r.name = k.n; this.tools(); });
        kinds.appendChild(b);
      });
      el.appendChild(kinds);
      const rec = document.createElement('div'); rec.className = 'recipe'; rec.style.marginTop = '14px';
      rec.innerHTML = '<div class="rt">📡 O que vai para a internet (modo online)</div><code></code><div class="rn">✅ Nenhuma foto da casa. Só cores e posição dos móveis.</div>';
      const pub = Object.assign({}, r, { name: r.name || 'Cômodo', objects: r.objects.filter(o => !homeType(o.type).privacy) });
      rec.querySelector('code').textContent = JSON.stringify(Home.recipe(pub));
      el.appendChild(rec);
    }
  },

  /* ----- foto ----- */
  coverScale() { return Math.max(W / this.img.width, H / this.img.height); },
  clampOff() {
    const s = this.coverScale(), mx = Math.max(0, (this.img.width * s - W) / 2), my = Math.max(0, (this.img.height * s - H) / 2);
    this.off.x = clamp(this.off.x, -mx, mx); this.off.y = clamp(this.off.y, -my, my);
  },
  drawImg(g) { const s = this.coverScale(), w = this.img.width * s, h = this.img.height * s; g.drawImage(this.img, W / 2 - w / 2 + this.off.x, H / 2 - h / 2 + this.off.y, w, h); },
  bakePhoto() { const p = document.createElement('canvas'); p.width = W; p.height = H; this.drawImg(p.getContext('2d')); this.photo = p; },

  /* ----- toque ----- */
  pt(e) { const r = this.cv.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width * W, y: (e.clientY - r.top) / r.height * H }; },
  down(e) {
    const p = this.pt(e); this.cv.setPointerCapture(e.pointerId);
    if (this.step === 1 && this.img) this.dragging = { x: p.x, y: p.y, ox: this.off.x, oy: this.off.y };
    if (this.step === 2) { this.dragging = true; this.room.floorY = clamp(p.y, 150, 500); }
    if (this.step === 3) {
      const hit = this.room.objects.slice().reverse().find(o => p.x >= o.x && p.x <= o.x + o.w && p.y >= o.y && p.y <= o.y + o.h);
      if (hit) { this.sel = hit; this.tools(); return; }
      this.room.objects = this.room.objects.filter(o => o.type); this.sel = null;
      this.drawing = { x0: p.x, y0: p.y, x1: p.x, y1: p.y };
    }
  },
  move(e) {
    const p = this.pt(e);
    if (this.step === 1 && this.dragging) { this.off.x = this.dragging.ox + (p.x - this.dragging.x); this.off.y = this.dragging.oy + (p.y - this.dragging.y); this.clampOff(); }
    if (this.step === 2 && this.dragging) this.room.floorY = clamp(p.y, 150, 500);
    if (this.step === 3 && this.drawing) { this.drawing.x1 = clamp(p.x, 0, W); this.drawing.y1 = clamp(p.y, 0, H); }
  },
  up() {
    this.dragging = null;
    if (this.step === 3 && this.drawing) {
      const d = this.drawing; this.drawing = null;
      const x = Math.min(d.x0, d.x1), y = Math.min(d.y0, d.y1), w = Math.abs(d.x1 - d.x0), h = Math.abs(d.y1 - d.y0);
      if (w >= 30 && h >= 30) { const o = { id: uid(), type: null, x, y, w, h }; this.room.objects.push(o); this.sel = o; Sound.tap(); }
      this.tools();
    }
  },

  /* ----- desenho ----- */
  sampleScale(y) { const y0 = clamp(this.room.floorY + 22, 200, 520); return (0.92 + (y - y0) / (575 - y0) * 0.32) * (this.room.scale || 1); },
  render(t) {
    const g = this.g, r = this.room; g.setTransform(DPR, 0, 0, DPR, 0, 0); g.clearRect(0, 0, W, H);
    if (this.step === 1) {
      if (this.img) this.drawImg(g);
      else if (this.photo) g.drawImage(this.photo, 0, 0, W, H);
      else {
        g.fillStyle = '#F3EEFF'; g.fillRect(0, 0, W, H);
        g.setLineDash([16, 12]); g.strokeStyle = '#B9A8FF'; g.lineWidth = 5; rr(g, 40, 40, W - 80, H - 80, 28); g.stroke(); g.setLineDash([]);
        g.font = '90px ' + FONT; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('🏡', W / 2, H / 2 - 40);
        g.fillStyle = '#7C5CFF'; g.font = '800 34px ' + FONT; g.fillText('Foto do cômodo aqui', W / 2, H / 2 + 50);
      }
      if (this.img) { g.fillStyle = 'rgba(43,34,56,.6)'; rr(g, W / 2 - 150, H - 58, 300, 40, 20); g.fill(); g.fillStyle = '#fff'; g.font = '700 20px ' + FONT; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('✋ Arraste para enquadrar', W / 2, H - 38); }
      return;
    }
    if (!this.photo) { g.fillStyle = '#F3EEFF'; g.fillRect(0, 0, W, H); return; }
    if (this.step === 4) {
      if (this.view === 'cartoon') { Home.drawCartoon(g, r); }
      else { g.drawImage(this.photo, 0, 0, W, H); this.drawHidden(g); }
      const cast = [['heroi', 300], ['princesa', 640]];
      cast.forEach(([id, x], i) => { const y = clamp(r.floorY + 120 + i * 60, r.floorY + 30, 565); drawChar(g, id, getPlayerFace() || null, x, y, this.sampleScale(y), t + i, false); });
      return;
    }
    g.drawImage(this.photo, 0, 0, W, H);
    if (this.step === 2) {
      const fy = r.floorY;
      g.fillStyle = 'rgba(92,224,138,.22)'; g.fillRect(0, fy, W, H - fy);
      g.fillStyle = 'rgba(43,34,56,.18)'; g.fillRect(0, 0, W, fy);
      g.setLineDash([18, 10]); g.strokeStyle = '#fff'; g.lineWidth = 5; g.beginPath(); g.moveTo(0, fy); g.lineTo(W, fy); g.stroke(); g.setLineDash([]);
      circ(g, W / 2, fy, 26, '#5B3FD9'); g.fillStyle = '#fff'; g.font = '800 26px ' + FONT; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('⇕', W / 2, fy + 1);
      fr(g, W / 2 + 36, fy - 50, 150, 34, 17, 'rgba(255,255,255,.92)'); g.fillStyle = '#2B2238'; g.font = '800 18px ' + FONT; g.fillText('Chão começa aqui', W / 2 + 111, fy - 33);
      const y1 = clamp(fy + 60, fy + 30, 560), y2 = 565;
      drawChar(g, currentCostume(), getPlayerFace(), W * 0.22, y1, this.sampleScale(y1), t, false);
      drawChar(g, currentCostume(), getPlayerFace(), W * 0.8, y2, this.sampleScale(y2), t + 1, false);
      return;
    }
    if (this.step === 3) {
      this.drawHidden(g);
      g.fillStyle = 'rgba(92,224,138,.10)'; g.fillRect(0, r.floorY, W, H - r.floorY);
      r.objects.forEach(o => {
        const on = o === this.sel, t2 = o.type ? homeType(o.type) : null;
        g.fillStyle = on ? 'rgba(124,92,255,.22)' : 'rgba(255,255,255,.12)'; rr(g, o.x, o.y, o.w, o.h, 10); g.fill();
        g.strokeStyle = on ? '#FFD34D' : '#7C5CFF'; g.lineWidth = on ? 5 : 4; rr(g, o.x, o.y, o.w, o.h, 10); g.stroke();
        const label = t2 ? t2.e + ' ' + t2.n : '❓ O que é?';
        g.font = '800 18px ' + FONT; const lw = g.measureText(label).width + 20;
        const ly = o.y > 34 ? o.y - 32 : o.y + 6;
        fr(g, o.x, ly, lw, 28, 14, on ? '#FFD34D' : '#5B3FD9'); g.fillStyle = on ? '#2B2238' : '#fff'; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText(label, o.x + 10, ly + 15);
      });
      if (this.drawing) {
        const d = this.drawing; g.setLineDash([12, 8]); g.strokeStyle = '#FFD34D'; g.lineWidth = 4;
        g.strokeRect(Math.min(d.x0, d.x1), Math.min(d.y0, d.y1), Math.abs(d.x1 - d.x0), Math.abs(d.y1 - d.y0)); g.setLineDash([]);
      }
    }
  },

  drawHidden(g) { this.room.objects.forEach(o => { if (o.type === 'esconder') pixelateRect(g, this.photo, o, 18); }); },

  /* ----- salvar ----- */
  save() {
    const r = this.room;
    /* borra de verdade as áreas escondidas antes de guardar a foto */
    const hid = r.objects.filter(o => o.type === 'esconder');
    if (hid.length) { const pg = this.photo.getContext('2d'); hid.forEach(o => pixelateRect(pg, this.photo, o, 18)); r.objects = r.objects.filter(o => o.type !== 'esconder'); }
    if (!r.name.trim()) r.name = (ROOM_KINDS.find(k => k.e === r.emoji) || ROOM_KINDS[4]).n;
    r.name = r.name.trim();
    Home.sampleColors(r, this.photo);
    try { r.photo = this.photo.toDataURL('image/jpeg', 0.72); } catch (e) { r.photo = null; }
    const list = Store.data.homes; const i = list.findIndex(x => x.id === r.id);
    const before = i >= 0 ? list[i] : null;
    if (i >= 0) list[i] = r; else list.push(r);
    Home.invalidate(r);
    if (!Store.save()) {
      try { localStorage.getItem('x'); r.photo = null; Store.save(); toast('Pouco espaço no aparelho: guardei só a versão desenhada.'); }
      catch (e) { toast('Este navegador não guarda dados: o cômodo vale só até fechar o jogo.'); }
    } else toast((before ? 'Cômodo atualizado' : 'Cômodo criado') + ': ' + r.emoji + ' ' + r.name);
    Sound.unlock();
    const pl = Home.placeById(r.placeId); if (pl) { pl.lastRoom = r.id; Store.save(); }
    if (App.profile) { App.profile.scene = Home.sceneId(r); Store.save(); startGame(true); }
    else show('s-home');
  },
};
