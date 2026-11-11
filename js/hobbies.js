/* Hobbies: o que o personagem faz no jogo (escolhidos no perfil da criança).
   Usados só para a brincadeira. Nunca para publicidade (proibido pelo ECA Digital). */
'use strict';

const HOBBIES = [
  { id: 'bola', n: 'Jogar bola', e: '⚽' },
  { id: 'desenhar', n: 'Desenhar', e: '🎨' },
  { id: 'dancar', n: 'Dançar', e: '💃' },
  { id: 'ler', n: 'Ler', e: '📚' },
  { id: 'cantar', n: 'Cantar', e: '🎤' },
  { id: 'corda', n: 'Pular corda', e: '➰' },
  { id: 'pular', n: 'Pular', e: '🦘' },
  { id: 'girar', n: 'Dar estrelinha', e: '🤸' },
  { id: 'palmas', n: 'Bater palmas', e: '👏' },
  { id: 'bolhas', n: 'Bolhas de sabão', e: '🫧' },
  { id: 'pipa', n: 'Soltar pipa', e: '🪁' },
  { id: 'violao', n: 'Tocar violão', e: '🎸' },
];
const HOBBY_PRAISE = { pular: 'Que pulo alto! 🦘', girar: 'Uau, que estrelinha! 🤸', palmas: 'Eba! 👏👏', bolhas: 'Que bolhas lindas! 🫧', pipa: 'Sua pipa tá alta! 🪁', violao: 'Toca mais uma! 🎸', bola: 'Que embaixadinha! ⚽', desenhar: 'Que desenho lindo! 🎨', dancar: 'Arrasou na dança! 💃', ler: 'Que livro é esse? 📚', cantar: 'Canta mais! 🎶', corda: 'Uau, quanto pulo!' };
const HOBBY_VERB = { pular: 'pular', girar: 'dar estrelinha', palmas: 'bater palmas', bolhas: 'fazer bolhas', pipa: 'soltar pipa', violao: 'tocar violão', bola: 'jogar bola', desenhar: 'desenhar', dancar: 'dançar', ler: 'ler', cantar: 'cantar', corda: 'pular corda' };

function actOpts(o, t) {
  if (o.act === 'dancar') return { tilt: Math.sin(t * 7) * 0.16, lift: Math.abs(Math.sin(t * 7)) * 5 };
  if (o.act === 'corda') return { lift: Math.abs(Math.sin(o.actT * 6.5)) * 13 };
  if (o.act === 'pular') { const p = (o.actT * 1.6) % 1; return { lift: Math.sin(p * Math.PI) * 55 }; }
  if (o.act === 'girar') { const p = (o.actT * 0.8) % 1; return { spin: p < 0.6 ? (p / 0.6) * TAU : 0, lift: p < 0.6 ? Math.sin(p / 0.6 * Math.PI) * 26 : 0 }; }
  if (o.act === 'palmas' || o.act === 'violao') return { tilt: Math.sin(t * 5) * 0.06 };
  return null;
}
function notes(c, x, y, t, n) {
  c.font = '700 18px ' + FONT; c.textAlign = 'center'; c.textBaseline = 'middle';
  for (let i = 0; i < n; i++) {
    const p = (t * 0.6 + i / n) % 1; c.globalAlpha = 1 - p; c.fillStyle = ['#FF6FA8', '#7C5CFF', '#2BB3A6'][i % 3];
    c.fillText(i % 2 ? '♫' : '♪', x + Math.sin(p * 6 + i) * 12 + (i - 1) * 14, y - p * 48);
  }
  c.globalAlpha = 1;
}
/* objetos atrás do personagem (cavalete) */
function drawActBack(c, o, s, t) {
  if (o.act !== 'desenhar') return;
  c.save(); c.translate(o.x, o.y); c.scale(s, s);
  c.strokeStyle = '#8E5E33'; c.lineWidth = 3; c.lineCap = 'round';
  c.beginPath(); c.moveTo(40, 0); c.lineTo(48, -80); c.moveTo(66, 0); c.lineTo(58, -80); c.moveTo(53, -2); c.lineTo(53, -60); c.stroke();
  fr(c, 30, -92, 46, 38, 3, '#fff'); c.strokeStyle = '#D9CEFF'; c.lineWidth = 1.5; rr(c, 30, -92, 46, 38, 3); c.stroke();
  const mine = o === game.player ? getDrawing('easel') : null;
  if (mine) {
    c.strokeStyle = '#8E5E33'; c.lineWidth = 3.5; c.beginPath(); c.moveTo(70, -60); c.lineTo(70, -2); c.stroke();
    fr(c, 30, -128, 80, 68, 4, '#fff'); c.strokeStyle = '#B07A45'; c.lineWidth = 3; rr(c, 30, -128, 80, 68, 4); c.stroke();
    c.save(); rr(c, 33, -125, 74, 62, 2); c.clip(); c.drawImage(mine, 33, -125, 74, 62); c.restore(); c.restore(); return;
  }
  const p = Math.min(1, o.actT / 6);
  if (p > 0.1) circ(c, 39, -83, 5 * Math.min(1, (p - 0.1) * 8), '#FFD34D');
  if (p > 0.3) fr(c, 48, -76, 16, 14, 1, '#FF8FB8');
  if (p > 0.5) { c.fillStyle = '#E2464A'; c.beginPath(); c.moveTo(46, -76); c.lineTo(56, -85); c.lineTo(66, -76); c.closePath(); c.fill(); }
  if (p > 0.7) fr(c, 32, -60, 42, 3, 1, '#5CC46B');
  if (p > 0.85) circ(c, 38, -64, 2.5, '#7C5CFF');
  c.restore();
}
/* objetos na frente do personagem (bola, livro, microfone, corda...) */
function drawActFront(c, o, s, t) {
  if (!o.act) return;
  c.save(); c.translate(o.x, o.y); c.scale(s, s);
  const op = actOpts(o, t); if (op && op.lift) c.translate(0, -op.lift);
  switch (o.act) {
    case 'bola': {
      const k = o.actT * 6.5, h = Math.abs(Math.sin(k)) * 42, by = -8 - h;
      circ(c, 14, by, 8, '#fff'); c.strokeStyle = '#2B2238'; c.lineWidth = 1.5; c.beginPath(); c.arc(14, by, 8, 0, TAU); c.stroke();
      c.fillStyle = '#2B2238'; starPath(c, 14, by, 5, 3.6, 1.7, k); c.fill();
      const n = Math.floor(k / Math.PI);
      if (n > 0) { c.font = '800 15px ' + FONT; c.fillStyle = '#5B3FD9'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(n, 34, -34); }
      break;
    }
    case 'desenhar': {
      const w = Math.sin(t * 10) * 3; c.strokeStyle = '#8E5E33'; c.lineWidth = 2.5; c.lineCap = 'round';
      c.beginPath(); c.moveTo(19, -29); c.lineTo(31, -58 + w); c.stroke(); circ(c, 31, -59 + w, 2.8, ['#FF6FA8', '#5BC0FF', '#FFD34D'][Math.floor(t * 2) % 3]); break;
    }
    case 'ler': {
      fr(c, -21, -49, 42, 28, 3, '#5B3FD9'); fr(c, -19, -48, 18, 25, 2, '#fff'); fr(c, 1, -48, 18, 25, 2, '#fff');
      c.strokeStyle = '#CFC6EA'; c.lineWidth = 1.2;
      for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(-16, -43 + i * 5); c.lineTo(-4, -43 + i * 5); c.moveTo(4, -43 + i * 5); c.lineTo(16, -43 + i * 5); c.stroke(); }
      const fp = (o.actT % 2.5) / 2.5; if (fp < 0.3) { const a = fp / 0.3, wd = 18 * Math.abs(1 - 2 * a) + 1; fr(c, a < 0.5 ? 1 : 1 - wd, -48, wd, 25, 2, '#EEE8FF'); }
      break;
    }
    case 'cantar': c.strokeStyle = '#2B2238'; c.lineWidth = 3; c.lineCap = 'round'; c.beginPath(); c.moveTo(19, -29); c.lineTo(15, -60); c.stroke(); circ(c, 14, -64, 6, '#9AA5B5'); notes(c, 30, -104, t, 3); break;
    case 'dancar': notes(c, 0, -124, t, 3); break;
    case 'violao': {
      c.save(); c.translate(2, -38); c.rotate(-0.5);
      ell(c, 0, 6, 12, 10, 0, '#C77B3A'); ell(c, 0, -6, 9, 8, 0, '#C77B3A'); circ(c, 0, 2, 3.5, '#5A3A22'); fr(c, -2, -40, 4, 32, 2, '#8E5E33'); fr(c, -4, -46, 8, 8, 2, '#5A3A22');
      c.restore(); notes(c, 26, -110, t, 3); break;
    }
    case 'palmas': {
      c.font = '20px ' + FONT; c.textAlign = 'center'; c.textBaseline = 'middle';
      for (let i = 0; i < 3; i++) { const p = (t * 0.9 + i / 3) % 1; c.globalAlpha = 1 - p; c.fillText('👏', (i - 1) * 22, -110 - p * 50); }
      c.globalAlpha = 1; if (Math.sin(t * 12) > 0.6) { c.fillStyle = '#FFD34D'; starPath(c, 0, -52, 4, 7, 2.5, t); c.fill(); }
      break;
    }
    case 'bolhas': {
      c.strokeStyle = '#8E5E33'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(19, -29); c.lineTo(26, -56); c.stroke();
      c.strokeStyle = '#5BC0FF'; c.lineWidth = 2; c.beginPath(); c.arc(27, -62, 6, 0, TAU); c.stroke();
      for (let i = 0; i < 6; i++) { const p = (t * 0.35 + i / 6) % 1, x = 30 + p * 70 + Math.sin(p * 9 + i) * 10, y = -62 - p * 90, r = 4 + (i % 3) * 3;
        c.globalAlpha = 1 - p; c.strokeStyle = ['#8FD3FF', '#FF9EC4', '#B49BFF'][i % 3]; c.lineWidth = 2; c.beginPath(); c.arc(x, y, r, 0, TAU); c.stroke(); circ(c, x - r * 0.35, y - r * 0.35, r * 0.25, 'rgba(255,255,255,.9)'); }
      c.globalAlpha = 1; break;
    }
    case 'pipa': {
      const kx = 70 + Math.sin(t * 1.3) * 18, ky = -190 + Math.cos(t * 1.7) * 12;
      c.strokeStyle = 'rgba(43,34,56,.6)'; c.lineWidth = 1.3; c.beginPath(); c.moveTo(19, -30); c.quadraticCurveTo(60, -60, kx, ky + 22); c.stroke();
      c.save(); c.translate(kx, ky); c.rotate(Math.sin(t * 2) * 0.15);
      c.fillStyle = '#FF6FA8'; c.beginPath(); c.moveTo(0, -22); c.lineTo(16, 0); c.lineTo(0, 22); c.lineTo(-16, 0); c.closePath(); c.fill();
      c.fillStyle = '#FFD34D'; c.beginPath(); c.moveTo(0, -22); c.lineTo(16, 0); c.lineTo(0, 0); c.closePath(); c.fill(); c.beginPath(); c.moveTo(0, 22); c.lineTo(-16, 0); c.lineTo(0, 0); c.closePath(); c.fill();
      c.strokeStyle = '#5B3FD9'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(0, 22); for (let i = 1; i <= 5; i++) c.lineTo(Math.sin(t * 4 + i) * 6, 22 + i * 8); c.stroke();
      c.restore(); break;
    }
    case 'corda': { const th = o.actT * 6.5, cy = -30 + Math.cos(th) * 64; c.strokeStyle = '#FF6FA8'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(-20, -29); c.quadraticCurveTo(0, cy, 20, -29); c.stroke(); break; }
  }
  c.restore();
}
