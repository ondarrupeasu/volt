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
- **N3:** regleta con aparatos (sin protección → el cable arde; fusible 10 A; magnetotérmico C10 con disparo
  térmico lento + magnético por cortocircuito) · diferencial 30 mA (fase→carcasa, con/sin tierra, persona toca,
  TEST, escala de efectos en el cuerpo). SVG portados a `levels/breakers.js`.
- Solo **ES** por ahora (euskera pendiente de Alex; no inventar). N2–N4 salen como «Próximamente».
- Local: `python3 -m http.server 8790` (`.claude/launch.json`). Deploy: push a `main` → GitHub Pages. **En vivo:** https://volt.cinemafilmak.com
- **N2:** galería de 13 símbolos IEC 60617 · juego de emparejar (10 rondas, distractores parecidos) · unifilar
  de vivienda (contador → IGA → diferencial → C1/C2/C3) clicable.
- **N4:** tres fases (ondas + fasores, L1−L2 = 400 V, suma = 0) · reparto de 12 focos entre L1/L2/L3 (límite 40 A,
  corriente de neutro) · **cuadro real** del control con misión (diferencial → LED → Dimmers → ELECTRONICS Datapak 2).
  `levels/cuadro.js` = COPIA del dibujo de `tvstudio/power.js` (solo textos en ES): si cambia allí, sincronizar.
- **N5 Electricidad en el estudio (8 pasos):** impedancia/bridging (micro, guitarra→Hi-Z/DI) · altavoces 8 Ω serie/paralelo
  vs ampli mín. 4 Ω · reflexiones en líneas 75/120 Ω (Γ) · niveles dBu/dBV↔V · phantom 48 V (pin 2/3, modo común) ·
  zumbido/bucle de masa (Web Audio 50 Hz + armónicos; ground lift vs quitar tierra = peligro) · vídeo como tensión
  (−300/0/700 mV, sin terminar = ×2, IRE) · flicker (100 Hz, fps×obturación, LED/incand./flicker-free). Enlaces deep-link a AVHandbook.
**Siguiente:** revisión de Alex (textos/técnica) · i18n EU.

## Frontera con AVHandbook (acordada con su sesión, 4-oct-2026)
**Volt = el «por qué» eléctrico** (voltios, ohmios, Z, CC). **AVHandbook = uso AV práctico + monitorado + efecto en cámara.**
Plan **N5 «Electricidad en el estudio»** (todo de Volt): impedancia (mic→previo bridging, 8 Ω/paralelo, 75 Ω SDI,
120 Ω DMX, reflexiones) · niveles como tensión (dBu=0,775 V, +4 dBu=1,23 V, −10 dBV) · phantom 48 V · bucles de
masa/zumbido 50 Hz · vídeo analógico como tensión (1 Vpp, 700 mV, sync −300 mV, IRE) · flicker (100 parpadeos/s, dimmers).
Enlaces a AVHandbook con deep-link `https://avhandbook.cinemafilmak.com/#/<slug>` (slug = id camelCase→kebab):
Audio › Balanced Audio, Levels & Metering (dBFS), Loudness EBU R128, Production Sound · Artifacts & Defects › Flicker &
Rolling Bands · Signals & Connectivity · Monitoring & Scopes › False Color, Scopes · Color Science (SDR/HDR = suyo, sin módulo aún).
Slugs: balanced-audio, levels, loudness, prod-sound, mic-types, polar-patterns, sync-timecode, flicker, signals, false-color, scopes, color-spaces, picture-profiles, aces.
