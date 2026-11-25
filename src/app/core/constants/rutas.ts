/** Segmentos de ruta de la app. Equivalen a los enlaces directos del prototipo (?p=…). */
export const RUTAS = {
  login: 'login',
  inicio: 'inicio',
  ficha: 'ficha',
  producto: 'producto',
  radiografia: 'radiografia',
  /** Monitor Contigo: `/monitor` (desde el menú Operativo) y `/ficha/monitor` (el del cliente, desde Productos). */
  monitor: 'monitor',
} as const;

/** Vista que se reabre al volver a la app en la misma sesión (sessionStorage `nc-vista`). */
export type VistaGuardada =
  | typeof RUTAS.inicio
  | typeof RUTAS.ficha
  | typeof RUTAS.radiografia
  | typeof RUTAS.monitor;
