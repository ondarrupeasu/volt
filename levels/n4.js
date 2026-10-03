/* N4 · Trifásica e instalación real: tres fases, reparto de cargas y el cuadro del control de tvstudio. */
import { h, loop, num, quiz, toggle } from '../ui.js';
import { board, datapak } from './cuadro.js';

const PH_COL = ['#c07a40', '#f2f2f4', '#8a8f98']; // marrón, negro (pintado claro para que se vea), gris

/* ---------- 1 · Tres fases ---------- */
function fases(el, { done }) {
  el.append(h(`<p class="lead">En una instalación <b>trifásica</b> llegan <b>tres fases</b> (L1, L2, L3), tres alternas iguales pero
    desfasadas un tercio de vuelta (120°). Es como un motor de tres cilindros: siempre hay una empujando.</p>`));
  const A = 60, X0 = 40, X1 = 420, Y = 130, T = 3; // T s por ciclo (cámara lenta: 1 ciclo real = 20 ms)
  const svg = h(`
  <svg class="sim" viewBox="0 0 640 270">
    <line x1="${X0}" x2="${X1}" y1="${Y}" y2="${Y}" class="axis"/><line x1="${X0}" x2="${X0}" y1="20" y2="240" class="axis"/>
    <text x="${X0 - 6}" y="${Y + 4}" class="lab small" text-anchor="end">0</text>
    <g id="waves"></g>
    <path id="diff" fill="none" stroke="#ff5a4d" stroke-width="3" stroke-dasharray="6 5" opacity="0"/>
    <path id="sum" fill="none" stroke="#3fb950" stroke-width="4" opacity="0"/>
    <line id="cur" y1="20" y2="240" class="cursor"/>
    <text x="${X1}" y="${Y + 18}" class="lab small" text-anchor="end">1 ciclo = 20 ms →</text>
    <circle cx="540" cy="${Y}" r="${A + 22}" fill="none" class="axis"/>
    <g id="phasors"></g>
    <text x="540" y="258" class="lab small" text-anchor="middle">fasores (las fases girando)</text>
  </svg>`);
  const ns = 'http://www.w3.org/2000/svg';
  const mk = (tag, attrs, parent) => { const e = document.createElementNS(ns, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); parent.append(e); return e; };
  const waves = svg.querySelector('#waves'), phasors = svg.querySelector('#phasors');
  const v = (k, x01) => Math.sin(2 * Math.PI * x01 - k * 2 * Math.PI / 3);
  const path = (f, amp) => { let d = ''; for (let i = 0; i <= 160; i++) d += `${i ? 'L' : 'M'}${X0 + (X1 - X0) * i / 160} ${Y - amp * f(i / 160)}`; return d; };
  PH_COL.forEach((c, k) => mk('path', { d: path((x) => v(k, x), A), stroke: c, 'stroke-width': 2.6, fill: 'none' }, waves));
  svg.querySelector('#diff').setAttribute('d', path((x) => v(0, x) - v(1, x), A));
  svg.querySelector('#sum').setAttribute('d', path((x) => v(0, x) + v(1, x) + v(2, x), A));
  const arms = PH_COL.map((c, k) => {
    const l = mk('line', { x1: 540, y1: Y, stroke: c, 'stroke-width': 3.5, 'stroke-linecap': 'round' }, phasors);
    const t = mk('text', { class: 'lab small', 'text-anchor': 'middle', fill: c }, phasors); t.textContent = `L${k + 1}`;
    return { l, t };
  });
  const cur = svg.querySelector('#cur');
  loop(svg, (_, t) => {
    const x01 = (t % T) / T, x = X0 + (X1 - X0) * x01;
    cur.setAttribute('x1', x); cur.setAttribute('x2', x);
    arms.forEach(({ l, t: tx }, k) => {
      // la proyección vertical del fasor es el valor instantáneo de la onda
      const a = 2 * Math.PI * x01 - k * 2 * Math.PI / 3;
      const px = 540 + A * Math.cos(a), py = Y - A * Math.sin(a);
      l.setAttribute('x2', px); l.setAttribute('y2', py);
      tx.setAttribute('x', 540 + (A + 14) * Math.cos(a)); tx.setAttribute('y', Y - (A + 14) * Math.sin(a) + 4);
    });
  });
  el.append(svg);

  const legend = h(`<div class="legend">${['L1 · marrón', 'L2 · negro', 'L3 · gris'].map((t, k) =>
    `<span><i style="background:${PH_COL[k]}"></i>${t}</span>`).join('')}<span><i style="background:#2f6fd8"></i>N · azul</span></div>`);
  const tg = h('<div class="toggles"></div>');
  tg.append(
    toggle({ label: 'Ver la tensión <b>entre L1 y L2</b>', onChange: (on) => svg.querySelector('#diff').setAttribute('opacity', on ? 1 : 0) }),
    toggle({ label: 'Sumar las tres fases', onChange: (on) => svg.querySelector('#sum').setAttribute('opacity', on ? 1 : 0) }),
  );
  el.append(legend, tg);
  el.append(h(`<div class="readout three">
    <div><small>Entre una fase y el neutro</small><b>tensión simple</b><span>230 V</span></div>
    <div><small>Entre dos fases</small><b>tensión compuesta</b><span>400 V</span></div>
    <div><small>Relación</small><b>400 = 230 × √3</b><span>× 1,73</span></div></div>`));
  el.append(h(`<div class="note"><ul>
    <li>La línea roja discontinua (L1 − L2) es <b>más alta</b> que cada fase: entre dos fases hay <b>400 V</b>, no 460.
      No se suman sin más porque no van a la vez (están desfasadas).</li>
    <li>La suma de las tres (verde) da <b>cero</b> en todo momento: si las tres fases llevan la misma carga, por el
      <b>neutro no vuelve nada</b>. Lo aprovechamos en el siguiente paso.</li>
    <li>Por qué trifásica: con los mismos cables se transporta mucha más potencia, y los motores giran solos. Los
      cuadros de plató y los dimmers de potencia suelen ser trifásicos.</li></ul></div>`));
  el.append(quiz({
    q: 'Un técnico mide con el polímetro entre dos fases del cuadro. ¿Qué debería leer?',
    options: ['230 V', '400 V', '460 V', '0 V'],
    correct: 1,
    why: '400 V entre fases (230 × √3). Por eso tocar dos fases a la vez es todavía más peligroso.',
    onOk: done,
  }));
}

/* ---------- 2 · Reparto de cargas ---------- */
const FOCOS = [
  ['Fresnel 2 kW', 2000], ['Fresnel 2 kW', 2000],
  ['Fresnel 1 kW', 1000], ['Fresnel 1 kW', 1000], ['Fresnel 1 kW', 1000], ['Fresnel 1 kW', 1000],
  ['Fresnel 650 W', 650], ['Fresnel 650 W', 650], ['Fresnel 650 W', 650], ['Fresnel 650 W', 650],
  ['Recorte 750 W', 750], ['Recorte 750 W', 750],
];
function reparto(el, { done }) {
  const LIM = 40;
  el.append(h(`<p class="lead">Mañana hay grabación y alguien ha enchufado <b>todos los focos a L1</b>. Cada fase aguanta
    <b>${LIM} A</b> (lo marca la protección general C40). Toca cada foco para pasarlo a otra fase hasta que la carga quede
    <b>equilibrada</b>.</p>`));
  const ph = FOCOS.map(() => 0);
  const list = h('<div class="focos"></div>');
  const bars = h(`<div class="phbars">${[0, 1, 2].map((k) => `
    <div class="phb"><span class="phb-l"><i style="background:${PH_COL[k]}"></i>L${k + 1}</span>
      <div class="phb-t"><i></i><em style="left:100%"></em></div><b></b></div>`).join('')}
    <div class="phb neu"><span class="phb-l"><i style="background:#2f6fd8"></i>N</span><div class="phb-t"><i></i></div><b></b></div></div>`);
  const state = h('<p class="state"></p>');

  FOCOS.forEach(([n, w], i) => {
    const b = h(`<button class="foco"><span>${n}</span><small>${num(w / 230, 1)} A</small><b></b></button>`);
    b.onclick = () => { ph[i] = (ph[i] + 1) % 3; draw(); };
    list.append(b);
  });
  const draw = () => {
    const I = [0, 0, 0];
    FOCOS.forEach(([, w], i) => (I[ph[i]] += w / 230));
    [...list.children].forEach((b, i) => {
      b.querySelector('b').textContent = `L${ph[i] + 1}`;
      b.style.setProperty('--pc', PH_COL[ph[i]]);
    });
    // corriente de neutro con cargas resistivas: |I1 + I2·∠−120° + I3·∠120°|
    const In = Math.sqrt(Math.max(0, I[0] ** 2 + I[1] ** 2 + I[2] ** 2 - I[0] * I[1] - I[1] * I[2] - I[0] * I[2]));
    const rows = bars.querySelectorAll('.phb');
    [...I, In].forEach((a, k) => {
      const r = rows[k], over = k < 3 && a > LIM;
      r.querySelector('.phb-t i').style.width = `${Math.min(100, a / 60 * 100)}%`;
      r.querySelector('.phb-t i').style.background = over ? 'var(--ce-accent)' : k < 3 ? PH_COL[k] : '#2f6fd8';
      r.querySelector('b').textContent = `${num(a, 1)} A`;
      r.classList.toggle('over', over);
    });
    bars.querySelectorAll('.phb-t em').forEach((e) => (e.style.left = `${LIM / 60 * 100}%`));
    const max = Math.max(...I), min = Math.min(...I), imb = max ? (max - min) / max : 0;
    if (max > LIM) state.innerHTML = `<span class="ce-badge ce-b-live">SOBRECARGA</span> L${I.indexOf(max) + 1} lleva ${num(max, 1)} A: saltaría la protección. Reparte los focos.`;
    else if (imb > 0.15) state.innerHTML = `<span class="ce-badge ce-b-warn">DESEQUILIBRADO</span> Ninguna fase se pasa, pero por el neutro vuelven ${num(In, 1)} A. Intenta igualar las tres.`;
    else { state.innerHTML = `<span class="ce-badge ce-b-ok">EQUILIBRADO</span> Las tres fases parecidas y por el neutro casi no vuelve nada (${num(In, 1)} A). ¡Listo para grabar!`; done(); }
  };
  el.append(list, bars, state);
  draw();
  el.append(h(`<div class="note">En el control, los focos del decorado van a los <b>Datapak</b> (Pulsar Datapak III): 12 canales de
    10 A repartidos en las tres fases — 4 canales por fase. Sus pilotos <b>ψ1 ψ2 ψ3</b> te dicen si llega cada fase.</div>`));
}

/* ---------- 3 · El cuadro del control ---------- */
function cuadro(el, { done }) {
  el.append(h(`<p class="lead">Este es el <b>cuadro real del control</b> (el mismo que en tvstudio). Llegas por la mañana y está
    <b>todo apagado</b>. Toca cada aparato para saber qué es y subir o bajar su maneta.</p>`));
  const st = { rcd: false, dp: false, dim: false, led: false, dpE0: false, dpE1: false, dpP0: false, dpP1: false };
  for (let r = 0; r < 2; r++) for (let i = 0; i < 12; i++) st[`c${r}_${i}`] = true;

  const mission = h(`<div class="quiz mission"><p class="quiz-q">🎬 <b>Misión:</b> deja listo el plató para grabar con el
    <b>croma</b> y las <b>luces del decorado</b>. Enciende solo lo necesario.</p><ul class="checks"></ul></div>`);
  const stage = h(`<div class="cuadro"><div class="cab">${board()}</div>
    <div class="dps"><figure>${datapak(0)}<figcaption>Datapak 1 · breaker «DATAPAK» · uso por identificar</figcaption></figure>
    <figure>${datapak(1)}<figcaption>Datapak 2 · breaker «Dimmers» · luces del decorado</figcaption></figure></div></div>`);
  const info = h('<div class="note cable-info"><i>Toca un aparato del cuadro o de los Datapak…</i></div>');
  el.append(mission, stage, info);

  const live = (u) => st.rcd && st[u ? 'dim' : 'dp'];
  const goals = [
    ['Diferencial arriba (alimenta todo el cuadro)', () => st.rcd],
    ['LED arriba → focos del croma', () => st.rcd && st.led],
    ['Dimmers arriba → llega trifásica al Datapak 2', () => live(1)],
    ['ELECTRONICS del Datapak 2 encendido', () => live(1) && st.dpE1],
  ];
  const render = () => {
    stage.querySelectorAll('[data-id]').forEach((e) => e.classList.toggle('on', !!st[e.dataset.id]));
    stage.querySelectorAll('.pw-dp').forEach((sv) => sv.classList.toggle('mains', live(+sv.dataset.u)));
    stage.querySelector('[data-id="rcd"] .led')?.setAttribute('fill', st.rcd ? '#191a1f' : '#e5372a');
    // sin diferencial no hay nada: atenuamos todo lo que cuelga de él
    stage.querySelector('.cab').classList.toggle('dead', !st.rcd);
    const ul = mission.querySelector('.checks');
    ul.innerHTML = goals.map(([t, f]) => `<li class="${f() ? 'ok' : ''}">${f() ? '✓' : '○'} ${t}</li>`).join('');
    if (goals.every(([, f]) => f())) {
      ul.insertAdjacentHTML('beforeend', '<li class="ok"><b>¡Plató listo!</b> Y fíjate: el «DATAPAK» puede quedarse abajo — no hace falta encender lo que no se usa.</li>');
      done();
    }
  };
  stage.addEventListener('click', (e) => {
    if (e.target.closest('[data-act="test"]')) {
      if (st.rcd) { st.rcd = false; info.innerHTML = '<b>TEST del Vigi:</b> ha simulado una fuga y el diferencial ha cortado. Se apaga <b>todo el cuadro</b>, porque todo cuelga de él.'; render(); }
      return;
    }
    const m = e.target.closest('[data-id]');
    if (!m) return;
    st[m.dataset.id] = !st[m.dataset.id];
    info.innerHTML = `<b>${m.dataset.name}</b> · ${st[m.dataset.id] ? 'ON' : 'OFF'}<br>${m.dataset.tip || ''}`;
    render();
  });
  render();

  el.append(h(`<div class="note"><b>Cómo se lee este cuadro</b> (de arriba abajo, como un unifilar):
    <ul><li><b>Diferencial C60N 4P 40 A + Vigi 30 mA</b>: protege a las personas en todo el cuadro. Es 4P porque corta las
      tres fases y el neutro a la vez.</li>
    <li><b>DATAPAK (Hager 4P)</b> y <b>Dimmers (Legrand 4P)</b>: alimentación trifásica de cada Datapak.</li>
    <li><b>LED (CHINT 1P+N 16 A)</b>: una sola fase para los focos LED, que se regulan por DMX y no necesitan dimmer.</li>
    <li><b>24 × K60N 2P 10 A</b>: circuitos de fase + neutro, cada uno con su magnetotérmico. Hipótesis (sin comprobar
      en la pared): son las salidas de los dos Datapak, 2 × 12 canales de 10 A.</li></ul>
    <p class="small muted">El reparto de este cuadro es una <b>hipótesis de trabajo</b> que aún hay que verificar bajando cada
      breaker y mirando qué pilotos ψ se apagan.</p>
    Puedes ver este mismo cuadro conectado a la mesa de luces en <a href="https://tvstudio.cinemafilmak.com" target="_blank" rel="noopener">tvstudio</a>.</div>`));

  el.append(quiz({
    q: 'Alguien pulsa la «T» del Vigi en mitad de una grabación. ¿Qué se apaga?',
    options: ['Solo los LED', 'Solo los Datapak', 'Todo el cuadro'],
    correct: 2,
    why: 'Todo lo que cuelga del diferencial: el cuadro entero. Por eso el test se hace con el plató parado.',
  }));
}

export default {
  id: 'n4', num: 4, title: 'Trifásica e instalación real',
  blurb: 'Tres fases y 400 V, repartir los focos entre fases… y el cuadro real del control.',
  steps: [
    { id: 'fases', title: 'Tres fases', render: fases },
    { id: 'reparto', title: 'Reparto de cargas', render: reparto },
    { id: 'cuadro', title: 'El cuadro del control', render: cuadro },
  ],
};
