/* N1 · El circuito: abierto/cerrado, Ley de Ohm interactiva, serie y paralelo. */
import { h, slider, flowDots, num, quiz, bulbSVG, HALO_DEF, setBulb } from '../ui.js';

const battery = (x, y, label) => `
  <g transform="translate(${x} ${y})">
    <rect x="-34" y="-22" width="68" height="44" class="mask"/>
    <line x1="-26" x2="26" y1="-8" y2="-8" class="sym" stroke-width="3"/>
    <line x1="-13" x2="13" y1="8" y2="8" class="sym" stroke-width="6"/>
    <text x="34" y="-4" class="lab small">+</text><text x="22" y="14" class="lab small">−</text>
    <text x="-44" y="5" class="lab" text-anchor="end">${label}</text>
  </g>`;

/* ---------- 1 · El circuito ---------- */
function circuito(el, { done }) {
  el.append(h(`<p class="lead">Un circuito es un <b>camino cerrado</b>: la corriente sale de la fuente, pasa por la carga y
    vuelve. Si el camino se corta en cualquier punto, deja de circular. Pulsa el interruptor.</p>`));
  const svg = h(`
  <svg class="sim" viewBox="0 0 640 300">
    <defs>${HALO_DEF}</defs>
    <path id="loop" d="M120 240 V60 H520 V240 Z" class="wireline"/>
    ${battery(120, 150, 'Pila 4,5 V')}
    <g id="sw" class="switch" transform="translate(320 60)">
      <rect x="-40" y="-30" width="80" height="50" class="mask"/>
      <circle cx="-26" cy="0" r="4" class="sym-fill"/><circle cx="26" cy="0" r="4" class="sym-fill"/>
      <line id="lever" x1="-26" y1="0" x2="26" y2="0" class="sym" stroke-width="3"/>
      <rect x="-40" y="-30" width="80" height="50" fill="transparent"/>
    </g>
    <text x="320" y="96" class="lab small" text-anchor="middle">interruptor (tócalo)</text>
    <g transform="translate(520 150)"><rect x="-30" y="-36" width="60" height="78" class="mask"/>${bulbSVG('b1')}</g>
    <text x="560" y="154" class="lab">Bombilla</text>
    <text x="320" y="272" class="lab small" text-anchor="middle">cable (conductor)</text>
  </svg>`);
  el.append(svg);
  const state = h('<p class="state"></p>');
  el.append(state);

  let on = false;
  const bulb = svg.querySelector('#b1'), lever = svg.querySelector('#lever');
  const dots = flowDots(svg.querySelector('#loop'), { n: 30, r: 3, cls: 'dot', speed: () => (on ? 90 : 0) });
  const draw = () => {
    lever.setAttribute('x2', on ? 26 : 20);
    lever.setAttribute('y2', on ? 0 : -24);
    setBulb(bulb, on ? 0.9 : 0);
    dots.style.opacity = on ? 1 : 0.3;
    state.innerHTML = on
      ? '<span class="ce-badge ce-b-ok"><span class="ce-dot" style="background:currentColor"></span>Circuito CERRADO</span> La corriente circula y la bombilla luce.'
      : '<span class="ce-badge ce-b-warn">Circuito ABIERTO</span> Los electrones están en el cable, pero sin camino de vuelta no se mueven.';
  };
  svg.querySelector('#sw').onclick = () => { on = !on; draw(); };
  draw();

  el.append(h(`<div class="note"><b>Los cuatro elementos de todo circuito:</b>
    <ul><li><b>Fuente</b>: da la tensión (pila, enchufe, batería).</li>
    <li><b>Conductor</b>: el cable, normalmente de cobre.</li>
    <li><b>Carga</b>: lo que aprovecha la energía (bombilla, motor, foco…).</li>
    <li><b>Control</b>: lo que abre o cierra el camino (interruptor).</li></ul></div>`));

  el.append(quiz({
    q: 'Cortas el cable de <b>vuelta</b> (el de abajo), lejos del interruptor. ¿Luce la bombilla?',
    options: ['Sí, porque el interruptor está cerrado', 'No, el circuito queda abierto'],
    correct: 1,
    why: 'Da igual dónde se corte: sin camino cerrado no hay corriente.',
    onOk: done,
  }));
}

/* ---------- 2 · Ley de Ohm ---------- */
function ohm(el, { done }) {
  el.append(h(`<p class="lead">La regla más importante de la electricidad: <b>la intensidad es la tensión dividida entre la
    resistencia</b>. Juega con la fuente y con la resistencia de la carga.</p>`));
  const PMAX = 40; // a partir de aquí la bombilla se funde
  const svg = h(`
  <svg class="sim" viewBox="0 0 640 300">
    <defs>${HALO_DEF}</defs>
    <path id="loop" d="M120 240 V60 H520 V240 Z" class="wireline"/>
    ${battery(120, 150, 'Fuente')}
    <g transform="translate(520 150)"><rect x="-30" y="-36" width="60" height="78" class="mask"/>${bulbSVG('b')}</g>
    <g transform="translate(320 240)">
      <rect x="-62" y="-38" width="124" height="70" rx="8" class="meter"/>
      <path d="M-46 14 A50 50 0 0 1 46 14" class="scale" fill="none"/>
      <text x="-50" y="26" class="lab small">0</text><text x="44" y="26" class="lab small">3 A</text>
      <line id="needle" x1="0" y1="20" x2="0" y2="-26" class="needle"/>
      <text x="0" y="52" class="lab small" text-anchor="middle">amperímetro</text>
    </g>
    <text id="burn" x="520" y="222" class="lab warn" text-anchor="middle" opacity="0">¡Fundida!</text>
  </svg>`);
  el.append(svg);

  let V = 12, R = 24, broken = false;
  const bulb = svg.querySelector('#b'), needle = svg.querySelector('#needle'), burn = svg.querySelector('#burn');
  const I = () => (broken ? 0 : V / R);
  const dots = flowDots(svg.querySelector('#loop'), { n: 30, r: 3, cls: 'dot', speed: () => 60 * Math.min(I(), 4) });

  const tri = h(`<div class="ohm">
    <svg viewBox="0 0 160 140" class="tri">
      <path d="M80 6 L154 134 H6 Z" class="tri-p"/><line x1="40" y1="74" x2="120" y2="74" class="tri-p"/><line x1="80" y1="74" x2="80" y2="134" class="tri-p"/>
      <text data-k="V" x="80" y="58" text-anchor="middle">V</text>
      <text data-k="I" x="54" y="116" text-anchor="middle">I</text>
      <text data-k="R" x="106" y="116" text-anchor="middle">R</text>
    </svg>
    <div><p class="formula" id="f"></p><p class="small muted">Toca una letra del triángulo para despejarla. Tapa la que buscas y
      lo que queda es la fórmula: V arriba → <b>I × R</b>; I → <b>V / R</b>; R → <b>V / I</b>.</p>
      <p class="formula small" id="p"></p></div>
  </div>`);
  let solve = 'I';
  tri.querySelectorAll('text').forEach((t) => (t.onclick = () => { solve = t.dataset.k; draw(); }));

  const reset = h('<button class="ce-btn" hidden>Cambiar bombilla</button>');
  reset.onclick = () => { broken = false; draw(); };

  const draw = () => {
    const P = V * V / R;
    if (P > PMAX) broken = true;
    setBulb(bulb, P / 12, broken);
    burn.setAttribute('opacity', broken ? 1 : 0);
    reset.hidden = !broken;
    needle.setAttribute('transform', `rotate(${-60 + 120 * Math.min(I(), 3) / 3} 0 20)`);
    dots.style.opacity = I() > 0 ? 1 : 0.3;
    tri.querySelectorAll('text').forEach((t) => t.classList.toggle('on', t.dataset.k === solve));
    const i = V / R;
    const f = {
      I: `I = V / R = ${num(V, 1)} V / ${num(R, 0)} Ω = <b>${num(i)} A</b>`,
      V: `V = I × R = ${num(i)} A × ${num(R, 0)} Ω = <b>${num(V, 1)} V</b>`,
      R: `R = V / I = ${num(V, 1)} V / ${num(i)} A = <b>${num(R, 0)} Ω</b>`,
    }[solve];
    tri.querySelector('#f').innerHTML = broken ? `${f}<br><span class="warn">…pero la bombilla está fundida: circuito abierto, I = 0 A.</span>` : f;
    tri.querySelector('#p').innerHTML = `Potencia: P = V × I = <b>${num(V * i, 1)} W</b> · la bombilla aguanta hasta ${PMAX} W`;
  };

  const ctr = h('<div class="controls"></div>');
  ctr.append(
    slider({ label: '<b>Tensión</b> de la fuente', min: 0, max: 24, step: 0.5, value: V, unit: 'V', fmt: (v) => num(v, 1), onInput: (v) => { V = v; draw(); } }),
    slider({ label: '<b>Resistencia</b> de la carga', min: 4, max: 100, value: R, unit: 'Ω', onInput: (v) => { R = v; draw(); } }),
    reset,
  );
  el.append(ctr, tri);

  el.append(quiz({
    q: 'Con la misma resistencia, <b>duplicas la tensión</b>. ¿Qué le pasa a la intensidad?',
    options: ['Se duplica', 'Se reduce a la mitad', 'Se multiplica por cuatro'],
    correct: 0,
    why: 'I = V / R: si V se duplica, I también. (La potencia, en cambio, se multiplica por cuatro: por eso se funden las bombillas).',
    onOk: done,
  }));
}

/* ---------- 3 · Serie y paralelo ---------- */
function seriePar(el, { done }) {
  el.append(h(`<p class="lead">Dos bombillas iguales (12 V · 6 W) y una pila de 12 V. ¿Las ponemos una detrás de otra
    (<b>serie</b>) o cada una con su propio camino (<b>paralelo</b>)? Toca una bombilla para desenroscarla.</p>`));
  const seg = h(`<div class="ce-seg"><button data-m="s" class="ce-on">Serie</button><button data-m="p">Paralelo</button></div>`);
  const wrap = h('<div></div>');
  const out = h('<div class="readout three"></div>');
  el.append(seg, wrap, out);

  const RB = 24, V = 12;
  let mode = 's';
  const present = { a: true, b: true };

  const build = () => {
    const ser = mode === 's';
    const svg = h(`
    <svg class="sim" viewBox="0 0 640 300">
      <defs>${HALO_DEF}</defs>
      ${ser
        ? '<path id="pa" d="M120 240 V60 H520 V240 Z" class="wireline"/>'
        : `<path id="pa" d="M120 240 V60 H520 V240 Z" class="wireline"/>
           <path id="pb" d="M120 240 V60 H360 V240 Z" class="wireline"/>`}
      ${battery(120, 150, 'Pila 12 V')}
      <g class="slot" data-k="a" transform="translate(${ser ? 260 : 520} ${ser ? 60 : 150})"><rect x="-30" y="-36" width="60" height="78" class="mask"/>${bulbSVG('ba')}<text y="62" class="lab small" text-anchor="middle">A</text></g>
      <g class="slot" data-k="b" transform="translate(${ser ? 420 : 360} ${ser ? 60 : 150})"><rect x="-30" y="-36" width="60" height="78" class="mask"/>${bulbSVG('bb')}<text y="62" class="lab small" text-anchor="middle">B</text></g>
    </svg>`);
    wrap.replaceChildren(svg);

    const calc = () => {
      if (ser) {
        const closed = present.a && present.b;
        const i = closed ? V / (2 * RB) : 0;
        return { ia: i, ib: i, it: i };
      }
      const ia = present.a ? V / RB : 0, ib = present.b ? V / RB : 0;
      return { ia, ib, it: ia + ib };
    };
    const dA = flowDots(svg.querySelector('#pa'), { n: 30, r: 3, cls: 'dot', speed: () => 120 * calc().ia });
    const dB = ser ? null : flowDots(svg.querySelector('#pb'), { n: 22, r: 3, cls: 'dot', speed: () => 120 * calc().ib });

    const draw = () => {
      const c = calc();
      for (const k of ['a', 'b']) {
        const g = svg.querySelector(`.slot[data-k="${k}"]`);
        g.classList.toggle('out', !present[k]);
        setBulb(g.querySelector('.bulb'), (c[`i${k}`] ** 2 * RB) / 6);
      }
      dA.style.opacity = c.ia > 0 ? 1 : 0.3;
      if (dB) dB.style.opacity = c.ib > 0 ? 1 : 0.3;
      const pw = (i) => `${num(i * i * RB, 1)} W`;
      out.innerHTML = `
        <div><small>Bombilla A</small><b>${pw(c.ia)}</b><span>${num(c.ia)} A</span></div>
        <div><small>Bombilla B</small><b>${pw(c.ib)}</b><span>${num(c.ib)} A</span></div>
        <div><small>Total desde la pila</small><b>${num(c.it)} A</b><span>${num(V * c.it, 1)} W</span></div>`;
    };
    svg.querySelectorAll('.slot').forEach((g) => (g.onclick = () => { present[g.dataset.k] = !present[g.dataset.k]; draw(); }));
    draw();
  };
  seg.querySelectorAll('button').forEach((b) => (b.onclick = () => {
    seg.querySelectorAll('button').forEach((x) => x.classList.toggle('ce-on', x === b));
    mode = b.dataset.m; build();
  }));
  build();

  el.append(h(`<div class="note"><ul>
    <li><b>Serie:</b> las bombillas se reparten los 12 V (6 V cada una) → lucen a <b>una cuarta parte</b> de su potencia.
      Y si una se funde, se apagan <b>todas</b> (como las guirnaldas de Navidad antiguas).</li>
    <li><b>Paralelo:</b> cada bombilla recibe los 12 V completos → lucen al 100 %. Si quitas una, la otra sigue.
      Pero la pila tiene que dar <b>más corriente</b> en total.</li>
  </ul></div>`));

  el.append(quiz({
    q: 'Los enchufes de tu casa, ¿cómo están conectados entre sí?',
    options: ['En serie', 'En paralelo'],
    correct: 1,
    why: 'En paralelo: todos reciben 230 V y puedes desenchufar uno sin apagar los demás. Eso sí, las corrientes se suman… y de eso se encarga el magnetotérmico (N3).',
    onOk: done,
  }));
}

export default {
  id: 'n1', num: 1, title: 'El circuito',
  blurb: 'Circuito abierto y cerrado, la Ley de Ohm con tus manos, y serie contra paralelo.',
  steps: [
    { id: 'circuito', title: 'Abierto y cerrado', render: circuito },
    { id: 'ohm', title: 'Ley de Ohm', render: ohm },
    { id: 'serie-paralelo', title: 'Serie y paralelo', render: seriePar },
  ],
};
