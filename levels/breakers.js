/* Aparamenta DIN en SVG — portado de DMXSimulatoR src/ui/power/breakers.tsx (mismo dibujo que el
   breaker board de tvstudio). Devuelven strings SVG. Maneta arriba = ON ("I"), abajo = OFF ("0"). */

const PW = 30, PH = 78;
const CREAM = '#e4dfd0', CREAM_HI = '#efe9da', CREAM_EDGE = '#b3ad9b', CREAM_SEAM = '#c7c1af';

const poleBody = (x) => `
  <g transform="translate(${x},0)">
    <rect x="0.5" y="0.5" width="${PW - 1}" height="${PH - 1}" rx="2.5" fill="${CREAM}" stroke="${CREAM_EDGE}" stroke-width="0.9"/>
    <rect x="4" y="14" width="${PW - 12}" height="1.2" rx="0.5" fill="${CREAM_SEAM}"/>
    <rect x="4" y="17.5" width="${PW - 17}" height="1.2" rx="0.5" fill="${CREAM_SEAM}"/>
    <rect x="3.5" y="56" width="${PW - 7}" height="16" rx="1.5" fill="${CREAM_HI}" stroke="${CREAM_EDGE}" stroke-width="0.6"/>
  </g>`;

const handle = (poles, on) => {
  const W = poles * PW, capY = on ? 25 : 36;
  let s = `<g class="handle"><rect x="3" y="23" width="${W - 6}" height="23" rx="3" fill="#2b2d33"/>`;
  for (let i = 0; i < poles; i++)
    s += `<text x="${i * PW + PW / 2}" y="${on ? 43.5 : 31}" text-anchor="middle" font-size="6.5" font-weight="700" font-family="system-ui" fill="#c9ced6">${on ? 'I' : '0'}</text>`;
  s += `<rect x="4.5" y="${capY}" width="${W - 9}" height="12.5" rx="2.2" fill="#f2efe6" stroke="#a5a196" stroke-width="0.7"/>`;
  for (let i = 0; i < poles; i++)
    s += `<rect x="${i * PW + PW / 2 - 5}" y="${capY + 3.6}" width="10" height="5.4" rx="1.4" fill="#191a1f"/>`;
  return s + '</g>';
};

/** Magnetotérmico (MCB) de 1–4 polos, con su rótulo (p.ej. "C10"). */
export function MCB({ poles = 2, on = true, label = 'C10' } = {}) {
  const W = poles * PW;
  let s = `<svg viewBox="0 0 ${W} ${PH}" class="din" data-kind="mcb">`;
  for (let i = 0; i < poles; i++) s += poleBody(i * PW);
  s += handle(poles, on);
  s += `<rect x="1.5" y="2" width="${W - 3}" height="4" rx="1.6" fill="#2f52d8" stroke="#1c34a0" stroke-width="0.4"/>`;
  s += `<text x="${PW / 2}" y="67" text-anchor="middle" font-size="7" font-weight="700" font-family="system-ui" fill="#333">${label}</text>`;
  return s + '</svg>';
}

/** Diferencial (RCD) de media cúpula: TEST azul a la izquierda (clase .testbtn), maneta navy, piloto rojo. */
export function RCD({ on = true } = {}) {
  const W = 2 * PW, hy = on ? 24 : 35, lx = PW / 2, rx = PW + PW / 2, r = 7;
  return `<svg viewBox="0 0 ${W} ${PH}" class="din" data-kind="rcd">
    <rect x="0.5" y="0.5" width="${W - 1}" height="${PH - 1}" rx="2.5" fill="${CREAM}" stroke="${CREAM_EDGE}" stroke-width="0.9"/>
    <line x1="0.5" y1="13" x2="${W - 0.5}" y2="13" stroke="${CREAM_SEAM}" stroke-width="0.8"/>
    <g class="testbtn">
      <path d="M ${lx - r} 8 A ${r} ${r} 0 0 0 ${lx + r} 8 Z" fill="#2f52d8" stroke="#1b34a0" stroke-width="0.7"/>
      <path d="M ${lx - r + 1.2} 8 A ${r - 1.2} ${r - 1.2} 0 0 0 ${lx + r - 1.2} 8" fill="none" stroke="#7a92ef" stroke-width="0.9" opacity="0.7"/>
      <text x="${lx}" y="21" text-anchor="middle" font-size="5.5" font-weight="700" font-family="system-ui" fill="#2f52d8">T</text>
    </g>
    ${[0, 1, 2, 3].map((k) => `<rect x="4.5" y="${26 + k * 4}" width="${PW - 11}" height="1.5" rx="0.6" fill="${CREAM_SEAM}"/>`).join('')}
    <text x="${lx}" y="67" text-anchor="middle" font-size="6" font-weight="700" font-family="system-ui" fill="#333">30mA</text>
    <g class="handle">
      <rect x="${rx - 10}" y="22" width="20" height="26" rx="3" fill="#2b2d33"/>
      <rect x="${rx - 9}" y="${hy}" width="18" height="15" rx="2.4" fill="#26326f" stroke="#12142a" stroke-width="0.8"/>
      <rect x="${rx - 7}" y="${hy + 1.6}" width="4" height="12" rx="1.4" fill="#3d4d97" opacity="0.8"/>
    </g>
    <rect x="${rx - 4}" y="50" width="8" height="2.8" rx="0.9" fill="${on ? '#e5372a' : '#191a1f'}"/>
    <rect x="${PW + 3.5}" y="56" width="${PW - 7}" height="16" rx="1.5" fill="${CREAM_HI}" stroke="${CREAM_EDGE}" stroke-width="0.6"/>
  </svg>`;
}

/** Fusible cilíndrico en su portafusibles (melted = fundido: ventanita negra). */
export function Fuse({ melted = false, label = '10A' } = {}) {
  return `<svg viewBox="0 0 30 78" class="din" data-kind="fuse">
    <rect x="0.5" y="0.5" width="29" height="77" rx="2.5" fill="${CREAM}" stroke="${CREAM_EDGE}" stroke-width="0.9"/>
    <rect x="7" y="10" width="16" height="50" rx="7" fill="#dcd6c4" stroke="${CREAM_EDGE}" stroke-width="0.8"/>
    <rect x="11" y="22" width="8" height="26" rx="2" fill="${melted ? '#1a1a1a' : '#f6f3ea'}" stroke="#9b968b" stroke-width="0.5"/>
    ${melted ? '<path d="M15 24 V32 M15 38 V46" stroke="#555" stroke-width="1"/>' : '<path d="M15 24 V46" stroke="#b07a3a" stroke-width="1.2"/>'}
    <text x="15" y="70" text-anchor="middle" font-size="7" font-weight="700" font-family="system-ui" fill="#333">${label}</text>
  </svg>`;
}
