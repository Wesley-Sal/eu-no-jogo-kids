/* Efeitos sonoros sintetizados (sem arquivos de áudio) */
'use strict';

const Sound = {
  ctx: null,
  on: true,
  init() {
    if (this.ctx) return;
    try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { this.ctx = null; }
  },
  tone(freq, dur, type, vol, slide, delay) {
    if (!this.on || !this.ctx) return;
    try {
      const c = this.ctx, t = c.currentTime + (delay || 0);
      const o = c.createOscillator(), g = c.createGain();
      o.type = type || 'sine'; o.frequency.setValueAtTime(freq, t);
      if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), t + dur);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol || 0.12, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + dur + 0.05);
    } catch (e) { /* som é opcional */ }
  },
  tap() { this.tone(520, 0.08, 'triangle', 0.07); },
  star() { this.tone(880, 0.12, 'sine', 0.14); this.tone(1320, 0.16, 'sine', 0.11, 0, 0.07); },
  win() { [523, 659, 784, 1047].forEach((f, i) => this.tone(f, 0.22, 'triangle', 0.13, 0, i * 0.1)); },
  unlock() { [784, 988, 1175, 1568].forEach((f, i) => this.tone(f, 0.28, 'sine', 0.13, 0, i * 0.08)); },
  slide() { this.tone(900, 0.75, 'sine', 0.1, -620); },
  pop() { this.tone(320, 0.1, 'square', 0.04, 220); },
  chat() { this.tone(660, 0.07, 'sine', 0.07); this.tone(880, 0.07, 'sine', 0.05, 0, 0.06); },
  bark() { this.tone(420, 0.09, 'square', 0.05, -160); this.tone(380, 0.1, 'square', 0.05, -160, 0.16); },
  coin() { [988, 1319].forEach((f, i) => this.tone(f, 0.12, 'square', 0.04, 0, i * 0.08)); },
};

document.addEventListener('pointerdown', () => {
  Sound.init();
  if (Sound.ctx && Sound.ctx.state === 'suspended') Sound.ctx.resume().catch(() => {});
}, { capture: true });
