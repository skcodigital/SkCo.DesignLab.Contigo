import { BarChart, LineChart, PieChart, ScatterChart } from 'echarts/charts';
import {
  DataZoomComponent,
  GraphicComponent,
  GridComponent,
  LegendComponent,
  MarkLineComponent,
  MarkPointComponent,
  TitleComponent,
  ToolboxComponent,
  TooltipComponent,
} from 'echarts/components';
import { type EChartsType, init, registerTheme, use } from 'echarts/core';
import { LabelLayout, LegacyGridContainLabel } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';

/**
 * Registro único de ECharts para el Monitor (importación modular). Solo se registra lo que usan las gráficas de
 * producción: líneas, torta, dispersión (riesgo y retorno) y barras (transacciones), con grilla, tooltip, título,
 * leyenda, barra de herramientas, zoom, marcas y gráficos sueltos.
 */
use([
  LineChart,
  PieChart,
  ScatterChart,
  BarChart,
  GridComponent,
  TooltipComponent,
  TitleComponent,
  LegendComponent,
  ToolboxComponent,
  DataZoomComponent,
  MarkPointComponent,
  MarkLineComponent,
  GraphicComponent,
  // Producción usa `grid.containLabel`, que en ECharts 6 necesita esta extensión.
  LegacyGridContainLabel,
  // Riesgo y retorno usa `labelLayout` (hideOverlap / moveOverlap) para que las etiquetas no se encimen.
  LabelLayout,
  CanvasRenderer,
]);

/** Nombre del tema con el que se inician todas las gráficas del Monitor. */
export const TEMA_MONITOR = 'nc-monitor-v5';

const ejeV5 = {
  axisLine: { lineStyle: { color: '#6E7079' } },
  axisLabel: { color: null },
  splitLine: { lineStyle: { color: ['#E0E6F1'] } },
  splitArea: { areaStyle: { color: ['rgba(250,250,250,0.2)', 'rgba(210,219,238,0.2)'] } },
  minorSplitLine: { color: '#F4F7FD' },
};

/**
 * Producción usa ECharts 5; el laboratorio, ECharts 6, que cambió el tema por defecto. Este es el tema de la
 * versión 5 (valores del `theme/v5.js` que trae ECharts 6) para las piezas que usa el Monitor.
 */
registerTheme(TEMA_MONITOR, {
  color: ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc'],
  bar: { defaultBarGap: '20%', select: { itemStyle: { borderColor: '#212121', borderWidth: 1 } } },
  line: { symbolSize: 4 },
  pie: { radius: [0, '75%'], labelLine: { length2: 15 } },
  scatter: { select: { itemStyle: { borderColor: '#212121' } } },
  timeAxis: ejeV5,
  logAxis: ejeV5,
  valueAxis: ejeV5,
  categoryAxis: { ...ejeV5, axisTick: { show: true } },
  axisPointer: {
    lineStyle: { color: '#B9BEC9' },
    shadowStyle: { color: 'rgba(210,219,238,0.2)' },
    label: { backgroundColor: 'auto', color: '#fff' },
    handle: { color: '#333', shadowBlur: 3, shadowColor: '#aaa', shadowOffsetX: 0, shadowOffsetY: 2 },
  },
  dataZoom: {
    borderColor: '#d2dbee',
    borderRadius: 3,
    backgroundColor: 'rgba(47,69,84,0)',
    dataBackground: { lineStyle: { color: '#d2dbee', width: 0.5 }, areaStyle: { color: '#d2dbee', opacity: 0.2 } },
    selectedDataBackground: {
      lineStyle: { color: '#8fb0f7', width: 0.5 },
      areaStyle: { color: '#8fb0f7', opacity: 0.2 },
    },
    handleStyle: { color: '#fff', borderColor: '#ACB8D1' },
    moveHandleStyle: { color: '#D2DBEE', opacity: 0.7 },
    textStyle: { color: '#6E7079' },
    brushStyle: { color: 'rgba(135,175,274,0.15)' },
    emphasis: {
      handleStyle: { borderColor: '#8FB0F7' },
      moveHandleStyle: { color: '#8FB0F7', opacity: 0.7 },
    },
    defaultLocationEdgeGap: 7,
  },
  grid: { left: '10%', top: 60, bottom: 70, borderColor: '#ccc' },
  legend: {
    top: 0,
    bottom: null,
    backgroundColor: 'rgba(0,0,0,0)',
    borderColor: '#ccc',
    itemGap: 10,
    inactiveColor: '#ccc',
    inactiveBorderColor: '#ccc',
    lineStyle: { inactiveColor: '#ccc' },
    textStyle: { color: '#333' },
    pageIconColor: '#2f4554',
    pageIconInactiveColor: '#aaa',
    pageTextStyle: { color: '#333' },
  },
  title: {
    left: 0,
    top: 0,
    backgroundColor: 'rgba(0,0,0,0)',
    borderColor: '#ccc',
    textStyle: { color: '#464646' },
    subtextStyle: { color: '#6E7079' },
  },
  toolbox: {
    borderColor: '#ccc',
    padding: 5,
    itemGap: 8,
    iconStyle: { borderColor: '#666' },
    emphasis: { iconStyle: { borderColor: '#3E98C5' } },
  },
  tooltip: {
    axisPointer: { crossStyle: { color: '#999' } },
    textStyle: { color: '#666' },
    backgroundColor: '#fff',
    borderWidth: 1,
    defaultBorderColor: '#fff',
  },
});

/** Inicia una gráfica del Monitor (con el tema de producción) sobre un elemento. */
export function iniciarGrafica(elemento: HTMLElement): EChartsType {
  return init(elemento, TEMA_MONITOR);
}

export type { EChartsCoreOption, EChartsType } from 'echarts/core';
