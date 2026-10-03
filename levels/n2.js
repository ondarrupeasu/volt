/* N2 · Símbolos y esquemas: símbolos normalizados (estilo IEC 60617), juego de emparejar y unifilar. */
import { h, quiz } from '../ui.js';

/* Cada símbolo se dibuja en una caja de 60×60, horizontal, con trazo currentColor. */
const SW = 'M4 30 H20 L42 17 M42 30 H56';
const SYM = {
  conductor: { name: 'Conductor (cable)', d: '<path d="M4 30 H56"/>',
    txt: 'Una línea es un cable. En un unifilar, las rayitas oblicuas que lo cruzan dicen cuántos conductores van dentro.' },
  interruptor: { name: 'Interruptor', d: `<path d="${SW}"/>`,
    txt: 'El de la pared de la luz: abre o cierra el circuito a mano. Se dibuja abierto (en reposo).' },
  fusible: { name: 'Fusible', d: '<path d="M4 30 H56"/><rect x="17" y="23" width="26" height="14"/>',
    txt: 'Un rectángulo atravesado por la línea: el hilo que se funde si pasa demasiada corriente.' },
  magneto: { name: 'Magnetotérmico', d: `<path d="${SW}"/><path d="M38.5 26.5 L45.5 33.5 M45.5 26.5 L38.5 33.5"/><path d="M22 10 h5 v-4 h5"/><rect x="36" y="4" width="9" height="7"/>`,
    txt: 'Interruptor automático: la cruz en el contacto indica que corta solo. Los dos dibujitos de arriba son la parte térmica (escalón) y la magnética (cuadradito).' },
  diferencial: { name: 'Diferencial', d: `<path d="${SW}"/><ellipse cx="11" cy="30" rx="4" ry="10"/><path d="M11 20 V10 H30 V22" stroke-dasharray="3 3"/>`,
    txt: 'Interruptor + un anillo (el toroide) que abraza los cables y mide si sale lo mismo que vuelve. Se rotula con su sensibilidad: 30 mA.' },
  lampara: { name: 'Lámpara / punto de luz', d: '<path d="M2 30 H16 M44 30 H58"/><circle cx="30" cy="30" r="14"/><path d="M20 20 L40 40 M40 20 L20 40"/>',
    txt: 'Un círculo con una equis. Vale para cualquier punto de luz: bombilla, LED, foco.' },
  toma: { name: 'Base de enchufe', d: '<path d="M14 36 A16 16 0 0 1 46 36 M30 36 V56"/>',
    txt: 'Medio círculo (el hueco donde entra la clavija) con su cable.' },
  tomaT: { name: 'Enchufe con toma de tierra', d: '<path d="M14 36 A16 16 0 0 1 46 36 M30 36 V56 M14 14 H46"/>',
    txt: 'Igual que la base de enchufe, con una raya encima que indica que lleva tierra. Es el Schuko de casa.' },
  tierra: { name: 'Toma de tierra', d: '<path d="M30 6 V30 M14 30 H46 M20 38 H40 M26 46 H34"/>',
    txt: 'Rayas cada vez más cortas: el cable que se va al suelo (la pica de tierra del edificio).' },
  motor: { name: 'Motor', d: '<path d="M2 30 H13 M47 30 H58"/><circle cx="30" cy="30" r="17"/><text x="30" y="37" text-anchor="middle" font-size="19" font-weight="700" stroke="none" fill="currentColor" font-family="system-ui">M</text>',
    txt: 'Un círculo con una M. Ventiladores, extractores, bombas, el motor de una lavadora.' },
  resistencia: { name: 'Resistencia', d: '<path d="M4 30 H16 M44 30 H56"/><rect x="16" y="23" width="28" height="14"/>',
    txt: 'Un rectángulo en el camino. Ojo: se parece al fusible, pero aquí la línea NO lo atraviesa.' },
  pila: { name: 'Pila / batería', d: '<path d="M4 30 H25 M25 16 V44 M35 23 V37 M35 30 H56"/>',
    txt: 'Raya larga (+) y raya corta (−). La misma que viste en los circuitos del N1.' },
  trafo: { name: 'Transformador', d: '<path d="M2 30 H12 M48 30 H58"/><circle cx="23" cy="30" r="11"/><circle cx="37" cy="30" r="11"/>',
    txt: 'Dos círculos entrelazados: cambia una tensión alterna por otra (230 V → 12 V, por ejemplo).' },
};
const symSVG = (k, cls = 'sym-svg') =>
  `<svg viewBox="0 0 60 60" class="${cls}" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${SYM[k].d}</svg>`;

/* ---------- 1 · Galería ---------- */
function galeria(el, { done }) {
  el.append(h(`<p class="lead">Los planos eléctricos usan un idioma de dibujitos normalizados (norma IEC 60617). Toca cada símbolo
    para ver qué aparato representa. Cuando los hayas visto todos, el paso queda completado.</p>`));
  const grid = h('<div class="symgrid"></div>');
  const card = h('<div class="note cable-info"><i>Toca un símbolo…</i></div>');
  const seen = new Set();
  for (const k of Object.keys(SYM)) {
    const b = h(`<button class="symcard">${symSVG(k)}<span>${SYM[k].name}</span></button>`);
    b.onclick = () => {
      grid.querySelectorAll('.symcard').forEach((x) => x.classList.toggle('on', x === b));
      b.classList.add('seen');
      card.innerHTML = `<b>${SYM[k].name}</b><br>${SYM[k].txt}`;
      seen.add(k);
      if (seen.size === Object.keys(SYM).length) done();
      counter.textContent = `${seen.size} / ${Object.keys(SYM).length} vistos`;
    };
    grid.append(b);
  }
  const counter = h(`<p class="small muted">0 / ${Object.keys(SYM).length} vistos</p>`);
  el.append(grid, counter, card);
}

/* ---------- 2 · Juego de emparejar ---------- */
function juego(el, { done }) {
  el.append(h(`<p class="lead">Ahora sin chuleta: aparece un símbolo y eliges qué es. <b>10 rondas</b>; con 8 aciertos lo superas.</p>`));
  const box = h(`<div class="game">
    <div class="game-sym"></div>
    <div class="game-side"><p class="game-score"></p><div class="quiz-opts"></div><p class="quiz-why"></p>
      <button class="ce-btn ce-primary next" hidden>Siguiente →</button></div></div>`);
  el.append(box);
  const keys = Object.keys(SYM);
  const shuffle = (a) => a.map((v) => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map((x) => x[1]);
  let round = 0, hits = 0, deck = shuffle(keys).slice(0, 10);
  const opts = box.querySelector('.quiz-opts'), why = box.querySelector('.quiz-why');
  const next = box.querySelector('.next'), score = box.querySelector('.game-score');

  const play = () => {
    if (round === deck.length) {
      const ok = hits >= 8;
      box.querySelector('.game-sym').innerHTML = `<div class="big">${hits}/10</div>`;
      score.textContent = ok ? '¡Superado! Ya lees planos.' : 'Casi. Repasa la galería y vuelve a intentarlo.';
      opts.innerHTML = ''; why.textContent = '';
      next.hidden = false; next.textContent = 'Jugar otra vez';
      if (ok) done();
      return;
    }
    const k = deck[round];
    box.querySelector('.game-sym').innerHTML = symSVG(k, 'sym-svg big');
    score.textContent = `Ronda ${round + 1} de 10 · aciertos: ${hits}`;
    why.textContent = ''; next.hidden = true;
    // distractores: incluye adrede los parecidos (fusible/resistencia, toma/tomaT, interruptor/magneto/diferencial)
    const twins = { fusible: 'resistencia', resistencia: 'fusible', toma: 'tomaT', tomaT: 'toma', interruptor: 'magneto', magneto: 'diferencial', diferencial: 'magneto' };
    const pool = shuffle(keys.filter((x) => x !== k && x !== twins[k]));
    const options = shuffle([k, twins[k] || pool.pop(), pool[0], pool[1]]);
    opts.innerHTML = '';
    options.forEach((o) => {
      const b = h(`<button class="ce-chip">${SYM[o].name}</button>`);
      b.onclick = () => {
        if (!next.hidden) return;
        const ok = o === k;
        if (ok) hits++;
        b.classList.add(ok ? 'ok' : 'ko');
        if (!ok) [...opts.children][options.indexOf(k)].classList.add('ok');
        why.className = `quiz-why ${ok ? 'ok' : 'ko'}`;
        why.innerHTML = `${ok ? '✓' : '✗'} ${SYM[k].txt}`;
        round++; next.hidden = false; next.textContent = 'Siguiente →';
      };
      opts.append(b);
    });
  };
  next.onclick = () => { if (round === deck.length) { round = hits = 0; deck = shuffle(keys).slice(0, 10); } play(); };
  play();
}

/* ---------- 3 · Leer un unifilar ---------- */
const UNI = {
  cont: ['Contador y acometida', 'Por aquí entra la electricidad de la compañía. El contador mide los kWh que gastas.'],
  iga: ['IGA · Interruptor General Automático 25 A', 'Un magnetotérmico que protege toda la instalación. Con él cortas todo de golpe.'],
  dif: ['Diferencial 40 A · 30 mA', 'Protege a las personas en todos los circuitos que cuelgan de él. «40 A» es lo que aguanta pasar; «30 mA» la fuga a la que salta.'],
  c1: ['C1 · Alumbrado · 10 A · 1,5 mm²', 'Los puntos de luz. Consumen poco, así que van con cable fino (1,5 mm²) y magnetotérmico de 10 A.'],
  c2: ['C2 · Enchufes de uso general · 16 A · 2,5 mm²', 'Las tomas de corriente. Cable más grueso (2,5 mm²) porque pueden tener más carga.'],
  c3: ['C3 · Climatización · 16 A · 2,5 mm²', 'Un motor (el aire acondicionado o un extractor) con su propio circuito: si falla, no deja a oscuras lo demás.'],
};
const place = (k, x, y, rot = 90) => `<g transform="translate(${x} ${y}) rotate(${rot}) translate(-30 -30)" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${SYM[k].d}</g>`;
const slashes = (x, y, n) => Array.from({ length: n }, (_, i) => `<path d="M${x - 7} ${y + 4 + i * 6} L${x + 7} ${y - 2 + i * 6}"/>`).join('');

function unifilar(el, { done }) {
  el.append(h(`<p class="lead">Un <b>esquema unifilar</b> dibuja cada circuito con <b>una sola línea</b>, aunque dentro vayan varios cables
    (las rayitas oblicuas dicen cuántos: 3 = fase + neutro + tierra). Se lee de arriba abajo, como baja la corriente.
    Toca cada elemento.</p>`));
  const br = (k, x, load, lab) => `
    <g class="uni" data-k="${k}">
      <rect x="${x - 60}" y="244" width="120" height="176" rx="8" class="hit"/>
      <path d="M${x} 240 V262 M${x} 318 V${load === 'motor' ? 367 : 358}"/>${place('magneto', x, 290)}
      <g class="sl">${slashes(x, 334, 3)}</g>
      ${place(load, x, 384, { lampara: 90, tomaT: 180, motor: 0 }[load])}
      <text x="${x}" y="436" class="lab small" text-anchor="middle">${lab}</text>
    </g>`;
  const svg = h(`
  <svg class="sim uni-svg" viewBox="0 0 640 450" stroke-linecap="round">
    <g class="uni" data-k="cont"><rect x="270" y="6" width="100" height="36" rx="6" class="hit box"/>
      <text x="320" y="29" class="lab small" text-anchor="middle">kWh · contador</text></g>
    <path d="M320 42 V70" class="ln"/>
    <g class="uni" data-k="iga"><rect x="250" y="66" width="140" height="68" rx="8" class="hit"/>${place('magneto', 320, 100)}
      <text x="360" y="104" class="lab small">IGA 25 A</text></g>
    <path d="M320 130 V150" class="ln"/>
    <g class="uni" data-k="dif"><rect x="250" y="146" width="140" height="68" rx="8" class="hit"/>${place('diferencial', 320, 180)}
      <text x="360" y="184" class="lab small">40 A · 30 mA</text></g>
    <path d="M320 210 V240 M160 240 H480" class="ln"/>
    ${br('c1', 160, 'lampara', 'C1 · 10 A · alumbrado')}
    ${br('c2', 320, 'tomaT', 'C2 · 16 A · enchufes')}
    ${br('c3', 480, 'motor', 'C3 · 16 A · clima')}
  </svg>`);
  const card = h('<div class="note cable-info"><i>Toca un elemento del esquema…</i></div>');
  svg.querySelectorAll('.uni').forEach((g) => (g.onclick = () => {
    svg.querySelectorAll('.uni').forEach((x) => x.classList.toggle('sel', x === g));
    const [t, d] = UNI[g.dataset.k];
    card.innerHTML = `<b>${t}</b><br>${d}`;
  }));
  el.append(svg, card);

  let ok = 0;
  const check = () => { if (++ok === 2) done(); };
  el.append(
    quiz({ q: 'Salta el <b>diferencial</b>. ¿Qué se queda sin corriente?', options: ['Solo los enchufes', 'Los tres circuitos', 'Nada, solo avisa'], correct: 1,
      why: 'Todo lo que cuelga debajo de él: C1, C2 y C3. Por eso en instalaciones grandes se ponen varios diferenciales.', onOk: check }),
    quiz({ q: 'Salta el magnetotérmico de <b>C2</b>. ¿Qué pasa con la luz (C1)?', options: ['Se apaga también', 'Sigue funcionando'], correct: 1,
      why: 'Cada circuito tiene su protección: un fallo en los enchufes no te deja a oscuras.', onOk: check }),
  );
}

export default {
  id: 'n2', num: 2, title: 'Símbolos y esquemas',
  blurb: 'Los iconos de los planos eléctricos, un juego para memorizarlos y cómo leer un unifilar.',
  steps: [
    { id: 'simbolos', title: 'Los símbolos', render: galeria },
    { id: 'juego', title: 'Empareja', render: juego },
    { id: 'unifilar', title: 'Leer un unifilar', render: unifilar },
  ],
};
