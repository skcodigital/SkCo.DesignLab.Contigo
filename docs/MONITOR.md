# Monitor Contigo en el laboratorio: brief de conversión

El Monitor de producción se trae al laboratorio **tal como se ve hoy en Contigo**, para que diseño lo rediseñe aquí.
Es una conversión píxel-fiel a producción (no al prototipo HTML): mismas pantallas, estados, textos e interacciones,
con las reglas de [CONVERSION.md](CONVERSION.md), que son obligatorias. Este documento agrega lo propio del Monitor.

## Las dos vistas

| Ruta             | Web component de producción                         | Qué es                                                                                       | Página del laboratorio                         |
| ---------------- | --------------------------------------------------- | -------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| `/monitor`       | `<monitor-exterior-element>` (SkCo.MonitorExterior) | «Monitor Contigo · Análisis avanzado de portafolios y rendimiento», desde Inicio y el menú Operativo → Monitor | `pages/monitor-exterior-page`                  |
| `/ficha/monitor` | `<monitor-element>` (SkCo.Monitor)                  | El Monitor del cliente: contratos y portafolios de Óscar, desde Productos → «Monitor Contigo» | `pages/monitor-cliente-page` (en el layout de la ficha) |

Los dos repos de producción son privados y vienen del mismo código: muchos componentes están repetidos con pequeñas
diferencias. Aquí se convierten **una sola vez** y se comparten entre las dos páginas.

## Estructura

```
src/app/features/monitor/
  pages/monitor-exterior-page/   pages/monitor-cliente-page/
  components/
    comunes/    piezas sin negocio: gráfica (ECharts), tabla, leyenda, selector de fechas, desplegable,
                casillas, periodo en móvil, tarjetas de rendimiento, sin datos, grupo de botones
    detalle/    el detalle del Monitor (tendencia, detalle del portafolio, documentos, rendimientos, rebalanceos,
                riesgo y retorno, listas de comparación: referencias, mezclas y CDT)
    cliente/    solo del Monitor del cliente (transacciones, comparar, filtro, visor de documentos)
    exterior/   solo del Monitor exterior (asistente, divisas e indicadores, lista de portafolios, SAMI, barra superior)
  data/         *.mock.ts (datos ficticios)          interfaces/   modelos de vista
  constants/    textos*.ts                           utils/        funciones puras con *.spec.ts y echarts.ts
  stores/       estado-cliente de cada página (signals, cero I/O)
```

- Selectores con prefijo `nc-mon-`; archivos y clases como en CONVERSION.md (sin `.component`, sin `Component`).
- Cada página orquesta; los componentes reciben datos por `input()` y avisan con `output()`.

## Qué no se trae

Nada de esto existe en el laboratorio, que es público y no tiene backend:

- Servicios, HTTP, interceptores, autenticación, cifrado de peticiones, analítica (Service Bus / Event Hub y sus
  claves), caché en IndexedDB y lectura de `localStorage` / `sessionStorage` del portal.
- Nombres de endpoints, de campos de las APIs ni URLs: los modelos de `interfaces/` son modelos de vista, en español.
- Generar PDF o imagen (html2canvas, visor de PDF) y descargar archivos: se pinta el botón y, al usarlo, se muestra un
  aviso con `AvisoStore` («En el laboratorio no se descargan archivos»).
- Respuestas reales de SAMI: el chat y el resumen usan respuestas de ejemplo fijas.
- Bootstrap, ng-bootstrap, sweetalert2, moment y ngx-skeleton-loader: se reemplazan por SCSS del componente, modales
  propios y `Intl` / `Date`. Los estados de carga se pueden omitir (los datos son síncronos); los de error y sin datos
  sí se convierten.

## Datos de ejemplo

- **Todo es ficticio.** Nunca se copian mocks ni respuestas de producción, aunque parezcan de prueba.
- **Monitor del cliente:** Óscar, con los contratos y portafolios de `features/ficha-cliente/data` (Multifund
  100000063061 y FIC Efectivo 301000052847, «hoy» = 12 de noviembre de 2026). Las cifras del Monitor deben cuadrar
  con las de la ficha.
- **Monitor exterior:** portafolios, fondos, indicadores, divisas y CDT con cifras inventadas. Los nombres de
  portafolios y productos pueden ser los públicos de Skandia; las rentabilidades, saldos y series, no.
- Las series para las gráficas se generan con funciones deterministas (sin `Math.random`) para que las pruebas y la
  vista sean estables.

## Escenarios para revisar el diseño

| URL                               | Qué muestra                                                        |
| --------------------------------- | ------------------------------------------------------------------ |
| `/monitor`                        | Monitor exterior vacío, como arranca en producción                 |
| `/monitor?estado=ejemplo`         | Con una selección de ejemplo ya comparada                          |
| `/monitor?estado=ejemplo-cdt`     | Con una selección que incluye CDT                                  |
| `/monitor?estado=error`           | El error de cada lista y de la comparación                         |
| `/ficha/monitor`                  | Monitor del cliente con los contratos de Óscar                     |
| `/ficha/monitor?estado=error`     | El error de cada módulo                                            |
| `/ficha/monitor?estado=sin-datos` | Un cliente sin productos                                           |

## Estilos de producción que no están en los repos

El portal de Contigo pone una guía de estilos global y una fuente de iconos que no están en el código del Monitor.
Lo que sí está en los `styles.scss` de producción (`text-body-*`, `sk-green`, `sk-gray`, `btn-icon-custom`…) se copia
con sus valores. Para lo demás:

| En producción                                  | Aquí                                                                                     |
| ---------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `sk-h3` / `sk-h4` / `sk-h5`                    | `var(--sk-font-heading)`, 24 / 20 / 18px (el peso lo da `fw-bold` u otro modificador)      |
| `sk-b1` / `sk-b2` / `sk-b3` / `sk-b4`          | `var(--sk-font-body)`, 16 / 14 / 12 / 10px                                               |
| `sk-btn`, `sk-btn-primary`, `sk-btn-outline-primary` | Botón en el SCSS del componente: verde `var(--sk-color-primary)`, texto blanco (o borde verde en *outline*) |
| Utilidades de Bootstrap (`d-flex`, `row`, `col-md-6`, `gap-2`, `mb-3`, `d-none d-md-flex`…) | Reglas equivalentes en el SCSS del componente, con los mismos valores de Bootstrap 5 (espaciado 4/8/16/24/48px, punto de corte 768px) |
| Fuente de iconos (`icon-Calendar-line`, `icon-Download-line`…) | SVG en línea con trazo 2 y `currentColor`, del mismo tamaño |
| `ngb-alert`, `ngbTooltip`, `ngbDropdown`, modales | Marcado y SCSS propios del componente                                                     |

Si una equivalencia no es exacta, se deja anotada en el reporte final.

## Gráficas (ECharts)

- `echarts` es dependencia del laboratorio. Se importa de forma modular desde `echarts/core` y se registran solo los
  módulos que se usan, una vez, en `features/monitor/utils/echarts.ts`.
- Un solo componente base, `components/comunes/grafica`, monta la gráfica: `opciones = input.required<EChartsCoreOption>()`,
  `init` en `afterNextRender`, `setOption` cuando cambian las opciones, `resize` con `ResizeObserver` y `dispose` al
  destruirse. Las demás gráficas solo arman sus opciones (funciones puras, con pruebas).
- Las opciones (colores, ejes, tooltips, leyendas) copian las de producción.

## Quién toca qué

Cada etapa solo crea o cambia archivos de su carpeta. Lo compartido (rutas, `core`, `layout`, `ficha-cliente`) ya
quedó listo y no se toca.

| Etapa                  | Carpetas                                                                                                   |
| ---------------------- | ---------------------------------------------------------------------------------------------------------- |
| 1 · Base               | `components/comunes`, `utils`, `interfaces/comunes.ts`, `constants/textos.ts`                              |
| 2 · Detalle            | `components/detalle`, `interfaces/detalle.ts`, `data/detalle*.mock.ts`, `utils/detalle*`                   |
| 3a · Monitor del cliente | `pages/monitor-cliente-page`, `components/cliente`, `stores/monitor-cliente*`, `data/cliente*`, `interfaces/cliente.ts`, `constants/textos-cliente.ts` |
| 3b · Monitor exterior  | `pages/monitor-exterior-page`, `components/exterior`, `stores/monitor-exterior*`, `data/exterior*`, `interfaces/exterior.ts`, `constants/textos-exterior.ts` |

## Verificación de cada etapa

Las de CONVERSION.md, con estas salidas:

1. `npx ng build --configuration development --output-path=dist-monitor-<etapa>` sin errores; se borra la carpeta al
   terminar.
2. `npx ng test --watch=false --include='src/app/features/monitor/**/*.spec.ts'`.
3. Reporte final: archivos, qué quedó fuera y por qué, equivalencias de estilo aproximadas y textos visibles nuevos.
