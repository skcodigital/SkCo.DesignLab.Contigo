import { ACCIONES_RAPIDAS, RESPUESTA_GENERAL, RESPUESTAS_ASISTENTE } from '@features/monitor/data/exterior-asistente.mock';
import {
  agregarMensaje,
  respuestaAsistente,
  sinTildes,
  textoRespuesta,
} from '@features/monitor/utils/exterior-asistente';

describe('exterior-asistente', () => {
  it('cada acción rápida tiene su respuesta (el análisis aunque diga «gráfica»)', () => {
    const [comparar, graficar, analizar] = ACCIONES_RAPIDAS;
    expect(respuestaAsistente(comparar.texto)).toBe(RESPUESTAS_ASISTENTE[1]);
    expect(respuestaAsistente(graficar.texto)).toBe(RESPUESTAS_ASISTENTE[2]);
    expect(respuestaAsistente(analizar.texto)).toBe(RESPUESTAS_ASISTENTE[0]);
    expect(respuestaAsistente('Hola')).toBe(RESPUESTA_GENERAL);
    expect(sinTildes('ANÁLISIS Gráfica')).toBe('analisis grafica');
  });

  it('arma el texto con el formato de producción', () => {
    const texto = textoRespuesta(RESPUESTAS_ASISTENTE[0]);
    const partes = texto.split('\n\n');
    expect(partes.length).toBe(4);
    expect(partes[1].startsWith('📝 Resumen: ')).toBe(true);
    expect(partes[2].startsWith('🔍 Análisis: ')).toBe(true);
    expect(partes[3].startsWith('💡 Recomendación: ')).toBe(true);
    expect(textoRespuesta(RESPUESTA_GENERAL)).toBe(RESPUESTA_GENERAL.mensaje);
  });

  it('agrega mensajes con ids consecutivos', () => {
    const uno = agregarMensaje([], 'usuario', 'Hola');
    const dos = agregarMensaje(uno, 'asistente', 'Respuesta');
    expect(dos).toEqual([
      { id: 1, remitente: 'usuario', texto: 'Hola' },
      { id: 2, remitente: 'asistente', texto: 'Respuesta' },
    ]);
  });
});
