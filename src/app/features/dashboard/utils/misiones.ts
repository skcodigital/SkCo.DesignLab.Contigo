import { Descarte } from '@core/state/misiones.store';
import {
  CLIENTES_EJEMPLO,
  COMPLETADAS_POR_ASESOR,
  MISIONES_POR_SEMANA,
  SALDOS_EJEMPLO,
  SEGMENTOS_EJEMPLO,
} from '../data/misiones.mock';
import { Mision, MisionCompletada, SemanaMisiones } from '../interfaces/mision';

/**
 * Semana de misiones (datos de ejemplo) del asesor `i` del selector de Logros: la ve el director en solo lectura.
 * Misma estructura que la semana propia, con otros clientes; las completadas van al final.
 */
export function misionesDeAsesor(i: number): SemanaMisiones {
  const completadasN = COMPLETADAS_POR_ASESOR[i] ?? 0;
  const pendientesN = MISIONES_POR_SEMANA - completadasN;
  const pendientes: Mision[] = [];
  const completadas: MisionCompletada[] = [];
  for (let k = 0; k < MISIONES_POR_SEMANA; k++) {
    const nombre = CLIENTES_EJEMPLO[(i * 3 + k) % CLIENTES_EJEMPLO.length];
    if (k >= pendientesN) {
      completadas.push({ nombre, texto: `Acuerdo registrado el ${16 + (k % 3)} nov` });
      continue;
    }
    const seguimiento = k === 0 && i % 2 === 0;
    pendientes.push({
      id: 'x' + k,
      nombre,
      segmento: SEGMENTOS_EJEMPLO[(i + k) % SEGMENTOS_EJEMPLO.length],
      chip: seguimiento ? 'seg' : 'alta',
      saldo: SALDOS_EJEMPLO[k],
      origen: seguimiento ? 'acuerdo' : k === 1 ? 'sami' : 'lista',
      origenTexto: seguimiento
        ? 'Inició la conversación el 13 nov'
        : k === 1
          ? 'Sami ya le escribió'
          : `En la lista desde el ${5 + k * 4} oct`,
    });
  }
  return { pendientes, completadas };
}

/** Quita de la lista las misiones descartadas (en el dashboard o en la ficha del cliente). */
export function sinDescartes(misiones: readonly Mision[], descartes: Readonly<Record<string, Descarte>>): Mision[] {
  return misiones.filter((m) => !(m.id in descartes));
}

/** Índice válido para la misión destacada: si la lista se acorta, queda en la última. */
export function indiceValido(indice: number, largo: number): number {
  return Math.max(0, Math.min(indice, largo - 1));
}
