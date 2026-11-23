// Ajustes de alcance de esta versión del prototipo (Lote 1 · ajustes del equipo comercial, 2026-11-17).
// En el prototipo se ocultaban con CSS (`display: none !important`); aquí son banderas que el template respeta.

/**
 * Q-09: la ruta de acción no sale en esta versión. Se conserva migrada (CTA "Crear Ruta de Acción",
 * estados vacíos, seguimiento, acciones por meta, tag de estado del plan) pero no se muestra.
 * Con `false`, la Ruta comercial muestra siempre el título y las cajitas del diagnóstico.
 */
export const RUTA_ACCION_VISIBLE = false;

/** C-04: las lecturas automáticas (`.sk-alert--reading`) no salen por ahora. */
export const LECTURAS_AUTOMATICAS_VISIBLES = false;

/** Tarjetas de posición bajo la franja de identidad: omitidas por ahora (en el prototipo, `hidden`). */
export const TARJETAS_POSICION_VISIBLES = false;
