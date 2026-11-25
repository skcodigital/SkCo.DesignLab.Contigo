# SkCo.DesignLab.Contigo: guía para trabajar con Claude

Laboratorio de diseño de Contigo: el prototipo «Nuevo Contigo» en Angular 22 (standalone, zoneless, signals,
Vitest), con datos de ejemplo y sin backend. Aquí diseño propone y ajusta; lo que queda en `main` es la referencia
visual que se lleva a producción. Cómo correrlo, el despliegue y la estructura están en el [README](README.md).

## Este repositorio es público

- Solo datos ficticios, como los de `features/*/data/*.mock.ts`. Nunca nombres, documentos, saldos, correos ni
  teléfonos de clientes o asesores reales, aunque sea para probar.
- Nada de URLs internas, hosts de servicios, tokens, client ids ni detalles de las APIs de Contigo.
- No se copia aquí código de los repos de producción que llame servicios: el DesignLab no tiene HTTP.

## Cómo se trabaja

- El trabajo del día a día va a `laboratory` (rama predeterminada), que se publica en GitHub Pages en `/laboratory/`.
- `main` solo recibe PR desde `laboratory` o desde ramas `hotfix/…`. Lo que está en `main` es lo que se lleva a
  producción.
- Las convenciones de código son las de [docs/CONVERSION.md](docs/CONVERSION.md) y son obligatorias: conversión
  píxel-fiel, tokens `--sk-*` de `src/styles/_tokens.scss`, sin sk-components.
- Antes de proponer un cambio: `npx ng test --watch=false` y `npm run build` sin errores.

## De aquí a producción

| Lo que está aquí                                         | Dónde vive en producción                                                    |
| -------------------------------------------------------- | --------------------------------------------------------------------------- |
| `features/dashboard`: Planeación Pro «Tu semana»         | Widget del Home de Contigo: `SkCo.Dashboard.Contigo.Angular` (Azure DevOps) |
| `features/asesoria-pro`: la pestaña en modo misión       | Pestaña Planeación Pro de la ficha: `SkCo.WealthPlanning.Contigo.Angular`   |
| `features/asesoria-pro/journey`: «Acompañamiento en el retiro» | El acompañamiento: `SkCo.WealthPlanningJourney.Contigo.Angular`       |
| `shared/components/descartar-mision-modal`               | La misma especificación en la pestaña y en el widget del Home              |
| `features/monitor`: Monitor del cliente (`/ficha/monitor`) | `SkCo.Monitor.Contigo.Angular` (Azure DevOps). Brief: [docs/MONITOR.md](docs/MONITOR.md) |
| `features/monitor`: Monitor exterior (`/monitor`)        | `SkCo.MonitorExterior.Contigo.Angular` (Azure DevOps)                       |
| `features/ficha-cliente`, `features/login`, `features/radiografia` | Fuera de Planeación Pro: los equipos dueños de esos módulos en Contigo |

1. Diseño cierra el ajuste en `laboratory`, se revisa en Pages y pasa a `main` por PR.
2. Para llevarlo a producción se pide a Claude, en el repo de producción que corresponde, que integre ese ajuste:
   rama y PR a `dev` (en el Home, el flujo de ese repo), con los lineamientos de frontend de Skandia. El PR nombra el
   commit o PR del DesignLab de donde sale.
3. Producción manda en lo que no es diseño: datos, reglas de negocio, servicios y textos ya aprobados por
   Cumplimiento. Si el DesignLab difiere en eso, se corrige aquí para que siga a producción.
4. Todo PR que agregue o cambie textos visibles los lista para Cumplimiento.
5. La documentación funcional (contratos de servicios, reglas, decisiones, ROADMAP) está en `docs/` de
   `SkCo.WealthPlanning.Contigo.Angular`, que es privado. No se copia aquí.

## Quién hace qué

- **Diseño:** propone y ajusta en este repo.
- **Desarrollo:** revisa los PR a `main` de este repo y los PR de producción, y despliega.
- **Líder de Planeación Pro:** decide el alcance y prioriza qué pasa a producción.
