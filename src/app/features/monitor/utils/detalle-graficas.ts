import type { EChartsCoreOption } from 'echarts/core';
import { TEXTOS } from '@features/monitor/constants/textos';
import { SerieLeyenda } from '@features/monitor/interfaces/comunes';
import { ActivoComparado, PuntoSerie } from '@features/monitor/interfaces/detalle';
import { formatearNumero } from '@features/monitor/utils/formatos';
import {
  esNumerico,
  nombreIndicador,
  rangoEjeY,
  rangoEjeYTasa,
  truncarDosDecimales,
  umbralesAtipicos,
} from '@features/monitor/utils/graficas';
import { BotonGuardar, opcionesLineas } from '@features/monitor/utils/graficas-lineas';
import { aParametros, ESTILO_AVISO } from '@features/monitor/utils/tooltips-lineas';
import { separarPlazoCdt } from '@features/monitor/utils/detalle-comparacion';
import { activoComparado } from '@features/monitor/utils/detalle-activos';
import { aIso, restarMeses } from '@features/monitor/utils/fechas';

/**
 * Gráfica de tendencia de la comparación del Monitor exterior (`renderChart`, `buildSeries`, `buildChartOption`).
 * La de riesgo y retorno está en `detalle-riesgo-retorno.ts`.
 */

/** Dato de un día de la tendencia: el valor graficado y el que muestra el tooltip. */
export interface PuntoTendencia {
  value: number | null;
  /** Valor real del día (`iValue`). */
  valor: number | null;
  clave: string;
  tipo: string;
  /** Hay dato ese día. */
  conPunto: boolean;
  /** Día sin dato: el tooltip muestra el último disponible. */
  valorArrastrado?: number;
}

/** Tendencia armada: etiquetas del eje, series de ECharts, leyenda propia y eje Y. */
export interface DatosTendencia {
  etiquetas: string[];
  series: object[];
  leyenda: SerieLeyenda[];
  yMin: number;
  yMax: number;
  /** Nombre visible e imagen por clave (los usa el tooltip). */
  nombres: Readonly<Record<string, string>>;
  imagenes: Readonly<Record<string, string>>;
}

const esIndicadorODivisa = (tipo: string): boolean => tipo === 'indicador' || tipo === 'divisa';

/** Nombre de la serie: indicadores con su nombre visible; con CDT, «<portafolio> · CDT A 30 días». */
function nombreSerie(a: ActivoComparado, conCdt: boolean): { nombre: string; sinCapitalizar: boolean } {
  const plazo = conCdt && a.tipo === 'portafolio' ? separarPlazoCdt(a.nombre) : null;
  if (plazo) {
    return { nombre: `${plazo.base} · ${plazo.plazo}`, sinCapitalizar: true };
  }
  return { nombre: nombreIndicador(a.clave, a.nombre), sinCapitalizar: esIndicadorODivisa(a.tipo) };
}

function datosSerie(a: ActivoComparado, fechas: readonly string[], modoTasa: boolean, valores: number[]): PuntoTendencia[] {
  const clave: keyof PuntoSerie = modoTasa ? 'valor' : 'valorNormalizado';
  const [abajo, arriba] = umbralesAtipicos(
    a.puntos.map((p) => Number(p[clave])).filter((v) => !Number.isNaN(v) && (modoTasa || v > 0)),
  );
  const porFecha = new Map(a.puntos.map((p) => [p.fechaIso, p]));
  const aValor = (v: unknown): number => (esIndicadorODivisa(a.tipo) ? truncarDosDecimales(v as number) : Number(v));
  let ultimo: PuntoSerie | null = null;
  const datos = fechas.map((fecha): PuntoTendencia => {
    const p = porFecha.get(fecha) ?? null;
    const conValor = esNumerico(p?.valor);
    const v = p && conValor && esNumerico(p[clave]) ? Number(p[clave]) : null;
    const atipico = v !== null && (v < abajo || v > arriba);
    if (v != null && !atipico) {
      valores.push(v);
    }
    const arrastre = !conValor && ultimo ? { valorArrastrado: aValor(ultimo.valor) } : {};
    if (p && v != null && !atipico) {
      ultimo = p;
    }
    return {
      value: atipico ? null : v,
      valor: conValor ? aValor(p?.valor) : null,
      clave: a.clave,
      tipo: a.tipo,
      conPunto: !!p && conValor,
      ...arrastre,
    };
  });
  // Fuera de los CDT la línea termina en su último dato: después no se arrastra el valor.
  const ultimoDibujado = datos.map((d) => d.value != null).lastIndexOf(true);
  return a.tipo === 'cdt' ? datos : datos.map((d, i) => (i > ultimoDibujado ? { ...d, valorArrastrado: undefined } : d));
}

/**
 * Series de la tendencia: fechas comunes ordenadas, valor normalizado (o tasa si hay un CDT graficado), sin
 * valores atípicos, y la leyenda (todo se puede retirar: viene de «Comparar»). `null` si ningún activo tiene puntos.
 */
export function armarTendencia(activos: readonly ActivoComparado[]): DatosTendencia | null {
  const validos = activos.filter((a) => a.puntos.length > 0);
  if (!validos.length) {
    return null;
  }
  const modoTasa = validos.some((a) => a.tipo === 'cdt');
  const conCdt = activos.some((a) => a.tipo === 'cdt');
  const etiquetaPorFecha = new Map<string, string>();
  validos.forEach((a) => a.puntos.forEach((p) => etiquetaPorFecha.set(p.fechaIso, p.etiqueta)));
  const fechas = [...etiquetaPorFecha.keys()].sort();
  const valores: number[] = [];
  const nombres: Record<string, string> = {};
  const imagenes: Record<string, string> = {};
  const leyenda: SerieLeyenda[] = [];
  const series = validos.map((a) => {
    const esCdt = a.tipo === 'cdt';
    const { nombre, sinCapitalizar } = nombreSerie(a, conCdt);
    nombres[a.clave] = nombre;
    if (a.imagen) {
      imagenes[a.clave] = a.imagen;
    }
    leyenda.push({
      nombre: a.clave,
      nombreVisible: nombre,
      color: a.color,
      imagen: a.imagen,
      compania: a.compania,
      sinCapitalizar,
      tipo: esCdt ? 'cdt' : esIndicadorODivisa(a.tipo) ? 'indicador' : 'portafolio',
      punteada: esCdt || !!a.imagen,
      removible: true,
    });
    return {
      name: a.clave,
      type: 'line',
      smooth: !esCdt,
      connectNulls: true,
      showSymbol: false,
      data: datosSerie(a, fechas, modoTasa, valores),
      color: a.color,
      ...(esCdt || a.imagen ? { lineStyle: { type: 'dashed', width: 1.5 } } : {}),
    };
  });
  const { yMin, yMax } = valores.length ? (modoTasa ? rangoEjeYTasa(valores) : rangoEjeY(valores)) : { yMin: 0, yMax: 0 };
  return { etiquetas: fechas.map((f) => etiquetaPorFecha.get(f) ?? f), series, leyenda, yMin, yMax, nombres, imagenes };
}

/**
 * Tendencia decorativa que producción pinta detrás del aviso cuando lo elegido no tiene datos
 * (`EMPTY_PORTFOLIO_CHART`, una serie del dólar), sin leyenda.
 */
export function tendenciaDecorativa(hoy: Date): DatosTendencia {
  const activo = activoComparado(
    {
      clave: 'US$',
      nombre: 'US$',
      tipo: 'divisa',
      serie: { semilla: 3.3, valorHoy: 3895.53, rentabilidadAnual: 6, volatilidad: 2, soloHabiles: true },
    },
    { inicio: aIso(restarMeses(hoy, 3)), fin: aIso(hoy) },
    hoy,
    '#A1DD70',
  );
  const d = armarTendencia([activo]) as DatosTendencia;
  return { ...d, leyenda: [] };
}

const aviso = (texto: string, extra = ''): string =>
  `<span class="disclaimer" style="${ESTILO_AVISO.exterior}${extra}">${texto}</span>`;

/**
 * Tooltip de la tendencia: una fila por serie con dato (o el último si la línea pasa por ahí), en tasa cuando hay
 * un CDT y en pesos o número en lo demás, más los avisos de CDT, normalización e inflación.
 */
export function tooltipTendencia(params: unknown, d: DatosTendencia, conCdt: boolean): string {
  const lista = aParametros(params);
  const fecha = lista[0]?.axisValue ?? '';
  const datos = lista.map((p) => (p.data ?? {}) as Partial<PuntoTendencia>);
  const existeCdt = datos.some((x) => x.tipo === 'cdt');
  const existeUvr = datos.some((x) => x.clave === 'UVR' || String(x.clave ?? '').startsWith('UVR_'));
  const modoTasa = existeCdt || conCdt;
  let recalculadas = false;
  let filas = lista
    .map((p, i) => {
      const x = datos[i];
      const esCdt = x.tipo === 'cdt';
      const arrastrado = esCdt ? x.value === null : x.conPunto === false;
      if ((arrastrado && x.valorArrastrado == null) || (!arrastrado && !esNumerico(x.valor))) {
        return '';
      }
      const recalculada = !esCdt && modoTasa;
      recalculadas ||= recalculada;
      const numero = formatearNumero((arrastrado ? x.valorArrastrado : x.valor) as number, 2, 2, 'en-US');
      const valor = esCdt || recalculada ? `${numero}%` : esIndicadorODivisa(x.tipo ?? '') ? numero : `$${numero}`;
      const color = p.color || '#000';
      const imagen = d.imagenes[x.clave ?? ''];
      const marca = esCdt
        ? `<span style="display:inline-block;width:16px;height:0;border-top:2px dashed ${color};margin-right:5px;vertical-align:middle;"></span>`
        : `<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background-color:${color};margin-right:5px;"></span>`;
      const logo = imagen
        ? `<img src="${imagen}" style="width:16px;height:16px;object-fit:contain;border-radius:2px;margin-right:5px;vertical-align:middle;">`
        : '';
      return `<div>${marca}${logo}<b>${d.nombres[x.clave ?? ''] ?? p.seriesName}</b>: ${valor}</div>`;
    })
    .join('');
  if (existeCdt) {
    filas += aviso(TEXTOS.tooltip.avisoCdt);
  }
  if (recalculadas) {
    filas += `<br/>${aviso(TEXTOS.normalizacionCdt.tooltip, ';font-size:11px')}`;
  }
  if (existeUvr) {
    filas += aviso(TEXTOS.inflacion.aviso);
  }
  return `<b>${fecha}</b><br>${filas}`;
}

/** Opciones de la tendencia (`buildChartOption`): las líneas comunes con el tooltip confinado y con scroll. */
export function opcionesTendencia(d: DatosTendencia, conCdt: boolean, guardar: BotonGuardar): EChartsCoreOption {
  return opcionesLineas({
    etiquetas: d.etiquetas,
    series: d.series,
    yMin: d.yMin,
    yMax: d.yMax,
    formatter: (params: unknown) => tooltipTendencia(params, d, conCdt),
    guardar,
    confinarTooltip: true,
    cssTooltip: 'width:min(400px,90vw);max-height:280px;overflow-y:auto;white-space:normal;',
  });
}
