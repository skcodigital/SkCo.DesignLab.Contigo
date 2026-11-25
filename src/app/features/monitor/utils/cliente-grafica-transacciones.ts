import { TEXTOS_CLIENTE } from '@features/monitor/constants/textos-cliente';
import { FilaPortafolio, MovimientoPortafolio, PortafolioCliente } from '@features/monitor/interfaces/cliente';
import { RangoFechas } from '@features/monitor/interfaces/comunes';
import { movimientosEnRango } from '@features/monitor/utils/cliente-portafolios';
import { etiquetaAmigable, puntosSerie } from '@features/monitor/utils/detalle-series';
import { EChartsCoreOption } from '@features/monitor/utils/echarts';
import { desdeIso } from '@features/monitor/utils/fechas';
import { formatearNumero } from '@features/monitor/utils/formatos';
import { ICONO_GUARDAR_COMO_IMAGEN } from '@features/monitor/utils/graficas-lineas';
import { posicionTooltip, TamanosTooltip } from '@features/monitor/utils/graficas';

/**
 * Gráfica del visor de transacciones (`makeChart` y `mapSeries` de `transaction-info`): valor de unidad
 * normalizado del portafolio, barras con el valor de cada movimiento (en millones), marcas de aportes y retiros,
 * líneas de tendencia y los valores promedio de compra y de venta.
 */

const T = TEXTOS_CLIENTE.transacciones;

/** Serie de la gráfica con los valores reales que muestra el tooltip (`realData`). */
export interface SerieTransacciones {
  name: string;
  type: 'line' | 'bar';
  data: (readonly [string, string | number | null])[];
  realData?: readonly (number | null)[];
  [opcion: string]: unknown;
}

/** Parámetro del tooltip de ECharts que se usa. */
export interface ParametroTransacciones {
  seriesName?: string;
  dataIndex?: number;
  marker?: string;
  value?: readonly unknown[];
}

const formato = (v: unknown): string => formatearNumero(v as number | string, 2, 2, 'es-CO');

/** Recta de mínimos cuadrados de los valores (por posición) y su desviación de los residuos. */
export function tendencia(valores: readonly number[]): { recta: number[]; desviacion: number } {
  const n = valores.length;
  if (!n) {
    return { recta: [], desviacion: 0 };
  }
  const mx = (n - 1) / 2;
  const my = valores.reduce((a, b) => a + b, 0) / n;
  const cov = valores.reduce((s, y, x) => s + (x - mx) * (y - my), 0);
  const varx = valores.reduce((s, _y, x) => s + (x - mx) ** 2, 0);
  const pendiente = varx ? cov / varx : 0;
  const recta = valores.map((_y, x) => my + pendiente * (x - mx));
  const desviacion = Math.sqrt(valores.reduce((s, y, x) => s + (y - recta[x]) ** 2, 0) / n);
  return { recta, desviacion };
}

const etiqueta = (iso: string): string => etiquetaAmigable(desdeIso(iso) as Date);

/** Marcas (puntos) de aportes o retiros sobre la línea del valor de unidad; la serie no tiene datos propios. */
function marcas(
  nombre: string,
  color: string,
  contrato: string,
  movimientos: readonly MovimientoPortafolio[],
  linea: ReadonlyMap<string, string>,
): SerieTransacciones {
  return {
    name: `${nombre} - ${contrato}`,
    type: 'line',
    data: [],
    yAxisIndex: 1,
    markPoint: {
      data: movimientos.map((m) => ({
        coord: [etiqueta(m.fecha), linea.get(etiqueta(m.fecha)) ?? null],
        itemStyle: { color },
        name: nombre,
        symbolSize: 14,
      })),
    },
    itemStyle: { color },
  };
}

/**
 * Series de la gráfica del periodo. Con `ocultarDevoluciones` las devoluciones no se marcan ni suman barra (la
 * línea del valor de unidad no cambia). `[]` si no hay valor de unidad en el periodo.
 */
export function seriesTransacciones(
  p: PortafolioCliente,
  fila: FilaPortafolio,
  rango: RangoFechas,
  hoy: Date,
  ocultarDevoluciones: boolean,
): SerieTransacciones[] {
  const puntos = puntosSerie(p.serie, rango, hoy);
  if (!puntos.length) {
    return [];
  }
  const linea = new Map(puntos.map((x) => [x.etiqueta, Number(x.valorNormalizado).toFixed(2)]));
  const constante = Number(puntos[0].valor) / Number(puntos[0].valorNormalizado);
  const movs = movimientosEnRango(p, rango);
  const visible = (m: MovimientoPortafolio): boolean => !(ocultarDevoluciones && m.devolucion);
  const contrato = p.contrato;
  const { recta, desviacion } = tendencia(puntos.map((x) => Number(x.valorNormalizado)));
  const banda = (signo: 1 | -1, nombre: string, color: string): SerieTransacciones => ({
    name: nombre,
    type: 'line',
    yAxisIndex: 1,
    showSymbol: false,
    data: puntos.map((x, i) => [x.etiqueta, (recta[i] + signo * 2 * desviacion).toFixed(6)] as const),
    realData: recta.map((y) => (y + signo * 2 * desviacion) * constante),
    lineStyle: { color, opacity: 0.2 },
    itemStyle: { color },
  });
  const promedio = (nombre: string, valor: number | null, color: string): SerieTransacciones[] =>
    valor === null
      ? []
      : [
          {
            name: nombre,
            type: 'line',
            yAxisIndex: 1,
            showSymbol: false,
            data: puntos.map((x) => [x.etiqueta, valor / constante] as const),
            realData: puntos.map(() => valor),
            lineStyle: { color, type: 'line' },
            itemStyle: { color },
          },
        ];
  return [
    {
      name: `${T.valor}${contrato}`,
      type: 'bar',
      yAxisIndex: 0,
      barWidth: '2px',
      label: { show: true, position: 'top', formatter: (x: { value: readonly unknown[] }) => `$${x.value[1]}M` },
      data: movs.map((m) => [etiqueta(m.fecha), visible(m) ? (Math.abs(m.valor) / 1_000_000).toFixed(2) : null] as const),
      itemStyle: { color: '#FF9460' },
    },
    {
      name: fila.nombre,
      type: 'line',
      yAxisIndex: 1,
      showSymbol: false,
      data: puntos.map((x) => [x.etiqueta, linea.get(x.etiqueta) ?? null] as const),
      realData: puntos.map((x) => x.valor),
      itemStyle: { color: '#A4D7E1' },
    },
    marcas(T.retiro, '#F67E7D', contrato, movs.filter((m) => m.valor < 0 && visible(m)), linea),
    marcas(T.aporte, '#A1DD70', contrato, movs.filter((m) => m.valor > 0 && visible(m)), linea),
    banda(1, T.tendenciaSuperior, '#A1DD70'),
    banda(-1, T.tendenciaInferior, '#F67E7D'),
    ...promedio(T.promedioCompra, fila.vupCompra, '#C0C1F7'),
    ...promedio(T.promedioVenta, fila.vupVenta, '#dfb7a2'),
  ];
}

/** `tooltipFormatter`: fecha y, por serie, su valor real (sin las líneas de tendencia). */
export function tooltipTransacciones(params: readonly ParametroTransacciones[], series: readonly SerieTransacciones[]): string {
  let texto = `<b>${String(params[0]?.value?.[0] ?? '')}</b><br>`;
  for (const item of params) {
    const nombre = item.seriesName ?? '';
    const i = item.dataIndex ?? 0;
    if (nombre === T.tendenciaSuperior || nombre === T.tendenciaInferior) {
      continue;
    }
    const serie = series.find((s) => s.name === nombre);
    if (nombre === T.promedioCompra || nombre === T.promedioVenta) {
      const valor = formato(serie?.realData?.[i] ?? item.value?.[1]);
      texto += `${item.marker ?? ''} <b>${nombre}: ${valor}</b><br>`;
      if (nombre === T.promedioVenta) {
        texto +=
          '<span style="font-size:11px;color:#888;display:inline-block;max-width:260px;white-space:normal;line-height:1.4;">' +
          `${T.explicacionPromedios.join('<br><br>')}</span><br>`;
      }
      continue;
    }
    if (!serie) {
      continue;
    }
    let dato: unknown = serie.realData?.[i];
    if (dato === undefined) {
      const graficado = serie.data[i]?.[1];
      dato = graficado === 'NaN' ? '-' : graficado;
    }
    const valor = dato === null || dato === undefined || String(dato).includes('-') ? '-' : formato(dato);
    if (valor !== '-') {
      texto += `${item.marker ?? ''} ${nombre}: <b>${valor}</b><br>`;
    }
  }
  return texto;
}

/**
 * Opciones de la gráfica: tooltip por eje con cruz, zoom (deslizador e interno), leyenda con scroll, dos ejes Y
 * sin etiquetas (barras a la derecha, valor de unidad a la izquierda) y el botón de imagen que muestra el aviso.
 */
export function opcionesGraficaTransacciones(
  series: readonly SerieTransacciones[],
  esMovil: boolean,
  alGuardar: () => void,
): EChartsCoreOption {
  const fechas = new Map<string, string>();
  series.forEach((s) => s.data.forEach(([x]) => fechas.set(x, x)));
  const orden = (x: string): number => {
    const [d, m, a] = x.split(' ');
    const mes = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'].indexOf(m);
    return new Date(2000 + Number(a), mes, Number(d)).getTime();
  };
  const ejes = [...fechas.keys()].sort((a, b) => orden(a) - orden(b));
  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
      position: (punto: number[], _p: unknown, _d: unknown, _r: unknown, tamanos: TamanosTooltip) =>
        posicionTooltip(punto, tamanos),
      formatter: (p: unknown) => tooltipTransacciones(p as ParametroTransacciones[], series),
    },
    grid: { right: '3%', width: '93%' },
    toolbox: {
      feature: {
        dataZoom: {},
        restore: {},
        myGuardar: { show: true, title: T.guardarImagen, icon: ICONO_GUARDAR_COMO_IMAGEN, onclick: alGuardar },
      },
    },
    dataZoom: [
      { type: 'slider', start: 0, end: 100 },
      { type: 'inside', start: 10, end: 100 },
    ],
    legend: { type: 'scroll', width: esMovil ? '50%' : '75%', left: 8, top: 5 },
    xAxis: [{ type: 'category', data: ejes }],
    yAxis: [
      { type: 'value', position: 'right', alignTicks: true, axisLine: { show: true }, axisLabel: { show: false } },
      { type: 'value', scale: true, position: 'left', alignTicks: true, axisLine: { show: true }, axisLabel: { show: false } },
    ],
    series,
  };
}
