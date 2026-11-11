/* Personagens e fantasias. Todas as fantasias são ORIGINAIS (sem personagens licenciados). */
'use strict';

/* cost = estrelas necessárias para desbloquear (0 = liberada desde o início).
   Desbloqueio por conquista, nunca por sorteio nem dinheiro (sem loot boxes). */
const COSTUMES = [
  { id: 'minha', name: 'Minha roupa', cost: 0, custom: true },
  { id: 'heroi', name: 'Super-herói Estrela', cost: 0 },
  { id: 'princesa', name: 'Princesa', cost: 0 },
  { id: 'astronauta', name: 'Astronauta', cost: 0 },
  { id: 'pirata', name: 'Pirata', cost: 0 },
  { id: 'dino', name: 'Dinossauro', cost: 0 },
  { id: 'bombeiro', name: 'Bombeiro(a)', cost: 0 },
  { id: 'fada', name: 'Fada', cost: 0 },
  { id: 'cavaleiro', name: 'Cavaleiro(a)', cost: 0 },
  { id: 'mago', name: 'Mago(a)', cost: 15 },
  { id: 'ninja', name: 'Ninja', cost: 30 },
  { id: 'robo', name: 'Robô', cost: 50 },
  { id: 'sereia', name: 'Sereia', cost: 75 },
];

const ST = {
  heroi: { suit: '#2BB3A6', legs: '#1E7F78', sleeve: '#2BB3A6', glove: '#FF7A2F', shoe: '#FF7A2F', cape: '#FF7A2F' },
  princesa: { dress: '#F49AC1', bodice: '#E06AA5', sleeve: '#F9C9DE', glove: '#FFFFFF', shoe: '#B5468A' },
  astronauta: { suit: '#F4F6FA', legs: '#E2E6EE', sleeve: '#EEF1F6', glove: '#FFFFFF', shoe: '#7A8699', pack: '#B9C2D0', trim: '#FF7A2F' },
  pirata: { suit: '#FFFFFF', legs: '#3B3F5C', sleeve: '#FFFFFF', glove: null, shoe: '#2A2A2A', vest: '#8A4A2E' },
  dino: { suit: '#5CC46B', legs: '#4DAE5B', sleeve: '#5CC46B', glove: '#4DAE5B', shoe: '#3F9A4D', belly: '#D4F5A8', spike: '#FF9F43' },
  bombeiro: { suit: '#F5B82E', legs: '#3B3F5C', sleeve: '#F5B82E', glove: '#3A3A3A', shoe: '#2A2A2A', helmet: '#E23B3B' },
  fada: { dress: '#7BD8C9', bodice: '#4FB8A8', sleeve: '#A8EADF', glove: null, shoe: '#4FB8A8' },
  cavaleiro: { suit: '#B8C2CF', legs: '#9AA5B5', sleeve: '#B8C2CF', glove: '#8893A3', shoe: '#6E7889', plume: '#E23B3B', shield: '#3F6FD8' },
  mago: { dress: '#6A4BD8', bodice: '#5A3DC4', sleeve: '#7C5CFF', glove: null, shoe: '#3E2A99', hat: '#5A3DC4', brim: '#4A2FB0' },
  ninja: { suit: '#2F3350', legs: '#262A44', sleeve: '#2F3350', glove: '#262A44', shoe: '#1C1F33' },
  robo: { suit: '#8FA3BF', legs: '#7489A6', sleeve: '#8FA3BF', glove: '#5E6E88', shoe: '#4A566B' },
  sereia: { bodice: '#B49BFF', sleeve: null, glove: null, tail: '#2FB9A6', fin: '#7BE0D0' },
  minha: { suit: '#5BC0FF', legs: '#3B3F5C', sleeve: '#5BC0FF', glove: null, shoe: '#2A2A2A' },
  professora: { dress: '#3F6FD8', bodice: '#F4F6FA', sleeve: '#6E9BEA', glove: null, shoe: '#2B2238' },
};
const DRESS = { princesa: 1, fada: 1, mago: 1, professora: 1 };

function setOutfitColors(o) { if (!o) return; ST.minha.suit = ST.minha.sleeve = o.top || ST.minha.suit; ST.minha.legs = o.bottom || ST.minha.legs; }
function arm(c, x, y, ang, sleeve, hand) { c.save(); c.translate(x, y); c.rotate(ang); fr(c, -3.5, 0, 7, 22, 3.5, sleeve); circ(c, 0, 24, 4.6, hand); c.restore(); }

/* Desenha um personagem com os pés em (x,y).
   opt: { lift, tilt, sit, noShadow } */
function drawChar(c, id, face, x, y, s, t, moving, opt) {
  opt = opt || {};
  const k = ST[id] || ST.heroi; const skin = (face && face.skin) || '#F2C9A0';
  const sit = !!opt.sit;
  const ph = t * 11, step = (moving && !sit) ? Math.sin(ph) : 0;
  const bob = (moving && !sit) ? Math.abs(Math.sin(ph)) * 3 : Math.sin(t * 2.4) * 0.8;
  c.save(); c.translate(x, y); c.scale(s, s);
  if (!opt.noShadow) ell(c, 0, 0, 24, 7, 0, 'rgba(30,20,60,.18)');
  c.translate(0, -bob);
  if (opt.lift) c.translate(0, -opt.lift);
  if (opt.tilt) { c.translate(0, -10); c.rotate(opt.tilt); c.translate(0, 10); }
  if (opt.spin) { c.translate(0, -55); c.rotate(opt.spin); c.translate(0, 55); }
  if (sit) c.translate(0, 10);
  const sway = Math.sin(t * 3) * 3 - (moving ? 4 : 0);

  /* --- camada de trás --- */
  if (id === 'heroi') {
    c.fillStyle = k.cape; c.beginPath(); c.moveTo(-13, -56); c.lineTo(13, -56); c.quadraticCurveTo(22, -32, 25 + sway, sit ? -16 : -6); c.quadraticCurveTo(0, sit ? -11 : -1, -25 + sway, sit ? -16 : -6); c.quadraticCurveTo(-22, -32, -13, -56); c.fill();
  } else if (id === 'astronauta') fr(c, -18, -58, 36, 34, 8, k.pack);
  else if (id === 'dino') {
    c.fillStyle = k.suit; c.beginPath(); c.moveTo(6, -32); c.quadraticCurveTo(30, -28, 40, -8 + Math.sin(t * 4) * 2); c.quadraticCurveTo(22, -14, 6, -16); c.closePath(); c.fill();
    c.fillStyle = k.spike; [[18, -27], [27, -21], [34, -14]].forEach(([a, b]) => { c.beginPath(); c.moveTo(a - 4, b + 1); c.lineTo(a + 1, b - 7); c.lineTo(a + 5, b + 2); c.fill(); });
  } else if (id === 'fada') {
    const f = 1 + Math.sin(t * 9) * 0.1; c.save(); c.translate(0, -48); c.scale(f, 1);
    c.fillStyle = 'rgba(200,235,255,.8)'; c.strokeStyle = '#fff'; c.lineWidth = 2;
    [[-19, -6, 14, 21, -0.5], [19, -6, 14, 21, 0.5], [-15, 12, 9, 13, -0.2], [15, 12, 9, 13, 0.2]].forEach(([a, b, rx, ry, r]) => { c.beginPath(); c.ellipse(a, b, rx, ry, r, 0, TAU); c.fill(); c.stroke(); });
    c.restore();
  }

  /* --- pernas / cauda --- */
  const dress = !!DRESS[id], tail = id === 'sereia';
  const lx = -9 + step * 3, rx = 1 - step * 3;
  if (tail) {
    c.fillStyle = k.tail; c.beginPath(); c.moveTo(-13, -48); c.lineTo(13, -48); c.quadraticCurveTo(16, -26, 6, -12); c.lineTo(-6, -12); c.quadraticCurveTo(-16, -26, -13, -48); c.fill();
    c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 1.4;
    for (let yy = -42, row = 0; yy < -16; yy += 7, row++) for (let xx = -9 + (row % 2) * 3; xx < 10; xx += 6) { c.beginPath(); c.arc(xx, yy, 3, 0, Math.PI); c.stroke(); }
    const f = Math.sin(t * 4) * 2; c.fillStyle = k.fin; c.beginPath(); c.moveTo(-6, -14); c.quadraticCurveTo(-22, -6 + f, -20, 0); c.quadraticCurveTo(-8, -4, 0, -10); c.quadraticCurveTo(8, -4, 20, 0); c.quadraticCurveTo(22, -6 - f, 6, -14); c.closePath(); c.fill();
  } else {
    if (!dress) {
      if (sit) { fr(c, -10, -24, 8, 10, 3, k.legs); fr(c, 2, -24, 8, 10, 3, k.legs); }
      else { fr(c, lx, -24, 8, 21, 3, k.legs); fr(c, rx, -24, 8, 21, 3, k.legs); }
    }
    if (sit) { ell(c, -6, -14, 6.5, 4, 0, k.shoe); ell(c, 6, -14, 6.5, 4, 0, k.shoe); }
    else { ell(c, lx + 4, -3, 6.5, 4, 0, k.shoe); ell(c, rx + 4, -3, 6.5, 4, 0, k.shoe); }
  }

  /* --- corpo --- */
  if (dress) {
    const hem = sit ? -16 : -7;
    c.fillStyle = k.dress; c.beginPath(); c.moveTo(-12, -50); c.lineTo(12, -50); c.quadraticCurveTo(20, -30, 27, hem); c.quadraticCurveTo(0, hem + 6, -27, hem); c.quadraticCurveTo(-20, -30, -12, -50); c.fill();
    for (let i = -20; i <= 20; i += 8) circ(c, i, hem + 1, 3, 'rgba(255,255,255,.55)');
    fr(c, -12, -57, 24, 21, 7, k.bodice);
  } else if (tail) fr(c, -12, -57, 24, 13, 7, k.bodice);
  else fr(c, -15, -57, 30, 37, 10, k.suit);

  switch (id) {
    case 'minha': {
      const tex = (typeof outfitTex !== 'undefined' && outfitTex && !(typeof isOnline === 'function' && isOnline() && App.current === 's-game')) ? outfitTex : null;
      if (tex) { c.save(); rr(c, -15, -57, 30, 37, 10); c.clip(); c.drawImage(tex, -19, -60, 38, 43); c.restore(); }
      c.strokeStyle = 'rgba(43,34,56,.18)'; c.lineWidth = 1.5; rr(c, -15, -57, 30, 37, 10); c.stroke(); break;
    }
    case 'heroi': fr(c, -15, -28, 30, 4, 2, '#FFD34D'); circ(c, 0, -43, 8.5, '#FFD34D'); c.fillStyle = '#FF7A2F'; starPath(c, 0, -43, 5, 6.5, 2.8); c.fill(); break;
    case 'astronauta': fr(c, -8, -49, 16, 10, 2, '#3F6FD8'); circ(c, -4, -44, 1.6, '#FF5A5A'); circ(c, 0, -44, 1.6, '#FFD34D'); circ(c, 4, -44, 1.6, '#5CE08A'); fr(c, -15, -28, 30, 4, 2, k.trim); break;
    case 'pirata':
      c.save(); rr(c, -15, -57, 30, 37, 10); c.clip(); c.fillStyle = '#E2464A'; for (let yy = -55; yy < -20; yy += 7) c.fillRect(-15, yy, 30, 3); c.restore();
      fr(c, -15, -57, 9, 35, 6, k.vest); fr(c, 6, -57, 9, 35, 6, k.vest); fr(c, -15, -28, 30, 5, 2, '#3A2616'); fr(c, -3, -29, 6, 7, 1.5, '#E8B64A'); break;
    case 'dino': ell(c, 0, -38, 9, 13, 0, k.belly); break;
    case 'bombeiro': c.fillStyle = '#E6EBF2'; c.fillRect(-15, -45, 30, 3.5); c.fillRect(-15, -32, 30, 3.5); circ(c, 0, -51, 1.5, '#3A3A3A'); circ(c, 0, -38, 1.5, '#3A3A3A'); break;
    case 'cavaleiro': fr(c, -3, -55, 6, 32, 3, '#9AA5B5'); fr(c, -15, -28, 30, 4, 2, '#E8B64A'); break;
    case 'princesa': circ(c, 0, -49, 2.8, '#FFD34D'); break;
    case 'fada': c.fillStyle = '#FFE27A'; starPath(c, 0, -47, 4, 4.5, 1.6); c.fill(); break;
    case 'mago': fr(c, -12, -38, 24, 3, 1.5, '#FFD34D'); c.fillStyle = '#FFD34D'; [[-14, -24], [10, -18], [-4, -14], [16, -30]].forEach(([a, b]) => { starPath(c, a, b, 5, 3, 1.3); c.fill(); }); break;
    case 'ninja': fr(c, -15, -30, 30, 5, 2, '#E2464A'); c.strokeStyle = '#3C4166'; c.lineWidth = 3; c.beginPath(); c.moveTo(-12, -55); c.lineTo(12, -33); c.stroke(); break;
    case 'robo': {
      fr(c, -10, -51, 20, 15, 3, '#5E6E88');
      const b = Math.floor(t * 3) % 3; circ(c, -5, -44, 2.4, b === 0 ? '#5CE08A' : '#2E5A3C'); circ(c, 0, -44, 2.4, b === 1 ? '#FFD34D' : '#6A5A2A'); circ(c, 5, -44, 2.4, b === 2 ? '#FF5A5A' : '#6A2E2E');
      fr(c, -15, -29, 30, 4, 2, '#5E6E88'); break;
    }
    case 'sereia': circ(c, -5, -50, 4, '#D6C8FF'); circ(c, 5, -50, 4, '#D6C8FF'); break;
  }

  /* --- pescoço e braços --- */
  fr(c, -5, -62, 10, 7, 3, skin);
  const sw = moving && !sit ? step * 0.55 : Math.sin(t * 2.4) * 0.05;
  const sleeve = k.sleeve || skin, hand = k.glove || skin;
  arm(c, -15, -53, 0.18 + sw, sleeve, hand);
  arm(c, 15, -53, -0.18 + sw, sleeve, hand);
  if (id === 'princesa') { circ(c, -14, -53, 7, k.sleeve); circ(c, 14, -53, 7, k.sleeve); }
  if (id === 'cavaleiro') {
    circ(c, -15, -53, 7, '#9AA5B5'); circ(c, 15, -53, 7, '#9AA5B5');
    c.fillStyle = k.shield; c.beginPath(); c.moveTo(-33, -48); c.lineTo(-11, -48); c.lineTo(-11, -34); c.quadraticCurveTo(-11, -23, -22, -17); c.quadraticCurveTo(-33, -23, -33, -34); c.closePath(); c.fill();
    c.strokeStyle = '#E8B64A'; c.lineWidth = 2; c.stroke(); c.fillStyle = '#FFD34D'; starPath(c, -22, -35, 5, 6, 2.6); c.fill();
  }
  if (id === 'robo') { circ(c, -15, -53, 6, '#7489A6'); circ(c, 15, -53, 6, '#7489A6'); }
  if (id === 'fada' || id === 'mago') {
    c.strokeStyle = id === 'mago' ? '#8E5E33' : '#fff'; c.lineWidth = 2.5; c.lineCap = 'round'; c.beginPath(); c.moveTo(19, -29); c.lineTo(29, -50); c.stroke();
    c.fillStyle = '#FFD34D'; starPath(c, 30, -53, 5, 6 + Math.sin(t * 6), 2.6, t); c.fill();
  }

  /* --- cabeça --- */
  const hy = -85, R = 28;
  if (face && face.full) c.drawImage(face, -2 * R, hy - 2 * R, 4 * R, 4 * R);
  else {
    c.save(); c.beginPath(); c.arc(0, hy, R, 0, TAU); c.clip();
    if (face) c.drawImage(face, -R, hy - R, 2 * R, 2 * R); else { c.fillStyle = skin; c.fillRect(-R, hy - R, 2 * R, 2 * R); }
    c.restore();
    c.strokeStyle = 'rgba(43,34,56,.2)'; c.lineWidth = 2; c.beginPath(); c.arc(0, hy, R, 0, TAU); c.stroke();
  }

  /* --- chapéus e acessórios --- */
  switch (id) {
    case 'princesa':
      c.fillStyle = '#FFD34D'; c.beginPath(); c.moveTo(-15, -104); c.lineTo(-17, -121); c.lineTo(-8, -112); c.lineTo(0, -125); c.lineTo(8, -112); c.lineTo(17, -121); c.lineTo(15, -104); c.closePath(); c.fill();
      c.strokeStyle = '#E0A800'; c.lineWidth = 1.5; c.stroke(); circ(c, 0, -112, 2.8, '#FF6FA8'); circ(c, -10, -109, 2, '#5BC0FF'); circ(c, 10, -109, 2, '#5BC0FF'); break;
    case 'astronauta':
      circ(c, 0, hy, R + 3, 'rgba(170,215,255,.16)');
      c.lineWidth = 6; c.strokeStyle = '#E9EDF3'; c.beginPath(); c.arc(0, hy, R + 5, 0, TAU); c.stroke();
      c.lineWidth = 2; c.strokeStyle = '#C9D1DD'; c.beginPath(); c.arc(0, hy, R + 8.5, 0, TAU); c.stroke();
      c.lineWidth = 3.5; c.strokeStyle = 'rgba(255,255,255,.85)'; c.lineCap = 'round'; c.beginPath(); c.arc(0, hy, R - 6, 3.6, 4.3); c.stroke();
      c.lineWidth = 2; c.strokeStyle = '#9AA5B5'; c.beginPath(); c.moveTo(17, hy - 31); c.lineTo(23, hy - 45); c.stroke(); circ(c, 23, hy - 47, 3.5, '#FF5A5A'); break;
    case 'pirata':
      ell(c, 0, hy - 21, 37, 7.5, 0, '#2A2A35');
      c.beginPath(); c.moveTo(-24, hy - 21); c.quadraticCurveTo(-24, hy - 50, 0, hy - 50); c.quadraticCurveTo(24, hy - 50, 24, hy - 21); c.closePath(); c.fill();
      c.fillStyle = '#E8B64A'; c.fillRect(-23.5, hy - 29, 47, 4.5);
      circ(c, 0, hy - 39, 5, '#fff'); circ(c, -1.8, hy - 39.5, 1.3, '#2A2A35'); circ(c, 1.8, hy - 39.5, 1.3, '#2A2A35'); break;
    case 'dino':
      c.strokeStyle = k.suit; c.lineWidth = 10; c.beginPath(); c.arc(0, hy, R + 4, Math.PI * 0.82, Math.PI * 2.18); c.stroke();
      c.fillStyle = k.spike;
      for (let i = 0; i < 5; i++) { const a = (-150 + i * 30) * Math.PI / 180; c.beginPath(); c.moveTo(Math.cos(a - 0.14) * (R + 8), hy + Math.sin(a - 0.14) * (R + 8)); c.lineTo(Math.cos(a) * (R + 21), hy + Math.sin(a) * (R + 21)); c.lineTo(Math.cos(a + 0.14) * (R + 8), hy + Math.sin(a + 0.14) * (R + 8)); c.fill(); }
      break;
    case 'bombeiro':
      c.fillStyle = k.helmet; c.beginPath(); c.arc(0, hy - 12, R + 2, Math.PI, 0); c.closePath(); c.fill();
      ell(c, 0, hy - 12, R + 10, 5.5, 0, '#B92B2B'); fr(c, -3, hy - 12 - R - 2, 6, R, 3, '#FF6A6A');
      c.fillStyle = '#FFD34D'; starPath(c, 0, hy - 24, 6, 6, 3.6); c.fill(); break;
    case 'fada':
      for (let i = 0; i < 7; i++) { const a = (-165 + i * 25) * Math.PI / 180; const px = Math.cos(a) * (R - 1), py = hy + Math.sin(a) * (R - 1); circ(c, px, py, 4.4, i % 2 ? '#FFD34D' : '#FF8FB8'); circ(c, px, py, 1.5, '#fff'); }
      break;
    case 'cavaleiro':
      c.strokeStyle = k.suit; c.lineWidth = 7; c.beginPath(); c.arc(0, hy, R + 4, 0, TAU); c.stroke();
      c.strokeStyle = '#8893A3'; c.lineWidth = 2; c.beginPath(); c.arc(0, hy, R + 8, 0, TAU); c.stroke();
      fr(c, -4, hy - R - 17, 8, 14, 3, k.suit); ell(c, 7, hy - R - 21, 15, 7, -0.5, k.plume); break;
    case 'mago':
      c.fillStyle = k.hat; c.beginPath(); c.moveTo(-23, hy - 20); c.quadraticCurveTo(-4, hy - 52, 10, hy - 82); c.quadraticCurveTo(12, hy - 50, 23, hy - 20); c.closePath(); c.fill();
      ell(c, 0, hy - 20, 35, 7, 0, k.brim);
      c.fillStyle = '#FFD34D'; starPath(c, 3, hy - 42, 5, 6, 2.6); c.fill(); circ(c, -8, hy - 30, 2, '#FFD34D'); circ(c, 9, hy - 60, 1.8, '#FFD34D'); break;
    case 'ninja': {
      fr(c, -R - 1, hy - 21, 2 * R + 2, 8, 3, '#E2464A');
      const w = Math.sin(t * 5) * 3; c.fillStyle = '#E2464A';
      c.beginPath(); c.moveTo(R - 2, hy - 19); c.quadraticCurveTo(R + 10, hy - 18 + w, R + 20, hy - 10 + w); c.lineTo(R + 16, hy - 6 + w); c.quadraticCurveTo(R + 8, hy - 12, R - 2, hy - 14); c.closePath(); c.fill();
      c.beginPath(); c.moveTo(R - 2, hy - 16); c.quadraticCurveTo(R + 6, hy - 10 - w, R + 12, hy + 2 - w); c.lineTo(R + 8, hy + 4 - w); c.quadraticCurveTo(R + 3, hy - 8, R - 3, hy - 12); c.closePath(); c.fill();
      break;
    }
    case 'robo': {
      c.strokeStyle = '#B9C7DA'; c.lineWidth = 5; c.beginPath(); c.arc(0, hy, R + 3, 0, TAU); c.stroke();
      circ(c, -R - 5, hy, 5, '#5E6E88'); circ(c, R + 5, hy, 5, '#5E6E88');
      c.strokeStyle = '#5E6E88'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(0, hy - R - 4); c.lineTo(0, hy - R - 16); c.stroke();
      circ(c, 0, hy - R - 19, 4, Math.floor(t * 2) % 2 ? '#FF5A5A' : '#FFD34D'); break;
    }
    case 'sereia': c.fillStyle = '#FF9F43'; starPath(c, R * 0.66, hy - R * 0.74, 5, 8, 3.4, t * 0.3); c.fill(); break;
  }
  c.restore();
}
