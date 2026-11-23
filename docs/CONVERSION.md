# Conversión del prototipo Nuevo Contigo a Angular — brief común

Proyecto: `C:\Users\ogil\Desktop\DEVENGERS\Front\SPIKES\SkCo.DesignLab.Contigo` (Angular 22.3, standalone, zoneless, SCSS, Vitest).
Prototipo original (solo lectura, referencia): `docs/prototipo/index.html`, `docs/prototipo/radiografia.html`, `docs/prototipo/radiografia-sin-pac.html`.
Assets ya copiados en `public/assets/` → en templates se referencian como `assets/...` (igual que el prototipo).

## Objetivo

Conversión **píxel-fiel**: la app debe verse y comportarse igual que el prototipo (escritorio y móvil ≤768px / ≤600px),
pero con código Angular idiomático. No se usa sk-components. No se reescribe el diseño.

Fuera de alcance (NO migrar): vista teléfono (`pv-on`, `?embed`, `#movil`), grabador de pruebas (`?prueba=`, `html.prueba`,
"Terminar prueba"), sección Recursos (`v-recursos`), selector flotante de vista de la radiografía si es solo control del prototipo
(ver nota en la sección de radiografía), iframes y `postMessage` (la radiografía pasa a ser una ruta Angular).

## Convenciones (lineamientos Skandia, obligatorios)

- Nombres estilo Angular 20+: archivos `algo.ts` / `algo.html` / `algo.scss` (sin sufijo `.component`), clase `Algo` (sin sufijo `Component`), selector con prefijo `nc-`.
- `ChangeDetectionStrategy.OnPush` siempre; `inject()` (nunca DI por constructor); `input()` / `input.required()` / `model()` / `output()`; `signal` + `computed`; `effect` solo para sincronizar con el exterior (DOM, timers, UiStore) — nunca para derivar estado.
- Control flow `@if / @for (track) / @switch`. Nada de `*ngIf`, `NgClass`, `CommonModule` (usa `[class.x]`, `[style.x]`).
- `protected` lo que usa el template, `private readonly` lo interno. Cero `any`, cero `console.log`, cero `var`, cero manipulación de DOM por `innerHTML`/`querySelector` para pintar contenido: el contenido se pinta con templates. Acceso directo al DOM solo para foco/medidas (vía `viewChild` + `ElementRef`), con `afterRenderEffect`/`afterNextRender`.
- Componentes chicos (≲300 líneas de TS; templates grandes se dividen en hijos). Page orquesta; presentacionales con `input()`/`output()`.
- Datos de ejemplo del prototipo: constantes tipadas en `features/<feature>/data/*.mock.ts` con interfaces en `features/<feature>/interfaces/`. No hay HTTP.
- Estado-cliente de la feature: store de signals `@Injectable()` (backing privado + `asReadonly()`, derivados `computed`, métodos con nombre de negocio, cero I/O). `providedIn: 'root'` solo si debe sobrevivir a la navegación (p. ej. lo que se recuerda en la sesión); si no, provéelo en la page.
- Textos: el copy estático puede ir en el template (es un prototipo de diseño). Los textos que arma el TS (avisos, etiquetas dinámicas, mensajes de error) van en `features/<feature>/constants/textos.ts` (`as const`).
- Breakpoints en TS: `injectMediaQuery(MQ_MOBILE)` de `@core/utils/media-query` (o un query propio, p. ej. `'(max-width: 600px)'`, si el prototipo usa otro).
- Path aliases: `@core/*`, `@shared/*`, `@layout/*`, `@features/*`. Nada de `../../../` entre carpetas de nivel superior.

## Estilos

- Cada componente tiene su `.scss` con los estilos del prototipo que le corresponden (copiados con sus valores exactos, incluidos los `@media`). Encapsulación emulada (default).
- Colores/fuentes: usa `var(--sk-*)` de `src/styles/_tokens.scss` cuando el valor coincide exactamente con un token (p. ej. `#00C73D` → `var(--sk-color-primary)`, `#404040` → `var(--sk-color-text)`, `Montserrat` → `var(--sk-font-heading)`, `'Open Sans'` → `var(--sk-font-body)`, `var(--Texts-Dark,#404040)` → `var(--sk-color-text)`, `var(--green)` → `var(--sk-color-primary)`, `var(--green-soft)` → `var(--sk-color-primary-soft)`, `var(--blue)` → `var(--sk-color-info)`, `var(--ink)` → `var(--sk-color-ink)`, `var(--ink-2)` → `var(--sk-color-ink-2)`, `var(--line)` → `var(--sk-color-line)`, `var(--red)` → `var(--sk-color-danger)`, `--charts-cNN` → `--sk-charts-cNN`). Colores sin token se dejan literales (fidelidad); si uno se repite mucho dentro de tu feature, decláralo como custom property en `:host` del componente raíz de la feature.
- Utilidades globales ya definidas en `src/styles/_base.scss` (no las redefinas): reset `*{box-sizing;margin:0;padding:0}`, `svg{display:block}`, `.ico`, `.ico-sm`, `.sr`, `.ojo`, `.tip/.tip-btn/.tip-box`, `.chip`.
- **No edites** `src/styles/*`, `src/app/core/*`, `src/app/shared/*`, `src/app/layout/*`, `app.*`. Si necesitas algo ahí, dilo en tu reporte final.
- Las clases que el prototipo ponía en `<body>` (p. ej. `body.modo-mision .x{…}`) se expresan como `:host-context(.modo-mision) .x{…}`. La clase la pone la raíz de la app a partir de `UiStore` (ver abajo).
- Si un estilo tiene que alcanzar a un componente hijo de otra feature, no uses `::ng-deep`: usa un input o una custom property.

## Contratos compartidos (ya existen)

- `UiStore` (`@core/state/ui.store`): modos de página que el prototipo ponía como clases de `<body>`: `'modo-mision' | 'saldos-recogidos' | 'cop-cargando' | 'jw-abierto' | 'pp-md-abierta' | 'vista-producto' | 'm-detalle' | 'm-pf-sec' | 'dr-open' | 'nav-open'`. API: `set(modo, on)`, `toggle(modo)`, `activo(modo)`, `modos()` (signal), `modoMision` (computed), `limpiar(...excepto)`. La raíz los refleja en `document.body.classList`.
- `SessionStore` (`@core/state/session.store`): `dentro()`, `entrar()`, `salir()`.
- `AvisoStore` (`@core/state/aviso.store`): `mostrar(texto, deshacer?)` — toast global (lo monta el shell; no crees otro toast).
- `MisionesStore` (`@core/state/misiones.store`): estado de misiones compartido dashboard ↔ ficha: `descartes()` (Record id→`Descarte`), `descartar(id, descarte)`, `restaurar(id)`, `progreso()` (Record id→etapas), `registrarProgreso(id, n)`; helpers `textoMotivo(d)`, enum `MotivoDescarte`. El id de la misión de Óscar es `'oscar'`.
- `DescartarMisionModal` (`@shared/components/descartar-mision-modal/descartar-mision-modal`): `<nc-descartar-mision-modal [(abierta)]="…" [nombre]="…" (confirmar)="onDescarte($event)" />`. Ya trae la variante oscura del modo misión.
- Rutas (`@core/constants/rutas` → `RUTAS`): `/login`, `/inicio` (dashboard), `/ficha` (ficha de Óscar; `?tab=copiloto|productos|datos|…` abre esa pestaña), `/ficha/producto` (ficha del producto, la define la feature ficha), `/radiografia` (`?plan=sin`, `?rol=dueno|fp`, `?tab=…`). Navega con `Router`/`routerLink`, nunca con `location.href`.
- Shell (`@layout/shell`): pinta el menú lateral (112px), el drawer, el header (80px, sticky, con buscador, Sami/ChatGPT, campana, saludo) y el `<main>` con el padding del prototipo (`padding:0 clamp(16px,4vw,58px) 0 clamp(16px,2.5vw,35px)`). Las páginas se renderizan dentro de ese `<main>`: **no** dupliques menú ni header. El login es una ruta fuera del shell.

## Verificación antes de terminar

1. `npx ng build --configuration development --output-path=dist-<tu-feature>` sin errores en tus archivos (otros agentes trabajan en paralelo en otras features: si ves errores en archivos que no son tuyos, ignóralos y menciónalos). Borra tu carpeta `dist-<tu-feature>` al terminar.
2. Specs de Vitest para la lógica pura (stores, utils, validaciones, cálculos): `npx ng test --watch=false --include='src/app/features/<tu-feature>/**/*.spec.ts'`.
3. Recorre tu sección del prototipo y confirma que no quedó markup, estado ni interacción sin migrar (lista lo que no migraste y por qué).
4. Reporte final corto: archivos creados, qué quedó fuera, dudas, y cualquier cambio que necesites en archivos compartidos.
