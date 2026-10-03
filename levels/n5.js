/* N5 · Electricidad en el estudio: el «por qué» eléctrico de imagen y sonido.
   Frontera acordada con AVHandbook (ver BRIEF.md): aquí la física (V, Ω, Z, CC); allí el uso, el monitorado y la cámara. */
import { h, slider, loop, num, quiz, toggle } from '../ui.js';

const AVH = 'https://avhandbook.cinemafilmak.com';
const avh = (slug, cat, mod, why) => `<div class="note avh">📘 <b>En AVHandbook:</b> ${why} → <a href="${AVH}/#/${slug}" target="_blank" rel="noopener">${cat} › ${mod}</a></div>`;
const db = (r) => 20 * Math.log10(r);
const seg = (opts, on, cb) => {
  const el = h(`<div class="ce-seg">${opts.map(([k, t]) => `<button data-k="${k}" class="${k === on ? 'ce-on' : ''}">${t}</button>`).join('')}</div>`);
  el.querySelectorAll('button').forEach((b) => (b.onclick = () => {
    el.querySelectorAll('button').forEach((x) => x.classList.toggle('ce-on', x === b));
    cb(b.dataset.k);
  }));
  return el;
};
const fmtZ = (z) => (z >= 1e6 ? `${num(z / 1e6, 1)} MΩ` : z >= 1000 ? `${num(z / 1000, 1)} kΩ` : `${num(z, 0)} Ω`);
const fmtV = (v) => (v < 1 ? `${num(v * 1000, v < 0.01 ? 2 : 0)} mV` : `${num(v, 2)} V`);

/* ---------- 1 · Impedancia: de baja a alta ---------- */
function impedancia(el, { done }) {
  el.append(h(`<p class="lead">La <b>impedancia (Z)</b> es la «resistencia» de un equipo a una señal <b>alterna</b> (y el audio y el vídeo lo
    son). Se mide en ohmios, como la resistencia. Toda salida tiene una Z de salida y toda entrada una Z de entrada, y entre las
    dos se <b>reparten</b> la señal, igual que dos resistencias en serie.</p>`));
  const SRC = { mic: ['Micro dinámico', 150], gtr: ['Guitarra eléctrica pasiva', 10000], line: ['Salida de línea (mesa)', 100] };
  let src = 'mic', zin = 1500;
  const top = seg(Object.entries(SRC).map(([k, [t]]) => [k, t]), src, (k) => { src = k; draw(); });
  const svg = h(`
  <svg class="sim" viewBox="0 0 640 200">
    <rect x="30" y="40" width="190" height="120" rx="12" class="meter"/>
    <text id="sname" x="125" y="30" class="lab small" text-anchor="middle"></text>
    <circle cx="80" cy="100" r="24" class="axis" fill="none"/><path d="M66 100 q7 -14 14 0 t14 0" class="sig"/>
    <rect x="130" y="88" width="56" height="24" rx="3" class="res"/><text id="zs" x="158" y="128" class="lab small" text-anchor="middle"></text>
    <path d="M104 100 H130 M186 100 H420" class="wire2"/>
    <rect x="420" y="40" width="190" height="120" rx="12" class="meter"/>
    <text x="515" y="30" class="lab small" text-anchor="middle">entrada del equipo</text>
    <rect x="460" y="88" width="56" height="24" rx="3" class="res"/><text id="zi" x="488" y="128" class="lab small" text-anchor="middle"></text>
    <rect x="560" y="60" width="18" height="80" rx="3" class="vu-bg"/><rect id="vu" x="560" width="18" rx="3" class="vu"/>
    <text x="300" y="90" class="lab small" text-anchor="middle">cable</text>
  </svg>`);
  const out = h('<div class="readout three"></div>');
  const sl = slider({ label: '<b>Impedancia de entrada</b> del equipo que recibe', min: 0, max: 100, value: 50, fmt: (v) => fmtZ(50 * 10 ** (v / 100 * 4.3)),
    onInput: (v) => { zin = 50 * 10 ** (v / 100 * 4.3); draw(); } });
  const draw = () => {
    const zs = SRC[src][1], k = zin / (zs + zin);
    svg.querySelector('#sname').textContent = SRC[src][0];
    svg.querySelector('#zs').textContent = `Z salida ${fmtZ(zs)}`;
    svg.querySelector('#zi').textContent = `Z entrada ${fmtZ(zin)}`;
    const vu = svg.querySelector('#vu'); vu.setAttribute('height', 80 * k); vu.setAttribute('y', 140 - 80 * k);
    const ratio = zin / zs;
    out.innerHTML = `
      <div><small>Señal que llega</small><b>Zin / (Zs + Zin)</b><span>${num(k * 100, 0)} %</span></div>
      <div><small>Pérdida</small><b>en decibelios</b><span>${num(db(k), 1)} dB</span></div>
      <div><small>Relación entrada / salida</small><b>${ratio >= 10 ? '✓ al menos ×10' : '✗ menos de ×10'}</b><span>× ${num(ratio, ratio < 10 ? 1 : 0)}</span></div>`;
  };
  el.append(top, svg, h('<div class="controls"></div>'));
  el.querySelector('.controls').append(sl);
  el.append(out);
  draw();
  el.append(h(`<div class="note"><b>Regla de oro: de baja a alta («bridging»)</b>. La entrada debe tener al menos <b>10 veces</b> más
    impedancia que la salida que recibe; así llega casi toda la señal (pérdida &lt; 1 dB).
    <ul><li>Micro dinámico (~150 Ω) → entrada de micro (~1,5–2 kΩ): perfecto.</li>
    <li>Guitarra pasiva (~10 kΩ y más) → entrada de micro: llega muy poca señal y suena apagada. Necesita una entrada
      <b>Hi-Z / instrumento</b> (~1 MΩ) o una <b>caja DI</b>, que hace justo esta conversión.</li></ul>
    ¿Por qué «impedancia» y no «resistencia»? Porque bobinas y condensadores frenan distinto según la frecuencia: un cable muy
    largo, por ejemplo, se come antes los agudos que los graves.</div>`));
  el.append(quiz({
    q: 'Conectas una guitarra pasiva directamente a la entrada de micro de la mesa. ¿Qué pasará?',
    options: ['Nada, va perfecto', 'Llega poca señal y sin brillo', 'Se rompe la guitarra'],
    correct: 1,
    why: 'Su impedancia de salida es alta para esa entrada: se pierde señal y agudos. Solución: entrada Hi-Z o caja DI.',
    onOk: done,
  }));
}

/* ---------- 2 · Altavoces y amplificador ---------- */
function altavoces(el, { done }) {
  el.append(h(`<p class="lead">Con los altavoces pasa al revés: el amplificador quiere ver una impedancia <b>no demasiado baja</b>.
    Este ampli da 20 V y admite como mínimo <b>4 Ω</b>. Conecta altavoces de <b>8 Ω</b> en serie o en paralelo (¿te suena del N1?).</p>`));
  const VA = 20, ZMIN = 4;
  let n = 1, mode = 'p';
  const s = seg([['s', 'Serie'], ['p', 'Paralelo']], mode, (k) => { mode = k; draw(); });
  const sl = slider({ label: '<b>Número de altavoces</b> de 8 Ω', min: 1, max: 4, value: 1, onInput: (v) => { n = v; draw(); } });
  const spk = h('<div class="spk-row"></div>');
  const out = h('<div class="readout four"></div>');
  const state = h('<p class="state"></p>');
  const draw = () => {
    const Z = mode === 's' ? 8 * n : 8 / n, I = VA / Z, P = VA * VA / Z, each = P / n;
    spk.innerHTML = `<div class="amp ${Z < ZMIN ? 'hot' : ''}">AMPLI<br><small>20 V · mín. 4 Ω</small></div>` +
      Array.from({ length: n }, () => `<div class="spk" style="--g:${Math.min(1, each / 50)}"><i></i><small>${num(each, 0)} W</small></div>`).join('');
    out.innerHTML = `
      <div><small>Impedancia total</small><b>${mode === 's' ? '8 × n' : '8 / n'}</b><span>${num(Z, 1)} Ω</span></div>
      <div><small>Corriente del ampli</small><b>I = V / Z</b><span>${num(I, 1)} A</span></div>
      <div><small>Potencia total</small><b>P = V² / Z</b><span>${num(P, 0)} W</span></div>
      <div><small>Cada altavoz</small><b>P / n</b><span>${num(each, 1)} W</span></div>`;
    state.innerHTML = Z < ZMIN
      ? `<span class="ce-badge ce-b-live">PELIGRO</span> ${num(Z, 1)} Ω es menos de lo que admite: el ampli se calienta, entra en protección o se quema.`
      : mode === 's' && n > 1
        ? '<span class="ce-badge ce-b-warn">POCO VOLUMEN</span> En serie la impedancia sube y cada altavoz recibe mucha menos potencia.'
        : '<span class="ce-badge ce-b-ok">OK</span> El ampli trabaja dentro de su margen.';
    if (mode === 'p' && n === 2) done();
  };
  el.append(s, h('<div class="controls"></div>'), spk, state, out);
  el.querySelector('.controls').append(sl);
  draw();
  el.append(h(`<div class="note">Mira el <b>dorso del ampli</b>: pone «4–16 Ω» o «min. 4 Ω». Dos cajas de 8 Ω en paralelo = 4 Ω (justo);
    tres ya serían 2,7 Ω. Por eso en sonorización se calcula la impedancia de cada línea antes de colgar más cajas.
    <small class="muted">(Para completar el paso, deja dos altavoces en paralelo.)</small></div>`));
}

/* ---------- 3 · Líneas de 75 Ω y terminación ---------- */
function lineas(el, { done }) {
  el.append(h(`<p class="lead">En señales muy rápidas (vídeo SDI, DMX, red), el cable deja de ser «un simple hilo»: tiene su propia
    <b>impedancia característica</b> (75 Ω el coaxial de vídeo, 120 Ω el de DMX). Si al final la línea no termina con esa misma
    impedancia, la señal <b>rebota</b> y vuelve hacia atrás, como una ola contra un muro.</p>`));
  let z0 = 75, zl = Infinity, seen = new Set();
  const LOADS = [['open', 'Sin terminar (abierto)', Infinity], ['short', 'Cortocircuito', 0], ['50', '50 Ω', 50], ['75', '75 Ω', 75], ['120', '120 Ω', 120]];
  const segZ = seg([['75', 'Coaxial de vídeo · 75 Ω'], ['120', 'Cable DMX · 120 Ω']], '75', (k) => { z0 = +k; draw(); });
  const segL = seg(LOADS.map(([k, t]) => [k, t]), 'open', (k) => { zl = LOADS.find((l) => l[0] === k)[2]; seen.add(`${z0}:${k}`); draw(); });
  const svg = h(`
  <svg class="sim" viewBox="0 0 640 200">
    <rect x="30" y="70" width="40" height="60" rx="6" class="meter"/><text x="50" y="150" class="lab small" text-anchor="middle">emisor</text>
    <line x1="70" y1="100" x2="560" y2="100" class="axis"/>
    <rect x="70" y="92" width="490" height="16" rx="8" class="coax"/>
    <rect x="560" y="70" width="44" height="60" rx="6" class="term"/><text id="tl" x="582" y="150" class="lab small" text-anchor="middle"></text>
    <path id="pulse" class="pulse" fill="none"/>
    <text id="g" x="320" y="185" class="lab small" text-anchor="middle"></text>
  </svg>`);
  const G = () => (zl === Infinity ? 1 : (zl - z0) / (zl + z0));
  const draw = () => {
    const g = G();
    svg.querySelector('#tl').textContent = zl === Infinity ? 'abierto' : zl === 0 ? 'corto' : `${zl} Ω`;
    svg.querySelector('#g').textContent = `Coeficiente de reflexión Γ = (Zcarga − Z0) / (Zcarga + Z0) = ${num(g, 2)} → rebota el ${num(Math.abs(g) * 100, 0)} %`;
    if ((z0 === 75 && zl === 75) || (z0 === 120 && zl === 120)) seen.add(`ok${z0}`);
    if (seen.has('ok75') && seen.has('ok120')) done();
  };
  const T = 2.4, L0 = 70, L1 = 560;
  const gs = (x, c) => Math.exp(-(((x - c) / 14) ** 2));
  loop(svg, (_, t) => {
    const p = (t % T) / T, g = G();
    const inc = p < 0.5 ? L0 + (L1 - L0) * (p / 0.5) : null;
    const ref = p >= 0.5 ? L1 - (L1 - L0) * ((p - 0.5) / 0.5) : null;
    let d = '';
    for (let x = L0; x <= L1; x += 3) {
      const y = 100 - 55 * ((inc ? gs(x, inc) : 0) + (ref ? g * gs(x, ref) : 0));
      d += `${d ? 'L' : 'M'}${x} ${y}`;
    }
    svg.querySelector('#pulse').setAttribute('d', d);
  });
  el.append(segZ, segL, svg);
  draw();
  el.append(h(`<div class="note"><ul>
    <li><b>Igual impedancia = cero rebote</b>: toda la energía se queda en la carga. Prueba 75 Ω con el coaxial y 120 Ω con DMX.</li>
    <li>Abierto: rebota entera y del mismo signo. Cortocircuito: rebota entera pero <b>invertida</b>.</li>
    <li>En vídeo, el rebote se suma a la señal: imagen con «fantasmas» o un SDI que da errores o se corta.</li>
    <li>En DMX, el último foco de la cadena lleva un <b>terminador de 120 Ω</b>; sin él, los focos pueden hacer cosas raras.</li>
    <li>Con audio analógico no pasa: sus ondas miden kilómetros y los cables son cortos en comparación.</li></ul></div>`));
  el.append(h(avh('signals', 'Signals & Connectivity', 'SDI, BNC, DMX', 'qué cable y conector lleva cada señal, distancias y cómo se monta')));
}

/* ---------- 4 · Niveles: los voltios del audio ---------- */
function niveles(el, { done }) {
  el.append(h(`<p class="lead">Un nivel de audio analógico es, al final, una <b>tensión alterna</b>. Como va de milivoltios a decenas de
    voltios, se mide en <b>decibelios</b> respecto a una referencia: <b>0 dBu = 0,775 V</b> y <b>0 dBV = 1 V</b>.</p>`));
  const MARKS = [[-50, 'micro'], [-7.8, 'línea doméstica −10 dBV'], [4, 'línea profesional +4 dBu'], [30, 'altavoz']];
  const lo = -60, hi = 36, pct = (d) => ((d - lo) / (hi - lo)) * 100;
  const bar = h(`<div class="lvl-bar"><div class="lvl-t"><i></i>${MARKS.map(([d, t], i) =>
    `<span style="left:${pct(d)}%;top:${i % 2 ? 36 : 18}px"><b>${t}</b></span>`).join('')}</div></div>`);
  const out = h('<div class="readout three"></div>');
  const draw = (d) => {
    bar.querySelector('i').style.left = `${pct(d)}%`;
    const v = 0.775 * 10 ** (d / 20);
    out.innerHTML = `
      <div><small>En dBu</small><b>ref. 0,775 V</b><span>${num(d, 1)} dBu</span></div>
      <div><small>En dBV</small><b>ref. 1 V</b><span>${num(d - 2.21, 1)} dBV</span></div>
      <div><small>Tensión (eficaz)</small><b>V = 0,775 × 10^(dBu/20)</b><span>${fmtV(v)}</span></div>`;
  };
  const sl = slider({ label: '<b>Nivel</b> de la señal', min: lo, max: hi, step: 0.5, value: 4, unit: 'dBu', fmt: (v) => num(v, 1), onInput: draw });
  el.append(h('<div class="controls"></div>'), bar, out);
  el.querySelector('.controls').append(sl);
  el.append(h(`<div class="table-wrap"><table class="mag">
    <thead><tr><th>Señal</th><th>Nivel típico</th><th>Tensión</th></tr></thead><tbody>
    <tr><td>Micrófono</td><td>−60 a −40 dBu</td><td>0,8 – 8 mV</td></tr>
    <tr><td>Línea doméstica («consumer»)</td><td>−10 dBV</td><td>0,316 V</td></tr>
    <tr><td>Línea profesional</td><td>+4 dBu</td><td>1,23 V</td></tr>
    <tr><td>Altavoz (50 W en 8 Ω)</td><td>≈ +28 dBu</td><td>20 V</td></tr></tbody></table></div>`));
  el.append(h(`<div class="note">Por eso un micro necesita <b>previo</b>: tiene que multiplicar su señal unas 1000 veces (+60 dB) para
    llevarla a nivel de línea. Y por eso conectar una salida de línea a una entrada de micro distorsiona: le llega ~1000 veces demasiado.</div>`));
  el.append(quiz({
    q: 'Conectas un reproductor «consumer» (−10 dBV) a una entrada de línea profesional (+4 dBu). ¿Cuánto le falta?',
    options: ['Nada, es lo mismo', 'Unos 12 dB', 'Unos 60 dB'],
    correct: 1,
    why: '−10 dBV = −7,8 dBu; hasta +4 dBu faltan 11,8 dB. Se nota, pero se arregla subiendo la ganancia.',
    onOk: done,
  }));
  el.append(h(avh('levels', 'Audio', 'Levels & Metering', 'los niveles DIGITALES (dBFS, picos, headroom, clipping) y el loudness en LUFS')));
}

/* ---------- 5 · Phantom 48 V ---------- */
function phantom(el, { done }) {
  el.append(h(`<p class="lead">Un cable XLR balanceado lleva el audio en <b>dos hilos</b> (pin 2 «caliente» y pin 3 «frío»), uno al revés que
    el otro, más la malla (pin 1). El <b>phantom</b> mete además <b>48 V de continua</b> en los pines 2 y 3 a la vez. Truco: el previo
    solo escucha la <b>diferencia</b> entre 2 y 3… y la continua, al ser igual en los dos, desaparece.</p>`));
  let ph = true, mic = 'cond', noise = false, okCount = 0;
  const svg = h(`
  <svg class="sim" viewBox="0 0 640 300">
    <text x="20" y="40" class="lab small">pin 2</text><text x="20" y="120" class="lab small">pin 3</text><text x="20" y="215" class="lab small">2 − 3</text>
    <text x="20" y="232" class="lab small">(lo que oye</text><text x="20" y="248" class="lab small">el previo)</text>
    <line x1="100" x2="620" y1="70" y2="70" class="axis"/><line x1="100" x2="620" y1="150" y2="150" class="axis"/><line x1="100" x2="620" y1="230" y2="230" class="axis"/>
    <text id="off2" x="616" y="30" class="lab small" text-anchor="end"></text><text id="off3" x="616" y="110" class="lab small" text-anchor="end"></text>
    <path id="p2" class="tr2" fill="none"/><path id="p3" class="tr3" fill="none"/><path id="pd" class="trd" fill="none"/>
  </svg>`);
  loop(svg, (_, t) => {
    const works = mic === 'dyn' || ph;
    const dc = ph ? 1 : 0;
    const n = (x) => (noise ? 9 * Math.sin(x * 0.9 + t * 7) : 0);
    const a = (x) => (works ? 16 * Math.sin(x * 0.06 - t * 5) : 0);
    let d2 = '', d3 = '', dd = '';
    for (let x = 100; x <= 620; x += 4) {
      d2 += `${d2 ? 'L' : 'M'}${x} ${70 - 22 * dc - a(x) - n(x)}`;
      d3 += `${d3 ? 'L' : 'M'}${x} ${150 - 22 * dc + a(x) - n(x)}`;
      dd += `${dd ? 'L' : 'M'}${x} ${230 - 2 * a(x)}`;
    }
    svg.querySelector('#p2').setAttribute('d', d2); svg.querySelector('#p3').setAttribute('d', d3); svg.querySelector('#pd').setAttribute('d', dd);
    svg.querySelector('#off2').textContent = svg.querySelector('#off3').textContent = ph ? '+48 V de continua' : '0 V';
  });
  const state = h('<p class="state"></p>');
  const paint = () => {
    state.innerHTML = mic === 'cond' && !ph
      ? '<span class="ce-badge ce-b-warn">SIN SEÑAL</span> El micro de condensador necesita esos 48 V para funcionar: sin phantom no suena.'
      : '<span class="ce-badge ce-b-ok">SUENA</span> En «2 − 3» la continua y el ruido se han anulado: queda solo el audio, al doble.';
    if (mic === 'cond' && ph && noise) done();
  };
  const tg = h('<div class="toggles"></div>');
  tg.append(
    toggle({ label: '<b>Phantom +48 V</b> activado', value: ph, onChange: (v) => { ph = v; paint(); } }),
    toggle({ label: 'Hay <b>ruido</b> inducido en el cable', value: noise, onChange: (v) => { noise = v; paint(); } }),
  );
  el.append(seg([['cond', 'Micro de condensador'], ['dyn', 'Micro dinámico']], mic, (k) => { mic = k; paint(); }), svg, tg, state);
  paint();
  el.append(h(`<div class="note"><ul>
    <li>El phantom entra por dos resistencias de 6,8 kΩ, así que da muy poca corriente (unos mA): suficiente para la electrónica
      de un micro de condensador o una caja DI activa.</li>
    <li>Al micro dinámico no le afecta: no se entera de la continua. <b>Ojo</b> con micros de cinta antiguos y con cables mal
      cableados (2 o 3 a masa): ahí sí puede hacer daño.</li>
    <li>El ruido que entra igual por los dos hilos también se anula: por eso el balanceado aguanta tiradas largas.</li></ul>
    <small class="muted">Para completar el paso: condensador + phantom + ruido activado, y mira cómo «2 − 3» sale limpio.</small></div>`));
  el.append(h(avh('balanced-audio', 'Audio', 'Balanced Audio', 'el cableado XLR (hot/cold/malla), el rechazo de modo común y el uso del phantom en la mesa')));
}

/* ---------- 6 · Zumbido y bucles de masa ---------- */
function zumbido(el, { done }) {
  el.append(h(`<p class="lead">El famoso <b>«hummm»</b> grave es la red eléctrica (50 Hz) colándose en el audio. La causa típica es un
    <b>bucle de masa</b>: dos equipos unidos por la malla del cable de audio y, a la vez, cada uno por su tierra del enchufe.
    Ese círculo cerrado capta corriente de 50 Hz, y la malla la mete en la señal.</p>`));
  let loopOn = true, bal = false, lift = false, noEarth = false;
  const svg = h(`
  <svg class="sim" viewBox="0 0 640 250">
    <rect x="40" y="40" width="150" height="80" rx="10" class="meter"/><text x="115" y="85" class="lab" text-anchor="middle">Ordenador</text>
    <rect x="450" y="40" width="150" height="80" rx="10" class="meter"/><text x="525" y="85" class="lab" text-anchor="middle">Mesa / ampli</text>
    <path id="sig" d="M190 70 H450" class="wire2"/><text id="sigl" x="320" y="60" class="lab small" text-anchor="middle"></text>
    <path id="shield" d="M190 95 H450" class="shield"/><text x="320" y="112" class="lab small" text-anchor="middle">malla (masa)</text>
    <g id="liftx" opacity="0"><path d="M300 86 L316 104 M316 86 L300 104" stroke="#ff5a4d" stroke-width="3"/></g>
    <path id="e1" d="M115 120 V200" class="earth"/><path id="e2" d="M525 120 V200" class="earth"/>
    <g id="e2x" opacity="0"><path d="M515 150 L535 170 M535 150 L515 170" stroke="#ff5a4d" stroke-width="3"/></g>
    <path d="M60 200 H580" class="earth"/><text x="320" y="225" class="lab small" text-anchor="middle">tierra de la instalación (los enchufes)</text>
    <path id="loopPath" d="M190 95 H450 H525 V200 H115 V120" fill="none" class="loopline"/>
  </svg>`);
  const meter = h(`<div class="hum"><span>Zumbido</span><div class="hbar"><i></i></div><b></b>
    <button class="ce-btn">🔊 Escuchar</button></div>`);
  const state = h('<div class="note cable-info"></div>');
  let ctx = null, gain = null;
  const level = () => (noEarth || !loopOn || lift ? 0 : bal ? 0.06 : 1);
  meter.querySelector('button').onclick = () => {
    if (ctx) { ctx.close(); ctx = null; meter.querySelector('button').textContent = '🔊 Escuchar'; return; }
    ctx = new AudioContext();
    const o = ctx.createOscillator();
    o.setPeriodicWave(ctx.createPeriodicWave(new Float32Array([0, 0, 0, 0, 0]), new Float32Array([0, 1, 0.6, 0.45, 0.25])));
    o.frequency.value = 50;
    gain = ctx.createGain(); gain.gain.value = 0.25 * level();
    o.connect(gain).connect(ctx.destination); o.start();
    meter.querySelector('button').textContent = '⏹ Parar';
    addEventListener('hashchange', () => { ctx?.close(); ctx = null; }, { once: true });
  };
  const paint = () => {
    const L = level();
    meter.querySelector('i').style.width = `${L * 100}%`;
    meter.querySelector('b').textContent = L === 0 ? 'nada' : L < 0.1 ? 'apenas' : '¡fuerte!';
    if (gain) gain.gain.value = 0.25 * L;
    svg.querySelector('#sigl').textContent = bal ? 'audio BALANCEADO (XLR)' : 'audio NO balanceado (minijack/RCA)';
    svg.querySelector('#liftx').setAttribute('opacity', lift ? 1 : 0);
    svg.querySelector('#e2x').setAttribute('opacity', noEarth ? 1 : 0);
    svg.querySelector('#e1').setAttribute('opacity', loopOn ? 1 : 0.2);
    svg.querySelector('#loopPath').setAttribute('opacity', L > 0 ? 1 : 0);
    state.innerHTML = noEarth
      ? '<b>⚠️ Se acabó el zumbido… y la protección.</b> Sin tierra, si ese equipo tiene una avería su carcasa puede quedar a 230 V y el diferencial no se entera (repasa N3). <b>Nunca</b> se quita la tierra del enchufe para quitar un zumbido.'
      : !loopOn ? 'Un equipo funciona a batería (o con un cargador sin tierra): no hay círculo cerrado, no hay bucle.'
      : lift ? '<b>Bien hecho:</b> el «ground lift» de una caja DI corta la malla del cable de AUDIO solo en un extremo. Se rompe el bucle y los dos equipos siguen con su tierra de seguridad.'
      : bal ? 'El balanceado rechaza casi todo el zumbido (el ruido entra igual por los dos hilos y se resta), pero el bucle sigue ahí.'
      : 'Bucle cerrado + audio no balanceado = zumbido. La corriente del bucle circula por la malla, que es también el retorno de la señal.';
    if (lift && !noEarth && loopOn) done();
  };
  const tg = h('<div class="toggles"></div>');
  tg.append(
    toggle({ label: 'Los dos equipos enchufados a la red (con tierra)', value: loopOn, onChange: (v) => { loopOn = v; paint(); } }),
    toggle({ label: 'Usar cable <b>balanceado</b>', value: bal, onChange: (v) => { bal = v; paint(); } }),
    toggle({ label: 'Caja DI con <b>ground lift</b>', value: lift, onChange: (v) => { lift = v; paint(); } }),
    toggle({ label: '⚠️ Quitar la tierra del enchufe de la mesa', value: noEarth, onChange: (v) => { noEarth = v; paint(); } }),
  );
  el.append(svg, tg, meter, state);
  paint();
  el.append(h(`<div class="note">El zumbido suena a 50 Hz <b>y sus múltiplos</b> (100, 150, 200 Hz…), por eso es un «hummm» con
    cuerpo y no un tono puro. Y si oyes un zumbido que cambia con el regulador de luz: eso es la interferencia de los dimmers.</div>`));
  el.append(h(avh('prod-sound', 'Audio', 'Production Sound', 'cómo se detecta y se resuelve en un rodaje real')));
}

/* ---------- 7 · El vídeo también son voltios ---------- */
function video(el, { done }) {
  el.append(h(`<p class="lead">Una señal de vídeo analógico es una tensión que sube y baja a lo largo de cada línea de la imagen:
    <b>0 mV = negro</b>, <b>700 mV = blanco</b>, y por debajo de cero (<b>−300 mV</b>) los pulsos de <b>sincronismo</b> que marcan dónde
    empieza cada línea. En total, <b>1 voltio pico a pico</b> sobre 75 Ω.</p>`));
  let gain = 1, unterm = false, okSeen = false;
  const MV = (mv) => 190 - mv * 0.2; // 700 mV → 50 ; −300 → 250
  const svg = h(`
  <svg class="sim" viewBox="0 0 640 290">
    <rect x="70" y="${MV(1400)}" width="540" height="${MV(700) - MV(1400)}" class="illegal"/>
    ${[-300, 0, 350, 700].map((v) => `<line x1="70" x2="610" y1="${MV(v)}" y2="${MV(v)}" class="axis"/><text x="64" y="${MV(v) + 4}" class="lab small" text-anchor="end">${v} mV</text>`).join('')}
    ${[[0, '0 %'], [350, '50 %'], [700, '100 %']].map(([v, t]) => `<text x="614" y="${MV(v) + 4}" class="lab small">${t}</text>`).join('')}
    <path id="wf" class="wave" fill="none"/>
    <text x="100" y="275" class="lab small">sincro</text><text x="340" y="275" class="lab small" text-anchor="middle">una línea de imagen: escala de grises</text>
  </svg>`);
  const strip = h('<div class="gstrip"></div>');
  const out = h('<div class="readout three"></div>');
  const STEPS = [0, 0.2, 0.4, 0.6, 0.8, 1];
  const draw = () => {
    const k = gain * (unterm ? 2 : 1);
    const syncLvl = -300 * (unterm ? 2 : 1);
    let d = `M70 ${MV(0)} H90 V${MV(syncLvl)} H120 V${MV(0)} H150`;
    STEPS.forEach((s, i) => { const x = 150 + i * 75; d += ` V${MV(700 * s * k)} H${x + 75}`; });
    d += ` V${MV(0)} H610`;
    svg.querySelector('#wf').setAttribute('d', d);
    strip.innerHTML = STEPS.map((s) => { const v = Math.min(1, s * k); return `<i style="background:rgb(${v * 255},${v * 255},${v * 255})"></i>`; }).join('');
    const white = 700 * k;
    out.innerHTML = `
      <div><small>Blanco</small><b>debería ser 700 mV</b><span>${num(white, 0)} mV</span></div>
      <div><small>En porcentaje</small><b>0 % = 0 mV · 100 % = 700 mV</b><span>${num(white / 7, 0)} %</span></div>
      <div><small>Estado</small><b>${white > 735 ? 'por encima de lo legal' : white < 630 ? 'oscuro / lavado' : 'correcto'}</b><span>${white > 735 ? '⚠️' : white < 630 ? '↓' : '✓'}</span></div>`;
    if (!unterm && Math.abs(white - 700) < 20 && okSeen) done();
    if (unterm) okSeen = true;
  };
  const sl = slider({ label: '<b>Ganancia</b> de la cámara (iris)', min: 40, max: 140, value: 100, unit: '%', onInput: (v) => { gain = v / 100; draw(); } });
  const tg = toggle({ label: 'Monitor con el <b>loop-through sin terminar</b> (falta el tapón de 75 Ω)', onChange: (v) => { unterm = v; draw(); } });
  el.append(svg, strip, h('<div class="controls"></div>'), out);
  el.querySelector('.controls').append(sl, tg);
  draw();
  el.append(h(`<div class="note"><ul>
    <li><b>Sin terminación</b> la señal llega al <b>doble</b> (2 Vpp): imagen quemada y sincronismo raro. Es el rebote del paso
      «Líneas de 75 Ω». Por eso los monitores con salida de paso llevan un interruptor o tapón de 75 Ω.</li>
    <li><b>IRE</b> es una escala de ese voltaje que nació con el NTSC: 100 IRE = 714 mV (1 IRE ≈ 7,14 mV) y el sincronismo
      a −40 IRE. En PAL y en digital hablamos en <b>%</b> (0–700 mV), pero los monitores de forma de onda aún dicen «IRE».</li>
    <li>El vídeo digital (SDI) ya no codifica el brillo como un voltaje, sino como números… que viajan por un cable de 75 Ω.</li></ul>
    <small class="muted">Para completar el paso: activa el «sin terminar», mira qué pasa, quítalo y deja el blanco en 700 mV.</small></div>`));
  el.append(h(avh('scopes', 'Monitoring & Scopes', 'Scopes', 'cómo se LEE ese nivel en el monitor de forma de onda (IRE / %)')));
  el.append(h(avh('false-color', 'Monitoring & Scopes', 'False Color', 'el mismo nivel convertido en colores para exponer en rodaje')));
}

/* ---------- 8 · Parpadeo (flicker) ---------- */
function flicker(el, { done }) {
  el.append(h(`<p class="lead">La red va a 50 Hz, y una lámpara se enciende con cada <b>pico</b> de tensión, sea positivo o negativo:
    <b>100 destellos por segundo</b>. El ojo no lo ve, pero la cámara sí, si el tiempo de obturación no «encaja» con esos destellos.</p>`));
  const LIGHT = { led: ['LED barato', (t) => Math.abs(Math.sin(2 * Math.PI * 50 * t))], inc: ['Incandescente / fresnel', (t) => 0.9 + 0.1 * Math.cos(2 * Math.PI * 100 * t)], ff: ['LED «flicker-free»', () => 1] };
  let light = 'led', fps = 30, sh = 60, phase = 0;
  const svg = h(`
  <svg class="sim" viewBox="0 0 640 170">
    <text x="20" y="20" class="lab small">luz de la lámpara (40 ms)</text>
    <path id="lamp" class="wave" fill="none"/>
    <g id="wins"></g>
  </svg>`);
  const strip = h('<div class="frames"></div>');
  const out = h('<div class="readout three"></div>');
  const expo = (t0, dur) => { let s = 0; const N = 80; for (let i = 0; i < N; i++) s += LIGHT[light][1](t0 + (i + 0.5) * dur / N); return s / N; };
  const draw = () => {
    const f = LIGHT[light][1], dur = 1 / sh;
    let d = '';
    for (let i = 0; i <= 300; i++) { const t = i / 300 * 0.04; d += `${i ? 'L' : 'M'}${20 + 600 * i / 300} ${150 - 110 * f(t)}`; }
    svg.querySelector('#lamp').setAttribute('d', d);
    // ventanas de exposición de los fotogramas que caen en esos 40 ms
    let w = '';
    for (let k = 0; k * (1 / fps) < 0.04; k++) {
      const t0 = k / fps + phase;
      const x = 20 + 600 * (t0 % 0.04) / 0.04, wd = Math.min(600 * dur / 0.04, 620 - x);
      w += `<rect x="${x}" y="30" width="${wd}" height="125" class="win"/>`;
    }
    svg.querySelector('#wins').innerHTML = w;
    const ex = Array.from({ length: 24 }, (_, k) => expo(k / fps + phase, dur));
    const mean = ex.reduce((a, b) => a + b) / ex.length, var_ = (Math.max(...ex) - Math.min(...ex)) / mean;
    strip.innerHTML = ex.map((e) => { const v = Math.min(255, 200 * e / Math.max(...ex)); return `<i style="background:rgb(${v},${v * 0.95},${v * 0.85})"></i>`; }).join('');
    const ang = 360 * fps / sh;
    out.innerHTML = `
      <div><small>Obturación</small><b>1/${sh} s</b><span>${num(ang, 0)}°</span></div>
      <div><small>Variación entre fotogramas</small><b>(máx − mín) / media</b><span>${num(var_ * 100, 1)} %</span></div>
      <div><small>Resultado</small><b>${var_ < 0.02 ? 'imagen estable' : 'parpadeo visible'}</b><span>${var_ < 0.02 ? '✓' : '⚠️'}</span></div>`;
    if (light === 'led' && var_ < 0.02 && fps === 30) done();
  };
  el.append(
    seg(Object.entries(LIGHT).map(([k, [t]]) => [k, t]), light, (k) => { light = k; draw(); }),
    seg([25, 30, 50, 60].map((v) => [String(v), `${v} fps`]), String(fps), (k) => { fps = +k; draw(); }),
    seg([50, 60, 100, 120, 250, 1000].map((v) => [String(v), `1/${v}`]), String(sh), (k) => { sh = +k; draw(); }),
    svg, h('<p class="small muted">Cada fotograma (24 seguidos), tal como lo grabaría la cámara:</p>'), strip, out,
  );
  let acc = 0;
  loop(svg, (dt) => { phase = (phase + dt * 0.002) % 0.04; if ((acc += dt) > 0.12) { acc = 0; draw(); } });
  draw();
  el.append(h(`<div class="note"><b>La regla:</b> si el tiempo de obturación es un múltiplo de 10 ms (1/100, 1/50, 1/33…), cada fotograma
    «recoge» destellos completos y todos salen iguales. Con 1/60 o 1/120 (pensados para la red americana de 60 Hz) cada fotograma
    pilla un trozo distinto: parpadeo.
    <ul><li>La incandescente casi no parpadea: el filamento sigue caliente entre destellos (inercia térmica).</li>
    <li>Un LED barato o un fluorescente siguen la red al instante: parpadeo fuerte. Los dimmers de los Datapak, al recortar la onda,
      pueden empeorarlo en niveles bajos.</li>
    <li>Reto: con el LED barato a <b>30 fps</b>, encuentra una obturación sin parpadeo.</li></ul></div>`));
  el.append(h(avh('flicker', 'Artifacts & Defects', 'Flicker & Rolling Bands', 'las bandas que se ven en cámara (obturador rolling), los ángulos 172,8° / 180° y los focos flicker-free')));
}

export default {
  id: 'n5', num: 5, title: 'Electricidad en el estudio',
  blurb: 'Impedancia, altavoces, cables de 75 Ω, niveles en voltios, phantom, zumbidos, el vídeo como tensión y el parpadeo.',
  steps: [
    { id: 'impedancia', title: 'Impedancia', render: impedancia },
    { id: 'altavoces', title: 'Altavoces y ampli', render: altavoces },
    { id: 'lineas', title: 'Líneas de 75 Ω', render: lineas },
    { id: 'niveles', title: 'Niveles en voltios', render: niveles },
    { id: 'phantom', title: 'Phantom 48 V', render: phantom },
    { id: 'zumbido', title: 'Zumbido y masa', render: zumbido },
    { id: 'video', title: 'El vídeo son voltios', render: video },
    { id: 'flicker', title: 'Parpadeo', render: flicker },
  ],
};
