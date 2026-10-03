/* Volt — router por hash (#/, #/n0, #/n0/<paso>) + progreso en localStorage. */
import { h } from './ui.js';
import n0 from './levels/n0.js';
import n1 from './levels/n1.js';
import n2 from './levels/n2.js';
import n3 from './levels/n3.js';

const LEVELS = [
  n0,
  n1,
  n2,
  n3,
  { id: 'n4', num: 4, title: 'Trifásica e instalación real', blurb: 'Tres fases, reparto de cargas… y el cuadro real del control.', soon: true },
];

/* ---- progreso ---- */
const KEY = 'volt.done';
const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } };
let done = load();
const isDone = (lv, st) => (done[lv] || []).includes(st);
function markDone(lv, st) {
  if (isDone(lv, st)) return;
  (done[lv] ||= []).push(st);
  try { localStorage.setItem(KEY, JSON.stringify(done)); } catch {}
  document.querySelector(`.steps [data-step="${st}"]`)?.classList.add('done');
}
const levelPct = (lv) => (lv.steps ? (done[lv.id] || []).length / lv.steps.length : 0);

/* ---- vistas ---- */
const app = document.getElementById('app');
const crumbs = document.getElementById('crumbs');

function home() {
  crumbs.innerHTML = '';
  app.replaceChildren(h(`
    <section class="hero">
      <h1>Entiende la electricidad <em>jugando con ella</em>.</h1>
      <p>De qué es un voltio hasta el cuadro eléctrico real del control. Cada nivel tiene simuladores
      que puedes tocar y una preguntita al final de cada paso para comprobar que lo has pillado.</p>
    </section>`));
  const grid = h('<section class="levels"></section>');
  for (const lv of LEVELS) {
    const pct = Math.round(levelPct(lv) * 100);
    const card = h(`
      <a class="lv ce-card ${lv.soon ? 'soon' : ''}" ${lv.soon ? '' : `href="#/${lv.id}"`}>
        <span class="lv-num">N${lv.num}</span>
        <span class="lv-body">
          <span class="lv-title">${lv.title}</span>
          <span class="lv-blurb">${lv.blurb}</span>
          ${lv.soon ? '<span class="ce-badge ce-b-warn">Próximamente</span>'
                    : `<span class="bar"><i style="width:${pct}%"></i></span>`}
        </span>
      </a>`);
    grid.append(card);
  }
  app.append(grid);
}

function level(lv, stepId) {
  const step = lv.steps.find((s) => s.id === stepId) || lv.steps[0];
  const idx = lv.steps.indexOf(step);
  crumbs.innerHTML = `<a href="#/">Niveles</a><span>›</span><span>N${lv.num} · ${lv.title}</span>`;

  const nav = h('<nav class="steps"></nav>');
  lv.steps.forEach((s, i) => {
    nav.append(h(`<a href="#/${lv.id}/${s.id}" data-step="${s.id}"
      class="${s === step ? 'on' : ''} ${isDone(lv.id, s.id) ? 'done' : ''}"><b>${i + 1}</b>${s.title}</a>`));
  });

  const body = h('<article class="step"></article>');
  body.append(h(`<h2>${step.title}</h2>`));
  step.render(body, { done: () => markDone(lv.id, step.id) });

  const prev = lv.steps[idx - 1], next = lv.steps[idx + 1];
  const nextLv = LEVELS.slice(LEVELS.indexOf(lv) + 1).find((l) => !l.soon);
  const foot = h('<footer class="step-foot"></footer>');
  foot.append(prev ? h(`<a class="ce-btn" href="#/${lv.id}/${prev.id}">← ${prev.title}</a>`) : h('<span></span>'));
  if (next) foot.append(h(`<a class="ce-btn ce-primary" href="#/${lv.id}/${next.id}">${next.title} →</a>`));
  else if (nextLv) foot.append(h(`<a class="ce-btn ce-primary" href="#/${nextLv.id}">Nivel ${nextLv.num} →</a>`));
  else foot.append(h('<a class="ce-btn ce-primary" href="#/">Volver a los niveles</a>'));

  app.replaceChildren(nav, body, foot);
  window.scrollTo(0, 0);
}

function route() {
  const [, lvId, stepId] = location.hash.split('/');
  const lv = LEVELS.find((l) => l.id === lvId && !l.soon);
  lv ? level(lv, stepId) : home();
}

addEventListener('hashchange', route);
route();

if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js');
