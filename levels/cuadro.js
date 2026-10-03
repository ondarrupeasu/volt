/* Cuadro eléctrico real del control de tvstudio + los dos Pulsar Datapak III.
   COPIA del dibujo de ~/Proyectos/tvstudio/power.js (que a su vez porta los SVG de DMXSimulatoR).
   Mismo componente que el breaker board de tvstudio: si cambia allí, sincronizar aquí (o extraer a shared/).
   Aquí solo cambian los textos (castellano, enfoque docente); la lógica didáctica vive en n4.js. */
const PW=30,PH=78;
const CREAM='#e4dfd0',CREAM_HI='#efe9da',CREAM_EDGE='#b3ad9b',CREAM_SEAM='#c7c1af';

function poleBody(x,o){const b=o.body||CREAM,e=o.edge||CREAM_EDGE,s=o.seam||CREAM_SEAM,h=o.hi||CREAM_HI;
  return `<g transform="translate(${x},0)"><rect x=".5" y=".5" width="${PW-1}" height="${PH-1}" rx="2.5" fill="${b}" stroke="${e}" stroke-width=".9"/>`+
    (o.stripe?`<rect x="1" y="11" width="${PW-2}" height="5" fill="${o.stripe}"/>`:`<rect x="4" y="14" width="${PW-12}" height="1.2" rx=".5" fill="${s}"/><rect x="4" y="17.5" width="${PW-17}" height="1.2" rx=".5" fill="${s}"/>`)+
    `<rect x="3.5" y="56" width="${PW-7}" height="16" rx="1.5" fill="${h}" stroke="${e}" stroke-width=".6"/></g>`;}

/* united handle: dark slot + pale cap spanning the poles, I/0 markings in the exposed part of the slot */
function handle(poles,o){const W=poles*PW,cap=o.cap||'#f2efe6',cs=o.capStroke||'#a5a196';let mk='',holes='';
  for(let i=0;i<poles;i++){const cx=i*PW+PW/2;
    mk+=`<text class="mk-on" x="${cx}" y="43.5" text-anchor="middle" font-size="6.5" font-weight="700" fill="#c9ced6">I</text><text class="mk-off" x="${cx}" y="31" text-anchor="middle" font-size="6.5" font-weight="700" fill="#c9ced6">0</text>`;
    holes+=`<rect x="${cx-5}" y="28.6" width="10" height="5.4" rx="1.4" fill="${o.hole||'#191a1f'}"/>`;}
  return `<rect x="3" y="23" width="${W-6}" height="23" rx="3" fill="#2b2d33"/>${mk}<g class="cap"><rect x="4.5" y="25" width="${W-9}" height="12.5" rx="2.2" fill="${cap}" stroke="${cs}" stroke-width=".7"/>${holes}</g>`;}

/* magnetothermic (MCB), 1-4 poles under one handle */
function mcb(poles,o={}){const W=poles*PW;let s='';for(let i=0;i<poles;i++)s+=poleBody(i*PW,o);
  s+=handle(poles,o);
  if(o.bar)s+=`<rect x="1.5" y="2" width="${W-3}" height="4" rx="1.6" fill="${o.bar}"/>`;
  if(o.rating)s+=`<text x="${PW/2}" y="67" text-anchor="middle" font-size="7" font-weight="700" fill="#55524a">${o.rating}</text>`;
  return {w:W,svg:s};}

/* Vigi residual-current add-on (4 modules) clipped to the C60N: grey "T" test button + lever + trip flag */
function vigi(){const W=4*PW;let s=`<rect x=".5" y=".5" width="${W-1}" height="${PH-1}" rx="2.5" fill="#e3e3df" stroke="#a9aaa4" stroke-width=".9"/>`;
  s+=`<g class="pw-test" data-act="test"><rect x="6" y="5" width="18" height="13" rx="2" fill="#c8c9c6" stroke="#7f817c" stroke-width=".8"/><text x="15" y="15" text-anchor="middle" font-size="9" font-weight="800" fill="#33352f">T</text></g>`;
  s+=`<rect x="5" y="22" width="20" height="26" rx="3" fill="#2b2d33"/><g class="cap"><rect x="6" y="24" width="18" height="13" rx="2.4" fill="#d9dad6" stroke="#8d8f8a" stroke-width=".8"/></g>`;
  for(let k=0;k<4;k++)s+=`<rect x="${PW+6}" y="${24+k*4}" width="${2*PW}" height="1.4" rx=".6" fill="#c2c3be"/>`;
  s+=`<rect class="led" x="${3*PW+6}" y="26" width="9" height="4" rx="1" fill="#191a1f"/>`;
  s+=`<text x="${2*PW}" y="52" text-anchor="middle" font-size="7.5" font-weight="700" fill="#5a5c56">Vigi · 30 mA</text>`;
  s+=`<rect x="${PW+3.5}" y="56" width="${2*PW-7}" height="16" rx="1.5" fill="#efefec" stroke="#a9aaa4" stroke-width=".6"/>`;
  return {w:W,svg:s};}

/* ---------- model ---------- */
// Studio lighting (from the labels on the Showtec desk, 3-oct): top row 1-12 = CHROMA, LED fixtures with
// INTENSITY + colour TEMP channels (LEDs take constant power → the "LED" breaker); bottom row 13-24 = PHYSICAL SET,
// one intensity channel per lamp (fresnels, a 2 kW front…) → dimmed by the Datapaks. "Dimmers" breaker: still unknown.
const MG={stripe:'#ec8a2c'};  // Merlin Gerin multi 9 (orange band)
const TOP=[  // fila de arriba, en módulos DIN (1 módulo = PW) — medida sobre la foto real (tvstudio img/breaker-board.jpg)
  {gap:4},
  {id:'rcd',tag:'Diferencial',tagc:'#ff4fa3',name:'Diferencial · Merlin Gerin C60N 4P C40 + bloque Vigi 30 mA',tip:'Protege a las personas en TODO el cuadro: si salta, se apaga todo. «T» = test.',parts:[mcb(4,{...MG,rating:'C40'}),vigi()]},
  {id:'dp',tag:'DATAPAK',tagc:'#ff4fa3',name:'DATAPAK · Hager 4P (trifásico)',tip:'Alimenta en trifásica el Datapak 1 (izquierda). Qué cuelga de sus 12 canales: por identificar.',parts:[mcb(4,{body:'#dfe2e3',edge:'#a9adb0',hi:'#eef0f1',bar:'#3b73c4'})]},
  {id:'dim',tag:'Dimmers',tagc:'#ff4fa3',name:'Dimmers · Legrand 4P (trifásico)',tip:'Alimenta en trifásica el Datapak 2 (derecha): los dimmers de las luces del decorado (faders 13–24). Hipótesis de trabajo.',parts:[mcb(4,{body:'#cfd2d5',edge:'#9a9ea3',hi:'#e2e4e6'})]},
  {id:'led',tag:'LED',tagc:'#efe3a2',name:'LED · CHINT 1P+N C16',tip:'Corriente fija (sin regular) para los focos LED del croma (faders 1–12, se controlan por DMX).',parts:[mcb(2,{body:'#f3f4f2',edge:'#a8aaa6',hi:'#fbfbfa',cap:'#2f6fd6',capStroke:'#1b4ea8',hole:'#1b3f86',rating:'C16'})]},
  {gap:2}
];
const ROWS=2,PER=12;   // two rows of 12 Merlin Gerin K60N 2P C10
const BX=40,RAILW=24*PW;
function modG(id,x,y,inner,w,name,tip){return `<g class="din" data-id="${id}" data-name="${name}" data-tip="${tip||''}" transform="translate(${x},${y})">${inner}<rect class="din-hit" x="0" y="0" width="${w}" height="${PH}" fill="transparent"/></g>`;}
function board(){const W=RAILW+2*BX,H=900;let s=`<svg class="pw-board" viewBox="0 0 ${W} ${H}" role="img" aria-label="Cuadro eléctrico del control">`;
  // cabinet
  s+=`<rect x="2" y="2" width="${W-4}" height="${H-4}" rx="10" fill="#d6d1c1" stroke="#8f8a7a" stroke-width="2"/>`;
  s+=`<rect x="22" y="200" width="${W-44}" height="${H-226}" rx="4" fill="#1d1e23" stroke="#77725f" stroke-width="2"/>`;
  // wires (flavour)
  const wc=['#2f5fc4','#2f5fc4','#5b3a24','#1b1b1e','#2f5fc4','#8a8f98'];
  for(let i=0;i<26;i++){const x=40+i*28,c=wc[i%wc.length];s+=`<path d="M${x} 208 C ${x+40} 250, ${x-30} 280, ${x+8} 312" fill="none" stroke="${c}" stroke-width="2.4" opacity=".75"/><path d="M${x+12} 400 C ${x+40} 420, ${x-20} 440, ${x+4} 492" fill="none" stroke="${c}" stroke-width="2.4" opacity=".6"/><path d="M${x+6} 580 C ${x+50} 620, ${x-20} 660, ${x+14} 720" fill="none" stroke="${c}" stroke-width="2.4" opacity=".75"/><path d="M${x+30} 760 C ${x+10} 800, ${x+40} 820, ${x+20} 860" fill="none" stroke="${c}" stroke-width="2.4" opacity=".6"/>`;}
  // top row: label tags, rail, modules, numbering
  const ty=70;
  s+=`<rect x="${BX-6}" y="${ty-8}" width="${RAILW+12}" height="${PH+16}" rx="4" fill="#ece8dc" stroke="#9c9786"/>`;
  s+=`<rect x="${BX}" y="${ty+PH/2-8}" width="${RAILW}" height="16" fill="#9a9ca0"/>`;
  let x=BX;
  TOP.forEach(m=>{if(m.gap){x+=m.gap*PW;return;}
    let inner='',w=0;m.parts.forEach(p=>{inner+=`<g transform="translate(${w},0)">${p.svg}</g>`;w+=p.w;});
    const cx=x+w/2,lw=Math.max(58,m.tag.length*9);
    s+=`<g transform="rotate(${m.id==='led'?3:-2} ${cx} 30)"><rect x="${cx-lw/2}" y="14" width="${lw}" height="30" rx="2" fill="${m.tagc}"/><text x="${cx}" y="35" text-anchor="middle" font-size="15" font-family="'Marker Felt','Comic Sans MS',cursive" fill="#2a1622">${m.tag}</text></g>`;
    s+=modG(m.id,x,ty,inner,w,m.name,m.tip);x+=w;});
  for(let i=0;i<24;i++)s+=`<text x="${BX+i*PW+PW/2}" y="${ty+PH+30}" text-anchor="middle" font-size="9" fill="#a8a392">${i+1}</text>`;
  s+=`<line x1="22" y1="190" x2="${W-22}" y2="190" stroke="#a49f8e" stroke-width="2"/>`;
  // lower rows: 12 × 2P C10 each
  for(let r=0;r<ROWS;r++){const y=316+r*178;
    s+=`<rect x="${BX}" y="${y+PH/2-8}" width="${RAILW}" height="16" fill="#6b6d72"/>`;
    for(let i=0;i<PER;i++){const m=mcb(2,{...MG,rating:'C10'}),n=r*PER+i+1;
      s+=modG(`c${r}_${i}`,BX+i*2*PW,y,m.svg,m.w,`Circuito ${n} · Merlin Gerin K60N 2P C10`,'Uno de los 24 magnetotérmicos de 10 A (fase + neutro). Hipótesis sin comprobar: protegen las salidas de los dos Datapak (2 × 12 canales de 10 A).');}}
  // terminal strip
  for(let i=0;i<60;i++)s+=`<rect x="${70+i*11}" y="730" width="9" height="30" rx="1" fill="#b39b62" stroke="#6e5c33" stroke-width=".6"/>`;
  s+=`<rect x="150" y="830" width="420" height="12" rx="2" fill="#9c8a55"/><path d="M560 800 C 600 780, 640 840, 700 820" fill="none" stroke="#d6c42a" stroke-width="3"/>`;
  return s+'</svg>';}

/* ---------- Datapak SVG (Pulsar Datapak III, 12 × 10 A) ---------- */
function chan(n,x,y,dir){ // dir: 'h' = LEDs-fuse-label left→right, 'hr' mirrored, 'v' = top row (stacked)
  const g=(cx,cy)=>`<circle class="g-led" data-ch="${n}" cx="${cx}" cy="${cy}" r="4.6"/>`,r=(cx,cy)=>`<circle cx="${cx}" cy="${cy}" r="4.6" fill="#3b1513"/>`,
    f=(cx,cy)=>`<circle cx="${cx}" cy="${cy}" r="9" fill="#141416" stroke="#5e6066" stroke-width="1.4"/><line x1="${cx-5}" y1="${cy}" x2="${cx+5}" y2="${cy}" stroke="#5e6066" stroke-width="1.6"/>`,
    lab=(lx,ly,w,h)=>`<rect x="${lx}" y="${ly}" width="${w}" height="${h}" rx="1" fill="#d9d9d6"/>`,
    num=(nx,ny)=>`<text x="${nx}" y="${ny}" text-anchor="middle" font-size="11" font-weight="700" fill="#e6e6e6">${n}</text>`;
  if(dir==='v')return num(x,y)+g(x,y+14)+r(x,y+28)+f(x,y+48)+lab(x-10,y+64,20,7);
  if(dir==='h')return num(x,y+4)+g(x+16,y)+r(x+30,y)+f(x+50,y)+lab(x+64,y-4,22,8);
  return lab(x-86,y-4,22,8)+f(x-50,y)+r(x-30,y)+g(x-16,y)+num(x,y+4);}
function phase(lbl,x,y,vert){return vert?`<rect class="phase" x="${x}" y="${y}" width="14" height="34" rx="2"/><text x="${x+26}" y="${y+21}" font-size="11" fill="#e6e6e6">${lbl}</text>`
  :`<rect class="phase" x="${x}" y="${y}" width="34" height="14" rx="2"/><text x="${x+17}" y="${y+30}" text-anchor="middle" font-size="11" fill="#e6e6e6">${lbl}</text>`;}
function rocker(id,x,y,name,tip){return `<g class="rock" data-id="${id}" data-name="${name}" data-tip="${tip}" transform="translate(${x},${y})"><rect x="0" y="0" width="18" height="34" rx="2" fill="#0d0d0f" stroke="#55575d"/><rect class="r-top" x="3" y="3" width="12" height="14" rx="1"/><rect class="r-bot" x="3" y="17" width="12" height="14" rx="1"/><rect x="-6" y="-6" width="30" height="46" fill="transparent"/></g>`;}
function datapak(u){let s=`<svg class="pw-dp" data-u="${u}" viewBox="0 0 400 470" role="img" aria-label="Datapak ${u+1}">`;
  s+=`<rect x="2" y="2" width="396" height="466" rx="4" fill="#2c2d31" stroke="#121214" stroke-width="2"/>`;
  [[14,14],[386,14],[14,456],[386,456],[200,14],[200,456]].forEach(([a,b])=>s+=`<circle cx="${a}" cy="${b}" r="3" fill="#121214"/>`);
  s+=rocker(`dpE${u}`,34,34,`Datapak ${u+1} · interruptor ELECTRONICS`,'Enciende la electrónica del Datapak (la que lee el DMX y regula).');
  s+=`<text x="36" y="28" font-size="6.5" fill="#bbb">ELECTRONICS</text><circle cx="72" cy="52" r="8" fill="#141416" stroke="#5e6066"/>`;
  [5,6,7,8].forEach((n,i)=>s+=chan(n,140+i*50+(i>1?40:0),34,'v'));
  s+=phase('ψ2',222,60,false);
  [4,3].forEach((n,i)=>s+=chan(n,26,160+i*42,'h'));s+=phase('ψ1',40,238,true);[2,1].forEach((n,i)=>s+=chan(n,26,296+i*42,'h'));
  [9,10].forEach((n,i)=>s+=chan(n,378,166+i*42,'hr'));s+=phase('ψ3',346,246,true);[11,12].forEach((n,i)=>s+=chan(n,378,304+i*42,'hr'));
  s+=`<text x="215" y="150" text-anchor="middle" font-size="40" font-style="italic" font-family="'Snell Roundhand','Brush Script MT',cursive" fill="#e8e8e8" transform="rotate(-7 215 150)">Datapak</text>`;
  s+=`<g fill="none" stroke="#b8b8b8" stroke-width=".8"><rect x="122" y="214" width="196" height="160"/><line x1="122" y1="244" x2="318" y2="244"/><line x1="190" y1="244" x2="190" y2="374"/><line x1="254" y1="244" x2="254" y2="374"/><rect x="50" y="382" width="300" height="58"/><line x1="130" y1="382" x2="130" y2="440"/><line x1="230" y1="382" x2="230" y2="440"/></g>`;
  s+=`<text x="220" y="228" text-anchor="middle" font-size="8" font-weight="700" fill="#cfcfcf">WARNING</text><text x="220" y="238" text-anchor="middle" font-size="5.5" fill="#bdbdbd">DISCONNECT MAINS BEFORE REMOVING COVER</text>`;
  s+=rocker(`dpP${u}`,22,384,`Datapak ${u+1} · interruptor PREHEAT`,'Precalentamiento: mantiene los filamentos un poco calientes para que no sufran al encenderse de golpe.');
  s+=`<text x="20" y="378" font-size="6.5" fill="#bbb">PREHEAT</text>`;
  s+=`<text x="16" y="460" font-size="12" font-weight="800" font-style="italic" fill="#e6e6e6">PULSAR</text><text x="72" y="459" font-size="7" fill="#cfcfcf">12 × 10 AMP DIMMING/SWITCHING DATAPAK III · 1-3 PHASE</text>`;
  return s+'</svg>';}

/* ---------- logic ---------- */
const root=document.getElementById('pwr'),stage=document.getElementById('pwr-stage'),tip=document.getElementById('pwr-tip'),stat=document.getElementById('pwr-status');
const mains=u=>state.rcd&&state[u==1?'dim':'dp'];
export { PH, board, datapak, ROWS, PER };
