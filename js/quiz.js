/* Professora: perguntas por tema, adaptadas à idade, com nota de 0 a 10. */
'use strict';

const QUIZ_THEMES = [
  { id: 'mat', n: 'Matemática', e: '➕' },
  { id: 'port', n: 'Letras e palavras', e: '🔤' },
  { id: 'animais', n: 'Animais', e: '🐾' },
  { id: 'cores', n: 'Cores e formas', e: '🎨' },
  { id: 'natureza', n: 'Natureza e corpo', e: '🌎' },
];

/* [idade mínima, pergunta, resposta certa, [erradas]] */
const QUIZ_BANK = {
  port: [
    [3, 'Com que letra começa 🐶 CACHORRO?', 'C', ['A', 'S', 'P']],
    [3, 'Com que letra começa 🍎 MAÇÃ?', 'M', ['N', 'A', 'B']],
    [3, 'Com que letra começa 🐱 GATO?', 'G', ['J', 'C', 'T']],
    [3, 'Com que letra começa ⭐ ESTRELA?', 'E', ['A', 'I', 'S']],
    [3, 'Com que letra começa 🐟 PEIXE?', 'P', ['B', 'F', 'R']],
    [3, 'Com que letra começa 🦁 LEÃO?', 'L', ['I', 'T', 'R']],
    [3, 'Com que letra começa 🏠 CASA?', 'C', ['K', 'Q', 'S']],
    [4, 'Qual destas é uma vogal?', 'O', ['B', 'T', 'M']],
    [4, 'Qual destas é uma vogal?', 'U', ['P', 'L', 'D']],
    [5, 'Quantas vogais existem no alfabeto?', '5', ['3', '7', '10']],
    [5, 'Qual letra vem depois do A?', 'B', ['C', 'D', 'E']],
    [5, 'Qual letra vem antes do D?', 'C', ['B', 'E', 'F']],
    [6, 'Quantas sílabas tem a palavra BOLA?', '2', ['1', '3', '4']],
    [6, 'Quantas sílabas tem a palavra BORBOLETA?', '4', ['2', '3', '5']],
    [6, 'Quantas sílabas tem a palavra SOL?', '1', ['2', '3', '4']],
    [6, 'Qual palavra rima com JANELA?', 'PANELA', ['JARDIM', 'CADEIRA', 'MESA']],
    [6, 'Qual palavra rima com MÃO?', 'PÃO', ['PÉ', 'MAR', 'MEL']],
    [7, 'Qual palavra está escrita certo?', 'CASA', ['KASA', 'CAZA', 'QASA']],
    [7, 'Qual palavra está escrita certo?', 'ESCOLA', ['ISCOLA', 'ESKOLA', 'ECOLA']],
    [7, 'Qual é o contrário de GRANDE?', 'PEQUENO', ['ALTO', 'GORDO', 'LONGE']],
    [7, 'Qual é o contrário de DIA?', 'NOITE', ['SOL', 'TARDE', 'CLARO']],
    [8, 'Qual é o plural de FLOR?', 'FLORES', ['FLORS', 'FLORIS', 'FLORAS']],
    [8, 'Qual palavra é um nome de animal?', 'CAVALO', ['CORRER', 'AZUL', 'FELIZ']],
    [8, 'Qual palavra é uma ação (verbo)?', 'PULAR', ['MESA', 'BONITO', 'CÉU']],
    [9, 'Qual destas palavras tem acento?', 'CAFÉ', ['CASA', 'BOLA', 'MESA']],
    [9, 'Qual é o sinônimo de FELIZ?', 'ALEGRE', ['TRISTE', 'BRAVO', 'CANSADO']],
  ],
  animais: [
    [3, 'Qual animal faz "muuu"?', '🐄 Vaca', ['🐷 Porco', '🐔 Galinha', '🐑 Ovelha']],
    [3, 'Qual animal faz "au au"?', '🐶 Cachorro', ['🐱 Gato', '🐮 Vaca', '🐸 Sapo']],
    [3, 'Qual animal faz "miau"?', '🐱 Gato', ['🐶 Cachorro', '🦆 Pato', '🐴 Cavalo']],
    [3, 'Qual animal tem tromba?', '🐘 Elefante', ['🦒 Girafa', '🦁 Leão', '🐻 Urso']],
    [3, 'Qual animal tem o pescoço bem comprido?', '🦒 Girafa', ['🐘 Elefante', '🐷 Porco', '🐰 Coelho']],
    [4, 'Qual animal vive na água?', '🐟 Peixe', ['🐔 Galinha', '🐶 Cachorro', '🐴 Cavalo']],
    [4, 'Qual animal voa?', '🐦 Passarinho', ['🐢 Tartaruga', '🐰 Coelho', '🐷 Porco']],
    [4, 'Qual animal anda bem devagar e tem casco?', '🐢 Tartaruga', ['🐇 Coelho', '🐆 Guepardo', '🐎 Cavalo']],
    [4, 'Qual animal adora cenoura?', '🐰 Coelho', ['🦁 Leão', '🐟 Peixe', '🦉 Coruja']],
    [5, 'Qual animal bota ovos?', '🐔 Galinha', ['🐄 Vaca', '🐶 Cachorro', '🐱 Gato']],
    [5, 'Quantas patas tem um cachorro?', '4', ['2', '6', '8']],
    [5, 'Quantas patas tem uma galinha?', '2', ['4', '6', '3']],
    [6, 'Quantas patas tem uma aranha?', '8', ['6', '4', '10']],
    [6, 'Quantas patas tem um inseto, como a formiga?', '6', ['4', '8', '2']],
    [6, 'Antes de virar sapo, ele é um...', 'Girino', ['Lagarta', 'Pintinho', 'Filhote de peixe']],
    [6, 'Antes de virar borboleta, ela é uma...', 'Lagarta', ['Minhoca', 'Girino', 'Formiga']],
    [7, 'Qual animal é conhecido como o rei da selva?', '🦁 Leão', ['🐯 Tigre', '🐘 Elefante', '🐻 Urso']],
    [7, 'Qual animal fica acordado à noite e tem olhos grandes?', '🦉 Coruja', ['🐔 Galinha', '🐦 Pardal', '🦆 Pato']],
    [7, 'A baleia é um...', 'Mamífero', ['Peixe', 'Réptil', 'Inseto']],
    [8, 'Qual destes animais é um réptil?', '🐊 Jacaré', ['🐬 Golfinho', '🐸 Sapo', '🦅 Águia']],
    [8, 'Qual animal é o maior do mundo?', '🐋 Baleia-azul', ['🐘 Elefante', '🦒 Girafa', '🦈 Tubarão']],
    [9, 'Animais que comem só plantas são chamados de...', 'Herbívoros', ['Carnívoros', 'Onívoros', 'Insetos']],
  ],
  cores: [
    [3, 'De que cor é o céu num dia de sol?', '🔵 Azul', ['🔴 Vermelho', '🟢 Verde', '🟤 Marrom']],
    [3, 'De que cor é a banana madura?', '🟡 Amarela', ['🔵 Azul', '🟣 Roxa', '⚪ Branca']],
    [3, 'De que cor é a grama?', '🟢 Verde', ['🔴 Vermelha', '🔵 Azul', '🟠 Laranja']],
    [3, 'De que cor é o morango?', '🔴 Vermelho', ['🟢 Verde', '🔵 Azul', '⚫ Preto']],
    [4, 'Qual forma parece uma bola?', '⚪ Círculo', ['🔺 Triângulo', '🟥 Quadrado', '▬ Retângulo']],
    [4, 'Qual forma tem 3 lados?', '🔺 Triângulo', ['🟥 Quadrado', '⚪ Círculo', '⭐ Estrela']],
    [5, 'Quantos lados tem um quadrado?', '4', ['3', '5', '6']],
    [5, 'Amarelo misturado com azul dá...', '🟢 Verde', ['🟣 Roxo', '🟠 Laranja', '🔴 Vermelho']],
    [5, 'Vermelho misturado com amarelo dá...', '🟠 Laranja', ['🟢 Verde', '🟣 Roxo', '🔵 Azul']],
    [6, 'Vermelho misturado com azul dá...', '🟣 Roxo', ['🟢 Verde', '🟠 Laranja', '🟡 Amarelo']],
    [6, 'Vermelho misturado com branco dá...', '🌸 Rosa', ['🟤 Marrom', '🟢 Verde', '🔵 Azul']],
    [6, 'Quantas cores tem o arco-íris?', '7', ['5', '3', '10']],
    [7, 'Quantos lados tem um hexágono?', '6', ['5', '8', '4']],
    [7, 'Quantos lados tem um pentágono?', '5', ['6', '4', '7']],
    [7, 'Qual forma tem 4 lados, dois compridos e dois curtos?', 'Retângulo', ['Quadrado', 'Triângulo', 'Círculo']],
    [8, 'Um cubo tem quantas faces?', '6', ['4', '8', '12']],
    [8, 'Branco misturado com preto dá...', 'Cinza', ['Marrom', 'Azul', 'Bege']],
  ],
  natureza: [
    [3, 'Quantos dedos temos em uma mão?', '5', ['4', '6', '10']],
    [3, 'Com que parte do corpo nós vemos?', '👀 Olhos', ['👂 Orelhas', '👃 Nariz', '👄 Boca']],
    [3, 'Com que parte do corpo nós ouvimos?', '👂 Orelhas', ['👀 Olhos', '✋ Mãos', '🦶 Pés']],
    [4, 'De onde cai a chuva?', '☁️ Nuvens', ['☀️ Sol', '🌙 Lua', '⭐ Estrelas']],
    [4, 'O que aparece no céu à noite?', '🌙 Lua', ['🌈 Arco-íris', '☀️ Sol', '🦋 Borboleta']],
    [4, 'Quantos dedos temos nas duas mãos?', '10', ['8', '5', '12']],
    [5, 'Do que uma planta precisa para crescer?', 'Água e sol', ['Só sombra', 'Sorvete', 'Areia seca']],
    [5, 'Quantos dias tem uma semana?', '7', ['5', '10', '12']],
    [5, 'Para escovar os dentes usamos...', 'Escova e pasta de dente', ['🧽 Esponja', '🥄 Colher', '✏️ Lápis']],
    [6, 'Qual é a estação mais fria do ano?', '❄️ Inverno', ['☀️ Verão', '🌸 Primavera', '🍂 Outono']],
    [6, 'Em que planeta nós moramos?', '🌍 Terra', ['🔴 Marte', '🪐 Saturno', '☀️ Sol']],
    [6, 'Quantos meses tem um ano?', '12', ['10', '7', '24']],
    [7, 'O Sol é uma...', '⭐ Estrela', ['🪐 Planeta', '☁️ Nuvem', '🌙 Lua']],
    [7, 'Que parte da planta fica embaixo da terra?', 'Raiz', ['Folha', 'Flor', 'Fruto']],
    [7, 'A água vira gelo quando fica...', 'Muito fria', ['Muito quente', 'Colorida', 'Salgada']],
    [8, 'Qual órgão bombeia o sangue no corpo?', '❤️ Coração', ['🫁 Pulmão', '🧠 Cérebro', '🦴 Osso']],
    [8, 'Com que órgão nós respiramos?', '🫁 Pulmões', ['❤️ Coração', '🦷 Dentes', '👂 Orelhas']],
    [8, 'Qual é o maior planeta do Sistema Solar?', '🪐 Júpiter', ['🌍 Terra', '🔴 Marte', '☀️ Sol']],
    [9, 'Quantos planetas tem o Sistema Solar?', '8', ['9', '7', '12']],
    [9, 'As plantas soltam no ar um gás que respiramos. Qual?', 'Oxigênio', ['Fumaça', 'Vapor de sal', 'Poeira']],
  ],
};

function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function rint(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }

/* matemática gerada na hora, de acordo com a idade */
function mathQuestion(age) {
  const emojis = ['🍎', '⭐', '🐟', '🌸', '🎈', '🍪'];
  let q, ans;
  if (age <= 5) {
    if (Math.random() < 0.5) { const n = rint(1, 6), e = pick(emojis); q = 'Quantos tem aqui? ' + e.repeat(n); ans = n; }
    else { const a = rint(1, 4), b = rint(1, 4); q = 'Quanto é ' + a + ' + ' + b + '?'; ans = a + b; }
  } else if (age <= 7) {
    if (Math.random() < 0.6) { const a = rint(2, 12), b = rint(1, 8); q = 'Quanto é ' + a + ' + ' + b + '?'; ans = a + b; }
    else { const a = rint(6, 18), b = rint(1, a - 1); q = 'Quanto é ' + a + ' − ' + b + '?'; ans = a - b; }
  } else if (age <= 9) {
    const r = Math.random();
    if (r < 0.4) { const a = rint(2, 9), b = rint(2, 9); q = 'Quanto é ' + a + ' × ' + b + '?'; ans = a * b; }
    else if (r < 0.7) { const a = rint(15, 70), b = rint(5, 29); q = 'Quanto é ' + a + ' + ' + b + '?'; ans = a + b; }
    else { const a = rint(30, 99), b = rint(5, 29); q = 'Quanto é ' + a + ' − ' + b + '?'; ans = a - b; }
  } else {
    const r = Math.random();
    if (r < 0.4) { const a = rint(3, 12), b = rint(3, 12); q = 'Quanto é ' + a + ' × ' + b + '?'; ans = a * b; }
    else if (r < 0.7) { const b = rint(2, 10), ans2 = rint(2, 12); q = 'Quanto é ' + (b * ans2) + ' ÷ ' + b + '?'; ans = ans2; }
    else { const a = rint(100, 600), b = rint(20, 300); q = 'Quanto é ' + a + ' + ' + b + '?'; ans = a + b; }
  }
  const wrong = new Set();
  while (wrong.size < 3) { const d = ans + pick([-3, -2, -1, 1, 2, 3, 10, -10]); if (d !== ans && d >= 0) wrong.add(d); }
  return { q, a: String(ans), opts: shuffle([String(ans), ...[...wrong].map(String)]) };
}
function buildQuiz(theme, age) {
  if (theme === 'mat') { const out = []; for (let i = 0; i < 10; i++) out.push(mathQuestion(age)); return out; }
  const bank = QUIZ_BANK[theme];
  let pool = bank.filter(x => x[0] <= age); if (pool.length < 10) pool = bank.slice();
  /* idades maiores: prefere as perguntas mais avançadas */
  pool = shuffle(pool).sort((a, b) => (b[0] <= age ? b[0] : 0) - (a[0] <= age ? a[0] : 0) + (Math.random() - 0.5) * 6);
  return shuffle(pool.slice(0, 10)).map(([, q, a, w]) => ({ q, a, opts: shuffle([a, ...w]) }));
}

const Quiz = {
  theme: null, qs: [], i: 0, right: 0, busy: false,
  init() {
    $('#quizClose').addEventListener('click', () => this.close());
  },
  open() { this.home(); $('#quizModal').classList.add('open'); },
  close() { $('#quizModal').classList.remove('open'); },
  body() { return $('#quizBody'); },
  home() {
    const p = App.profile, grades = (p && p.grades) || {};
    $('#quizTitle').textContent = '👩‍🏫 Prof. Ana';
    const b = this.body(); b.innerHTML = '<p class="quiz-say">Oi, ' + esc(playerName()) + '! Vamos aprender brincando? Escolha um tema:</p>';
    const grid = document.createElement('div'); grid.className = 'quiz-themes';
    QUIZ_THEMES.forEach(t => {
      const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'hob';
      const best = grades[t.id]; btn.innerHTML = '<b>' + t.e + '</b>' + t.n + (best != null ? '<small>Melhor nota: ' + best + '</small>' : '');
      btn.addEventListener('click', () => this.start(t.id)); grid.appendChild(btn);
    });
    b.appendChild(grid);
  },
  start(theme) {
    this.theme = theme; this.qs = buildQuiz(theme, (App.profile && App.profile.age) || 7); this.i = 0; this.right = 0;
    Sound.pop(); this.ask();
  },
  ask() {
    const t = QUIZ_THEMES.find(x => x.id === this.theme), q = this.qs[this.i];
    $('#quizTitle').textContent = t.e + ' ' + t.n;
    const b = this.body(); b.innerHTML = '';
    const prog = document.createElement('div'); prog.className = 'quiz-prog';
    for (let k = 0; k < this.qs.length; k++) { const d = document.createElement('span'); d.className = k < this.i ? (this.qs[k].ok ? 'ok' : 'bad') : (k === this.i ? 'now' : ''); prog.appendChild(d); }
    b.appendChild(prog);
    const qq = document.createElement('div'); qq.className = 'quiz-q'; qq.textContent = q.q; b.appendChild(qq);
    const opts = document.createElement('div'); opts.className = 'quiz-opts';
    q.opts.forEach(o => {
      const btn = document.createElement('button'); btn.type = 'button'; btn.textContent = o;
      btn.addEventListener('click', () => this.answer(btn, o)); opts.appendChild(btn);
    });
    b.appendChild(opts);
    const fb = document.createElement('div'); fb.className = 'quiz-fb'; fb.id = 'quizFb'; b.appendChild(fb);
    this.busy = false;
  },
  answer(btn, o) {
    if (this.busy) return; this.busy = true;
    const q = this.qs[this.i]; q.ok = o === q.a;
    $$('#quizBody .quiz-opts button').forEach(x => { if (x.textContent === q.a) x.classList.add('ok'); else if (x === btn) x.classList.add('bad'); x.disabled = true; });
    if (q.ok) { this.right++; Sound.star(); $('#quizFb').textContent = pick(['Muito bem! ✨', 'Acertou! 🎉', 'Isso mesmo! ⭐', 'Mandou bem! 👏']); }
    else { Sound.tap(); $('#quizFb').textContent = 'Quase! A resposta certa é: ' + q.a; }
    setTimeout(() => { this.i++; if (this.i < this.qs.length) this.ask(); else this.result(); }, q.ok ? 1100 : 2000);
  },
  result() {
    const nota = Math.round(this.right / this.qs.length * 10), p = App.profile;
    p.grades = p.grades || {}; const prev = p.grades[this.theme]; if (prev == null || nota > prev) p.grades[this.theme] = nota;
    Store.save();
    const stars = Math.ceil(nota / 2) + (nota === 10 ? 3 : 0);
    const msg = nota === 10 ? 'Nota 10! Excelente! 🏆' : nota >= 8 ? 'Muito bem! Você é fera! 🌟' : nota >= 6 ? 'Bom trabalho! Vamos treinar mais? 💪' : 'Vamos tentar de novo? Você consegue! 💛';
    $('#quizTitle').textContent = '📝 Boletim';
    const b = this.body();
    b.innerHTML = '<div class="quiz-grade' + (nota >= 6 ? ' good' : '') + '">' + nota + '</div><p class="quiz-say">' + msg + '</p><p class="small">Você acertou ' + this.right + ' de ' + this.qs.length + ' e ganhou ' + stars + ' ⭐' + (prev != null && nota > prev ? ' · Nova melhor nota!' : '') + '</p>';
    const row = document.createElement('div'); row.className = 'row'; row.style.justifyContent = 'center';
    const again = document.createElement('button'); again.className = 'btn pink'; again.textContent = '🔁 Jogar de novo'; again.addEventListener('click', () => this.start(this.theme));
    const other = document.createElement('button'); other.className = 'btn alt'; other.textContent = '📚 Outro tema'; other.addEventListener('click', () => this.home());
    const out = document.createElement('button'); out.className = 'btn alt'; out.textContent = 'Sair'; out.addEventListener('click', () => this.close());
    row.append(again, other, out); b.appendChild(row);
    if (stars > 0) giveStars(stars, 700, 230);
    if (nota >= 8) Sound.win();
    game.teacherSay = nota === 10 ? 'Parabéns! Nota 10! 🏆' : nota >= 6 ? 'Muito bem, ' + playerName() + '!' : 'Vamos estudar juntos! 📚';
    game.teacherSayT = 3;
  },
};
