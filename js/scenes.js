/* Cenários: fundos desenhados por código + objetos com que dá para brincar */
'use strict';

const SCENES = [
  { id: 'casa', name: 'Casa do jogo', emoji: '🏠' },
  { id: 'escola', name: 'Escola', emoji: '🏫' },
  { id: 'parque', name: 'Parque', emoji: '🌳' },
  { id: 'castelo', name: 'Castelo', emoji: '🏰' },
];

function floorBase(g,col,y0){g.fillStyle=col;g.fillRect(0,y0,W,H-y0);}
function window1(g,x,y,w,h){fr(g,x-8,y-8,w+16,h+16,12,'#fff');const gr=g.createLinearGradient(0,y,0,y+h);gr.addColorStop(0,'#8FD3FF');gr.addColorStop(1,'#DFF3FF');fr(g,x,y,w,h,6,gr);
  circ(g,x+w*0.25,y+h*0.3,h*0.13,'#FFE27A');g.fillStyle='#fff';g.fillRect(x+w/2-3,y,6,h);g.fillRect(x,y+h/2-3,w,6);}
const DRAW={
  casa(g){
    g.fillStyle='#FFE9D2';g.fillRect(0,0,W,310);
    for(let y=0;y<300;y+=46)for(let x=0;x<W+46;x+=46)circ(g,x+((y/46)%2?23:0),y+23,4,'rgba(255,160,110,.22)');
    g.fillStyle='#EAC7A2';g.fillRect(0,296,W,14);
    floorBase(g,'#E0A96D',310);g.strokeStyle='rgba(120,70,30,.16)';g.lineWidth=2;
    for(let y=310,i=0;y<H;y+=36,i++){g.beginPath();g.moveTo(0,y);g.lineTo(W,y);g.stroke();for(let x=(i%2)*90;x<W;x+=180){g.beginPath();g.moveTo(x,y);g.lineTo(x,y+36);g.stroke();}}
    window1(g,80,60,190,140);
    fr(g,64,52,40,170,14,'#FF8FB8');fr(g,246,52,40,170,14,'#FF8FB8');fr(g,58,44,234,14,7,'#B5468A');
    fr(g,360,150,200,12,4,'#B07A45');
    [['#FF6FA8',26,60],['#5BC0FF',20,52],['#FFD34D',24,64],['#5CE08A',18,48],['#7C5CFF',26,58],['#FF9F43',22,54]].reduce((x,[col,w,h])=>{fr(g,x,150-h,w,h,3,col);return x+w+4;},372);
    fr(g,600,64,100,120,10,'#fff');fr(g,608,72,84,104,6,'#7C5CFF');g.fillStyle='#FFD34D';starPath(g,650,124,5,30,13);g.fill();
    fr(g,760,168,180,150,18,'#8A6BE0');fr(g,770,178,160,30,10,'rgba(255,255,255,.15)');
    fr(g,740,250,220,84,16,'#fff');fr(g,740,276,220,62,14,'#6EC6FF');
    for(let x=756;x<950;x+=28)circ(g,x,306,6,'rgba(255,255,255,.5)');
    fr(g,770,232,86,34,14,'#fff');
    ell(g,470,455,240,86,0,'#FF9EC4');ell(g,470,455,200,66,0,'#FFC2DA');ell(g,470,455,150,46,0,'#FF9EC4');
    [['#FF6FA8','A',90,340],['#5BC0FF','B',138,346],['#FFD34D','C',112,310]].forEach(([col,l,x,y])=>{fr(g,x,y,42,42,6,col);g.fillStyle='#fff';g.font='800 26px '+FONT;g.textAlign='center';g.textBaseline='middle';g.fillText(l,x+21,y+23);});
  },
  escola(g){
    g.fillStyle='#E3F4EA';g.fillRect(0,0,W,310);
    g.strokeStyle='#C9A27A';g.lineWidth=2;g.beginPath();g.moveTo(0,22);g.quadraticCurveTo(W/2,52,W,22);g.stroke();
    const cols=['#FF6FA8','#FFD34D','#5BC0FF','#5CE08A','#FF9F43','#7C5CFF'];
    'ABCDEFGHIJKLMNOP'.split('').forEach((l,i)=>{const x=30+i*58;const y=22+Math.sin((x/W)*Math.PI)*28;g.fillStyle=cols[i%6];g.beginPath();g.moveTo(x-20,y);g.lineTo(x+20,y);g.lineTo(x,y+38);g.closePath();g.fill();g.fillStyle='#fff';g.font='800 17px '+FONT;g.textAlign='center';g.textBaseline='middle';g.fillText(l,x,y+13);});
    fr(g,290,82,380,190,10,'#B07A45');fr(g,302,94,356,166,4,'#2F5D46');
    g.fillStyle='rgba(255,255,255,.92)';g.font='700 34px '+FONT;g.textAlign='center';g.textBaseline='middle';g.fillText('Bem-vindos!',480,145);
    g.font='600 28px '+FONT;g.fillText('2 + 2 = 4',420,205);
    g.strokeStyle='rgba(255,255,255,.85)';g.lineWidth=3;g.beginPath();g.arc(580,205,16,0,TAU);g.stroke();
    for(let i=0;i<8;i++){const a=i*Math.PI/4;g.beginPath();g.moveTo(580+Math.cos(a)*22,205+Math.sin(a)*22);g.lineTo(580+Math.cos(a)*30,205+Math.sin(a)*30);g.stroke();}
    fr(g,350,262,260,8,3,'#8E5E33');
    circ(g,150,150,46,'#5B3FD9');circ(g,150,150,38,'#fff');g.strokeStyle='#2B2238';g.lineWidth=4;g.lineCap='round';
    g.beginPath();g.moveTo(150,150);g.lineTo(150,124);g.stroke();g.beginPath();g.moveTo(150,150);g.lineTo(168,158);g.stroke();
    window1(g,770,90,140,130);
    g.fillStyle='#CFE7D8';g.fillRect(0,296,W,14);
    floorBase(g,'#F2E0BC',310);g.strokeStyle='rgba(150,110,60,.15)';g.lineWidth=2;
    for(let x=0;x<=W;x+=64){g.beginPath();g.moveTo(x,310);g.lineTo(x,H);g.stroke();}for(let y=310;y<H;y+=48){g.beginPath();g.moveTo(0,y);g.lineTo(W,y);g.stroke();}
    for(let i=0;i<4;i++){const x=150+i*220,y=346;g.fillStyle='#8E5E33';g.fillRect(x-40,y,6,30);g.fillRect(x+34,y,6,30);fr(g,x-50,y-14,100,18,5,'#F5B041');fr(g,x-30,y-24,28,10,2,cols[i]);fr(g,x+6,y-21,22,7,2,cols[(i+2)%6]);}
  },
  parque(g){
    const sky=g.createLinearGradient(0,0,0,300);sky.addColorStop(0,'#7FCBFF');sky.addColorStop(1,'#E2F5FF');g.fillStyle=sky;g.fillRect(0,0,W,300);
    circ(g,840,82,70,'rgba(255,226,122,.35)');circ(g,840,82,46,'#FFD34D');
    [[150,70],[420,50],[640,95]].forEach(([x,y])=>{g.fillStyle='#fff';[[0,0,28],[30,-10,34],[64,0,26],[32,10,26]].forEach(([a,b,r])=>{g.beginPath();g.arc(x+a,y+b,r,0,TAU);g.fill();});});
    ell(g,180,300,300,90,0,'#9EDB7E');ell(g,760,305,320,100,0,'#8ED16F');
    floorBase(g,'#7CCB5E',290);
    const r=rng(7);g.strokeStyle='rgba(40,120,40,.25)';g.lineWidth=2;
    for(let i=0;i<220;i++){const x=r()*W,y=300+r()*300;g.beginPath();g.moveTo(x,y);g.lineTo(x+2,y-7);g.stroke();}
    ell(g,480,520,500,80,0,'#F1D79B');ell(g,480,520,460,60,0,'#F6E2B2');
    ell(g,130,430,92,34,0,'#6EC6FF');ell(g,120,424,60,16,0,'rgba(255,255,255,.35)');
    [[70,250,1],[250,226,1.2],[905,250,1.1]].forEach(([x,y,s])=>{fr(g,x-9*s,y-10*s,18*s,70*s,6,'#8E5E33');circ(g,x,y-40*s,46*s,'#4FAE58');circ(g,x-30*s,y-14*s,32*s,'#5CC46B');circ(g,x+30*s,y-16*s,34*s,'#5CC46B');circ(g,x-10*s,y-58*s,6*s,'#FF6F6F');circ(g,x+20*s,y-30*s,6*s,'#FF6F6F');});
    g.strokeStyle='#E2464A';g.lineWidth=7;g.lineCap='round';g.beginPath();g.moveTo(452,334);g.lineTo(468,188);g.moveTo(558,334);g.lineTo(542,188);g.stroke();g.lineWidth=8;g.beginPath();g.moveTo(462,190);g.lineTo(548,190);g.stroke();
    g.strokeStyle='#5B3FD9';g.lineWidth=6;g.lineCap='round';g.beginPath();g.moveTo(640,320);g.lineTo(640,190);g.moveTo(670,320);g.lineTo(670,190);g.stroke();
    g.lineWidth=4;for(let y=210;y<320;y+=22){g.beginPath();g.moveTo(640,y);g.lineTo(670,y);g.stroke();}
    fr(g,630,180,52,14,6,'#FFD34D');
    g.strokeStyle='#FF6FA8';g.lineWidth=18;g.beginPath();g.moveTo(678,190);g.quadraticCurveTo(740,210,770,320);g.stroke();
    const fl=rng(3);for(let i=0;i<40;i++){const x=fl()*W,y=320+fl()*260;if(Math.abs((x-480)/500)**2+Math.abs((y-520)/80)**2<1)continue;circ(g,x,y,4,['#FF8FB8','#FFD34D','#fff','#B49BFF'][i%4]);circ(g,x,y,1.6,'#FF9F43');}
    fr(g,300,300,120,12,4,'#B07A45');fr(g,300,282,120,10,4,'#B07A45');g.fillStyle='#8E5E33';g.fillRect(308,312,6,20);g.fillRect(406,312,6,20);
    /* caixa de areia */ fr(g,700,468,190,84,12,'#B07A45');fr(g,709,476,172,68,9,'#F3D99B');const sr=rng(21);for(let i=0;i<60;i++)circ(g,712+sr()*166,479+sr()*62,1.4,'rgba(176,122,69,.35)');
    g.fillStyle='#5BC0FF';g.beginPath();g.moveTo(848,492);g.lineTo(872,492);g.lineTo(868,520);g.lineTo(852,520);g.closePath();g.fill();g.strokeStyle='#3A7BD5';g.lineWidth=2;g.beginPath();g.arc(860,494,11,Math.PI,0);g.stroke();
    g.strokeStyle='#FF6FA8';g.lineWidth=3;g.beginPath();g.moveTo(724,530);g.lineTo(744,500);g.stroke();ell(g,748,494,6,8,0.6,'#FF6FA8');
  },
  castelo(g){
    g.fillStyle='#A9A2C8';g.fillRect(0,0,W,310);
    g.strokeStyle='rgba(60,50,100,.18)';g.lineWidth=2;
    for(let y=0,i=0;y<300;y+=34,i++){g.beginPath();g.moveTo(0,y);g.lineTo(W,y);g.stroke();for(let x=(i%2)*40;x<W;x+=80){g.beginPath();g.moveTo(x,y);g.lineTo(x,y+34);g.stroke();}}
    [[100,60],[780,60]].forEach(([x,y])=>{g.fillStyle='#6E6595';g.beginPath();g.moveTo(x-10,y+170);g.lineTo(x-10,y+50);g.arc(x+45,y+50,55,Math.PI,0);g.lineTo(x+100,y+170);g.closePath();g.fill();
      const gr=g.createLinearGradient(0,y,0,y+160);gr.addColorStop(0,'#7FCBFF');gr.addColorStop(1,'#E2F5FF');g.fillStyle=gr;g.beginPath();g.moveTo(x,y+160);g.lineTo(x,y+50);g.arc(x+45,y+50,45,Math.PI,0);g.lineTo(x+90,y+160);g.closePath();g.fill();
      g.fillStyle='#6E6595';g.fillRect(x+42,y+5,6,155);});
    [260,700].forEach(x=>{g.fillStyle='#D9435B';g.beginPath();g.moveTo(x-32,20);g.lineTo(x+32,20);g.lineTo(x+32,170);g.lineTo(x,148);g.lineTo(x-32,170);g.closePath();g.fill();
      g.fillStyle='#FFD34D';starPath(g,x,82,8,22,11);g.fill();fr(g,x-40,14,80,10,4,'#E8B64A');});
    [200,760].forEach(x=>{fr(g,x-8,150,16,40,4,'#4A4266');ell(g,x,140,13,20,0,'#FF9F43');ell(g,x,145,7,12,0,'#FFE27A');});
    fr(g,410,92,140,200,26,'#E8B64A');fr(g,424,106,112,170,20,'#C0392B');fr(g,400,236,160,56,14,'#E8B64A');fr(g,416,226,128,26,10,'#E25A4B');
    g.fillStyle='#FFD34D';starPath(g,480,70,5,22,10);g.fill();
    floorBase(g,'#CFC8E6',310);
    for(let y=310,i=0;y<H;y+=48,i++)for(let x=(i%2)*64;x<W;x+=128){g.fillStyle='#BDB4DC';g.fillRect(x,y,64,48);}
    g.fillStyle='#C0392B';g.beginPath();g.moveTo(420,292);g.lineTo(540,292);g.lineTo(600,H);g.lineTo(360,H);g.closePath();g.fill();
    g.strokeStyle='#E8B64A';g.lineWidth=5;g.beginPath();g.moveTo(426,292);g.lineTo(368,H);g.moveTo(534,292);g.lineTo(592,H);g.stroke();
  },
};
const bgCache = {};
function getBg(id) {
  if (id.indexOf('home:') === 0) return Home.bg(id);
  if (!bgCache[id]) {
    const cv = document.createElement('canvas'); cv.width = W * DPR; cv.height = H * DPR;
    const g = cv.getContext('2d'); g.setTransform(DPR, 0, 0, DPR, 0, 0); DRAW[id](g); bgCache[id] = cv;
  }
  return bgCache[id];
}
function clearBgCache() { for (const k in bgCache) delete bgCache[k]; if (typeof Home !== 'undefined') Home.cartoonCache = {}; }
function sceneObjects(id) { return OBJECTS[id] || Home.objects(id); }
function sceneInfo(id) {
  const s = SCENES.find(x => x.id === id); if (s) return s;
  const r = Home.byScene(id); return r ? { id, name: r.name, emoji: r.emoji } : SCENES[0];
}

/* Objetos interativos de cada cenário.
   hit = área de toque [x,y,w,h]; spot = onde o personagem fica; act = ação (ver ACTS em game.js) */
const OBJECTS = {
  casa: [
    { id: 'cama', icon: '😴', hit: [740, 170, 220, 170], spot: [700, 352], act: 'dormir' },
    { id: 'blocos', icon: '🧱', hit: [80, 300, 110, 95], spot: [200, 386], act: 'blocos' },
    { id: 'estante', icon: '📚', hit: [360, 80, 210, 90], spot: [465, 360], act: 'ler' },
  ],
  escola: [
    { id: 'quadro', icon: '✏️', hit: [290, 82, 380, 190], spot: [480, 352], act: 'quadro' },
    { id: 'carteira', icon: '🪑', hit: [96, 318, 108, 62], spot: [150, 392], act: 'estudar' },
    { id: 'relogio', icon: '🕘', hit: [100, 100, 100, 100], spot: [250, 356], act: 'relogio' },
    { id: 'professora', icon: '📝', hit: [672, 250, 66, 112], spot: [645, 392], act: 'quiz' },
  ],
  parque: [
    { id: 'escorrega', icon: '🎢', hit: [620, 170, 170, 165], spot: [655, 348], act: 'escorregar' },
    { id: 'balanco', icon: '🎠', hit: [445, 180, 120, 160], spot: [505, 350], act: 'balancar' },
    { id: 'lago', icon: '🦆', hit: [40, 392, 190, 80], spot: [255, 444], act: 'patos' },
    { id: 'areia', icon: '🏰', hit: [700, 468, 190, 84], spot: [795, 462], act: 'areia' },
  ],
  castelo: [
    { id: 'trono', icon: '👑', hit: [400, 90, 160, 210], spot: [480, 350], act: 'trono' },
    { id: 'bau', icon: '💰', hit: [815, 345, 85, 70], spot: [790, 440], act: 'bau' },
  ],
};
