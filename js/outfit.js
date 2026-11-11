/* "Minha roupa": foto de uma roupa de verdade vira a roupa do personagem (em estilo desenho).
   A foto da roupa fica só no aparelho; no modo online vão só as cores. */
'use strict';

const PANTS = ['#3B3F5C', '#2F5D9E', '#1C1C1C', '#8E5E33', '#9AA5B5', '#E2464A', '#FF8FB8', '#F4F1EA'];
let outfitTex = null;

function applyOutfit(p) {
  outfitTex = null;
  if (!p || !p.outfit) return;
  setOutfitColors(p.outfit);
  if (p.outfit.tex) { const im = new Image(); im.onload = () => { const c = document.createElement('canvas'); c.width = c.height = 128; c.getContext('2d').drawImage(im, 0, 0, 128, 128); outfitTex = c; }; im.src = p.outfit.tex; }
}

function openOutfit() {
  const p = App.profile; if (!p) return;
  const st = { img: null, zoom: 1, off: { x: 0, y: 0 }, bottom: (p.outfit && p.outfit.bottom) || PANTS[0], tex: null, top: (p.outfit && p.outfit.top) || '#5BC0FF' };
  if (p.outfit && p.outfit.tex) { const im = new Image(); im.onload = () => { st.img = im; draw(); }; im.src = p.outfit.tex; }
  const C = 220; let cv, g, pv, pg, raf = 0, drag = null;
  function base() { return Math.max(C / st.img.width, C / st.img.height); }
  function clampO() { const s = base() * st.zoom, mx = Math.max(0, (st.img.width * s - C) / 2), my = Math.max(0, (st.img.height * s - C) / 2); st.off.x = clamp(st.off.x, -mx, mx); st.off.y = clamp(st.off.y, -my, my); }
  function crop(size) { const c = document.createElement('canvas'); c.width = c.height = size; const k = size / C, s = base() * st.zoom * k, w = st.img.width * s, h = st.img.height * s; c.getContext('2d').drawImage(st.img, size / 2 - w / 2 + st.off.x * k, size / 2 - h / 2 + st.off.y * k, w, h); return c; }
  function rebuild() {
    if (!st.img) return;
    const raw = crop(128); st.tex = toonFilter(raw);
    const d = dominantRegion(raw, .2, .2, .8, .8); if (d) st.top = rgbHex(d);
    setOutfitColors({ top: st.top, bottom: st.bottom }); outfitTex = st.tex;
  }
  function draw() {
    if (!g) return; g.setTransform(DPR, 0, 0, DPR, 0, 0); g.fillStyle = '#F3EEFF'; g.fillRect(0, 0, C, C);
    if (!st.img) { g.font = '60px ' + FONT; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('👕', C / 2, C / 2 - 14); g.fillStyle = '#7C5CFF'; g.font = '800 16px ' + FONT; g.fillText('Foto da roupa aqui', C / 2, C / 2 + 44); return; }
    const s = base() * st.zoom, w = st.img.width * s, h = st.img.height * s; g.drawImage(st.img, C / 2 - w / 2 + st.off.x, C / 2 - h / 2 + st.off.y, w, h);
    g.strokeStyle = '#fff'; g.lineWidth = 3; g.setLineDash([8, 6]); g.strokeRect(C * .12, C * .12, C * .76, C * .76); g.setLineDash([]);
  }
  function loopPv(now) {
    if (!$('#sheet').classList.contains('open')) { applyOutfit(App.profile); return; }
    pg.setTransform(DPR, 0, 0, DPR, 0, 0); pg.clearRect(0, 0, 170, 220);
    drawChar(pg, 'minha', getPlayerFace(), 85, 212, 1.55, now / 1000, false);
    raf = requestAnimationFrame(loopPv);
  }
  openSheet('👕 Minha roupa', body => {
    body.insertAdjacentHTML('beforeend', '<p class="small">Estique uma camiseta, blusa ou vestido na cama ou no chão e tire uma foto. Ela vira a roupa do seu personagem!</p>');
    const wrap = document.createElement('div'); wrap.className = 'outfit-wrap';
    cv = document.createElement('canvas'); cv.className = 'outfit-crop'; g = setupCanvas(cv, C, C);
    pv = document.createElement('canvas'); pv.className = 'outfit-pv'; pg = setupCanvas(pv, 170, 220);
    wrap.append(cv, pv); body.appendChild(wrap);
    const row = document.createElement('div'); row.className = 'row'; row.style.justifyContent = 'center';
    row.innerHTML = '<label class="btn pink small" for="outCam">📷 Tirar foto</label><label class="btn alt small" for="outGal">🖼️ Escolher foto</label><input class="hidden-input" id="outCam" type="file" accept="image/*" capture="environment"><input class="hidden-input" id="outGal" type="file" accept="image/*">';
    body.appendChild(row);
    const zr = document.createElement('div'); zr.className = 'zoom'; zr.style.margin = '10px auto'; zr.innerHTML = '<span>−</span><input type="range" min="1" max="3" step="0.01" value="1" aria-label="Zoom"><span>+</span>';
    body.appendChild(zr); const zi = zr.querySelector('input');
    zi.addEventListener('input', () => { if (!st.img) return; st.zoom = +zi.value; clampO(); draw(); rebuild(); });
    const onFile = e => { const f = e.target.files && e.target.files[0]; e.target.value = ''; if (!f) return; const im = new Image(); im.onload = () => { st.img = im; st.zoom = 1; zi.value = 1; st.off = { x: 0, y: 0 }; draw(); rebuild(); }; im.src = URL.createObjectURL(f); };
    row.querySelector('#outCam').addEventListener('change', onFile); row.querySelector('#outGal').addEventListener('change', onFile);
    cv.addEventListener('pointerdown', e => { if (!st.img) return; drag = { x: e.clientX, y: e.clientY, ox: st.off.x, oy: st.off.y }; cv.setPointerCapture(e.pointerId); });
    cv.addEventListener('pointermove', e => { if (!drag) return; const k = C / cv.getBoundingClientRect().width; st.off.x = drag.ox + (e.clientX - drag.x) * k; st.off.y = drag.oy + (e.clientY - drag.y) * k; clampO(); draw(); });
    const end = () => { if (drag) { drag = null; rebuild(); } }; cv.addEventListener('pointerup', end); cv.addEventListener('pointercancel', end);
    const l = document.createElement('div'); l.className = 'flabel'; l.style.justifyContent = 'center'; l.textContent = 'Cor da calça / saia'; body.appendChild(l);
    const sw = document.createElement('div'); sw.className = 'swatches'; sw.style.justifyContent = 'center'; body.appendChild(sw);
    const buildSw = () => { sw.innerHTML = ''; PANTS.forEach(c => { const b = document.createElement('button'); b.type = 'button'; b.className = 'sw' + (st.bottom === c ? ' sel' : ''); b.style.background = c; b.setAttribute('aria-label', 'cor'); b.addEventListener('click', () => { st.bottom = c; setOutfitColors({ top: st.top, bottom: c }); buildSw(); }); sw.appendChild(b); }); };
    buildSw();
    const ok = document.createElement('button'); ok.className = 'btn pink'; ok.style.margin = '14px auto 0'; ok.style.display = 'flex'; ok.textContent = '✅ Vestir esta roupa';
    ok.addEventListener('click', () => {
      if (!st.img) { toast('Tire ou escolha uma foto da roupa 👕'); return; }
      rebuild();
      let tex = null; try { tex = st.tex.toDataURL('image/jpeg', 0.85); } catch (e) { }
      p.outfit = { tex, top: st.top, bottom: st.bottom }; p.costume = 'minha'; Store.save();
      closeSheet(); applyOutfit(p); Sound.unlock(); toast('Roupa nova! 👕✨');
      if (App.current === 's-game') { playerSay('Olha minha roupa nova! 👕', 2.6); burst(game.player.x, game.player.y - 60, 28); }
      if (App.current === 's-costume') buildCostumeGrid($('#costumeGrid'), false);
    });
    body.appendChild(ok);
    draw();
  });
  raf = requestAnimationFrame(loopPv);
}
