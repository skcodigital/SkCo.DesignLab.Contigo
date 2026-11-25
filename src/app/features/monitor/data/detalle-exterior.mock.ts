import { ActivoComparado, DefinicionActivo } from '@features/monitor/interfaces/detalle';
import {
  CDT_COMPARABLES,
  HOY_MONITOR,
  INDICADORES,
  MEZCLAS_COMPARABLES,
  PLAZOS_CDT,
  PORTAFOLIOS_SKANDIA,
  REFERENCIAS_COMPARABLES,
} from '@features/monitor/data/detalle-catalogos.mock';
import { activosComparados } from '@features/monitor/utils/detalle-activos';
import { PERIODO, rangoPorPeriodo } from '@features/monitor/utils/periodos';

/**
 * Monitor exterior: selecciones de ejemplo de «Compara» para la comparación (`nc-mon-comparacion`). Las páginas
 * arman las suyas con `activosComparados(definiciones, rango, hoy, PLAZOS_CDT)` cada vez que cambia el periodo.
 */

const buscar = (lista: readonly DefinicionActivo[], clave: string): DefinicionActivo =>
  lista.find((d) => d.clave === clave) ?? lista[0];

/** Periodo con el que arranca el Monitor exterior: «Año en curso (YTD)». */
export const PERIODO_INICIAL_EXTERIOR = PERIODO.anioEnCurso;

/** Selección de ejemplo: dos portafolios Skandia, el dólar, la inflación (UVR), una mezcla y una referencia. */
export const SELECCION_EXTERIOR_EJEMPLO: readonly DefinicionActivo[] = [
  buscar(PORTAFOLIOS_SKANDIA, 'FPVSTGCONS'),
  buscar(PORTAFOLIOS_SKANDIA, 'FICEFECTIVO'),
  buscar(INDICADORES, 'US$'),
  buscar(INDICADORES, 'UVR'),
  buscar(MEZCLAS_COMPARABLES, 'PACIENTE'),
  buscar(REFERENCIAS_COMPARABLES, '1_AA02'),
];

/** La misma selección con un CDT a 90 días: todo pasa a tasa (rentabilidad móvil a 90 días). */
export const SELECCION_EXTERIOR_CON_CDT: readonly DefinicionActivo[] = [
  ...SELECCION_EXTERIOR_EJEMPLO.filter((d) => d.tipo !== 'divisa' && d.tipo !== 'indicador'),
  buscar(CDT_COMPARABLES, 'CDT-90'),
];

/** Activos del ejemplo en el año en curso, listos para `nc-mon-comparacion`. */
export const ACTIVOS_EXTERIOR_EJEMPLO: readonly ActivoComparado[] = activosComparados(
  SELECCION_EXTERIOR_EJEMPLO,
  rangoPorPeriodo(PERIODO_INICIAL_EXTERIOR, HOY_MONITOR),
  HOY_MONITOR,
  PLAZOS_CDT,
);

/** Activos del ejemplo con CDT en el año en curso. */
export const ACTIVOS_EXTERIOR_CON_CDT: readonly ActivoComparado[] = activosComparados(
  SELECCION_EXTERIOR_CON_CDT,
  rangoPorPeriodo(PERIODO_INICIAL_EXTERIOR, HOY_MONITOR),
  HOY_MONITOR,
  PLAZOS_CDT,
);
