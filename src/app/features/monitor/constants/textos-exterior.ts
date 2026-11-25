/**
 * Textos que arma el TS de la página del Monitor exterior (los del template viven en cada template). Copiados de
 * producción; los propios del laboratorio están marcados.
 */
export const TEXTOS_EXTERIOR = {
  /** Tooltip del botón de pantallazo. */
  tooltipPantallazo: 'Toma un pantallazo de toda la información visible',

  /** Propio del laboratorio: reemplaza abrir el Monitor antiguo (en producción abre otra aplicación). */
  sinMonitorAntiguo: 'En el laboratorio no se abre el Monitor antiguo',

  portafolios: {
    clasificacion: 'Clasificación',
    perfilRiesgo: 'Perfil de riesgo',
    /** Perfil `NA`. */
    otros: 'Otros',
    desactualizado: (fecha: string) => `Datos desactualizados. Última fecha de valor unitario: ${fecha}`,
  },

  asistente: {
    resumen: (texto: string) => `📝 Resumen: ${texto}`,
    analisis: (texto: string) => `🔍 Análisis: ${texto}`,
    recomendacion: (texto: string) => `💡 Recomendación: ${texto}`,
  },
} as const;
