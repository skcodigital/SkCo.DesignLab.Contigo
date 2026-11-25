import { AccionRapida, RespuestaAsistente } from '@features/monitor/interfaces/exterior';

/**
 * Asistente del Monitor exterior: acciones rápidas de producción y respuestas fijas de ejemplo (inventadas: en el
 * laboratorio el asistente no consulta nada). El orden de `RESPUESTAS_ASISTENTE` importa: «Haz un análisis de la
 * gráfica» también dice «gráfica».
 */

/** Demora con la que llega la respuesta (muestra «Escribiendo»). */
export const DEMORA_RESPUESTA_MS = 1200;

export const ACCIONES_RAPIDAS: readonly AccionRapida[] = [
  { clave: 'compare', texto: 'Compara portafolios o indicadores', icono: 'comparar' },
  { clave: 'chart', texto: 'Grafica portafolios o indicadores', icono: 'grafica-linea' },
  { clave: 'analyze', texto: 'Haz un análisis de la gráfica', icono: 'buscar' },
];

export const RESPUESTAS_ASISTENTE: readonly RespuestaAsistente[] = [
  {
    palabras: ['analisis', 'analiza'],
    mensaje: 'Este es un análisis de ejemplo de la gráfica.',
    resumen:
      'En el periodo, los portafolios de renta fija y de liquidez avanzaron de forma estable, mientras las divisas tuvieron más variación.',
    analisis:
      'Los portafolios conservadores mostraron la menor volatilidad del grupo. Las mezclas con más renta variable lograron un retorno mayor, con más oscilaciones en el camino.',
    recomendacion:
      'Revisa también los últimos 12 meses y consulta las fichas técnicas de cada activo antes de conversar con tu cliente.',
  },
  {
    palabras: ['compar'],
    mensaje:
      'Con gusto. Elige en «Selecciona y compara» los portafolios, mezclas, divisas o indicadores que quieras ver juntos y cambia el periodo sobre la gráfica. Por ejemplo: FPV Strategist Conservador, FIC Skandia Efectivo y la inflación en el año en curso.',
  },
  {
    palabras: ['grafic'],
    mensaje:
      'Cada elemento que marques en «Selecciona y compara» aparece en la gráfica de tendencia y en la tabla. Con la «x» de la leyenda lo retiras de la experiencia.',
  },
];

/** Respuesta a cualquier otro texto. */
export const RESPUESTA_GENERAL: RespuestaAsistente = {
  palabras: [],
  mensaje:
    'Esta es una respuesta de ejemplo: en el laboratorio el asistente no consulta datos. Prueba con una de las acciones rápidas para ver cómo responde.',
};
