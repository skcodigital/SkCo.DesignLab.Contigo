import {
  FilaTabla,
  PorcionTortaCompacta,
  RangoFechas,
  SerieLineaCompacta,
} from '@features/monitor/interfaces/comunes';
import { ClaseActivo, TendenciaActivo, TendenciaMezcla } from '@features/monitor/interfaces/detalle';
import { colorSerie } from '@features/monitor/utils/graficas';
import { metricasPuntos, puntosSerie, redondear } from '@features/monitor/utils/detalle-series';

/**
 * Armado de las secciones de tendencia del detalle (`tendency`, `asset-trend` y `rebalances` de producción):
 * composición en torta, líneas de cada portafolio y tabla, para el rango elegido.
 */

/** Gráfica de líneas compacta lista para pintar. */
export interface LineasCompactas {
  etiquetas: string[];
  series: SerieLineaCompacta[];
  yMin: number;
  yMax: number;
}

/** Todo lo que pinta la pestaña «Tendencia» de una mezcla en un rango. */
export interface VistaTendencia extends LineasCompactas {
  composicion: PorcionTortaCompacta[];
  filas: FilaTabla[];
}

/**
 * Porciones de una composición con su color de la paleta según el orden de llegada y luego ordenadas de mayor a
 * menor (`setDataPieChart`).
 */
export function porcionesComposicion(clases: readonly ClaseActivo[], paleta: readonly string[]): PorcionTortaCompacta[] {
  return clases
    .map((c, i) => ({ nombre: c.nombre, valor: c.porcentaje, color: colorSerie(i, paleta) }))
    .sort((a, b) => b.valor - a.valor);
}

/** Extremos del eje Y de las líneas compactas: mínimo y máximo de lo graficado (0 sin datos). */
function extremos(series: readonly SerieLineaCompacta[]): { yMin: number; yMax: number } {
  const valores = series.flatMap((s) => s.datos);
  return valores.length ? { yMin: Math.min(...valores), yMax: Math.max(...valores) } : { yMin: 0, yMax: 0 };
}

/**
 * Tendencia de una mezcla en un rango: torta con el peso de cada portafolio, líneas normalizadas (con el valor de
 * unidad real en el tooltip) y tabla con las medidas del periodo, ordenada por participación.
 */
export function tendenciaEnRango(
  t: TendenciaMezcla,
  rango: RangoFechas,
  hoy: Date,
  paleta: readonly string[],
): VistaTendencia {
  const composicion = porcionesComposicion(
    t.portafolios.map((p) => ({ nombre: p.nombre, porcentaje: p.porcentaje })),
    paleta,
  );
  const puntos = t.portafolios.map((p) => puntosSerie(p.serie, rango, hoy));
  const series: SerieLineaCompacta[] = t.portafolios.map((p, i) => ({
    nombre: p.id,
    suave: true,
    simbolo: 'circle',
    tamanoSimbolo: 8,
    datos: puntos[i].map((x) => redondear(x.valorNormalizado ?? 0)),
    valoresReales: puntos[i].map((x) => redondear(x.valor ?? 0)),
    color: colorSerie(i, paleta),
  }));
  const filas: FilaTabla[] = t.portafolios
    .map((p, i) => {
      const m = metricasPuntos(puntos[i]);
      const porcion = composicion.find((c) => c.nombre.toUpperCase() === p.nombre.toUpperCase());
      return {
        porcentaje: porcion ? String(porcion.valor) : undefined,
        nombre: p.nombre,
        valorInicial: m?.valorInicial ?? null,
        valorFinal: m?.valorFinal ?? null,
        variacion: m?.variacion ?? null,
        volatilidad: m?.volatilidad ?? null,
        tea: m?.tea ?? null,
        retorno: m?.retorno ?? null,
        color: porcion?.color,
      };
    })
    .sort((a, b) => Number(b.porcentaje) - Number(a.porcentaje));
  return {
    composicion,
    etiquetas: (puntos[0] ?? []).map((x) => x.etiqueta),
    series,
    ...extremos(series),
    filas,
  };
}

/** Tendencia de un activo que no es mezcla (`asset-trend`): torta ordenada y líneas sin suavizar. */
export function vistaTendenciaActivo(
  t: TendenciaActivo,
  paleta: readonly string[],
): LineasCompactas & { composicion: PorcionTortaCompacta[] } {
  const series: SerieLineaCompacta[] = t.series.map((s, i) => ({
    nombre: s.nombre,
    suave: false,
    simbolo: 'circle',
    tamanoSimbolo: 8,
    datos: [...s.datos],
    valoresReales: [...s.datos],
    color: colorSerie(i, paleta),
  }));
  return {
    composicion: porcionesComposicion(t.categorias, paleta),
    etiquetas: [...t.etiquetas],
    series,
    ...extremos(series),
  };
}
