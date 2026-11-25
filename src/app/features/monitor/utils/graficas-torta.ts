import type { EChartsCoreOption } from 'echarts/core';
import { PorcionTorta, PorcionTortaCompacta } from '@features/monitor/interfaces/comunes';
import { formatearPesos } from '@features/monitor/utils/formatos';

/** Armado de las gráficas de torta (dona) del Monitor: `pie-chart` y `pie-charts` de producción. */

/** Luminancia relativa (0–1) de un color `#rrggbb`. */
export function luminancia(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const l = 0.299 * r + 0.587 * g + 0.114 * b;
  return Number.isNaN(l) ? 0.5 : l;
}

/** Oscurece un color `#rrggbb` en la proporción indicada (0–1). */
export function oscurecer(hex: string, cantidad: number): string {
  const canal = (i: number): string => {
    const v = Math.max(0, Math.round(parseInt(hex.slice(i, i + 2), 16) * (1 - cantidad)));
    return (Number.isNaN(v) ? 0x55 : v).toString(16).padStart(2, '0');
  };
  return `#${canal(1)}${canal(3)}${canal(5)}`;
}

/** Datos que ECharts pasa al `formatter` del tooltip de la torta. */
export interface ParametroTorta {
  value?: unknown;
  name?: string;
  color?: unknown;
  data?: unknown;
}

/**
 * Tarjeta del tooltip de la composición: punto de color, nombre, saldo en pesos y el porcentaje en una píldora
 * (más oscura si el color es claro).
 */
export function tooltipTorta(p: ParametroTorta): string {
  const dato = (p.data ?? {}) as Partial<{ color: string; saldo: number | string }>;
  const porcentaje = Number(p.value ?? 0).toFixed(1);
  const nombre = p.name ?? '';
  const color = dato.color ?? (typeof p.color === 'string' ? p.color : '#999');
  const saldo = formatearPesos(parseFloat(String(dato.saldo ?? '0')) || 0);
  const clara = luminancia(color) > 0.65;
  const textoPildora = clara ? oscurecer(color, 0.45) : color;
  const fondoPildora = clara ? `${oscurecer(color, 0.1)}33` : `${color}1A`;
  return (
    '<div style="padding:12px 16px; min-width:190px; font-family:Montserrat,sans-serif;">' +
    '<div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">' +
    `<span style="display:inline-block; width:10px; height:10px; border-radius:50%; background:${color}; border:1px solid rgba(0,0,0,0.15); flex-shrink:0;"></span>` +
    `<span style="font-size:12px; font-weight:600; color:#333; line-height:1.3;">${nombre}</span></div>` +
    '<div style="display:flex; justify-content:space-between; align-items:center; gap:12px;">' +
    `<span style="font-size:13px; color:#555;">${saldo}</span>` +
    `<span style="font-size:13px; font-weight:700; color:${textoPildora}; background:${fondoPildora}; border:1.5px solid ${textoPildora}; padding:2px 8px; border-radius:20px;">${porcentaje}%</span>` +
    '</div></div>'
  );
}

/** Opciones de la torta con título (composición actual de contratos o portafolios). */
export function opcionesTorta(datos: readonly PorcionTorta[], titulo: string, esMovil: boolean): EChartsCoreOption {
  return {
    title: {
      text: titulo,
      top: '10px',
      left: esMovil ? '0px' : '24px',
      textStyle: {
        fontFamily: 'Montserrat',
        fontWeight: 500,
        fontSize: esMovil ? 16 : 18,
        color: '#404040',
        lineHeight: 26,
      },
    },
    series: {
      type: 'pie',
      data: datos.map((d) => ({
        name: d.nombre,
        value: d.valor,
        color: d.color,
        saldo: d.saldo,
        itemStyle: { color: d.color },
      })),
      radius: ['40%', '70%'],
      top: '10%',
      label: { show: false },
    },
    tooltip: {
      trigger: 'item',
      backgroundColor: '#FFFFFF',
      borderColor: '#E0E0E0',
      borderWidth: 1,
      borderRadius: 12,
      confine: true,
      padding: 0,
      extraCssText: 'box-shadow: 0 4px 16px rgba(0,0,0,0.12);',
      formatter: (p: unknown) => tooltipTorta((p ?? {}) as ParametroTorta),
    },
  };
}

/** Texto del tooltip de la torta compacta: «12.5% - Nombre». */
export function tooltipTortaCompacta(p: ParametroTorta): string {
  return `${String(p.value)}% - ${p.name ?? ''}`;
}

/** Opciones de la torta compacta (tendencia y rebalanceos): sin título, tooltip oscuro. */
export function opcionesTortaCompacta(datos: readonly PorcionTortaCompacta[]): EChartsCoreOption {
  return {
    series: {
      type: 'pie',
      data: datos.map((d) => ({ name: d.nombre, value: d.valor, itemStyle: { color: d.color } })),
      radius: ['40%', '70%'],
      label: { show: false },
    },
    tooltip: {
      trigger: 'item',
      backgroundColor: '#404040',
      borderColor: '#ccc',
      borderWidth: 1,
      confine: true,
      textStyle: { color: '#FFFFFF', fontSize: 12 },
      formatter: (p: unknown) => tooltipTortaCompacta((p ?? {}) as ParametroTorta),
    },
  };
}
