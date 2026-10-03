/* Helpers de UI compartidos por los niveles. */

export const h = (html) => {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
};

/** Slider estilo Casa (.ce-slider). onInput recibe el valor numérico. */
export function slider({ label, min, max, step = 1, value, unit = '', fmt = (v) => v, onInput }) {
  const el = h(`
    <label class="sl">
      <span class="sl-lab">${label}</span>
      <span class="ce-slider"><input type="range" min="${min}" max="${max}" step="${step}" value="${value}" />
      <span class="ce-val"></span></span>
    </label>`);
  const inp = el.querySelector('input');
  const out = el.querySelector('.ce-val');
  const upd = () => {
    const v = Number(inp.value);
    inp.style.setProperty('--p', `${((v - min) / (max - min)) * 100}%`);
    out.textContent = `${fmt(v)} ${unit}`.trim();
    onInput?.(v);
  };
  inp.addEventListener('input', upd);
  el.set = (v) => { inp.value = v; upd(); };
  el.get = () => Number(inp.value);
  queueMicrotask(upd);
  return el;
}

/** Bucle de animación que se para solo cuando el nodo sale del DOM. */
export function loop(node, fn) {
  let last = performance.now();
  const tick = (now) => {
    if (!node.isConnected) return;
    fn(Math.min(0.05, (now - last) / 1000), now / 1000);
    last = now;
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

/** Puntos que recorren un <path> (la corriente). speed() en px/s, puede ser negativa (CA). */
export function flowDots(path, { n = 14, r = 3.2, cls = 'dot', speed }) {
  const svgNS = 'http://www.w3.org/2000/svg';
  const len = path.getTotalLength();
  const g = document.createElementNS(svgNS, 'g');
  const dots = Array.from({ length: n }, () => {
    const c = document.createElementNS(svgNS, 'circle');
    c.setAttribute('r', r);
    c.setAttribute('class', cls);
    g.append(c);
    return c;
  });
  path.after(g);
  let off = 0;
  loop(g, (dt, t) => {
    off = (off + speed(t) * dt) % len;
    dots.forEach((c, i) => {
      const p = path.getPointAtLength((((off + (i * len) / n) % len) + len) % len);
      c.setAttribute('cx', p.x);
      c.setAttribute('cy', p.y);
    });
  });
  return g;
}

/** Bombilla SVG (string). glow 0..1; broken = filamento roto. */
export function bulbSVG(id = 'b') {
  return `
  <g class="bulb" id="${id}">
    <circle class="halo" r="46" fill="url(#halo)" opacity="0"/>
    <path class="glass" d="M-18 10 A24 24 0 1 1 18 10 L12 22 H-12 Z"/>
    <path class="fil" d="M-7 18 V4 L-4 -6 L-1 2 L2 -6 L5 2 L7 -4 V18" fill="none" stroke-width="1.6"/>
    <rect class="base" x="-12" y="22" width="24" height="14" rx="2"/>
    <path d="M-12 26 H12 M-12 31 H12" stroke="#0e0f12" stroke-width="1.2"/>
  </g>`;
}
export const HALO_DEF = `<radialGradient id="halo"><stop offset="0" stop-color="#ffd46b" stop-opacity=".9"/><stop offset="1" stop-color="#ffd46b" stop-opacity="0"/></radialGradient>`;
export function setBulb(g, glow, broken = false) {
  const k = broken ? 0 : Math.max(0, Math.min(1, glow));
  g.querySelector('.halo').setAttribute('opacity', (k * 0.95).toFixed(3));
  g.querySelector('.glass').style.fill = `rgba(255,${200 + 30 * k},${90 + 40 * k},${0.08 + 0.75 * k})`;
  g.querySelector('.fil').style.stroke = broken ? '#555' : k > 0.02 ? `rgb(255,${150 + 100 * k},${60 + 120 * k})` : '#777';
  g.querySelector('.fil').setAttribute('d', broken
    ? 'M-7 18 V4 L-4 -6 L-2 -1 M1 -3 L2 -6 L5 2 L7 -4 V18'
    : 'M-7 18 V4 L-4 -6 L-1 2 L2 -6 L5 2 L7 -4 V18');
}

/** Interruptor deslizante de la Casa (.ce-sw). */
export function toggle({ label, value = false, onChange }) {
  const el = h(`<label class="ce-sw"><span class="ce-track"><span class="ce-knob"></span></span><span>${label}</span></label>`);
  const tr = el.querySelector('.ce-track');
  let v = value;
  const paint = () => tr.classList.toggle('ce-on', v);
  el.onclick = (e) => { e.preventDefault(); v = !v; paint(); onChange?.(v); };
  el.set = (x) => { v = x; paint(); };
  paint();
  return el;
}

/** Formatea con coma decimal (es/eu). */
export const num = (v, d = 2) =>
  Number(v).toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: d });

/** Caja "¿lo has pillado?": pregunta tipo test con feedback inmediato. */
export function quiz({ q, options, correct, why, onOk }) {
  const el = h(`<div class="quiz"><p class="quiz-q">${q}</p><div class="quiz-opts"></div><p class="quiz-why" hidden></p></div>`);
  const box = el.querySelector('.quiz-opts');
  const whyEl = el.querySelector('.quiz-why');
  options.forEach((o, i) => {
    const b = h(`<button class="ce-chip">${o}</button>`);
    b.onclick = () => {
      box.querySelectorAll('button').forEach((x) => x.classList.remove('ok', 'ko'));
      const ok = i === correct;
      b.classList.add(ok ? 'ok' : 'ko');
      whyEl.hidden = false;
      whyEl.className = `quiz-why ${ok ? 'ok' : 'ko'}`;
      whyEl.innerHTML = ok ? `✓ ${why}` : '✗ Casi. Vuelve a mirarlo en el simulador de arriba.';
      if (ok) onOk?.();
    };
    box.append(b);
  });
  return el;
}
