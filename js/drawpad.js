/* Prancheta de desenho livre: quadro da escola (giz) e cavalete do hobby Desenhar (papel). */
'use strict';

const DrawPad = {
  mode: 'board', cb: null, cv: null, g: null, w: 0, h: 0,
  color: '#FFFFFF', size: 10, tool: 'pen', stamp: null, undo: [], last: null, drawing: false, changed: false,
  MODES: {
    board: { w: 712, h: 332, bg: '#2F5D46', title: 'Desenhe no quadro! ✏️', pal: ['#FFFFFF', '#FFE27A', '#FF9EC4', '#8FD3FF', '#A8F0A0', '#FFB066', '#D9B8FF', '#FF6B6B'] },
    easel: { w: 480, h: 400, bg: '#FFFFFF', title: 'Hora de desenhar! 🎨', pal: ['#2B2238', '#E2464A', '#FF9F43', '#FFD34D', '#5CC46B', '#3A7BD5', '#7C5CFF', '#FF6FA8', '#8E5E33', '#9AA5B5'] },
  },
  SIZES: [[5, 'Fino'], [11, 'Médio'], [22, 'Grosso']],
  STAMPS: ['⭐', '❤️', '🌈', '🌸', '🐶', '☀️', '🦋', '🚗'],

  init() {
    this.cv = $('#drawCanvas');
    this.cv.addEventListener('pointerdown', e => this.down(e));
    this.cv.addEventListener('pointermove', e => this.move(e));
    const up = () => { this.drawing = false; this.last = null; };
    this.cv.addEventListener('pointerup', up); this.cv.addEventListener('pointercancel', up); this.cv.addEventListener('pointerleave', up);
    $('#drawCancel').addEventListener('click', () => this.close(false));
    $('#drawDone').addEventListener('click', () => this.close(true));
  },

  open(mode, cb, existing) {
    const M = this.MODES[mode]; this.mode = mode; this.cb = cb; this.w = M.w; this.h = M.h;
    this.g = setupCanvas(this.cv, M.w, M.h);
    this.cv.style.aspectRatio = M.w + '/' + M.h;
    $('#drawStage').className = 'draw-stage ' + mode;
    $('#drawTitle').textContent = M.title;
    this.g.fillStyle = M.bg; this.g.fillRect(0, 0, M.w, M.h);
    if (existing) this.g.drawImage(existing, 0, 0, M.w, M.h);
    this.color = M.pal[0]; this.size = 11; this.tool = 'pen'; this.stamp = null; this.undo = []; this.changed = false;
    this.tools();
    $('#drawModal').classList.add('open');
  },
  close(ok) {
    $('#drawModal').classList.remove('open');
    const cb = this.cb; this.cb = null;
    if (!cb) return;
    if (ok) { let url = null; try { url = this.cv.toDataURL('image/jpeg', 0.85); } catch (e) { } cb(url, this.changed); }
    else cb(null, false);
  },

  tools() {
    const M = this.MODES[this.mode];
    const pal = $('#drawPal'); pal.innerHTML = '';
    M.pal.forEach(c => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'sw' + (this.tool === 'pen' && this.color === c ? ' sel' : ''); b.style.background = c; b.setAttribute('aria-label', 'cor');
      b.addEventListener('click', () => { this.color = c; this.tool = 'pen'; this.stamp = null; Sound.tap(); this.tools(); }); pal.appendChild(b);
    });
    const tb = $('#drawBtns'); tb.innerHTML = '';
    const btn = (label, on, fn, title) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'tg' + (on ? ' sel' : ''); b.textContent = label; if (title) b.title = title; b.addEventListener('click', () => { Sound.tap(); fn(); this.tools(); }); tb.appendChild(b); };
    this.SIZES.forEach(([s, n]) => btn(n, this.size === s && this.tool !== 'stamp', () => { this.size = s; if (this.tool === 'stamp') this.tool = 'pen'; }));
    btn(this.mode === 'board' ? '🧽 Apagador' : '🧽 Borracha', this.tool === 'eraser', () => { this.tool = 'eraser'; this.stamp = null; });
    btn('↩️ Voltar', false, () => this.undoStep(), 'Desfazer');
    btn('🗑️ Limpar', false, () => { this.snap(); this.g.fillStyle = M.bg; this.g.fillRect(0, 0, this.w, this.h); this.changed = true; });
    const st = $('#drawStamps'); st.innerHTML = '';
    this.STAMPS.forEach(s => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'tg big-emoji' + (this.tool === 'stamp' && this.stamp === s ? ' sel' : ''); b.textContent = s;
      b.addEventListener('click', () => { this.tool = 'stamp'; this.stamp = s; Sound.tap(); this.tools(); }); st.appendChild(b);
    });
  },

  snap() {
    try { const c = document.createElement('canvas'); c.width = this.cv.width; c.height = this.cv.height; c.getContext('2d').drawImage(this.cv, 0, 0); this.undo.push(c); if (this.undo.length > 8) this.undo.shift(); } catch (e) { }
  },
  undoStep() {
    const c = this.undo.pop(); if (!c) return;
    this.g.save(); this.g.setTransform(1, 0, 0, 1, 0, 0); this.g.drawImage(c, 0, 0); this.g.restore();
  },
  pt(e) { const r = this.cv.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width * this.w, y: (e.clientY - r.top) / r.height * this.h }; },
  down(e) {
    e.preventDefault(); this.cv.setPointerCapture(e.pointerId);
    const p = this.pt(e); this.snap(); this.changed = true;
    if (this.tool === 'stamp') {
      const s = this.size * 2.4 + 20;
      this.g.font = Math.round(s) + 'px ' + FONT; this.g.textAlign = 'center'; this.g.textBaseline = 'middle'; this.g.fillText(this.stamp, p.x, p.y);
      Sound.pop(); return;
    }
    this.drawing = true; this.last = p; this.dot(p);
  },
  move(e) {
    if (!this.drawing) return;
    const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
    (evs.length ? evs : [e]).forEach(ev => { const p = this.pt(ev); this.seg(this.last, p); this.last = p; });
  },
  stroke() {
    const g = this.g, M = this.MODES[this.mode];
    g.strokeStyle = g.fillStyle = this.tool === 'eraser' ? M.bg : this.color;
    g.lineWidth = this.tool === 'eraser' ? this.size * 2.2 : this.size; g.lineCap = 'round'; g.lineJoin = 'round';
    g.globalAlpha = this.mode === 'board' && this.tool !== 'eraser' ? 0.92 : 1;
  },
  dot(p) { this.stroke(); this.g.beginPath(); this.g.arc(p.x, p.y, this.g.lineWidth / 2, 0, TAU); this.g.fill(); this.g.globalAlpha = 1; },
  seg(a, b) { this.stroke(); this.g.beginPath(); this.g.moveTo(a.x, a.y); this.g.lineTo(b.x, b.y); this.g.stroke(); this.g.globalAlpha = 1; },
};
