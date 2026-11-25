import { TEXTOS_EXTERIOR } from '@features/monitor/constants/textos-exterior';
import { RESPUESTA_GENERAL, RESPUESTAS_ASISTENTE } from '@features/monitor/data/exterior-asistente.mock';
import { MensajeAsistente, RemitenteMensaje, RespuestaAsistente } from '@features/monitor/interfaces/exterior';

/**
 * Asistente del Monitor exterior sin servicios: elige una respuesta fija según el texto y la arma con el formato de
 * producción (`handleAPIResponse`): el mensaje y, si hay análisis, «📝 Resumen», «🔍 Análisis» y
 * «💡 Recomendación», separados por una línea en blanco.
 */

const A = TEXTOS_EXTERIOR.asistente;

/** Minúsculas y sin tildes, para buscar palabras. */
export function sinTildes(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

/** Respuesta fija para un texto: la primera cuyas palabras aparecen, o la general. */
export function respuestaAsistente(texto: string): RespuestaAsistente {
  const t = sinTildes(texto);
  return RESPUESTAS_ASISTENTE.find((r) => r.palabras.some((p) => t.includes(p))) ?? RESPUESTA_GENERAL;
}

/** Texto del mensaje del asistente. */
export function textoRespuesta(r: RespuestaAsistente): string {
  let texto = r.mensaje ? `${r.mensaje}\n\n` : '';
  if (r.resumen) {
    texto += `${A.resumen(r.resumen)}\n\n`;
  }
  if (r.analisis) {
    texto += `${A.analisis(r.analisis)}\n\n`;
  }
  if (r.recomendacion) {
    texto += A.recomendacion(r.recomendacion);
  }
  return texto.trim();
}

/** La conversación con un mensaje más al final. */
export function agregarMensaje(
  mensajes: readonly MensajeAsistente[],
  remitente: RemitenteMensaje,
  texto: string,
): MensajeAsistente[] {
  const id = mensajes.reduce((max, m) => Math.max(max, m.id), 0) + 1;
  return [...mensajes, { id, remitente, texto }];
}
