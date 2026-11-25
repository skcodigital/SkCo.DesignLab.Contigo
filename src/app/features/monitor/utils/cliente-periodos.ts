import { TEXTOS } from '@features/monitor/constants/textos';
import { TEXTOS_CLIENTE } from '@features/monitor/constants/textos-cliente';
import { OpcionSeleccion, RangoFechas } from '@features/monitor/interfaces/comunes';
import { aIso, desdeIso, restarAnios, restarMeses } from '@features/monitor/utils/fechas';

/**
 * Periodos de la página del Monitor del cliente (`OpcionFiltroRango`, `SELECT_OPTIONS` y
 * `getRangeDatesFromSelect` de producción). Su numeración es distinta de la del detalle (`utils/periodos.ts`):
 * aquí está «Desde el inicio».
 */
export const PERIODO_CLIENTE = {
  ultimoMes: 1,
  ultimos3Meses: 2,
  ultimos6Meses: 3,
  anioEnCurso: 4,
  desdeElInicio: 5,
  personalizado: 6,
  ultimos3Anios: 7,
  ultimos5Anios: 8,
  ultimoAnio: 9,
  anioAnterior: 10,
} as const;

/** Periodo con el que abre cada pestaña (`DEFAULT`). */
export const PERIODO_INICIAL_CLIENTE = PERIODO_CLIENTE.anioEnCurso;

const P = TEXTOS.periodos;

/** Opciones de la lista de periodos (las dos pestañas usan las mismas). */
export const OPCIONES_PERIODO_CLIENTE: readonly OpcionSeleccion[] = [
  { nombre: P.ultimoMes, valor: PERIODO_CLIENTE.ultimoMes },
  { nombre: P.ultimos3Meses, valor: PERIODO_CLIENTE.ultimos3Meses },
  { nombre: P.ultimos6Meses, valor: PERIODO_CLIENTE.ultimos6Meses },
  { nombre: P.anioEnCurso, valor: PERIODO_CLIENTE.anioEnCurso },
  { nombre: P.ultimoAnio, valor: PERIODO_CLIENTE.ultimoAnio },
  { nombre: P.anioAnterior, valor: PERIODO_CLIENTE.anioAnterior },
  { nombre: P.ultimos3Anios, valor: PERIODO_CLIENTE.ultimos3Anios },
  { nombre: P.ultimos5Anios, valor: PERIODO_CLIENTE.ultimos5Anios },
  { nombre: P.personalizado, valor: PERIODO_CLIENTE.personalizado },
  { nombre: TEXTOS_CLIENTE.desdeElInicio, valor: PERIODO_CLIENTE.desdeElInicio },
];

/**
 * Rango (ISO) de un periodo a partir de `hoy`. «Desde el inicio» va del primer dato del cliente (`inicioHistoria`)
 * a hoy; «Personalizado» y un valor desconocido no tienen rango (`null`).
 */
export function rangoPeriodoCliente(valor: number, hoy: Date, inicioHistoria: string): RangoFechas | null {
  const fin = aIso(hoy);
  const desde = (fecha: Date): RangoFechas => ({ inicio: aIso(fecha), fin });
  switch (valor) {
    case PERIODO_CLIENTE.ultimoMes:
      return desde(restarMeses(hoy, 1));
    case PERIODO_CLIENTE.ultimos3Meses:
      return desde(restarMeses(hoy, 3));
    case PERIODO_CLIENTE.ultimos6Meses:
      return desde(restarMeses(hoy, 6));
    case PERIODO_CLIENTE.anioEnCurso:
      return desde(new Date(hoy.getFullYear(), 0, 1));
    case PERIODO_CLIENTE.ultimoAnio:
      return desde(restarMeses(hoy, 12));
    case PERIODO_CLIENTE.anioAnterior:
      return { inicio: aIso(new Date(hoy.getFullYear() - 1, 0, 1)), fin: aIso(new Date(hoy.getFullYear() - 1, 11, 31)) };
    case PERIODO_CLIENTE.ultimos3Anios:
      return desde(restarAnios(hoy, 3));
    case PERIODO_CLIENTE.ultimos5Anios:
      return desde(restarAnios(hoy, 5));
    case PERIODO_CLIENTE.desdeElInicio:
      return { inicio: inicioHistoria, fin };
    default:
      return null;
  }
}

/** Meses como los abrevia moment en español, sin el punto («ene», «sep»). */
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'] as const;

function fechaInsignia(iso: string): string {
  const f = desdeIso(iso);
  if (!f) {
    return '';
  }
  const dia = f.getDate() < 10 ? `0${f.getDate()}` : `${f.getDate()}`;
  return `${dia}/${MESES[f.getMonth()]}/${f.getFullYear()}`;
}

/**
 * Rango que se muestra junto a la lista (`dateRangeBadge`, «01/ene/2026 - 12/nov/2026»): vacío con «Desde el
 * inicio» y con «Personalizado».
 */
export function insigniaRango(valor: number, rango: RangoFechas): string {
  if (valor === PERIODO_CLIENTE.desdeElInicio || valor === PERIODO_CLIENTE.personalizado) {
    return '';
  }
  return `${fechaInsignia(rango.inicio)} - ${fechaInsignia(rango.fin)}`;
}

/** Nombre del periodo para «Fecha seleccionada: …» (`selectedRangeLabel`). */
export function etiquetaPeriodoCliente(valor: number): string {
  return OPCIONES_PERIODO_CLIENTE.find((o) => o.valor === valor)?.nombre ?? TEXTOS_CLIENTE.rangoDesconocido;
}
