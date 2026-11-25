import { TEXTOS } from '@features/monitor/constants/textos';
import {
  DetallePunto,
  FormatoRegional,
  PuntoLinea,
  SerieLineaCompacta,
  VistaMonitor,
} from '@features/monitor/interfaces/comunes';
import {
  formatearFechaCorta,
  formatearNumero,
  numeroColombiano,
  numeroColombianoDosDecimales,
} from '@features/monitor/utils/formatos';

/**
 * HTML de los tooltips de las gráficas de líneas del Monitor (lo que devuelve el `formatter` de ECharts): la
 * gráfica principal con sus avisos y el detalle de saldos y rendimientos, y la gráfica compacta.
 */

/** Parámetro que ECharts pasa al `formatter` de un tooltip de eje. */
export interface ParametroTooltip {
  color?: string;
  axisValue?: string | number;
  dataIndex?: number;
  seriesIndex?: number;
  seriesName?: string;
  data?: unknown;
}

/** Normaliza lo que llega al `formatter` (un parámetro o una lista). */
export function aParametros(params: unknown): ParametroTooltip[] {
  const lista: unknown[] = Array.isArray(params) ? params : [params];
  return lista.filter((p): p is ParametroTooltip => typeof p === 'object' && p !== null);
}

function puntoDe(p: ParametroTooltip | undefined): Partial<PuntoLinea> | undefined {
  return p?.data && typeof p.data === 'object' ? (p.data as Partial<PuntoLinea>) : undefined;
}

/**
 * Estilos de la clase global `.disclaimer` de cada vista, en línea: el tooltip de ECharts vive fuera del
 * encapsulamiento de los componentes. En el cliente el tamaño (12px) era `!important`.
 */
export const ESTILO_AVISO: Readonly<Record<VistaMonitor, string>> = {
  cliente:
    "font-family:'Open Sans';font-weight:400;font-size:12px;line-height:20px;vertical-align:middle;color:#a5a5a5;text-align:justify",
  exterior:
    'display:block;font-size:10px;font-family:Montserrat;color:#666666;width:100%;margin-top:6px;white-space:normal;overflow-wrap:break-word;word-break:break-word',
};

/**
 * Aviso al pie del tooltip (`buildTooltipDisclaimer`): bloque con margen fijo. El tamaño opcional solo aplica
 * fuera del cliente (allá lo pisaba el `!important` de `.disclaimer`).
 */
export function avisoTooltip(texto: string, tamano?: string, vista: VistaMonitor = 'cliente'): string {
  const tamanoPropio = tamano && vista !== 'cliente' ? `;font-size:${tamano}` : '';
  return `<div class="disclaimer" style="${ESTILO_AVISO[vista]};width:80%;white-space:break-spaces;margin-top:8px${tamanoPropio}">${texto}</div>`;
}

// ───────────────────────────── Tooltip de la gráfica principal ─────────────────────────────

export interface ConfigTooltipLineas {
  esPortafolio: boolean;
  /** Hay detalle por punto (cuenta regresiva → saldos y rendimientos). */
  conDetalle: boolean;
  esMovil: boolean;
  /** HTML de la fase actual del detalle (ver `contenidoFaseTooltip`). */
  contenidoFase?: string;
}

function esIndicador(d: Partial<PuntoLinea> | undefined): boolean {
  return d?.tipo === 'indicador' || d?.tipo === 'divisa';
}

function rendimientoYSaldo(d: Partial<PuntoLinea>): string {
  const conRendimiento = !!d.rendimiento && Number(d.rendimiento) !== 0;
  const conSaldo = !!d.saldo && Number(d.saldo) !== 0;
  let texto = '';
  if (conRendimiento) {
    texto += `${TEXTOS.tooltip.rendimiento}: $${numeroColombiano(d.rendimiento as number | string)}`;
  }
  if (conSaldo) {
    texto += `${texto ? ' - ' : ''}${TEXTOS.tooltip.saldo}: $${numeroColombiano(d.saldo as number | string)}<br/>`;
  }
  return texto;
}

function tieneFechaExtracto(d: Partial<PuntoLinea>): boolean {
  return d.fechaExtracto !== '' && d.fechaExtracto !== '-' && d.fechaExtracto !== undefined;
}

function avisoCorte(d: Partial<PuntoLinea>, conFecha: boolean): string {
  const sufijo = conFecha ? ` (${formatearFechaCorta(String(d.fechaExtracto))}).` : '.';
  return avisoTooltip(`${TEXTOS.tooltip.avisoCorte}${sufijo}`);
}

function marcaSerie(esCdt: boolean, color: string): string {
  return esCdt
    ? `<span style="display:inline-block;width:16px;height:0;border-top:2px dashed ${color};margin-right:5px;vertical-align:middle;"></span>`
    : `<span style="display:inline-block;width:10px;height:10px;background-color:${color};border-radius:50%;margin-right:6px;"></span>`;
}

function imagenSerie(imagen: string): string {
  return imagen
    ? `<img src="${imagen}" style="width:14px;height:14px;object-fit:contain;border-radius:2px;margin-right:4px;vertical-align:middle;">`
    : '';
}

/** Valor del punto: % en tasa, número en indicadores y divisas, y $ en el resto. */
export function valorTooltip(valor: unknown, comoTasa: boolean, indicador: boolean): string {
  if (comoTasa) {
    return `${numeroColombianoDosDecimales(valor as number)}%`;
  }
  if (indicador) {
    return numeroColombiano(valor as number);
  }
  return `$${numeroColombiano(valor as number)}`;
}

const ESTILO_NOMBRE_MOVIL = 'display:inline-block;width:53% !important;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;';

/**
 * HTML del tooltip de la gráfica principal (contratos y portafolios): una fila por serie con dato ese día,
 * rendimiento y saldo de los contratos, y al final los avisos de corte, CDT, normalización e inflación.
 */
export function tooltipLineas(params: readonly ParametroTooltip[], c: ConfigTooltipLineas): string {
  const primero = puntoDe(params[0]);
  const fecha = primero?.fecha || params[0]?.axisValue || '';
  const estiloNombre = c.esMovil ? ESTILO_NOMBRE_MOVIL : '';
  let html = `<div style="max-height: 260px; overflow-y: auto; padding-right: 4px;"><strong>${fecha}</strong><br/>`;

  let avisoExtracto = '';
  let avisoConFecha = false;
  let conCdt = false;
  let conInflacion = false;
  let conRecalculadas = false;
  // Se mira antes porque el CDT puede venir después en la lista.
  const hayCdt = params.some((p) => puntoDe(p)?.tipo === 'cdt');

  for (const p of params) {
    const d = puntoDe(p);
    const esCdt = d?.tipo === 'cdt';
    conCdt ||= esCdt;
    conInflacion ||= d?.nombre === TEXTOS.inflacion.nombre;
    // Sin dato ese día (fin de semana, festivo o sin historia) no se muestra, en vez de «$0».
    if (!d || d.valorTooltip === null || d.valorTooltip === undefined) {
      continue;
    }
    let detalle = '';
    if (!c.esPortafolio && !esCdt) {
      detalle = rendimientoYSaldo(d);
      if (!avisoConFecha) {
        avisoConFecha = tieneFechaExtracto(d);
        avisoExtracto = avisoCorte(d, avisoConFecha);
      }
    }
    // Con un CDT visible lo que se agregó con «Comparar» pasa a tasa.
    const comoTasa = !esCdt && (d.esTasa ?? (hayCdt && !!d.removible));
    conRecalculadas ||= comoTasa;
    const valor = valorTooltip(d.valorTooltip, esCdt || comoTasa, esIndicador(d));
    html +=
      `<div style="margin-bottom: 6px">${marcaSerie(esCdt, p.color ?? '')}${imagenSerie(d.imagen ?? '')}` +
      `<span style="${estiloNombre}">${d.nombre}</span> : <strong>${valor}</strong><br/>${detalle}</div>`;
  }

  if (c.conDetalle && !c.esPortafolio) {
    html += `<div>${c.contenidoFase ?? ''}</div>`;
  }
  html += avisoExtracto;
  if (conCdt) {
    html += avisoTooltip(TEXTOS.tooltip.avisoCdt);
  }
  if (conRecalculadas) {
    html += avisoTooltip(TEXTOS.normalizacionCdt.tooltip, '11px');
  }
  if (conInflacion) {
    html += avisoTooltip(TEXTOS.inflacion.aviso);
  }
  return `${html}</div>`;
}

/** Fase del detalle de saldos y rendimientos de un punto. */
export type FaseTooltip =
  | { fase: 'cuenta'; segundos: number }
  | { fase: 'cargando' }
  | { fase: 'cargado'; registros: readonly DetallePunto[] };

function barrasCargando(cantidadSeries: number): string {
  const barra =
    '<div style="height:10px;border-radius:4px;margin:4px 0;background:linear-gradient(90deg,#e0e0e0 25%,#eeeeee 50%,#e0e0e0 75%);background-size:400% 100%;animation:nc-mon-brillo 1.4s ease infinite;"></div>';
  return (
    '<style>@keyframes nc-mon-brillo{0%{background-position:100% 0}100%{background-position:-100% 0}}</style>' +
    `<div style="margin-top:8px;border-top:1px solid #eee;padding-top:6px">${barra.repeat(cantidadSeries * 2)}</div>`
  );
}

function detalleCargado(params: readonly ParametroTooltip[], registros: readonly DetallePunto[]): string {
  let html = '<div style="border-top:1px solid #eee;padding-top:6px;margin-top:6px">';
  params.forEach((p, i) => {
    const r = registros[i];
    const conRendimiento = !!r?.rendimiento && Number(r.rendimiento) !== 0;
    const conSaldo = !!r?.saldo && Number(r.saldo) !== 0;
    if (!conRendimiento && !conSaldo) {
      return;
    }
    html += `<div style="margin-bottom:6px"><span style="display:inline-block;width:10px;height:10px;background:${p.color ?? ''};border-radius:50%;margin-right:6px"></span>`;
    if (conRendimiento) {
      html += `${TEXTOS.tooltip.rendimiento}: $${numeroColombiano(r.rendimiento as number | string)}`;
    }
    if (conSaldo) {
      html += `${conRendimiento ? ' - ' : ''}${TEXTOS.tooltip.saldo}: $${numeroColombiano(r.saldo as number | string)}`;
    }
    html += '</div>';
  });
  const fechaCorte = registros[0]?.fechaExtracto;
  const fecha = fechaCorte ? formatearFechaCorta(fechaCorte) : '';
  return `${html}<span class="disclaimer" style="${ESTILO_AVISO.cliente};display:inline-block;width:80%!important;white-space:break-spaces">${TEXTOS.tooltip.saldosAl(fecha)}</span></div>`;
}

/** HTML de la fase del detalle: cuenta regresiva, barras de carga o saldos y rendimientos. */
export function contenidoFaseTooltip(fase: FaseTooltip | null, params: readonly ParametroTooltip[]): string {
  if (!fase) {
    return '';
  }
  if (fase.fase === 'cuenta') {
    const d = puntoDe(params[0]);
    const fecha = d?.fechaIso ? formatearFechaCorta(d.fechaIso) : (d?.fecha ?? '');
    return `<div style="margin-top:6px;color:#666;font-size:12px;padding:4px 0;border-top:1px solid #eee">${TEXTOS.tooltip.cuentaRegresiva(fecha, fase.segundos)}</div>`;
  }
  if (fase.fase === 'cargando') {
    return barrasCargando(params.length || 1);
  }
  return detalleCargado(params, fase.registros);
}

// ───────────────────────────── Tooltip de la gráfica compacta ─────────────────────────────

/**
 * Tooltip de la gráfica compacta: fecha y, por serie, el valor real en pesos (o «0» sin dato). Como producción,
 * toma el valor real por la posición del parámetro en la lista.
 */
export function tooltipLineasCompacta(
  params: readonly ParametroTooltip[],
  series: readonly SerieLineaCompacta[],
  formato: FormatoRegional,
): string {
  const fecha = params[0]?.axisValue || '';
  const filas = params
    .map((p, i) => {
      const real = series[i]?.valoresReales[p.dataIndex ?? -1];
      const valor = real ? `$${formatearNumero(real, 2, 2, formato)}` : '0';
      return (
        `<div><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background-color:${p.color || '#000'};margin-right:5px;"></span>` +
        `<b>${p.seriesName ?? ''}</b>: ${valor}</div>`
      );
    })
    .join('');
  return `<b>${fecha}</b><br>${filas}`;
}
