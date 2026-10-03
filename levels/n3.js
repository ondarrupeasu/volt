/* N3 · Protecciones: fusible, magnetotérmico (térmica + magnética) y diferencial (fuga a tierra). */
import { h, loop, flowDots, num, quiz, toggle } from '../ui.js';
import { MCB, RCD, Fuse } from './breakers.js';

const V = 230, IN = 10; // 10 A como los K60N del cuadro del control

const APARATOS = [
  { id: 'led', name: 'Lámpara LED', w: 10 },
  { id: 'pc', name: 'Portátil', w: 65 },
  { id: 'f1', name: 'Fresnel 1000 W', w: 1000 },
  { id: 'f2', name: 'Otro fresnel 1000 W', w: 1000 },
  { id: 'herv', name: 'Hervidor', w: 2000 },
  { id: 'sec', name: 'Secador', w: 1800 },
];

/* Simulador de «regleta»: aparatos enchufados a una línea protegida (o no) a 10 A.
   kind: 'none' | 'fuse' | 'mcb'. Modelo térmico de 1er orden: h' = ((I/In)² − h) / τ. Dispara con h > 1,6
   (≈ 1,27·In sostenido); el disparo magnético del MCB es instantáneo por encima de 5·In (curva C). */
function regleta(el, { kinds, onTrip }) {
  let kind = kinds[0];
  const on = new Set(['led', 'pc']);
  let heat = 0, cable = 0, tripped = false, burnt = false, short = false, reason = '';

  const board = h(`<div class="board">
    <div class="dev"><div class="devbox"></div><small class="devlab"></small></div>
    <div class="line"><div class="cablebar"><i></i></div><small class="cablelab">cable de la línea</small></div>
    <div class="strip"><b>Regleta</b><div class="chips"></div>
      <button class="ce-btn short">⚡ Provocar cortocircuito</button></div>
  </div>`);
  const devbox = board.querySelector('.devbox'), devlab = board.querySelector('.devlab');
  const bar = board.querySelector('.cablebar i'), cablelab = board.querySelector('.cablelab');
  const chips = board.querySelector('.chips');
  APARATOS.forEach((a) => {
    const c = h(`<button class="ce-chip ${on.has(a.id) ? 'ce-on' : ''}">${a.name} <small>${a.w} W</small></button>`);
    c.onclick = () => { on.has(a.id) ? on.delete(a.id) : on.add(a.id); c.classList.toggle('ce-on'); };
    chips.append(c);
  });
  board.querySelector('.short').onclick = () => { if (!tripped && !burnt) short = true; };

  const out = h('<div class="readout four"></div>');
  const heatRow = h(`<div class="heat"><span>Calentamiento de la protección</span><div class="hbar"><i></i><em></em></div></div>`);
  const state = h('<p class="state"></p>');
  const fix = h('<button class="ce-btn" hidden></button>');

  let seg = null;
  if (kinds.length > 1) {
    seg = h(`<div class="ce-seg">${kinds.map((k) => `<button data-k="${k}" class="${k === kind ? 'ce-on' : ''}">${
      { none: 'Sin protección', fuse: 'Con fusible 10 A', mcb: 'Con magnetotérmico 10 A' }[k]}</button>`).join('')}</div>`);
    seg.querySelectorAll('button').forEach((b) => (b.onclick = () => {
      seg.querySelectorAll('button').forEach((x) => x.classList.toggle('ce-on', x === b));
      kind = b.dataset.k; tripped = burnt = short = false; heat = cable = 0; reason = ''; paintDev();
    }));
  }

  const paintDev = () => {
    devbox.innerHTML = kind === 'fuse' ? Fuse({ melted: tripped }) : kind === 'mcb' ? MCB({ on: !tripped }) : '<div class="nodev">sin<br>protección</div>';
    devlab.textContent = { none: '', fuse: 'fusible 10 A', mcb: 'magnetotérmico C10 · toca la maneta para rearmar' }[kind];
    heatRow.hidden = kind === 'none';
    fix.hidden = !(tripped && kind === 'fuse') && !burnt;
    fix.textContent = burnt ? 'Reparar la instalación' : 'Cambiar el fusible';
  };
  devbox.onclick = () => { if (kind === 'mcb' && tripped) { tripped = false; reason = ''; paintDev(); } };
  fix.onclick = () => { tripped = burnt = false; heat = cable = 0; reason = ''; paintDev(); };
  paintDev();

  const trip = (why) => { tripped = true; short = false; reason = why; paintDev(); onTrip?.(kind, why); };

  loop(board, (dt) => {
    const P = [...on].reduce((s, id) => s + APARATOS.find((a) => a.id === id).w, 0);
    const live = !tripped && !burnt;
    const I = live ? (short ? 1000 : P / V) : 0;
    const r = I / IN;
    cable += ((r * r) - cable) / 3 * dt;
    if (kind !== 'none') heat += ((r * r) - heat) / (kind === 'fuse' ? 1.5 : 4) * dt;

    if (live) {
      if (kind === 'mcb' && r > 5) trip('magnética');
      else if (kind === 'fuse' && r > 5) trip('cortocircuito');
      else if (kind !== 'none' && heat > 1.6) trip('térmica');
      else if (kind === 'none' && (short || cable > 2.5)) { burnt = true; short = false; cable = 6; paintDev(); onTrip?.('none'); }
    }

    const t = Math.min(cable / 2.5, 1);
    bar.style.width = `${Math.min(100, r * 50)}%`;
    bar.style.background = `rgb(${200 + 55 * t},${140 - 100 * t},${74 - 50 * t})`;
    bar.parentElement.classList.toggle('hot', t > 0.6);
    cablelab.textContent = burnt ? '🔥 el aislante se ha derretido' : t > 0.6 ? 'el cable se está calentando…' : 'cable de la línea';
    heatRow.querySelector('i').style.width = `${Math.min(100, (heat / 1.6) * 100)}%`;

    out.innerHTML = `
      <div><small>Potencia enchufada</small><b>P</b><span>${num(P, 0)} W</span></div>
      <div><small>Corriente por el cable</small><b>I = P / 230 V</b><span>${short && live ? '≈ 1000' : num(I, 1)} A</span></div>
      <div><small>Límite de la línea</small><b>In</b><span>${IN} A</span></div>
      <div><small>Carga</small><b>I / In</b><span>${num(r * 100, 0)} %</span></div>`;

    state.innerHTML = burnt
      ? '<span class="ce-badge ce-b-live">PELIGRO</span> Sin protección el cable se calienta hasta quemarse: así empiezan muchos incendios.'
      : tripped
        ? { térmica: '<span class="ce-badge ce-b-warn">DISPARO TÉRMICO</span> Sobrecarga: demasiados aparatos a la vez. Quita alguno antes de rearmar.',
            magnética: '<span class="ce-badge ce-b-warn">DISPARO MAGNÉTICO</span> ¡Cortocircuito! La bobina ha cortado en milésimas de segundo.',
            cortocircuito: '<span class="ce-badge ce-b-warn">FUSIBLE FUNDIDO</span> Cortocircuito: el hilo se ha fundido al instante.' }[reason]
        : r > 1 ? '<span class="ce-badge ce-b-warn">SOBRECARGA</span> Pasa más corriente de la que aguanta la línea…'
        : '<span class="ce-badge ce-b-ok">OK</span> La línea trabaja dentro de su límite.';
  });

  if (seg) el.append(seg);
  el.append(board, heatRow, fix, state, out);
}

/* ---------- 1 · Sobrecarga y fusible ---------- */
function fusible(el, { done }) {
  el.append(h(`<p class="lead">Cada cable aguanta una corriente máxima. Si enchufas demasiado, pasa más corriente de la cuenta,
    el cable se <b>calienta</b> y puede arder. Prueba primero <b>sin protección</b> y luego con un <b>fusible</b>.</p>`));
  regleta(el, { kinds: ['none', 'fuse'] });
  el.append(h(`<div class="note">El <b>fusible</b> es el «eslabón débil» a propósito: un hilo fino que se funde antes que el cable.
    Funciona, pero hay que <b>cambiarlo</b> cada vez. Aún los verás en enchufes de aparatos, dimmers y equipos de luz
    (los <b>Datapak</b> del control llevan un fusible de 10 A por canal).</div>`));
  el.append(quiz({
    q: 'Línea de 10 A a 230 V. ¿Cuántos fresnel de 1000 W puedes enchufar sin que salte?',
    options: ['1', '2', '3', '5'],
    correct: 1,
    why: '10 A × 230 V = 2300 W. Dos de 1000 W caben (≈ 8,7 A); con tres ya son 13 A.',
    onOk: done,
  }));
}

/* ---------- 2 · Magnetotérmico ---------- */
function magneto(el, { done }) {
  el.append(h(`<p class="lead">El <b>magnetotérmico</b> sustituye al fusible: corta solo y se <b>rearma</b> subiendo la maneta.
    Dentro lleva dos protecciones distintas. Enchufa aparatos para una <b>sobrecarga</b> y provoca un <b>cortocircuito</b>.</p>`));
  regleta(el, { kinds: ['mcb'] });
  el.append(h(`<div class="note"><ul>
    <li><b>Parte térmica</b> (una lámina bimetálica): se curva al calentarse. Es <b>lenta</b> a propósito: aguanta picos
      cortos pero corta si la sobrecarga dura. Por eso tarda unos segundos.</li>
    <li><b>Parte magnética</b> (una bobina): ante un <b>cortocircuito</b> (fase y neutro se tocan, la corriente se dispara a
      cientos de amperios) corta en milisegundos.</li>
    <li>El rótulo <b>C10</b>: «10» son los amperios; «C» la curva (la magnética salta entre 5 y 10 veces In).
      Los 24 magnetotérmicos del cuadro del control son <b>K60N de 10 A</b>.</li>
  </ul></div>`));
  el.append(quiz({
    q: 'Un magnetotérmico de 10 A, ¿te protege si tocas un cable de fase?',
    options: ['Sí, salta enseguida', 'No: por tu cuerpo pasan miliamperios, muy lejos de 10 A'],
    correct: 1,
    why: 'Protege la instalación (cables y aparatos), no a las personas. Para eso está el diferencial: siguiente paso.',
    onOk: done,
  }));
}

/* ---------- 3 · Diferencial ---------- */
function diferencial(el, { done }) {
  el.append(h(`<p class="lead">El <b>diferencial</b> compara la corriente que <b>sale</b> por la fase con la que <b>vuelve</b> por el
    neutro. Si no coinciden, es que una parte se está escapando a tierra… quizá a través de una persona. Si la fuga
    supera <b>30 mA</b>, corta en menos de 30 ms.</p>`));

  let rcdOn = true, installed = true, fault = false, earth = true, touch = false;
  let msg = 'Todo en orden: la lavadora funciona y no hay fuga.', peakBody = 0, tested = false, savedLife = false;

  const wrap = h(`<div class="board rcd-board">
    <div class="dev"><div class="devbox"></div><small class="devlab">toca la maneta para rearmar · «T» = test</small></div>
    <svg class="sim" viewBox="0 0 560 300">
      <defs><pattern id="pe3" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <rect width="12" height="12" fill="#2fa84f"/><rect width="6" height="12" fill="#e8d531"/></pattern></defs>
      <path d="M0 80 H300" stroke="#7b4a2a" stroke-width="6"/><text x="10" y="70" class="lab small">L · fase</text>
      <path d="M0 130 H300" stroke="#2f6fd8" stroke-width="6"/><text x="10" y="150" class="lab small">N · neutro</text>
      <path id="loadL" d="M0 80 H300" fill="none"/><path id="loadN" d="M300 130 H0" fill="none"/>
      <rect x="300" y="50" width="130" height="150" rx="10" class="washer"/>
      <circle cx="365" cy="135" r="40" class="drum"/><circle cx="365" cy="135" r="28" class="drum-in"/>
      <text x="365" y="40" class="lab small" text-anchor="middle">lavadora (carcasa metálica)</text>
      <text id="bolt" x="320" y="78" font-size="22" opacity="0">⚡</text>
      <g id="peline"><path d="M330 200 V268" stroke="url(#pe3)" stroke-width="6"/></g>
      <g id="pecut" opacity="0"><path d="M318 222 L342 246 M342 222 L318 246" stroke="#ff5a4d" stroke-width="3"/></g>
      <path d="M312 270 H348 M318 278 H342 M325 286 H335" stroke="#9aa0ab" stroke-width="2.5"/>
      <text x="352" y="276" class="lab small">tierra</text>
      <path id="leakPE" d="M330 200 V270" fill="none"/>
      <g id="person" transform="translate(500 0)">
        <circle cx="0" cy="120" r="12" class="person"/>
        <path d="M0 132 V200 M0 200 L-14 262 M0 200 L14 262" class="person-l"/>
        <path id="arm" d="M0 150 L28 175" class="person-l"/>
      </g>
      <path d="M440 266 H560" stroke="#9aa0ab" stroke-width="2"/><text x="452" y="286" class="lab small">suelo</text>
      <path id="leakBody" d="M432 150 H500 V200 L500 264" fill="none"/>
    </svg>
  </div>`);
  const devbox = wrap.querySelector('.devbox'), svg = wrap.querySelector('svg');

  const fuga = () => {
    const powered = !installed || rcdOn;
    if (!powered || !fault) return { earthA: 0, bodyA: 0, powered };
    const earthA = earth ? 5 : 0;
    const bodyA = touch ? (earth ? 0.002 : 0.115) : 0;
    return { earthA, bodyA, powered };
  };
  const evaluate = (cause) => {
    const f = fuga();
    if (f.bodyA > peakBody) peakBody = f.bodyA;
    if (installed && rcdOn && f.earthA + f.bodyA > 0.03) {
      rcdOn = false;
      if (cause === 'rearm') msg = '<b>No se deja rearmar:</b> la fuga sigue ahí. Primero hay que arreglar la avería.';
      else if (f.bodyA > 0.03) { msg = '<b>¡Calambrazo de unas milésimas… y corte!</b> El diferencial ha detectado ~115 mA escapando por la persona y ha cortado antes de que su corazón se vea afectado.'; savedLife = true; }
      else msg = '<b>Ha saltado antes de que nadie toque nada:</b> la fuga se iba por el cable de tierra y el diferencial la ha detectado. Así es como debe funcionar.';
      if (savedLife || f.earthA) done();
    } else if (!installed && f.bodyA > 0.03) {
      msg = '<b>⚠️ Sin diferencial nada corta:</b> ~115 mA atraviesan a la persona sin parar. Eso puede provocar una fibrilación del corazón. El magnetotérmico ni se entera (115 mA ≪ 10 A).';
    } else if (cause) {
      msg = !fault ? 'Sin avería: lo que sale por la fase vuelve por el neutro. Diferencia 0 mA.'
        : !f.powered ? 'La instalación está sin corriente.'
        : !earth && !touch ? '<b>Peligro escondido:</b> la carcasa está a 230 V pero, sin tierra, la corriente no tiene por dónde escaparse… hasta que alguien la toque.'
        : earth && !installed ? 'La fuga se va por tierra (varios amperios) y nadie la corta: la carcasa puede quedarse con tensión peligrosa.'
        : msg;
    }
    paint();
  };

  const paint = () => {
    devbox.innerHTML = installed ? RCD({ on: rcdOn }) : '<div class="nodev">sin<br>diferencial</div>';
    devbox.querySelector('.testbtn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!rcdOn) return;
      rcdOn = false; tested = true;
      msg = '<b>TEST:</b> el botón crea una pequeña fuga falsa para comprobar que el diferencial funciona. Hay que pulsarlo de vez en cuando.';
      paint();
    });
    const f = fuga();
    svg.querySelector('#bolt').setAttribute('opacity', fault ? 1 : 0);
    svg.querySelector('#peline').setAttribute('opacity', earth ? 1 : 0.25);
    svg.querySelector('#pecut').setAttribute('opacity', earth ? 0 : 1);
    svg.querySelector('#arm').setAttribute('d', touch ? 'M0 150 L-68 150' : 'M0 150 L20 180');
    dPE.style.opacity = f.earthA ? 1 : 0;
    dBody.style.opacity = f.bodyA > 0.01 ? 1 : 0;
    dL.style.opacity = dN.style.opacity = f.powered ? 1 : 0.2;
    state.innerHTML = msg;
    const load = f.powered ? 2000 / V : 0, leak = f.earthA + f.bodyA;
    out.innerHTML = `
      <div><small>Sale por la fase</small><b>L</b><span>${num(load + leak, 2)} A</span></div>
      <div><small>Vuelve por el neutro</small><b>N</b><span>${num(load, 2)} A</span></div>
      <div><small>Diferencia = fuga</small><b>L − N</b><span>${leak >= 1 ? `${num(leak, 1)} A` : `${num(leak * 1000, 0)} mA`}</span></div>`;
    const pct = (ma) => `${Math.min(100, (Math.log10(Math.max(ma, 0.5)) + 0.3) / 2.6 * 100)}%`;
    scale.querySelector('.mark').style.left = pct(f.bodyA * 1000 || 0.5);
    scale.querySelector('.mark').style.opacity = f.bodyA > 0 ? 1 : 0;
    scale.querySelector('.peak').textContent = peakBody ? `Pico por el cuerpo: ${num(peakBody * 1000, 0)} mA` : '';
  };
  devbox.onclick = () => { if (installed && !rcdOn) { rcdOn = true; evaluate('rearm'); } };

  el.append(wrap);
  const fd = (id, cls, n, sp) => flowDots(svg.querySelector(id), { n, r: 3, cls, speed: () => sp });
  const dL = fd('#loadL', 'dot', 12, 80), dN = fd('#loadN', 'dot', 12, 80);
  const dPE = fd('#leakPE', 'leak', 5, 60), dBody = fd('#leakBody', 'leak', 8, 60);

  const ctr = h('<div class="toggles"></div>');
  ctr.append(
    toggle({ label: '⚡ Avería: la fase toca la carcasa', value: fault, onChange: (v) => { fault = v; evaluate('ui'); } }),
    toggle({ label: 'Cable de tierra conectado', value: earth, onChange: (v) => { earth = v; evaluate('ui'); } }),
    toggle({ label: 'Una persona toca la lavadora', value: touch, onChange: (v) => { touch = v; evaluate('ui'); } }),
    toggle({ label: 'Hay diferencial de 30 mA', value: installed, onChange: (v) => { installed = v; rcdOn = true; evaluate('ui'); } }),
  );
  const state = h('<div class="note cable-info"></div>');
  const out = h('<div class="readout three"></div>');
  const scale = h(`<div class="bodyscale">
    <div class="track"><span class="z" style="left:${(0.3 / 2.6) * 100}%">1 mA<br><small>lo notas</small></span>
      <span class="z" style="left:${(1.3 / 2.6) * 100}%">10 mA<br><small>no puedes soltarte</small></span>
      <span class="z" style="left:${((Math.log10(30) + 0.3) / 2.6) * 100}%">30 mA<br><small>límite del diferencial</small></span>
      <span class="z" style="left:${((Math.log10(100) + 0.3) / 2.6) * 100}%">100 mA<br><small>fibrilación</small></span>
      <i class="mark"></i></div><p class="peak small muted"></p></div>`);
  el.append(ctr, state, out, h('<h3 class="sub">Efectos de la corriente en el cuerpo (a 50 Hz)</h3>'), scale);
  paint();

  el.append(h(`<div class="note"><b>Prueba esto:</b> 1) activa la avería con la tierra conectada → salta solo.
    2) Desconecta la tierra, rearma y haz que la persona toque → salta al tocar. 3) Quita el diferencial y repite…
    En el control, el diferencial es un <b>Merlin Gerin C60N con bloque Vigi de 30 mA</b>: su botón «T» es el test.</div>`));
}

export default {
  id: 'n3', num: 3, title: 'Protecciones',
  blurb: 'Fusible, magnetotérmico y diferencial: qué cortan, por qué, y cómo te salvan la vida.',
  steps: [
    { id: 'fusible', title: 'Sobrecarga y fusible', render: fusible },
    { id: 'magnetotermico', title: 'Magnetotérmico', render: magneto },
    { id: 'diferencial', title: 'Diferencial', render: diferencial },
  ],
};
