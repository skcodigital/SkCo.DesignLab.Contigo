import { TEXTOS } from '@features/monitor/constants/textos';
import { OpcionSeleccion, PildoraPeriodo, RangoFechas } from '@features/monitor/interfaces/comunes';
import { aIso, desdeIso, MESES_RANGO, restarAnios, restarMeses } from '@features/monitor/utils/fechas';

/**
 * Periodos de las secciones de detalle (tendencia, evolución de un activo, selector móvil): `DateRangeOption`,
 * `SELECT_OPTIONS`, `MOBILE_PERIOD_PILLS`, `getDateRangeByOption` y `getDisplayDateRange` de producción.
 * La página del Monitor del cliente usa otra numeración (con «Desde el inicio»); esa es de la etapa 3.
 */
export const PERIODO = {
  ultimoMes: 1,
  ultimos3Meses: 2,
  ultimos6Meses: 3,
  anioEnCurso: 4,
  ultimoAnio: 5,
  anioAnterior: 6,
  ultimos3Anios: 7,
  ultimos5Anios: 8,
  personalizado: 10,
} as const;

export type Periodo = (typeof PERIODO)[keyof typeof PERIODO];

const P = TEXTOS.periodos;

export const OPCIONES_PERIODO: readonly OpcionSeleccion[] = [
  { nombre: P.ultimoMes, valor: PERIODO.ultimoMes },
  { nombre: P.ultimos3Meses, valor: PERIODO.ultimos3Meses },
  { nombre: P.ultimos6Meses, valor: PERIODO.ultimos6Meses },
  { nombre: P.anioEnCurso, valor: PERIODO.anioEnCurso },
  { nombre: P.ultimoAnio, valor: PERIODO.ultimoAnio },
  { nombre: P.anioAnterior, valor: PERIODO.anioAnterior },
  { nombre: P.ultimos3Anios, valor: PERIODO.ultimos3Anios },
  { nombre: P.ultimos5Anios, valor: PERIODO.ultimos5Anios },
  { nombre: P.personalizado, valor: PERIODO.personalizado },
];

export const PILDORAS_PERIODO: readonly PildoraPeriodo[] = [
  { etiqueta: P.pildoraUltimoMes, valor: PERIODO.ultimoMes },
  { etiqueta: P.pildoraUltimos6Meses, valor: PERIODO.ultimos6Meses },
  { etiqueta: P.pildoraUltimos12Meses, valor: PERIODO.ultimoAnio },
];

/**
 * Rango de fechas (ISO) de un periodo a partir de `hoy`. «Personalizado» no trae fechas; un valor desconocido
 * cae en «Último mes», como producción.
 */
export function rangoPorPeriodo(valor: number | string, hoy: Date): RangoFechas {
  const fin = aIso(hoy);
  switch (Number(valor)) {
    case PERIODO.ultimos3Meses:
      return { inicio: aIso(restarMeses(hoy, 3)), fin };
    case PERIODO.ultimos6Meses:
      return { inicio: aIso(restarMeses(hoy, 6)), fin };
    case PERIODO.anioEnCurso:
      return { inicio: aIso(new Date(hoy.getFullYear(), 0, 1)), fin };
    case PERIODO.ultimoAnio:
      return { inicio: aIso(restarAnios(hoy, 1)), fin };
    case PERIODO.anioAnterior:
      return {
        inicio: aIso(new Date(hoy.getFullYear() - 1, 0, 1)),
        fin: aIso(new Date(hoy.getFullYear() - 1, 11, 31)),
      };
    case PERIODO.ultimos3Anios:
      return { inicio: aIso(restarAnios(hoy, 3)), fin };
    case PERIODO.ultimos5Anios:
      return { inicio: aIso(restarAnios(hoy, 5)), fin };
    case PERIODO.personalizado:
      return { inicio: '', fin: '' };
    default:
      return { inicio: aIso(restarMeses(hoy, 1)), fin };
  }
}

/** `DD/Mmm/YYYY` del rango que se muestra junto al selector (p. ej. «12/Nov/2026»). */
function fechaRango(iso: string): string {
  const fecha = desdeIso(iso);
  if (!fecha) {
    return '';
  }
  const dia = fecha.getDate() < 10 ? `0${fecha.getDate()}` : `${fecha.getDate()}`;
  return `${dia}/${MESES_RANGO[fecha.getMonth()]}/${fecha.getFullYear()}`;
}

/** Rango visible del periodo; con «Personalizado» usa el rango elegido en el selector de fechas. */
export function rangoVisible(valor: number | string, personalizado: RangoFechas, hoy: Date): RangoFechas {
  const rango = Number(valor) === PERIODO.personalizado ? personalizado : rangoPorPeriodo(valor, hoy);
  return { inicio: fechaRango(rango.inicio), fin: fechaRango(rango.fin) };
}
