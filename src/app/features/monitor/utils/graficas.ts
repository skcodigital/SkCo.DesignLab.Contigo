import { TEXTOS } from '@features/monitor/constants/textos';
import { VistaMonitor } from '@features/monitor/interfaces/comunes';

/**
 * Ayudas puras de las gráficas del Monitor: paletas, ejes Y, valores atípicos y posición de tooltips
 * (`graphColors`, `getOutlierThresholds`, `calculateYAxisRange`, `defaultPosition`… de producción).
 */

const PALETA_BASE = [
  '#A1DD70', '#A4D7E1', '#63AABC', '#FF9460', '#8BA2C1', '#F67E7D', '#6A7491', '#FECD72', '#95DBB7', '#FFBF9F',
  '#BC6995', '#D9D052', '#D6C09C', '#ED3833', '#CBA1D2', '#C5D8A4', '#368CB5', '#00F59F', '#F50CC9', '#83A488',
  '#FCF9C6', '#B2F9FC', '#BF9078', '#9EB23B', '#73777B', '#FFE2E2', '#36D6E0', '#ABA09D', '#B5D1FF',
] as const;

/**
 * Paleta de las series (`graphColors`). El Monitor del cliente tiene 31 colores (con `#ECFFB5`); el exterior,
 * 30: a partir de la posición 29 los colores cambian entre vistas.
 */
export const COLORES_GRAFICA: Readonly<Record<VistaMonitor, readonly string[]>> = {
  cliente: [...PALETA_BASE, '#ECFFB5', '#6F32C6'],
  exterior: [...PALETA_BASE, '#6F32C6'],
};

/** Segunda paleta (`graphColorsV2`), igual en las dos vistas: activos agregados con «Comparar». */
export const COLORES_GRAFICA_COMPARAR: readonly string[] = [
  '#3B82F6', '#F59E0B', '#10B981', '#EF4444', '#8B5CF6', '#14B8A6', '#EAB308', '#F472B6', '#22C55E', '#6366F1',
  '#D946EF', '#F97316', '#06B6D4', '#4ADE80', '#A855F7', '#EC4899', '#84CC16', '#0EA5E9', '#FB7185', '#FACC15',
  '#60A5FA', '#34D399', '#C084FC', '#FBBF24', '#2DD4BF', '#E879F9', '#BE123C', '#15803D', '#2563EB', '#9333EA',
];

/** Color de la serie `indice` (da la vuelta a la paleta). */
export function colorSerie(indice: number, paleta: readonly string[]): string {
  return paleta[indice % paleta.length];
}

/**
 * Nombre visible de un indicador o divisa: la UVR se muestra como «Inflación» (también con el sufijo de plazo
 * que trae con CDT, p. ej. «UVR_30»); el resto conserva su nombre.
 */
export function nombreIndicador(id: string | null | undefined, nombre?: string): string {
  const clave = (id ?? '').trim().toUpperCase();
  if (clave === 'UVR' || clave.startsWith('UVR_')) {
    return TEXTOS.inflacion.nombre;
  }
  return nombre ?? id ?? '';
}

/** Trunca (sin redondear) a 2 decimales: indicadores y divisas se muestran tal cual llegan. */
export function truncarDosDecimales(valor: number | string): number {
  return Math.trunc(Number(valor) * 100) / 100;
}

/** `true` si es un número real (null, '' y NaN no cuentan; un 0 sí). */
export function esNumerico(valor: unknown): boolean {
  return valor != null && valor !== '' && !Number.isNaN(Number(valor));
}

/** Percentil lineal sobre valores ya ordenados. */
export function percentil(ordenados: readonly number[], p: number): number {
  const indice = (p / 100) * (ordenados.length - 1);
  const abajo = Math.floor(indice);
  const arriba = Math.ceil(indice);
  const peso = indice - abajo;
  return abajo === arriba ? ordenados[abajo] : ordenados[abajo] * (1 - peso) + ordenados[arriba] * peso;
}

/**
 * Umbrales de valores atípicos: percentiles 0,5 y 99,5 con un margen del 10 % del rango (mínimo 20). Sin valores
 * devuelve [0, 0]; con `minimoValores` (la gráfica de contratos usa 4) y menos valores, no descarta ninguno.
 */
export function umbralesAtipicos(valores: readonly number[], minimoValores?: number): [number, number] {
  if (minimoValores !== undefined && valores.length < minimoValores) {
    return [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER];
  }
  if (!valores.length) {
    return [0, 0];
  }
  const ordenados = [...valores].sort((a, b) => a - b);
  const abajo = percentil(ordenados, 0.5);
  const arriba = percentil(ordenados, 99.5);
  const margen = Math.max((arriba - abajo) * 0.1, 20);
  return [abajo - margen, arriba + margen];
}

/** Eje Y de valores: 1 % por debajo del mínimo y 3 % por encima del máximo, en enteros. */
export function rangoEjeY(valores: readonly number[]): { yMin: number; yMax: number } {
  return {
    yMin: Math.floor(Math.min(...valores) * 0.99),
    yMax: Math.ceil(Math.max(...valores) * 1.03),
  };
}

/** Eje Y de tasas (con CDT, pueden ser negativas): margen del 5 % del rango, mínimo 0,5. */
export function rangoEjeYTasa(valores: readonly number[]): { yMin: number; yMax: number } {
  const min = Math.min(...valores);
  const max = Math.max(...valores);
  const margen = Math.max((max - min) * 0.05, 0.5);
  return { yMin: Math.floor(min - margen), yMax: Math.ceil(max + margen) };
}

/** Serie con sus puntos (`value`), para el rango Y de la ventana del zoom. */
export interface SerieConValores {
  datos: readonly { value: number | null }[];
}

/**
 * Rango Y de los valores visibles en la ventana del zoom (`actualizarRangoYSegunZoom`): 5 % de margen y nunca
 * por debajo de 0. `null` si no hay valores visibles (se deja el rango que había).
 */
export function rangoYVisible(
  series: readonly SerieConValores[],
  totalEtiquetas: number,
  inicioPct: number,
  finPct: number,
): { min: number; max: number } | null {
  const desde = Math.floor((inicioPct / 100) * totalEtiquetas);
  const hasta = Math.ceil((finPct / 100) * totalEtiquetas);
  const valores = series.flatMap((s) =>
    s.datos
      .slice(desde, hasta)
      .map((p) => p?.value)
      .filter((v): v is number => v != null && !Number.isNaN(v)),
  );
  if (!valores.length) {
    return null;
  }
  const min = Math.min(...valores);
  const max = Math.max(...valores);
  const margen = (max - min) * 0.05;
  return { min: Math.max(0, min - margen), max: max + margen };
}

/** Tamaños que ECharts pasa al `position` del tooltip. */
export interface TamanosTooltip {
  contentSize: readonly number[];
  viewSize: readonly number[];
}

/**
 * `defaultPosition` de producción: el tooltip va 10 px a la derecha del puntero; si se sale por la derecha pasa
 * a la izquierda, y nunca queda en x negativa.
 */
export function posicionTooltip(punto: readonly number[], tamanos: TamanosTooltip): [number, number] {
  const ancho = tamanos.contentSize[0];
  const anchoGrafica = tamanos.viewSize[0];
  let x = punto[0] + 10;
  if (punto[0] + ancho > anchoGrafica) {
    x = punto[0] - ancho - 10;
  }
  return [Math.max(x, 0), punto[1]];
}
