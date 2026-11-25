import type { EChartsCoreOption } from 'echarts/core';
import { TEXTOS } from '@features/monitor/constants/textos';
import { SerieLinea, SerieLineaCompacta } from '@features/monitor/interfaces/comunes';

/**
 * Opciones de ECharts de las gráficas de líneas del Monitor como funciones puras (`line-chart` y `line-charts`
 * de producción). El HTML de sus tooltips está en `tooltips-lineas.ts`.
 */

/** Ícono del botón «Save image» de la gráfica principal (producción). */
export const ICONO_GUARDAR_IMAGEN = 'path://M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z';
/** Ícono que ECharts usa en su botón «Save as Image». */
export const ICONO_GUARDAR_COMO_IMAGEN =
  'path://M4.7,22.9L29.3,45.5L54.7,23.4M4.6,43.6L4.6,58L53.8,58L53.8,43.6M29.2,45.1L29.2,0';

/** Botón propio de la barra de herramientas que reemplaza la descarga de la imagen. */
export interface BotonGuardar {
  /** Nombre de la herramienta (debe empezar por `my`). */
  clave: string;
  titulo: string;
  icono: string;
  alClic: () => void;
}

export interface ConfigOpcionesLineas {
  etiquetas: readonly string[];
  /** Series ya armadas para ECharts (ver `seriesLineas` y `seriesLineasCompactas`). */
  series: readonly object[];
  yMin: number;
  yMax: number;
  formatter: (params: unknown) => string;
  guardar: BotonGuardar;
  /** Leyenda nativa (siempre oculta: la leyenda es el componente propio). */
  leyenda?: Readonly<Record<string, unknown>>;
  confinarTooltip?: boolean;
  cssTooltip?: string;
}

/**
 * Opciones comunes de las gráficas de líneas: tooltip por eje, zoom/restaurar/imagen, grilla con espacio para el
 * deslizador, eje X de categorías con líneas verticales y eje Y oculto.
 */
export function opcionesLineas(c: ConfigOpcionesLineas): EChartsCoreOption {
  return {
    legend: c.leyenda ?? { show: false },
    tooltip: {
      trigger: 'axis',
      enterable: true,
      ...(c.confinarTooltip ? { confine: true } : {}),
      ...(c.cssTooltip ? { extraCssText: c.cssTooltip } : {}),
      formatter: c.formatter,
    },
    toolbox: {
      show: true,
      feature: {
        dataZoom: { yAxisIndex: 'none' },
        restore: {},
        [c.guardar.clave]: {
          show: true,
          title: c.guardar.titulo,
          icon: c.guardar.icono,
          onclick: c.guardar.alClic,
        },
      },
    },
    grid: { left: '4%', right: '4%', bottom: 40, containLabel: true },
    xAxis: { type: 'category', boundaryGap: false, data: [...c.etiquetas], splitLine: { show: true } },
    yAxis: {
      type: 'value',
      show: false,
      min: c.yMin,
      max: c.yMax,
      scale: true,
      splitLine: { show: false },
      axisLabel: { show: false },
    },
    series: [...c.series],
    dataZoom: [{ type: 'slider', show: true, height: 26, bottom: 8 }],
  };
}

/** Leyenda nativa oculta de la gráfica principal (producción la dejaba configurada pero sin mostrar). */
export function leyendaOculta(esMovil: boolean): Readonly<Record<string, unknown>> {
  return { type: 'scroll', top: esMovil ? 45 : 35, left: 'right', bottom: 15, show: false };
}

/** Opciones de la gráfica sin series: solo el texto «Sin datos disponibles». */
export function opcionesSinDatos(): EChartsCoreOption {
  return {
    title: {
      text: TEXTOS.graficas.sinDatos,
      left: 'center',
      top: 'middle',
      textStyle: { color: '#999', fontSize: 16 },
    },
    tooltip: { show: false },
    legend: { show: false },
    xAxis: { type: 'category', data: [] },
    yAxis: { type: 'value' },
    series: [],
  };
}

/** `true` si no hay series o ninguna trae puntos. */
export function sinDatosLineas(series: readonly SerieLinea[]): boolean {
  return !series.length || series.every((s) => !s.datos.length);
}

/** Series de la gráfica principal en el formato de ECharts. */
export function seriesLineas(series: readonly SerieLinea[]): object[] {
  return series.map((s) => ({
    name: s.nombre,
    type: 'line',
    smooth: s.suave ?? true,
    showSymbol: false,
    connectNulls: true,
    data: s.datos,
    itemStyle: { color: s.color },
    ...(s.punteada ? { lineStyle: { type: 'dashed', ...(s.grosor ? { width: s.grosor } : {}) } } : {}),
  }));
}

/** Series de la gráfica compacta en el formato de ECharts. */
export function seriesLineasCompactas(series: readonly SerieLineaCompacta[]): object[] {
  return series.map((s) => ({
    name: s.nombre,
    type: 'line',
    smooth: s.suave,
    ...(s.simbolo ? { symbol: s.simbolo } : {}),
    ...(s.tamanoSimbolo ? { symbolSize: s.tamanoSimbolo } : {}),
    data: s.datos,
    color: s.color,
  }));
}
