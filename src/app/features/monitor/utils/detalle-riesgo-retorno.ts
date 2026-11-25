import type { EChartsCoreOption } from 'echarts/core';
import { TEXTOS } from '@features/monitor/constants/textos';
import { TEXTOS_DETALLE } from '@features/monitor/constants/textos-detalle';
import { PuntoRiesgoRetorno } from '@features/monitor/interfaces/detalle';
import { ICONO_GUARDAR_COMO_IMAGEN } from '@features/monitor/utils/graficas-lineas';

/** Gráfica de riesgo y retorno de la comparación del Monitor exterior (`risk-return-chart`). */

/** Rango del eje con un 10 % de margen a cada lado (lo calcula ECharts con los valores visibles). */
const conMargen = (lado: 'min' | 'max') => (v: { min: number; max: number }): number =>
  lado === 'min' ? v.min - 0.1 * (v.max - v.min) : v.max + 0.1 * (v.max - v.min);

/**
 * Opciones de riesgo/retorno: un punto por activo visible (volatilidad, retorno) con su nombre a la derecha, o el
 * texto «No hay datos disponibles» si no queda ninguno.
 */
export function opcionesRiesgoRetorno(
  datos: readonly PuntoRiesgoRetorno[],
  ocultas: readonly string[],
  alGuardar: () => void,
): EChartsCoreOption {
  const R = TEXTOS_DETALLE.riesgoRetorno;
  const series = datos
    .filter((d) => !ocultas.includes(d.clave))
    .map((d) => ({
      name: d.nombre,
      type: 'scatter',
      symbolSize: 12,
      data: [[parseFloat(d.volatilidad ?? '') || 0, parseFloat(d.retorno ?? '') || 0]],
      itemStyle: { color: d.color },
      label: { show: true, formatter: d.nombre, position: 'right', fontSize: 12, color: '#333' },
    }));
  if (!series.length) {
    return {
      graphic: { type: 'text', left: 'center', top: 'middle', style: { text: R.sinDatos, fill: '#999' } },
    };
  }
  const eje = (nombre: string, separacion: number, decimales: number) => ({
    name: nombre,
    nameLocation: 'middle',
    nameGap: separacion,
    axisLabel: { formatter: (v: number) => `${v.toFixed(decimales)}%` },
    axisLine: { lineStyle: { color: '#ccc' } },
    nameTextStyle: { color: '#404040' },
    min: conMargen('min'),
    max: conMargen('max'),
  });
  return {
    toolbox: {
      show: true,
      top: 5,
      feature: {
        dataZoom: { yAxisIndex: 'none' },
        restore: {},
        myGuardarImagen: {
          show: true,
          title: TEXTOS.graficas.guardarComoImagen,
          icon: ICONO_GUARDAR_COMO_IMAGEN,
          onclick: alGuardar,
        },
      },
    },
    legend: {
      show: false,
      type: 'scroll',
      top: 10,
      bottom: 20,
      left: 'right',
      icon: 'circle',
      textStyle: { color: '#404040', fontSize: 12 },
      data: datos.map((d) => ({ name: d.nombre })),
    },
    tooltip: {
      trigger: 'item',
      backgroundColor: '#333',
      borderColor: '#999',
      textStyle: { color: '#fff' },
      formatter: (p: unknown) => {
        const [x, y] = ((p as { data?: unknown[] })?.data ?? []).map((v) => parseFloat(String(v)) || 0);
        return R.tooltip((x ?? 0).toFixed(2), (y ?? 0).toFixed(2));
      },
    },
    grid: { left: '2%', right: '9%' },
    xAxis: eje(R.ejeX, 40, 2),
    yAxis: eje(R.ejeY, 50, 1),
    series,
    labelLayout: { hideOverlap: true, moveOverlap: 'shiftX' },
  };
}
