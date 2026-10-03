# volt — Curso de electricidad interactivo (PWA docente)

> **Proyecto NUEVO.** Arrancar en su **sesión propia** en esta carpeta (`~/Proyectos/volt`).
> Idea completa en memoria: `electricidad-curso-idea.md`. Carpeta creada el 3-oct-2026 por MissionControl.

## Qué es
Web/PWA docente **interactiva** para aprender **electricidad por niveles**, al estilo de `puzzle-realizacion`
(juego enrutado) y `keylab` (entender un concepto). **Doble público:** Alex (quiere aprender electricidad) +
alumnos de FP (Digitalizazioa). Surgió desde el **breaker board del control** de `tvstudio`.
UI probablemente **ES + euskara** (como la familia; el euskera técnico lo revisa/pasa Alex — NO inventar).

## Publicar (propuesto)
- Subdominio: **`volt.cinemafilmak.com`** (alternativas barajadas: `ohm.`, `electric.`). ⚠️ confirmar con Alex.
- Host: **GitHub Pages** (repo `ondarrupeasu/volt`, rama `main`, raíz; `CNAME`). DNS → `ondarrupeasu.github.io`. HTTPS forzado. `noindex`. PWA instalable.

## Estructura por niveles (borrador — pulir con Alex)
- **N0 · Conceptos:** tensión(V)/intensidad(A)/resistencia(Ω)/potencia(W); analogía del agua; CC vs CA; fase/neutro/tierra.
- **N1 · El circuito:** fuente‑cable‑carga‑interruptor; abierto/cerrado; serie/paralelo; **Ley de Ohm interactiva**
  (sliders V/R → corriente + bombilla que brilla).
- **N2 · Símbolos y esquemas:** símbolos de planos eléctricos (interruptor, magnetotérmico, diferencial, toma, lámpara,
  fusible, motor…); leer un **unifilar** sencillo; mini‑juego emparejar símbolo↔aparato.
- **N3 · Protecciones:** magnetotérmico (sobrecarga/cortocircuito), **diferencial** (fuga a tierra, 30 mA, por qué te
  salva → simular fuga y que SALTE), fusible.
- **N4 · Trifásica / instalación real:** 3 fases, reparto de cargas; **culmina en el cuadro real del control de tvstudio**.

## Reutilizar (NO empezar de cero)
- **DMXSimulatoR** `~/Proyectos/dmxsimulator/src/ui/power/`:
  - `breakers.tsx` → SVG ya pulidos: **`MCB`** (magnetotérmico 1-4 polos), **`RCD`** (diferencial con botón TEST),
    `MainSwitch` (general 4P); helpers `PoleBody`/`Handle`.
  - `power.css` (estilos `.pw-svg`), `PowerPatchView.tsx` (disposición de un cuadro).
  - `src/i18n/locales/eu.json` → **euskera de potencia** ya traducido.
  - ⚠️ DMX = React/TS/Vite; aquí será HTML/JS plano → portar los SVG parametrizados a strings (casi directo). COPIAR, no rehacer.
- **Casa de Estilo** `~/Proyectos/missioncontrol/shared/web/casa-estilo.css` (vendorizar).
- Patrón de niveles/enrutado de `~/Proyectos/puzzle-realizacion`; patrón "entender un concepto" de `~/Proyectos/keylab`.
- El **cuadro eléctrico interactivo** = componente COMPARTIDO con `tvstudio` (mismo breaker board). Construir una vez.

## Material real del cuadro del control (para N4, dato de Alex)
- **Diferencial:** Merlin Gerin **C60N** 40 A 4P + bloque **Vigi** 30 mA (botón **T** = test).
- **24 magnetotérmicos:** Merlin Gerin **K60N** 10 A 2P.
- Fila de arriba etiquetada: **Diferencial** · **DATAPAK** (Hager 4P) · **Dimmers** (Legrand 4P) · **LED** (CHINT 16A F+N).
- **Datapak** (Pulsar Datapak III ×2): controles impresos — ELECTRONICS (enciende electrónica), PREHEAT (precalienta
  filamentos), ψ1/ψ2/ψ3 (pilotos de las 3 fases), por canal: fusible 10A + LED rojo (fundido) + LED verde (salida).
- Conceptos clave a enseñar: magnetotérmico corta por sobrecarga/cortocircuito; diferencial corta por fuga a tierra
  (lo que pasa al electrocutarse) → por eso el Vigi 30 mA.

## Estado (3-oct-2026)
**MVP hecho:** PWA estática sin build (`index.html`, `app.js` router por hash `#/n0/<paso>`, `ui.js` helpers,
`levels/n0.js`, `levels/n1.js`, `styles.css`, `casa-estilo.css` vendorizado, `sw.js`, `manifest`). Progreso en
localStorage (`volt.done`): un paso se marca hecho al acertar su pregunta.
- **N0:** analogía del agua (sliders V/R → caudal y rueda) · tabla de magnitudes + ejemplos reales · CC vs CA animado
  · fase/neutro/tierra con mini-juego tocando cables.
- **N1:** circuito abierto/cerrado · Ley de Ohm (fuente + carga, amperímetro, triángulo V-I-R, la bombilla se funde
  > 40 W) · serie vs paralelo (desenroscar bombillas).
- Solo **ES** por ahora (euskera pendiente de Alex; no inventar). N2–N4 salen como «Próximamente».
- Local: `python3 -m http.server 8790` (`.claude/launch.json`). Deploy: push a `main` → GitHub Pages. **En vivo:** https://volt.cinemafilmak.com
**Siguiente:** N3 portando `breakers.tsx` (MCB/RCD) a strings SVG; N2 símbolos; i18n EU.
