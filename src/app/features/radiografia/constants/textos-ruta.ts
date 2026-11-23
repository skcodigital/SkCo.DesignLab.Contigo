// Textos y ajustes propios de la ruta de acción (Ruta comercial, modales de crear/editar/descartar).

/**
 * El listado aparte de la ruta (`#plan-seg` en el director, `#ruta-own` en el FP Asignado) ya no se muestra:
 * todo vive en las cajitas. Se conserva migrado (Lograda / Descartar / Deshacer) por si vuelve.
 */
export const LISTADO_METAS_VISIBLE = false;

/** "Incluir en la ruta de acción" en las cajitas del director: oculto en el prototipo (`#ruta-pasos .step-check`). */
export const CHECK_INCLUIR_VISIBLE = false;

export const TEXTOS_RUTA = {
  ultimaModificacion: 'Última modificación: ',
  porTi: 'ti',
  directorComercial: 'tu director comercial',
  fpAsignadoConRol: 'Juan Alberto Rodríguez González (FP Asignado)',
  elFpAsignado: 'el FP Asignado',
  elFpAsignadoMayus: 'El FP Asignado',
  laRecibio: ' la recibió a su correo y como notificación en Contigo. ',
  recibiste: ' recibiste a tu correo y como notificación en Contigo. ',
  tituloCrear: 'Crear Ruta de Acción',
  tituloEditar: 'Editar ruta de acción',
  botonCrear: 'Crear Ruta de Acción',
  botonGuardar: 'Guardar cambios',
  enviada: 'Ruta de acción enviada',
  actualizada: 'Ruta de acción actualizada',
  editadaSugerida: 'Editada · sugerida: ',
  metaSugerida: '· Meta sugerida',
  usarSugerida: 'Usar la sugerida',
  editada: 'editada',
  sinMetas: 'La ruta no tiene metas. Puedes añadirlas desde Editar ruta.',
  estado: { curso: '', lograda: 'Lograda', descartada: 'Descartada' },
  descartarMeta: 'Descartar meta: ',
  cumplimiento: 'Cumplimiento de la meta',
} as const;
