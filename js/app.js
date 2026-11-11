/* Telas, perfis, área dos pais e laço principal */
'use strict';

const App = {
  profile: null, photoFace: null, cartoonFace: null,
  editing: null, onboarding: false, current: 's-home',
  playTime: 0, extraTime: 0, paused: false,
};

/* ---------- funções usadas pelo motor do jogo ---------- */
function getPlayerFace() { const p = App.profile; return (p && p.mode === 'offline' && App.photoFace) ? (App.photoStyled || App.photoFace) : App.cartoonFace; }
function restyle() { const p = App.profile; App.photoStyled = p && App.photoFace ? stylizePhoto(App.photoFace, p.avatar, p.photoStyle || 'mistura') : null; }
function currentCostume() { return App.profile ? App.profile.costume : 'heroi'; }
function playerName() { return App.profile ? App.profile.name : 'Eu'; }
function isOnline() { return !!(App.profile && App.profile.mode === 'online' && Store.data.settings.online); }
function addStars(n) {
  const p = App.profile; if (!p) return;
  p.stars += n; Store.save(); updateTopBar(); checkUnlocks();
}

/* ---------- utilidades de interface ---------- */
let toastT = null;
function toast(msg) { const el = $('#toast'); el.textContent = msg; el.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('show'), 3200); }
function drawFaceIn(g, face, size) {
  g.clearRect(0, 0, size, size);
  if (!face) return;
  if (face.full) g.drawImage(face, 0, 0, size, size);
  else { g.save(); g.beginPath(); g.arc(size / 2, size / 2, size / 2 - 2, 0, TAU); g.clip(); g.drawImage(face, 0, 0, size, size); g.restore(); }
}
function costumeById(id) { return COSTUMES.find(c => c.id === id) || COSTUMES[0]; }
function isUnlocked(c) { return !App.profile || App.profile.stars >= c.cost; }

/* ---------- navegação ---------- */
const SCREENS = ['s-home', 's-parent', 's-photo', 's-avatar', 's-costume', 's-room', 's-map', 's-game'];
function show(id) {
  App.current = id;
  SCREENS.forEach(s => $('#' + s).classList.toggle('active', s === id));
  document.body.classList.toggle('playing', id === 's-game' || id === 's-map');
  requestAnimationFrame(fitStage);
  if (id === 's-home') renderHome();
  if (id === 's-parent') renderParent();
  if (id === 's-photo') renderPhoto();
  if (id === 's-avatar') buildAvatarEditor();
  if (id === 's-costume') { buildCostumeGrid($('#costumeGrid'), false); refreshModeUI(); }
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
$$('[data-go]').forEach(b => b.addEventListener('click', () => show(b.dataset.go)));
$('#logoHome').addEventListener('click', () => { if (App.current !== 's-parent') show('s-home'); });

/* ---------- início ---------- */
const heroC = $('#heroCanvas'); const heroG = setupCanvas(heroC, 400, 300);
const heroCast = [
  { costume: 'astronauta', face: makeCartoonFace({ skin: 1, hairColor: 5, hairStyle: 'espetado', eyes: 3, glasses: false, freckles: true, bow: false }), x: 95 },
  { costume: 'princesa', face: makeCartoonFace({ skin: 5, hairColor: 0, hairStyle: 'chiquinhas', eyes: 1, glasses: false, freckles: false, bow: false }), x: 200 },
  { costume: 'dino', face: makeCartoonFace({ skin: 3, hairColor: 2, hairStyle: 'cacheado', eyes: 0, glasses: true, freckles: false, bow: false }), x: 305 },
];
function drawHero(t) {
  heroG.setTransform(DPR, 0, 0, DPR, 0, 0); heroG.clearRect(0, 0, 400, 300);
  for (let i = 0; i < 9; i++) { heroG.fillStyle = 'rgba(255,211,77,.7)'; starPath(heroG, 40 + i * 42, 40 + Math.sin(t * 2 + i) * 10 + (i % 2) * 24, 5, 7, 3); heroG.fill(); }
  heroCast.forEach((h, i) => drawChar(heroG, h.costume, h.face, h.x, 270, 1.35, t + i, false, i === 1 ? { tilt: Math.sin(t * 4) * 0.08 } : null));
}
function renderHome() {
  const has = Store.data.parent && Store.data.profiles.length > 0;
  $('#homeWelcome').hidden = has; $('#homeProfiles').hidden = !has;
  if (!has) return;
  const grid = $('#profileGrid'); grid.innerHTML = '';
  Store.data.profiles.forEach(p => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'pcard';
    const cv = document.createElement('canvas'); const g = setupCanvas(cv, 110, 110);
    drawFaceIn(g, makeCartoonFace(p.avatar), 110);
    if (p.photo) faceFromDataURL(p.photo).then(f => { if (f) drawFaceIn(g, f, 110); });
    b.appendChild(cv);
    const nm = document.createElement('b'); nm.textContent = p.name; b.appendChild(nm);
    const st = document.createElement('span'); st.textContent = '⭐ ' + p.stars; b.appendChild(st);
    b.addEventListener('click', () => selectProfile(p));
    grid.appendChild(b);
  });
}
async function selectProfile(p) {
  App.profile = p;
  App.photoFace = await faceFromDataURL(p.photo); restyle(); applyOutfit(p);
  App.cartoonFace = makeCartoonFace(p.avatar);
  if (!Store.data.settings.online) p.mode = 'offline';
  game.started = false;
  startGame();
}
$('#btnStart').addEventListener('click', () => { App.editing = null; show('s-parent'); });
$('#btnNewProfile').addEventListener('click', () => parentGate(() => { App.editing = null; show('s-parent'); }));
$('#btnParentsHome').addEventListener('click', () => parentGate(openSettings));

/* ---------- área dos pais: login + perfil ---------- */
const form = { age: null, hobbies: [] };
(function buildProfileForm() {
  const hg = $('#hobbyGrid');
  HOBBIES.forEach(h => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'hob'; b.dataset.hob = h.id; b.innerHTML = '<b>' + h.e + '</b>' + h.n;
    b.addEventListener('click', () => {
      $('#hobWarn').textContent = '';
      const i = form.hobbies.indexOf(h.id);
      if (i >= 0) form.hobbies.splice(i, 1);
      else if (form.hobbies.length >= 3) { $('#hobWarn').textContent = 'Escolha até 3 hobbies.'; return; }
      else form.hobbies.push(h.id);
      syncForm();
    });
    hg.appendChild(b);
  });
})();
function syncForm() {
  const raw = $('#kidAge').value.trim(), n = parseInt(raw, 10);
  form.age = (n >= 1 && n <= 17 && String(n) === raw.replace(/^0+(?=\d)/, '')) ? n : null;
  $('#ageWarn').textContent = raw && !form.age ? 'Digite uma idade entre 1 e 17 anos.' : '';
  $$('#hobbyGrid .hob').forEach(b => b.classList.toggle('sel', form.hobbies.includes(b.dataset.hob)));
  const needConsent = !App.editing;
  $('#btnProfileSave').disabled = !($('#kidName').value.trim() && form.age && form.hobbies.length && (!needConsent || $('#consent').checked));
}
function renderParent() {
  const logged = Store.data.parent;
  $('#loginStage').hidden = logged; $('#profileStage').hidden = !logged;
  if (!logged) return;
  const p = App.editing;
  $('#profileTitle').textContent = p ? 'Editar perfil' : 'Perfil da criança';
  $('#kidName').value = p ? p.name : '';
  $('#kidAge').value = p ? p.age : ''; form.hobbies = p ? p.hobbies.slice() : [];
  $('#consentRow').hidden = !!p; $('#consent').checked = false;
  $('#btnProfileSave').textContent = p ? 'Salvar' : 'Criar perfil →';
  $('#hobWarn').textContent = '';
  syncForm();
}
function parentLogin() { Store.data.parent = true; Store.save(); renderParent(); setTimeout(() => $('#kidName').focus(), 50); }
$('#btnGoogle').addEventListener('click', parentLogin);
$('#btnEmail').addEventListener('click', parentLogin);
$('#kidName').addEventListener('input', syncForm);
$('#kidAge').addEventListener('input', syncForm);
$('#consent').addEventListener('change', syncForm);
$('#btnProfileCancel').addEventListener('click', () => show(App.editing && game.started && App.profile === App.editing ? 's-game' : 's-home'));
$('#btnProfileSave').addEventListener('click', () => {
  const name = $('#kidName').value.trim(); if (!name) return;
  if (App.editing) {
    const p = App.editing; p.name = name; p.age = form.age; p.hobbies = form.hobbies.slice(); Store.save();
    const back = App.profile === p && game.started; App.editing = null;
    if (back) { buildDoRow(); updateTopBar(); show('s-game'); } else show('s-home');
    toast('Perfil salvo ✅'); return;
  }
  const p = Store.newProfile(name, form.age, form.hobbies);
  Store.data.profiles.push(p); Store.save();
  App.profile = p; App.photoFace = null; App.photoStyled = null; App.cartoonFace = makeCartoonFace(p.avatar);
  App.onboarding = true; game.started = false;
  show('s-photo');
});

/* ---------- foto ---------- */
const cropC = $('#crop'); const cc = setupCanvas(cropC, 280, 280);
const CROP = 280, CR = 118;
let img = null, zoom = 1, off = { x: 0, y: 0 };
const placeholderFace = makeDefaultFace('#D9CCFF', '#B9A8FF');
function baseScale() { return Math.max(2 * CR / img.width, 2 * CR / img.height); }
function drawCrop() {
  cc.clearRect(0, 0, CROP, CROP); cc.fillStyle = '#F3EEFF'; cc.fillRect(0, 0, CROP, CROP);
  if (!img) {
    cc.setLineDash([10, 8]); cc.strokeStyle = '#B9A8FF'; cc.lineWidth = 4; cc.beginPath(); cc.arc(CROP / 2, CROP / 2, CR, 0, TAU); cc.stroke(); cc.setLineDash([]);
    cc.globalAlpha = .35; cc.drawImage(placeholderFace, CROP / 2 - 70, CROP / 2 - 80, 140, 140); cc.globalAlpha = 1;
    cc.fillStyle = '#7C5CFF'; cc.font = '800 20px ' + FONT; cc.textAlign = 'center'; cc.textBaseline = 'middle'; cc.fillText('Sua foto aqui', CROP / 2, CROP / 2 + 86); return;
  }
  const sc = baseScale() * zoom, w = img.width * sc, h = img.height * sc;
  cc.drawImage(img, CROP / 2 - w / 2 + off.x, CROP / 2 - h / 2 + off.y, w, h);
  cc.fillStyle = 'rgba(43,34,80,.55)'; cc.beginPath(); cc.rect(0, 0, CROP, CROP); cc.arc(CROP / 2, CROP / 2, CR, 0, TAU, true); cc.fill();
  cc.strokeStyle = '#fff'; cc.lineWidth = 4; cc.beginPath(); cc.arc(CROP / 2, CROP / 2, CR, 0, TAU); cc.stroke();
}
function clampOff() { if (!img) return; const sc = baseScale() * zoom; const mx = Math.max(0, img.width * sc / 2 - CR), my = Math.max(0, img.height * sc / 2 - CR); off.x = clamp(off.x, -mx, mx); off.y = clamp(off.y, -my, my); }
function makeFace() {
  const S = 360, fc = document.createElement('canvas'); fc.width = fc.height = S; const g = fc.getContext('2d');
  const k = S / (2 * CR), sc = baseScale() * zoom * k, w = img.width * sc, h = img.height * sc;
  g.beginPath(); g.arc(S / 2, S / 2, S / 2, 0, TAU); g.clip();
  g.drawImage(img, S / 2 - w / 2 + off.x * k, S / 2 - h / 2 + off.y * k, w, h);
  fc.skin = photoSkin(fc); return fc;
}
function renderPhoto() {
  img = null; $('#btnPhotoNext').disabled = true; $('#zoomRow').style.visibility = 'hidden';
  $('#photoHelp').textContent = 'Tire uma selfie ou escolha uma foto. Depois é só arrastar para deixar o rosto dentro do círculo.';
  $('#btnKeepPhoto').hidden = !(App.profile && App.profile.photo);
  $('#photoStep').style.visibility = App.onboarding ? 'visible' : 'hidden';
  drawCrop();
}
function onFile(e) {
  const f = e.target.files && e.target.files[0]; e.target.value = ''; if (!f) return;
  const url = URL.createObjectURL(f); const im = new Image();
  im.onload = () => {
    img = im; zoom = 1; off = { x: 0, y: -im.height * baseScale() * 0.06 };
    const f = locateFace(im);
    if (f) { /* centraliza e aproxima o rosto: ele ocupa ~70% do círculo */
      zoom = clamp((2 * CR * 0.7) / (f.h * baseScale()), 1, 4); const s = baseScale() * zoom;
      off = { x: (im.width / 2 - f.x) * s, y: (im.height / 2 - f.y) * s };
    }
    clampOff();
    $('#zoom').value = zoom; $('#zoomRow').style.visibility = 'visible'; $('#btnPhotoNext').disabled = false;
    $('#photoHelp').textContent = 'Centralizei o rosto ✨ Se precisar, arraste a foto ou use o zoom para ajustar.'; drawCrop();
  };
  im.onerror = () => { $('#photoHelp').textContent = 'Não consegui abrir essa imagem. Tente uma foto JPG ou PNG.'; };
  im.src = url;
}
$('#fileCam').addEventListener('change', onFile); $('#fileGal').addEventListener('change', onFile);
$('#zoom').addEventListener('input', e => { zoom = +e.target.value; clampOff(); drawCrop(); });
let drag = null;
cropC.addEventListener('pointerdown', e => { if (!img) return; drag = { x: e.clientX, y: e.clientY, ox: off.x, oy: off.y }; cropC.setPointerCapture(e.pointerId); cropC.classList.add('grabbing'); });
cropC.addEventListener('pointermove', e => { if (!drag) return; const f = CROP / cropC.getBoundingClientRect().width; off.x = drag.ox + (e.clientX - drag.x) * f; off.y = drag.oy + (e.clientY - drag.y) * f; clampOff(); drawCrop(); });
const endDrag = () => { drag = null; cropC.classList.remove('grabbing'); };
cropC.addEventListener('pointerup', endDrag); cropC.addEventListener('pointercancel', endDrag);
cropC.addEventListener('wheel', e => { if (!img) return; e.preventDefault(); zoom = clamp(zoom - e.deltaY * 0.002, 1, 4); $('#zoom').value = zoom; clampOff(); drawCrop(); }, { passive: false });
$('#btnPhotoNext').addEventListener('click', () => {
  if (!img || !App.profile) return; const p = App.profile;
  App.photoFace = makeFace();
  try { p.photo = App.photoFace.toDataURL('image/jpeg', 0.85); } catch (e) { p.photo = null; }
  p.auto = detectFromPhoto(App.photoFace, p.avatar);
  App.cartoonFace = makeCartoonFace(p.avatar); restyle(); Store.save(); updateTopBar();
  show('s-avatar');
});
$('#btnKeepPhoto').addEventListener('click', () => show('s-avatar'));
$('#btnNoPhoto').addEventListener('click', () => {
  const p = App.profile; if (!p) return;
  p.photo = null; p.auto = { skin: false, hair: false }; App.photoFace = null; App.photoStyled = null; Store.save(); updateTopBar();
  show('s-avatar');
});

/* ---------- avatar ---------- */
const cmpPc = setupCanvas($('#cmpPhoto'), 96, 96), cmpCc = setupCanvas($('#cmpCartoon'), 150, 150);
function renderAvatarPreview() {
  const p = App.profile; App.cartoonFace = makeCartoonFace(p.avatar); restyle();
  $('#photoStyleBox').hidden = !App.photoFace;
  if (App.photoFace) {
    const box = $('#photoStyles'); box.innerHTML = ''; const cur = p.photoStyle || 'mistura';
    PHOTO_STYLES.forEach(st => { const b = document.createElement('button'); b.type = 'button'; b.className = 'tg' + (st.id === cur ? ' sel' : ''); b.textContent = st.n; b.addEventListener('click', () => { p.photoStyle = st.id; Store.save(); Sound.tap(); renderAvatarPreview(); updateTopBar(); }); box.appendChild(b); });
    $('#photoStyleDesc').textContent = 'Modo offline: ' + PHOTO_STYLES.find(s => s.id === cur).d + '.';
  }
  if (App.photoFace) drawFaceIn(cmpPc, App.photoStyled || App.photoFace, 96);
  else { cmpPc.clearRect(0, 0, 96, 96); circ(cmpPc, 48, 48, 44, '#EDE6FF'); cmpPc.fillStyle = '#9C8CD9'; cmpPc.font = '700 13px ' + FONT; cmpPc.textAlign = 'center'; cmpPc.textBaseline = 'middle'; cmpPc.fillText('sem foto', 48, 48); }
  drawFaceIn(cmpCc, App.cartoonFace, 150);
  $('#recipe').textContent = JSON.stringify(Object.assign({ apelido: p.name }, avatarRecipe(p.avatar)));
  $('#autoSkin').style.display = p.auto && p.auto.skin ? '' : 'none';
  $('#autoHair').style.display = p.auto && p.auto.hair ? '' : 'none';
}
function buildAvatarEditor() {
  const p = App.profile; if (!p) return show('s-home');
  const a = p.avatar;
  $('#avatarStep').style.visibility = App.onboarding ? 'visible' : 'hidden';
  const sw = (el, list, key, autoKey) => {
    el.innerHTML = '';
    list.forEach((col, i) => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'sw' + (a[key] === i ? ' sel' : ''); b.style.background = col; b.setAttribute('aria-label', key + ' ' + (i + 1));
      b.addEventListener('click', () => { a[key] = i; if (autoKey && p.auto) p.auto[autoKey] = false; Store.save(); buildAvatarEditor(); });
      el.appendChild(b);
    });
  };
  sw($('#swSkin'), SKINS, 'skin', 'skin'); sw($('#swHair'), HAIRC, 'hairColor', 'hair'); sw($('#swEyes'), EYES.map(e => e.c), 'eyes');
  const st = $('#swStyle'); st.innerHTML = '';
  HAIR_STYLES.forEach(s => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'sty' + (a.hairStyle === s.id ? ' sel' : '');
    const cv = document.createElement('canvas'); const g = setupCanvas(cv, 60, 60);
    drawFaceIn(g, makeCartoonFace(Object.assign({}, a, { hairStyle: s.id })), 60);
    b.appendChild(cv); b.appendChild(document.createTextNode(s.n));
    b.addEventListener('click', () => { a.hairStyle = s.id; Store.save(); buildAvatarEditor(); });
    st.appendChild(b);
  });
  const ex = $('#swExtras'); ex.innerHTML = '';
  EXTRAS.forEach(x => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'tg' + (a[x.id] ? ' sel' : ''); b.textContent = x.n;
    b.addEventListener('click', () => { a[x.id] = !a[x.id]; Store.save(); buildAvatarEditor(); });
    ex.appendChild(b);
  });
  renderAvatarPreview();
}
$('#btnAvatarBack').addEventListener('click', () => show('s-photo'));
$('#btnAvatarNext').addEventListener('click', () => {
  App.cartoonFace = makeCartoonFace(App.profile.avatar); Store.save(); updateTopBar();
  if (App.onboarding) show('s-costume'); else startGame();
});

/* ---------- fantasias ---------- */
const prevG = setupCanvas($('#preview'), 260, 300);
function buildCostumeGrid(el, inSheet) {
  el.innerHTML = ''; const p = App.profile;
  COSTUMES.forEach(cs => {
    const ok = isUnlocked(cs);
    const b = document.createElement('button'); b.type = 'button'; b.className = 'cos' + (cs.id === p.costume ? ' sel' : '') + (ok ? '' : ' locked');
    const cv = document.createElement('canvas'); const g = setupCanvas(cv, 96, 120);
    drawChar(g, cs.id, getPlayerFace(), 48, 114, 0.9, 0.4, false);
    b.appendChild(cv); b.appendChild(document.createTextNode(cs.name));
    if (!ok) { const l = document.createElement('span'); l.className = 'lock'; l.textContent = '🔒 ' + cs.cost + ' ⭐'; b.appendChild(l); }
    if (cs.custom) { const l = document.createElement('span'); l.className = 'lock'; l.textContent = p.outfit ? (cs.id === p.costume ? '✏️ trocar foto' : '👕 vestir') : '📷 criar'; b.appendChild(l); }
    b.addEventListener('click', () => {
      if (!ok) { toast('Junte ' + (cs.cost - p.stars) + ' estrelas para liberar ⭐'); Sound.tap(); return; }
      if (cs.custom && (!p.outfit || p.costume === 'minha')) { if (inSheet) closeSheet(); setTimeout(openOutfit, inSheet ? 50 : 0); return; }
      p.costume = cs.id; Store.save(); Sound.pop();
      el.querySelectorAll('.cos').forEach(x => x.classList.remove('sel')); b.classList.add('sel');
      $('#cname').textContent = cs.name;
      if (inSheet) { closeSheet(); playerSay('Olha minha fantasia! ✨', 2.5); burst(game.player.x, game.player.y - 60, 28); }
    });
    el.appendChild(b);
  });
  $('#cname').textContent = costumeById(p.costume).name;
}
$('#btnCostumeBack').addEventListener('click', () => show('s-avatar'));
$('#btnCostumePlay').addEventListener('click', () => { App.onboarding = false; startGame(); });
function checkUnlocks() {
  const p = App.profile; if (!p) return;
  COSTUMES.forEach(cs => {
    if (cs.cost > 0 && p.stars >= cs.cost && !p.celebrated.includes(cs.id)) {
      p.celebrated.push(cs.id); Store.save();
      setTimeout(() => { toast('Nova fantasia liberada: ' + cs.name + '! ✨'); Sound.unlock(); if (App.current === 's-game') burst(0, 0, 90, true); }, 900);
    }
  });
}

/* ---------- modo offline / online ---------- */
function setMode(m) {
  const p = App.profile; if (!p || p.mode === m) return;
  if (m === 'online' && !Store.data.settings.online) { toast('O modo online está desligado na área dos pais.'); return; }
  p.mode = m; Store.save(); refreshModeUI(); updateTopBar();
  if (App.current === 's-costume') buildCostumeGrid($('#costumeGrid'), false);
  if (game.started) {
    if (m === 'online') Friends.join();
    else { Friends.leave(); playerSay('Modo offline: só eu aqui 🙂', 2.6); }
  }
}
function refreshModeUI() {
  const p = App.profile; const mode = p ? p.mode : 'online'; const allowed = Store.data.settings.online;
  $$('.mode button').forEach(b => { b.classList.toggle('on', b.dataset.mode === mode); b.disabled = b.dataset.mode === 'online' && !allowed; });
  const on = isOnline();
  $('#modeBadge').textContent = on ? '🌐 Online · os amigos veem seu avatar' : (App.photoFace ? '📴 Offline · sua foto, só neste aparelho' : '📴 Offline · só neste aparelho');
  $('#fabTalk').hidden = !on; if (!on) $('#talkPanel').hidden = true;
  $('#gameNote').textContent = on
    ? 'Modo online: você aparece como avatar cartoon. Lia, Theo e Bia são amigos de teste; na versão online entram só amigos aprovados pelos pais.'
    : 'Modo offline: você brinca sozinho, com a sua foto. Nada sai do aparelho.';
}
$$('.mode button').forEach(b => b.addEventListener('click', () => setMode(b.dataset.mode)));

/* ---------- jogo ---------- */
const gameC = $('#game'); const gameG = setupCanvas(gameC, W, H);
/* ajusta o jogo/mapa para ocupar a tela inteira (mantendo a proporção 16:10) */
function fitStage() {
  const wrap = App.current === 's-game' ? $('#gameWrap') : App.current === 's-map' ? $('#mapWrap') : null; if (!wrap) return;
  const vw = window.innerWidth, vh = window.innerHeight;
  let w = vw, h = w * H / W; if (h > vh) { h = vh; w = h * W / H; }
  wrap.style.width = Math.round(w) + 'px'; wrap.style.height = Math.round(h) + 'px';
  const cv = wrap.querySelector('canvas'), bw = Math.round(w * DPR), bh = Math.round(h * DPR);
  if (cv.width !== bw || cv.height !== bh) { cv.width = bw; cv.height = bh; }
  const k = bw / W; if (cv === gameC) game.rs = k; else World.rs = k;
}
window.addEventListener('resize', fitStage);
window.addEventListener('orientationchange', () => setTimeout(fitStage, 200));
$$('.fs-btn').forEach(b => {
  const d = document.documentElement;
  if (!d.requestFullscreen) { b.hidden = true; return; }
  b.addEventListener('click', () => { if (document.fullscreenElement) document.exitFullscreen().catch(() => {}); else d.requestFullscreen().catch(() => toast('Tela cheia não disponível aqui')); });
});
const meG = setupCanvas($('#meFace'), 32, 32);
function updateTopBar() {
  const p = App.profile; if (!p) return;
  $('#score').textContent = '⭐ ' + p.stars; $('#meName').textContent = p.name;
  drawFaceIn(meG, getPlayerFace(), 32);
}
function startGame(force) {
  const p = App.profile; if (!p) return show('s-home');
  show('s-game');
  if (force || !game.started || game.scene !== p.scene) { game.started = true; gameSetScene(p.scene); p.scene = game.scene; if (isOnline()) Friends.join(); }
  refreshModeUI(); updateTopBar(); buildDoRow(); buildRoomBar(); closePops();
  if (App.hintShown) $('#hint').style.opacity = 0; App.hintShown = true;
}
const PHRASES = ['Oi! 👋', 'Vamos brincar?', 'Que legal!', 'Hahaha 😂', 'Você é demais! ⭐', '❤️'];
PHRASES.forEach(t => { const b = document.createElement('button'); b.type = 'button'; b.textContent = t; b.addEventListener('click', () => { gameSay(t); closePops(); }); $('#talk').appendChild(b); });
function buildDoRow() {
  const el = $('#doRow'); el.innerHTML = '';
  const mine = App.profile && App.profile.hobbies ? App.profile.hobbies : [];
  const list = mine.concat(HOBBIES.map(h => h.id).filter(id => !mine.includes(id)));
  list.forEach(id => {
    const h = HOBBIES.find(x => x.id === id); if (!h) return;
    const b = document.createElement('button'); b.type = 'button'; b.className = 'act'; b.dataset.act = id; b.innerHTML = '<b>' + h.e + '</b>' + h.n + (mine.includes(id) ? '<i>❤️</i>' : '');
    b.addEventListener('click', () => { closePops(); gameHobby(id); $('#hint').style.opacity = 0; }); el.appendChild(b);
  });
  const stop = document.createElement('button'); stop.type = 'button'; stop.className = 'act stop'; stop.innerHTML = '<b>✋</b>Parar';
  stop.addEventListener('click', () => { closePops(); if (game.player.act) gameHobby(game.player.act); }); el.appendChild(stop);
  refreshDoRow();
}
function refreshDoRow() {
  const a = !game.player.script && game.player.act;
  $$('#doRow button').forEach(b => b.classList.toggle('on', b.dataset.act === a));
  const h = a && HOBBIES.find(x => x.id === a); $('#fabDo').innerHTML = h ? '<b>' + h.e + '</b>Trocar' : '<b>🎮</b>Fazer'; $('#fabDo').classList.toggle('on', !!h);
}
/* ---------- painéis compactos ---------- */
function closePops(except) { ['menuPanel', 'doPanel', 'talkPanel', 'roomPanel'].forEach(id => { if (id !== except) $('#' + id).hidden = true; }); }
function togglePop(id) { const el = $('#' + id), open = el.hidden; closePops(id); el.hidden = !open; Sound.tap(); }
$('#btnMenu').addEventListener('click', () => togglePop('menuPanel'));
$('#fabDo').addEventListener('click', () => togglePop('doPanel'));
$('#fabTalk').addEventListener('click', () => togglePop('talkPanel'));
$('#roomPill').addEventListener('click', () => togglePop('roomPanel'));
$$('#menuPanel .mitem, #menuPanel .mode button').forEach(b => b.addEventListener('click', () => setTimeout(closePops, 0)));
$('#btnRoomPhoto').addEventListener('click', () => parentGate(() => { const pl = Home.placeOfScene(game.scene) || Home.places()[0]; RoomEd.open(null, pl ? pl.id : null); }));
function toWorld(e) {
  const r = gameC.getBoundingClientRect(), z = game.zoom || 1;
  const vx = (e.clientX - r.left) / r.width * W, vy = (e.clientY - r.top) / r.height * H;
  return { x: (game.camX || W / 2) + (vx - W / 2) / z, y: (game.camY || H / 2) + (vy - H / 2) / z };
}
/* zoom: botões, pinça com dois dedos e roda do mouse */
function setZoom(z) { game.zoom = clamp(z, 1, 3); $('#zLbl').textContent = (Math.round(game.zoom * 10) / 10) + '×'; }
$('#fabZoom').addEventListener('click', () => { const z = game.zoom || 1; setZoom(z < 1.5 ? 1.8 : z < 2.4 ? 2.7 : 1); Sound.tap(); });
const touches = new Map(); let pinch = null;
gameC.addEventListener('pointerdown', e => {
  closePops();
  touches.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (touches.size === 2) { const [a, b] = [...touches.values()]; pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), z: game.zoom || 1 }; return; }
  if (touches.size > 2 || pinch) return;
  const p = toWorld(e); gameTap(p.x, p.y); $('#hint').style.opacity = 0;
});
gameC.addEventListener('pointermove', e => {
  if (!touches.has(e.pointerId)) return; touches.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (pinch && touches.size === 2) { const [a, b] = [...touches.values()]; setZoom(pinch.z * Math.hypot(a.x - b.x, a.y - b.y) / Math.max(20, pinch.d)); }
});
const endTouch = e => { touches.delete(e.pointerId); if (touches.size === 0) pinch = null; };
gameC.addEventListener('pointerup', endTouch); gameC.addEventListener('pointercancel', endTouch); gameC.addEventListener('pointerleave', endTouch);
gameC.addEventListener('wheel', e => { e.preventDefault(); setZoom((game.zoom || 1) - e.deltaY * 0.002); }, { passive: false });
const KEYMAP = { ArrowLeft: 'l', ArrowRight: 'r', ArrowUp: 'u', ArrowDown: 'd', a: 'l', d: 'r', w: 'u', s: 'd', A: 'l', D: 'r', W: 'u', S: 'd' };
window.addEventListener('keydown', e => {
  if (App.current !== 's-game' || anyOverlay()) return; if (e.target.tagName === 'INPUT') return;
  const k = KEYMAP[e.key]; if (k) { game.keys[k] = true; e.preventDefault(); if (game.player.act && !game.player.script) { game.player.act = null; refreshDoRow(); } $('#hint').style.opacity = 0; }
});
window.addEventListener('keyup', e => { const k = KEYMAP[e.key]; if (k) game.keys[k] = false; });
$('#meChip').addEventListener('click', () => show('s-home'));
$('#btnHome').addEventListener('click', () => { closePops(); show('s-home'); });
$('#btnCloset').addEventListener('click', () => openSheet('Fantasias', g => {
  const info = document.createElement('p'); info.className = 'small'; info.textContent = 'Você tem ' + App.profile.stars + ' ⭐. Pegue estrelas e brinque com os objetos ✨ para liberar fantasias novas!';
  g.appendChild(info); const grid = document.createElement('div'); grid.className = 'costumes'; g.appendChild(grid); buildCostumeGrid(grid, true);
}));
$('#btnMap').addEventListener('click', () => World.open());
$('#btnPets').addEventListener('click', () => openPetAdopt());
function onSceneChange(id) {
  const p = App.profile; if (p) { p.scene = id; const pl = Home.placeOfScene(id); if (pl) pl.lastRoom = id.slice(5); Store.save(); }
  const room = Home.byScene(id);
  if (room && room.photo && isOnline()) toast('🌐 No modo online o cômodo aparece desenhado. Toque em 📴 para ver a foto.');
  buildRoomBar();
}
function buildRoomBar() {
  const bar = $('#roomBar'), pill = $('#roomPill'), pl = Home.placeOfScene(game.scene);
  bar.innerHTML = '';
  if (!pl) { pill.hidden = true; $('#roomPanel').hidden = true; return; }
  const cur = Home.byScene(game.scene); pill.hidden = false; pill.textContent = '📍 ' + (cur ? cur.emoji + ' ' + cur.name : pl.name) + ' ▾';
  const t = document.createElement('div'); t.className = 'pop-title'; t.textContent = pl.icon + ' ' + pl.name; bar.appendChild(t);
  Home.roomsOf(pl.id).forEach(r => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'act'; b.innerHTML = '<b>' + r.emoji + '</b>' + esc(r.name); const sid = Home.sceneId(r);
    if (sid === game.scene) b.classList.add('on');
    b.addEventListener('click', () => { closePops(); if (sid !== game.scene) { game.fade = 1; gameSetScene(sid); if (isOnline()) Friends.join(); } });
    bar.appendChild(b);
  });
  const add = document.createElement('button'); add.type = 'button'; add.className = 'act stop'; add.innerHTML = '<b>📷</b>Novo cômodo';
  add.addEventListener('click', () => { closePops(); parentGate(() => RoomEd.open(null, pl.id, Home.facadeOf(pl.id) ? null : 'fachada')); }); bar.appendChild(add);
}

$('#btnAvatarEdit').addEventListener('click', () => { App.onboarding = false; show('s-avatar'); });
$('#btnPhotoEdit').addEventListener('click', () => { App.onboarding = false; show('s-photo'); });
$('#btnParentsGame').addEventListener('click', () => parentGate(openSettings));

/* ---------- painel ---------- */
function openSheet(title, build) { $('#sheetTitle').textContent = title; const body = $('#sheetBody'); body.innerHTML = ''; build(body); $('#sheet').classList.add('open'); }
function closeSheet() { $('#sheet').classList.remove('open'); }
$('#sheetClose').addEventListener('click', closeSheet);
$('#sheet').addEventListener('click', e => { if (e.target.id === 'sheet') closeSheet(); });
function anyOverlay() { return $('#sheet').classList.contains('open') || $('#gate').classList.contains('open') || $('#timeup').classList.contains('open') || $('#drawModal').classList.contains('open') || $('#quizModal').classList.contains('open'); }

/* ---------- desenhos da criança (guardados no perfil, só no aparelho) ---------- */
const drawCache = {};
function getDrawing(kind) {
  const p = App.profile, url = p && p.drawings && p.drawings[kind]; if (!url) return null;
  let c = drawCache[kind];
  if (!c || c.url !== url) { const im = new Image(); im.src = url; c = drawCache[kind] = { url, im }; }
  return c.im.complete && c.im.naturalWidth ? c.im : null;
}
function saveDrawing(kind, url) {
  const p = App.profile; if (!p || !url) return;
  p.drawings = p.drawings || {}; p.drawings[kind] = url;
  if (!Store.save()) toast('Pouco espaço no aparelho: o desenho vale até fechar o jogo.');
}

/* ---------- pergunta para adultos ---------- */
let gateCb = null;
function parentGate(cb) { gateCb = cb; newGateQuestion(); $('#gate').classList.add('open'); }
function newGateQuestion() {
  const a = 3 + Math.floor(Math.random() * 7), b = 3 + Math.floor(Math.random() * 7), ans = a * b;
  const opts = new Set([ans]); while (opts.size < 4) opts.add(ans + pick([-a, -b, a, b, 1, -1, 2, 10]));
  $('#gateQ').textContent = 'Quanto é ' + a + ' × ' + b + '?';
  const box = $('#gateOpts'); box.innerHTML = '';
  Array.from(opts).sort(() => Math.random() - .5).forEach(v => {
    const btn = document.createElement('button'); btn.type = 'button'; btn.textContent = v;
    btn.addEventListener('click', () => {
      if (v === ans) { $('#gate').classList.remove('open'); const cb = gateCb; gateCb = null; if (cb) cb(); }
      else { const m = $('#gate .mbox'); m.classList.remove('shake'); void m.offsetWidth; m.classList.add('shake'); setTimeout(newGateQuestion, 350); }
    });
    box.appendChild(btn);
  });
}
$('#gateClose').addEventListener('click', () => { $('#gate').classList.remove('open'); gateCb = null; });

/* ---------- configurações dos pais ---------- */
function openSettings() {
  openSheet('Área dos pais', body => {
    const S = Store.data.settings;
    const sec = (title, html) => { const d = document.createElement('div'); d.className = 'set-sec'; d.innerHTML = '<h3>' + title + '</h3>' + (html || ''); body.appendChild(d); return d; };
    const sw = (on, label, fn) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'switch' + (on ? ' on' : ''); b.textContent = label; b.addEventListener('click', fn); return b; };

    const s1 = sec('Sons'); const r1 = document.createElement('div'); r1.className = 'set-row';
    r1.append(sw(S.sound, 'Ligado', () => { S.sound = true; Sound.on = true; Store.save(); openSettings(); }), sw(!S.sound, 'Desligado', () => { S.sound = false; Sound.on = false; Store.save(); openSettings(); }));
    s1.appendChild(r1);

    const s2 = sec('Modo online com amigos', '<p class="small">Desligado: a criança só brinca no modo offline. Na versão online, só entram amigos aprovados por você.</p>');
    const r2 = document.createElement('div'); r2.className = 'set-row';
    r2.append(sw(S.online, 'Permitido', () => { S.online = true; Store.save(); refreshModeUI(); openSettings(); }),
      sw(!S.online, 'Bloqueado', () => { S.online = false; Store.data.profiles.forEach(p => p.mode = 'offline'); Store.save(); if (game.started) Friends.leave(); refreshModeUI(); updateTopBar(); openSettings(); }));
    s2.appendChild(r2);

    const s3 = sec('Limite de tempo por sessão'); const r3 = document.createElement('div'); r3.className = 'set-row';
    [[0, 'Sem limite'], [15, '15 min'], [30, '30 min'], [60, '1 hora']].forEach(([v, l]) => r3.appendChild(sw(S.timeLimit === v, l, () => { S.timeLimit = v; App.playTime = 0; App.extraTime = 0; Store.save(); openSettings(); })));
    s3.appendChild(r3);

    const s4 = sec('Perfis');
    Store.data.profiles.forEach(p => {
      const row = document.createElement('div'); row.className = 'prow';
      const cv = document.createElement('canvas'); const g = setupCanvas(cv, 44, 44); drawFaceIn(g, makeCartoonFace(p.avatar), 44);
      const info = document.createElement('div'); info.className = 'pinfo'; info.innerHTML = esc(p.name) + '<small>' + p.age + ' anos · ⭐ ' + p.stars + ' · ' + (p.photo ? 'com foto (só no aparelho)' : 'sem foto') + '</small>';
      const ed = document.createElement('button'); ed.className = 'btn small alt'; ed.textContent = 'Editar'; ed.addEventListener('click', () => { closeSheet(); App.editing = p; show('s-parent'); });
      row.append(cv, info, ed);
      if (p.photo) { const ph = document.createElement('button'); ph.className = 'btn small alt'; ph.textContent = 'Apagar foto'; ph.addEventListener('click', () => { p.photo = null; if (App.profile === p) { App.photoFace = null; App.photoStyled = null; updateTopBar(); refreshModeUI(); } Store.save(); toast('Foto apagada 🗑️'); openSettings(); }); row.appendChild(ph); }
      const del = document.createElement('button'); del.className = 'btn small danger'; del.textContent = 'Excluir';
      del.addEventListener('click', () => {
        if (!del.classList.contains('armed')) { del.classList.add('armed'); del.textContent = 'Tem certeza?'; return; }
        Store.data.profiles = Store.data.profiles.filter(x => x !== p); Store.save();
        if (App.profile === p) { App.profile = null; game.started = false; closeSheet(); show('s-home'); } else openSettings();
        toast('Perfil excluído');
      });
      row.appendChild(del); s4.appendChild(row);
    });

    const s45 = sec('Lugares do meu mundo', '<p class="small">Lugares criados com fotos (sua casa, casa da vó...). As fotos ficam só neste aparelho; no modo online aparece só a versão desenhada.</p>');
    const armDel = (btn, label, fn) => btn.addEventListener('click', () => { if (!btn.classList.contains('armed')) { btn.classList.add('armed'); btn.textContent = 'Tem certeza?'; return; } fn(); });
    const dropRooms = rooms => {
      const ids = rooms.map(r => Home.sceneId(r)); rooms.forEach(r => Home.invalidate(r));
      Store.data.homes = Store.data.homes.filter(x => !rooms.includes(x));
      Store.data.profiles.forEach(p => { if (ids.includes(p.scene)) p.scene = 'casa'; });
      if (game.started && ids.includes(game.scene)) gameSetScene('casa');
    };
    Home.places().forEach(pl => {
      const head = document.createElement('div'); head.className = 'place-head';
      const nm = document.createElement('b'); nm.textContent = pl.icon + ' ' + pl.name; head.appendChild(nm);
      const ed = document.createElement('button'); ed.className = 'btn small alt'; ed.textContent = 'Editar'; ed.addEventListener('click', () => openPlaceForm(pl));
      const add = document.createElement('button'); add.className = 'btn small alt'; add.textContent = '📷 Cômodo'; add.addEventListener('click', () => { closeSheet(); RoomEd.open(null, pl.id); });
      if (!Home.facadeOf(pl.id)) { const fb = document.createElement('button'); fb.className = 'btn small alt'; fb.textContent = '🏠 Fachada'; fb.addEventListener('click', () => { closeSheet(); RoomEd.open(null, pl.id, 'fachada'); }); head.appendChild(fb); }
      const del = document.createElement('button'); del.className = 'btn small danger'; del.textContent = 'Excluir lugar';
      armDel(del, '', () => { dropRooms(Home.roomsOf(pl.id)); Store.data.places = Store.data.places.filter(x => x !== pl); Store.save(); World.bg = null; toast('Lugar excluído'); openSettings(); });
      head.append(ed, add, del); s45.appendChild(head);
      Home.roomsOf(pl.id).forEach(r => {
        const row = document.createElement('div'); row.className = 'prow sub';
        const info = document.createElement('div'); info.className = 'pinfo'; info.innerHTML = esc(r.emoji + ' ' + r.name) + '<small>' + r.objects.length + ' móveis · ' + (r.photo ? 'com foto (só no aparelho)' : 'só desenho') + '</small>';
        const e2 = document.createElement('button'); e2.className = 'btn small alt'; e2.textContent = 'Editar'; e2.addEventListener('click', () => { closeSheet(); RoomEd.open(r); });
        const d2 = document.createElement('button'); d2.className = 'btn small danger'; d2.textContent = 'Excluir';
        armDel(d2, '', () => { dropRooms([r]); Store.save(); toast('Cômodo excluído'); openSettings(); });
        row.append(info, e2, d2); s45.appendChild(row);
      });
    });
    if (Home.places().length < MAX_PLACES) { const np = document.createElement('button'); np.className = 'btn small pink'; np.style.marginTop = '12px'; np.textContent = '＋ Novo lugar'; np.addEventListener('click', () => openPlaceForm(null)); s45.appendChild(np); }

    const s5 = sec('Dados deste aparelho', '<p class="small">Tudo fica guardado só neste aparelho. Versão de testes: o login ainda é simulado.</p>');
    const wipe = document.createElement('button'); wipe.className = 'btn small danger'; wipe.textContent = 'Apagar tudo e sair';
    wipe.addEventListener('click', () => {
      if (!wipe.classList.contains('armed')) { wipe.classList.add('armed'); wipe.textContent = 'Toque de novo para confirmar'; return; }
      Store.wipe(); App.profile = null; App.photoFace = null; game.started = false; closeSheet(); show('s-home'); toast('Todos os dados foram apagados');
    });
    s5.appendChild(wipe);
  });
}

/* ---------- limite de tempo ---------- */
function checkTime() {
  const lim = Store.data.settings.timeLimit; if (!lim) return;
  if (App.playTime >= lim * 60 + App.extraTime) { $('#timeup').classList.add('open'); }
}
$('#btnTimeHome').addEventListener('click', () => { $('#timeup').classList.remove('open'); show('s-home'); });
$('#btnTimeMore').addEventListener('click', () => parentGate(() => { App.extraTime += 15 * 60; $('#timeup').classList.remove('open'); }));

/* ---------- laço principal ---------- */
let last = performance.now(), T = 0;
function loop(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now; T += dt;
  if (App.current === 's-home' && !$('#homeWelcome').hidden) drawHero(T);
  if (App.current === 's-costume' && App.profile) {
    prevG.setTransform(DPR, 0, 0, DPR, 0, 0); prevG.clearRect(0, 0, 260, 300); ell(prevG, 130, 268, 70, 14, 0, 'rgba(91,63,217,.08)');
    drawChar(prevG, App.profile.costume, getPlayerFace(), 130, 262, 1.75, T, false);
  }
  if (App.current === 's-room') RoomEd.render(T);
  if (App.current === 's-map') World.render(T, dt);
  if (App.current === 's-game' && !anyOverlay()) {
    App.playTime += dt; gameUpdate(dt); gameRender(gameG, game.t); checkTime();
    const sc = '⭐ ' + App.profile.stars; if (sc !== App.lastScore) { App.lastScore = sc; $('#score').textContent = sc; }
  }
  requestAnimationFrame(loop);
}

/* ---------- início ---------- */
Store.load();
RoomEd.init();
DrawPad.init();
Quiz.init();
World.init();
Sound.on = Store.data.settings.sound;
show('s-home');
drawCrop();
requestAnimationFrame(loop);
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { clearBgCache(); drawCrop(); });
