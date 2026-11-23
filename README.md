# SkCo.DesignLab.Contigo

Prototipo **Nuevo Contigo** (UX, `ux-prototypes/projects/nuevo-contigo/v1`) convertido a Angular 22: misma apariencia y comportamiento, pero con componentes, rutas y estado en signals. Sirve de laboratorio de diseño para llevar las propuestas de UX a código Angular reutilizable.

## Cómo correrlo

```bash
npm install
npm start            # http://localhost:4200
npm run build        # producción en dist/
npx ng test --watch=false
```

## Rutas (antes enlaces directos `?p=…`)

| Ruta | Vista | Antes |
|---|---|---|
| `/login` | Login + restablecer contraseña (abrirla cierra la sesión) | `?p=login` |
| `/inicio` | Dashboard del asesor: Planeación Pro «Tu semana» y Logros | `?p=inicio` |
| `/ficha` | Ficha de Óscar Camilo Hernández Ramírez (`?tab=copiloto\|productos\|…`) | `?p=ficha` |
| `/ficha/producto` | Ficha del producto «Potencializar mi inversión» | — |
| `/radiografia` | Radiografía de Empresa ABC S.A. (`?plan=sin`, `?rol=dueno\|fp`, `?tab=…`) | `?p=radiografia&…` |

Como en el prototipo, un enlace directo a cualquier vista entra sin pasar por el login (`entrarDirectoGuard`), y la raíz `/` abre el login o la última vista de la sesión.

## Estructura

```
src/app/
  core/        constants (rutas, breakpoints), guards, utils, state (UiStore, SessionStore, MisionesStore, AvisoStore)
  shared/      componentes compartidos entre features (modal «Descartar misión», toast)
  layout/      shell: menú lateral + drawer, header con buscador, pie
  features/
    login/         login y restablecer contraseña
    dashboard/     Planeación Pro (semana) y Logros del mes
    ficha-cliente/ ficha del cliente, productos, ficha del producto, retiros en curso
    asesoria-pro/  pestaña Planeación Pro en modo misión + journey «Acompañamiento en el retiro»
    radiografia/   radiografía de empresa (con y sin plan de ahorro corporativo)
src/styles/    _tokens.scss (tokens --sk-*) y _base.scss (reset, utilidades, modo misión)
docs/          prototipo original de referencia y brief de conversión
```

## Decisiones

- **Píxel-fiel**: se conservan los estilos del prototipo, repartidos por componente; los colores que coinciden con un token usan `var(--sk-*)` (`src/styles/_tokens.scss`). No usa sk-components.
- **Modos de página** (modo misión, journey abierto, vista de producto, menú móvil…): el prototipo los ponía como clases de `<body>`. Aquí viven en `UiStore` y la raíz los refleja en `<body>`, así los componentes reaccionan con `:host-context(.modo-mision)` sin acoplarse.
- **Sin backend**: los datos son los de ejemplo del prototipo, tipados en `features/*/data/*.mock.ts`.
- **Vista previa Escritorio / Móvil** (control del prototipo, abajo al centro): «Móvil» muestra la página actual dentro de un teléfono de 375px (la misma app en un iframe con `?embed=1`); la URL de afuera sigue al teléfono con `#movil`, y un enlace con `#movil` abre directo en móvil. Se oculta en pantallas ≤768px.
- **Fuera de alcance**: grabador de pruebas (`?prueba=`), sección Recursos y el selector flotante de vista de la radiografía (los roles llegan por `?rol=`).
