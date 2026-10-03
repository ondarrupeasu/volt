/* N0 · Conceptos: magnitudes (analogía del agua), CC vs CA, fase/neutro/tierra. */
import { h, slider, loop, flowDots, num, quiz } from '../ui.js';

/* ---------- 1 · La analogía del agua ---------- */
function agua(el, { done }) {
  el.append(h(`<p class="lead">La electricidad no se ve, pero se comporta como <b>agua en una tubería</b>.
    Mueve los mandos y mira qué pasa con el agua… y con los números eléctricos de abajo.</p>`));

  const svg = h(`
  <svg class="sim" viewBox="0 0 640 270">
    <defs><linearGradient id="wat" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#4a9eff"/><stop offset="1" stop-color="#1f5fbf"/></linearGradient></defs>
    <text x="90" y="22" class="lab" text-anchor="middle">Depósito</text>
    <rect x="30" y="30" width="120" height="200" rx="6" class="tank"/>
    <rect id="water" x="32" y="228" width="116" height="0" fill="url(#wat)"/>
    <line id="lvl" x1="152" x2="168" y1="0" y2="0" class="lvl"/>
    <text id="lvlTxt" x="172" y="0" class="lab small">altura</text>
    <rect id="pipe" x="148" y="200" width="342" height="20" class="pipe"/>
    <path id="pipePath" d="M152 210 H486" fill="none"/>
    <g id="wheel" transform="translate(540 210)">
      <circle r="44" class="wheel"/>
      ${Array.from({ length: 8 }, (_, i) => `<rect x="-4" y="-50" width="8" height="22" rx="2" class="paddle" transform="rotate(${i * 45})"/>`).join('')}
      <circle r="6" class="hub"/>
    </g>
    <text x="540" y="150" class="lab" text-anchor="middle">Rueda (el aparato)</text>
    <text x="318" y="250" class="lab" text-anchor="middle">Tubería</text>
  </svg>`);
  el.append(svg);

  const water = svg.querySelector('#water'), pipe = svg.querySelector('#pipe');
  const lvl = svg.querySelector('#lvl'), lvlTxt = svg.querySelector('#lvlTxt');
  const wheel = svg.querySelector('#wheel');
  let V = 12, R = 6, ang = 0;
  const I = () => (V / R);

  flowDots(svg.querySelector('#pipePath'), {
    n: 16, r: 3, cls: 'drop',
    speed: () => 240 * I() / (I() + 2),
  });
  loop(svg, (dt) => {
    ang += 40 * Math.sqrt(V * I()) * dt;
    wheel.setAttribute('transform', `translate(540 210) rotate(${ang})`);
  });

  const out = h(`<div class="readout four">
    <div><small>Altura del agua</small><b>= Tensión</b><span id="oV"></span></div>
    <div><small>Estrechez del tubo</small><b>= Resistencia</b><span id="oR"></span></div>
    <div><small>Caudal de agua</small><b>= Intensidad</b><span id="oI"></span></div>
    <div><small>Trabajo de la rueda</small><b>= Potencia</b><span id="oP"></span></div>
  </div>`);

  const draw = () => {
    const hgt = 196 * V / 24;
    water.setAttribute('y', 228 - hgt); water.setAttribute('height', hgt);
    lvl.setAttribute('y1', 228 - hgt); lvl.setAttribute('y2', 228 - hgt);
    lvlTxt.setAttribute('y', 232 - hgt);
    const th = 6 + 30 / Math.sqrt(R);
    pipe.setAttribute('y', 210 - th / 2); pipe.setAttribute('height', th);
    svg.querySelectorAll('.drop').forEach((d) => d.setAttribute('opacity', V > 0 ? 1 : 0));
    out.querySelector('#oV').textContent = `${num(V, 1)} V`;
    out.querySelector('#oR').textContent = `${num(R, 0)} Ω`;
    out.querySelector('#oI').textContent = `${num(I())} A`;
    out.querySelector('#oP').textContent = `${num(V * I(), 1)} W`;
  };

  const ctr = h('<div class="controls"></div>');
  ctr.append(
    slider({ label: 'Altura del agua · <b>Tensión</b>', min: 0, max: 24, step: 0.5, value: V, unit: 'V', fmt: (v) => num(v, 1), onInput: (v) => { V = v; draw(); } }),
    slider({ label: 'Estrechez del tubo · <b>Resistencia</b>', min: 1, max: 24, value: R, unit: 'Ω', onInput: (v) => { R = v; draw(); } }),
  );
  el.append(ctr, out);

  el.append(h(`<div class="note"><ul>
    <li><b>Tensión (V, voltios)</b>: el «empuje». Cuanta más altura, más presión tiene el agua para salir.</li>
    <li><b>Resistencia (Ω, ohmios)</b>: lo que frena. Un tubo estrecho deja pasar menos agua.</li>
    <li><b>Intensidad (A, amperios)</b>: cuánta corriente pasa realmente. Sale de las dos anteriores.</li>
    <li><b>Potencia (W, vatios)</b>: el trabajo que se hace (la rueda gira, la bombilla luce, el horno calienta).</li>
  </ul></div>`));

  el.append(quiz({
    q: 'Dejas la tensión igual y <b>estrechas el tubo</b> (subes la resistencia). ¿Qué pasa con la intensidad?',
    options: ['Sube', 'Baja', 'No cambia'],
    correct: 1,
    why: 'Más resistencia = pasa menos corriente. Lo verás con números en la Ley de Ohm (N1).',
    onOk: done,
  }));
}

/* ---------- 2 · Las cuatro magnitudes en la vida real ---------- */
function magnitudes(el, { done }) {
  el.append(h(`<p class="lead">Cuatro magnitudes, cuatro unidades. Esto es lo que verás escrito en cables, enchufes,
    cargadores y focos.</p>`));
  el.append(h(`<div class="table-wrap"><table class="mag">
    <thead><tr><th>Magnitud</th><th>Letra</th><th>Unidad</th><th>En el agua</th><th>Ejemplos reales</th></tr></thead>
    <tbody>
      <tr><td>Tensión</td><td>V (o U)</td><td>voltio · <b>V</b></td><td>altura / presión</td><td>pila AA 1,5 V · USB 5 V · enchufe 230 V</td></tr>
      <tr><td>Intensidad</td><td>I</td><td>amperio · <b>A</b></td><td>caudal</td><td>móvil cargando ~2 A · magnetotérmico de casa 10–16 A</td></tr>
      <tr><td>Resistencia</td><td>R</td><td>ohmio · <b>Ω</b></td><td>estrechez del tubo</td><td>cable de cobre ≈ 0 Ω · cuerpo humano ~1000 Ω</td></tr>
      <tr><td>Potencia</td><td>P</td><td>vatio · <b>W</b></td><td>trabajo de la rueda</td><td>LED 8 W · fresnel de plató 1000 W · horno 2000 W</td></tr>
    </tbody></table></div>`));

  el.append(h(`<p>Fíjate en el <b>fresnel de 1000 W</b>: es la misma potencia que medio horno. Por eso en un plató
    se reparten los focos entre varios circuitos: no todo cabe en un solo enchufe (lo verás en N4).</p>`));

  let ok = 0;
  const check = () => { if (++ok === 2) done(); };
  el.append(
    quiz({
      q: 'En la caja de un foco pone «1000». ¿En qué unidad está, casi seguro?',
      options: ['Voltios (V)', 'Amperios (A)', 'Vatios (W)', 'Ohmios (Ω)'],
      correct: 2,
      why: 'Los aparatos se anuncian por su potencia: lo que «gastan» y el trabajo que hacen.',
      onOk: check,
    }),
    quiz({
      q: '¿Qué magnitud es la que de verdad <b>circula</b> por el cable?',
      options: ['La tensión', 'La intensidad', 'La potencia'],
      correct: 1,
      why: 'La intensidad es la corriente que pasa. La tensión es el empuje que la provoca.',
      onOk: check,
    }),
  );
}

/* ---------- 3 · Continua y alterna ---------- */
function ccca(el, { done }) {
  el.append(h(`<p class="lead">Hay dos formas de empujar la corriente. En <b>continua (CC)</b> siempre empuja hacia el mismo
    lado. En <b>alterna (CA)</b> cambia de sentido una y otra vez: <b>50 veces por segundo</b> en Europa.</p>`));

  const seg = h(`<div class="ce-seg"><button data-m="cc" class="ce-on">Continua · CC</button><button data-m="ca">Alterna · CA</button></div>`);
  const svg = h(`
  <svg class="sim" viewBox="0 0 640 250">
    <line x1="40" x2="620" y1="100" y2="100" class="axis"/>
    <line x1="40" x2="40" y1="15" y2="185" class="axis"/>
    <text x="34" y="104" class="lab small" text-anchor="end">0 V</text>
    <text id="top" x="34" y="24" class="lab small" text-anchor="end"></text>
    <text id="bot" x="34" y="184" class="lab small" text-anchor="end"></text>
    <path id="wave" class="wave" fill="none"/>
    <line id="cur" y1="15" y2="185" class="cursor"/>
    <circle id="curDot" r="5" class="curdot"/>
    <text id="tlab" x="620" y="118" class="lab small" text-anchor="end"></text>
    <rect x="40" y="212" width="580" height="16" rx="8" class="wire"/>
    <path id="wirePath" d="M48 220 H612" fill="none"/>
    <text x="40" y="246" class="lab small">el cable (los puntos = la corriente, a cámara muy lenta)</text>
  </svg>`);
  el.append(seg, svg);

  const info = h('<div class="note"></div>');
  el.append(info);

  let mode = 'cc';
  const T = 4; // segundos de animación = 2 ciclos de red (40 ms) → cámara lenta ×100
  const y = (x01) => (mode === 'cc' ? 40 : 100 - 80 * Math.sin(2 * Math.PI * 2 * x01));
  const draw = () => {
    let d = '';
    for (let i = 0; i <= 200; i++) d += `${i ? 'L' : 'M'}${40 + 580 * i / 200} ${y(i / 200)}`;
    svg.querySelector('#wave').setAttribute('d', d);
    svg.querySelector('#top').textContent = mode === 'cc' ? '+12 V' : '+325 V';
    svg.querySelector('#bot').textContent = mode === 'cc' ? '' : '−325 V';
    svg.querySelector('#tlab').textContent = mode === 'cc' ? 'tiempo →' : '40 ms (2 ciclos) →';
    info.innerHTML = mode === 'cc'
      ? `<b>Continua:</b> pilas, baterías, USB, cargadores de portátil, la electrónica por dentro.
         El valor no cambia: una batería de coche da siempre unos 12 V.`
      : `<b>Alterna:</b> la del enchufe. Decimos «230 V» pero en realidad oscila entre +325 V y −325 V;
         los 230 V son el valor <i>eficaz</i>, el que calienta igual que 230 V de continua. Se usa en la red porque
         se puede subir y bajar fácil con transformadores para transportarla lejos.`;
  };
  seg.querySelectorAll('button').forEach((b) => (b.onclick = () => {
    seg.querySelectorAll('button').forEach((x) => x.classList.toggle('ce-on', x === b));
    mode = b.dataset.m; draw();
  }));
  draw();

  flowDots(svg.querySelector('#wirePath'), {
    n: 22, r: 3, cls: 'dot',
    speed: (t) => (mode === 'cc' ? 70 : 220 * Math.sin(2 * Math.PI * 2 * ((t % T) / T))),
  });
  const cur = svg.querySelector('#cur'), dot = svg.querySelector('#curDot');
  loop(svg, (_, t) => {
    const x01 = (t % T) / T, x = 40 + 580 * x01;
    cur.setAttribute('x1', x); cur.setAttribute('x2', x);
    dot.setAttribute('cx', x); dot.setAttribute('cy', y(x01));
  });

  el.append(quiz({
    q: 'Un cargador de móvil se enchufa a la pared y da 5 V por el USB. ¿Qué hace por dentro?',
    options: ['Convierte CA en CC', 'Convierte CC en CA', 'Nada, es la misma corriente'],
    correct: 0,
    why: 'Coge la alterna de 230 V del enchufe y la convierte en continua de 5 V para el móvil.',
    onOk: done,
  }));
}

/* ---------- 4 · Fase, neutro y tierra ---------- */
const CABLES = {
  L: { name: 'Fase (L)', color: 'marrón, negro o gris',
       txt: 'Trae la tensión: <b>230 V</b>. Es el cable peligroso. Si tocas la fase y estás en contacto con el suelo, la corriente pasa por tu cuerpo.' },
  N: { name: 'Neutro (N)', color: 'azul',
       txt: 'Es el camino de <b>vuelta</b> de la corriente. Normalmente está cerca de 0 V… pero si la instalación falla puede tener tensión: <b>nunca</b> se toca «porque es el neutro».' },
  PE: { name: 'Tierra (PE)', color: 'verde-amarillo',
       txt: 'Es de <b>seguridad</b>: une las carcasas metálicas con el suelo. Si una fase toca la carcasa, la corriente se escapa por aquí y el <b>diferencial</b> corta (lo verás en N3). En uso normal no lleva corriente.' },
};
function cables(el, { done }) {
  el.append(h(`<p class="lead">En casa (monofásica) a cada enchufe llegan tres cables. Toca cada uno para ver para qué sirve.</p>`));
  const svg = h(`
  <svg class="sim" viewBox="0 0 640 280">
    <defs><pattern id="pe" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <rect width="16" height="16" fill="#2fa84f"/><rect width="8" height="16" fill="#e8d531"/></pattern></defs>
    <rect x="0" y="0" width="640" height="34" class="wall"/>
    <text x="320" y="22" class="lab" text-anchor="middle">viene del cuadro eléctrico</text>
    <g class="cable" data-c="L"><path d="M250 34 C250 120 290 120 290 175" stroke="#7b4a2a"/><text x="200" y="110" class="lab">L</text></g>
    <g class="cable" data-c="N"><path d="M390 34 C390 120 350 120 350 175" stroke="#2f6fd8"/><text x="420" y="110" class="lab">N</text></g>
    <g class="cable" data-c="PE"><path d="M320 34 V175" stroke="url(#pe)"/><text x="330" y="70" class="lab">PE</text></g>
    <circle cx="320" cy="215" r="58" class="socket"/>
    <circle cx="320" cy="215" r="44" class="socket-in"/>
    <circle cx="295" cy="215" r="7" class="hole"/><circle cx="345" cy="215" r="7" class="hole"/>
    <rect x="314" y="171" width="12" height="9" rx="2" class="clip"/><rect x="314" y="250" width="12" height="9" rx="2" class="clip"/>
    <text x="400" y="220" class="lab small">enchufe Schuko</text>
  </svg>`);
  el.append(svg);
  const card = h('<div class="note cable-info"><i>Toca un cable…</i></div>');
  el.append(card);

  const show = (c) => {
    svg.querySelectorAll('.cable').forEach((g) => g.classList.toggle('sel', g.dataset.c === c));
    const k = CABLES[c];
    card.innerHTML = `<b>${k.name}</b> · color: <b>${k.color}</b><br>${k.txt}`;
  };

  /* mini-juego: 3 preguntas, se responden tocando el cable */
  const asks = [
    ['¿Qué cable trae los 230 V?', 'L'],
    ['La carcasa de la lavadora se ha puesto en tensión. ¿Qué cable salva a quien la toque?', 'PE'],
    ['¿Por qué cable vuelve la corriente?', 'N'],
  ];
  let k = 0;
  const game = h(`<div class="quiz"><p class="quiz-q"></p><p class="quiz-why" hidden></p></div>`);
  const q = game.querySelector('.quiz-q'), why = game.querySelector('.quiz-why');
  const ask = () => { q.innerHTML = k < asks.length ? `🎯 ${asks[k][0]} <small>(toca el cable)</small>` : '¡Los tres a la primera… o casi! 👏'; };
  ask();

  svg.querySelectorAll('.cable').forEach((g) => (g.onclick = () => {
    const c = g.dataset.c;
    show(c);
    if (k >= asks.length) return;
    const ok = c === asks[k][1];
    why.hidden = false;
    why.className = `quiz-why ${ok ? 'ok' : 'ko'}`;
    why.innerHTML = ok ? '✓ Exacto.' : '✗ Ese no. Lee lo que hace y prueba otro.';
    if (ok && ++k === asks.length) done();
    ask();
  }));
  el.append(game);

  el.append(h(`<div class="note"><b>Curiosidad:</b> en el enchufe Schuko la fase y el neutro pueden ir en cualquiera de los dos
    agujeros (por eso la clavija entra de las dos maneras). La tierra son las dos <b>pestañas metálicas</b> de los lados.</div>`));
}

export default {
  id: 'n0', num: 0, title: 'Conceptos',
  blurb: 'Tensión, intensidad, resistencia y potencia con la analogía del agua; continua y alterna; fase, neutro y tierra.',
  steps: [
    { id: 'agua', title: 'La analogía del agua', render: agua },
    { id: 'magnitudes', title: 'Las cuatro magnitudes', render: magnitudes },
    { id: 'ccca', title: 'Continua y alterna', render: ccca },
    { id: 'cables', title: 'Fase, neutro y tierra', render: cables },
  ],
};
