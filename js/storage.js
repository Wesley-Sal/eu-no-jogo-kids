/* Dados guardados SÓ NESTE APARELHO (localStorage).
   A foto da criança fica aqui e nunca é enviada. Na versão online, o servidor recebe
   apenas apelido, fantasia e a receita do avatar (ver avatarRecipe). */
'use strict';

const Store = {
  KEY: 'eunojogo.v1',
  data: null,
  blank() { return { parent: false, settings: { sound: true, online: true, timeLimit: 0 }, profiles: [], homes: [], places: [] }; },
  load() {
    this.data = this.blank();
    try {
      const raw = localStorage.getItem(this.KEY);
      if (raw) {
        const d = JSON.parse(raw);
        this.data.parent = !!d.parent;
        this.data.settings = Object.assign(this.data.settings, d.settings || {});
        this.data.profiles = Array.isArray(d.profiles) ? d.profiles : [];
        this.data.homes = Array.isArray(d.homes) ? d.homes : [];
        this.data.places = Array.isArray(d.places) ? d.places : [];
        /* versão 7: começa no modo offline (foto real, inclusive dos cômodos) */
        if (!d.v7) { this.data.profiles.forEach(p => { p.mode = 'offline'; }); }
        /* versão 2 → 3: cômodos sem lugar vão para "Minha casa" */
        const loose = this.data.homes.filter(r => !r.placeId || !this.data.places.some(p => p.id === r.placeId));
        if (loose.length) {
          let pl = this.data.places.find(p => p.name === 'Minha casa');
          if (!pl) { pl = { id: uid(), name: 'Minha casa', icon: '🏡', color: '#FF8FB8', created: Date.now() }; this.data.places.push(pl); }
          loose.forEach(r => r.placeId = pl.id);
        }
      }
    } catch (e) { /* sem armazenamento: o jogo funciona mesmo assim */ }
  },
  save() { this.data.v7 = true; try { localStorage.setItem(this.KEY, JSON.stringify(this.data)); return true; } catch (e) { return false; } },
  wipe() { try { localStorage.removeItem(this.KEY); } catch (e) { } this.data = this.blank(); },
  newProfile(name, age, hobbies) {
    return {
      id: uid(), name, age, hobbies: hobbies.slice(), photo: null,
      avatar: defaultAvatar(), auto: { skin: false, hair: false },
      costume: 'heroi', scene: 'casa', mode: 'offline', photoStyle: 'mistura',
      stars: 0, celebrated: [], created: Date.now(),
    };
  },
};
