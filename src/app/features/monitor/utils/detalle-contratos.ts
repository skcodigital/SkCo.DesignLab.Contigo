import { DetallePunto, PuntoLinea, RangoFechas, SerieLinea } from '@features/monitor/interfaces/comunes';
import {
  ActivoComparado,
  ContratoGrafica,
  DatosGraficaContratos,
  DefinicionContrato,
  PlazoCdt,
  PuntoSerie,
} from '@features/monitor/interfaces/detalle';
import { esNumerico, umbralesAtipicos } from '@features/monitor/utils/graficas';
import { diasEntre, puntosSerie, redondear, valorSerie } from '@features/monitor/utils/detalle-series';
import { aIso, desdeIso, restarMeses } from '@features/monitor/utils/fechas';
import { diasPlazo, plazoVisible, puntosTasaMovil } from '@features/monitor/utils/detalle-activos';
import { separarPlazoCdt } from '@features/monitor/utils/detalle-comparacion';

/**
 * Gráfica de contratos del Monitor del cliente (`monitor-contigo`): contratos con su serie de valor de unidad,
 * fechas comunes, normalización a base 1.000 y valores atípicos (`buildChartData` / `buildSeries`).
 */

/** Clave de la serie de un contrato: producto capitalizado y los 3 últimos dígitos del contrato. */
export function claveContrato(producto: string, contrato: string): string {
  return `${producto.charAt(0).toUpperCase()}${producto.slice(1).toLowerCase()} ${contrato.slice(-3)}`;
}

/** Saldo de hoy de un contrato (unidades × valor de unidad de hoy, en pesos). */
export function saldoHoy(def: DefinicionContrato): number {
  return Math.round(def.unidades * def.serie.valorHoy);
}

/**
 * Contratos del cliente con sus puntos en el rango, ordenados de mayor a menor saldo y con el color de la paleta
 * en ese orden (`addChartKeysToContracts`). El saldo y el rendimiento de cada día no van en el punto: los trae el
 * detalle del tooltip (ver `detallePuntoContratos`).
 *
 * Con un CDT aplicado (`plazo`) cada contrato pasa a su rentabilidad móvil en ese plazo y la leyenda lo nombra
 * «Multifund 061 · CDT A 30 días» (`applyContractRates`).
 */
export function contratosEnRango(
  defs: readonly DefinicionContrato[],
  rango: RangoFechas,
  hoy: Date,
  paleta: readonly string[],
  plazo?: PlazoCdt,
): ContratoGrafica[] {
  return [...defs]
    .sort((a, b) => saldoHoy(b) - saldoHoy(a))
    .map((def, i) => {
      const clave = claveContrato(def.producto, def.contrato);
      const puntos = plazo
        ? puntosTasaMovil({ clave, nombre: clave, tipo: 'portafolio', serie: def.serie }, rango, hoy, diasPlazo(plazo))
        : puntosSerie(def.serie, rango, hoy);
      return {
        clave,
        nombreProducto: def.nombreProducto,
        ...(plazo ? { nombreVisible: `${clave} · ${plazoVisible(plazo)}` } : {}),
        color: paleta[i % paleta.length],
        removible: false,
        tipo: 'contrato' as const,
        puntos: puntos.map((p) => ({ ...p, fechaExtracto: '' })),
      };
    });
}

/**
 * Un activo agregado con «Comparar» como serie de la gráfica de contratos: se puede retirar desde la leyenda y la
 * leyenda muestra su nombre (los indicadores, con su nombre visible).
 */
export function contratoComparado(a: ActivoComparado): ContratoGrafica {
  // Con CDT lo comparado llega «<activo> - <plazo> (<CDT>)» y se muestra «<activo> · CDT A 30 días».
  const plazo = a.tipo !== 'cdt' ? separarPlazoCdt(a.nombre) : null;
  return {
    clave: a.clave,
    nombreProducto: plazo ? `${plazo.base} · ${plazo.plazo}` : a.nombre,
    ...(plazo ? { nombreVisible: `${plazo.base} · ${plazo.plazo}` } : {}),
    color: a.color,
    removible: true,
    tipo: a.tipo === 'cdt' ? 'cdt' : a.tipo === 'indicador' || a.tipo === 'divisa' ? 'indicador' : undefined,
    ...(a.imagen ? { imagen: a.imagen } : {}),
    ...(a.compania ? { compania: a.compania } : {}),
    puntos: a.puntos,
  };
}

/** Saldo y rendimiento de un contrato en una fecha ISO (`null` si no hay dato ese día). */
export function saldoYRendimiento(
  def: DefinicionContrato,
  fechaIso: string,
  hoy: Date,
): { saldo: number; rendimiento: number } | null {
  const fecha = desdeIso(fechaIso);
  if (!fecha || fecha > hoy || (def.serie.inicio && fechaIso < def.serie.inicio)) {
    return null;
  }
  const saldo = Math.round(def.unidades * valorSerie(def.serie, diasEntre(fecha, hoy)));
  return { saldo, rendimiento: def.rendimientosHoy - (saldoHoy(def) - saldo) };
}

/**
 * Detalle del punto que el tooltip muestra tras la cuenta regresiva (en producción venía de un servicio): saldo y
 * rendimiento de cada contrato propio en ese día; lo agregado con «Comparar» queda sin datos.
 */
export function detallePuntoContratos(
  defs: readonly DefinicionContrato[],
  hoy: Date,
): (indice: number, puntos: readonly PuntoLinea[]) => DetallePunto[] {
  return (_indice, puntos) =>
    puntos.map((p) => {
      const fecha = p?.fechaIso ?? '';
      const def = defs.find((d) => {
        const clave = claveContrato(d.producto, d.contrato);
        return !p?.removible && (p?.nombre === clave || !!p?.nombre?.startsWith(`${clave} · `));
      });
      const datos = def ? saldoYRendimiento(def, fecha, hoy) : null;
      return { rendimiento: datos?.rendimiento ?? null, saldo: datos?.saldo ?? null, fechaExtracto: fecha };
    });
}

// ───────────────────────────── Series de la gráfica ─────────────────────────────

/** `formatSeriesIValue`: valor del tooltip (tasa con signo, indicador truncado, el resto en valor absoluto). */
export function valorTooltipContrato(valor: unknown, modoTasa: boolean, esIndicador: boolean): number | null {
  if (!esNumerico(valor)) {
    return null;
  }
  const n = Number(valor);
  if (modoTasa) {
    return redondear(n);
  }
  return esIndicador ? Math.trunc(Math.abs(n) * 100) / 100 : redondear(Math.abs(n));
}

/**
 * `fillForwardCdtData`: en tasa, los días sin valor repiten el último cierre graficado (con su fecha); después
 * del último dato real no se rellena.
 */
export function rellenarTasa(datos: readonly PuntoLinea[]): PuntoLinea[] {
  let ultimoReal = -1;
  datos.forEach((p, i) => {
    if (p.valorTooltip !== null && p.valorTooltip !== undefined) {
      ultimoReal = i;
    }
  });
  let ultimo: PuntoLinea | null = null;
  return datos.map((p, i) => {
    if (p.value !== null) {
      ultimo = p;
    }
    if ((p.valorTooltip !== null && p.valorTooltip !== undefined) || i > ultimoReal) {
      return p;
    }
    return ultimo ? { ...ultimo, fecha: p.fecha } : p;
  });
}

/** Etiquetas del eje: una por fecha, ordenadas por la fecha real (`collectDates` + `sortFriendlyDates`). */
export function etiquetasContratos(contratos: readonly ContratoGrafica[]): string[] {
  const fechas = new Map<string, string>();
  contratos.forEach((c) => c.puntos.forEach((p) => fechas.has(p.etiqueta) || fechas.set(p.etiqueta, p.fechaIso)));
  return [...fechas.entries()].sort((a, b) => a[1].localeCompare(b[1])).map(([etiqueta]) => etiqueta);
}

function serieContrato(c: ContratoGrafica, etiquetas: readonly string[], modoTasa: boolean): SerieLinea {
  const esCdt = c.tipo === 'cdt';
  const esIndicador = c.tipo === 'indicador';
  const porEtiqueta = new Map(c.puntos.map((p) => [p.etiqueta, p]));
  const primera = etiquetas.find((e) => porEtiqueta.has(e));
  const base = primera ? Number(porEtiqueta.get(primera)?.valorNormalizado) : 0;
  // En tasa se grafica el valor con signo; si no, el normalizado vuelto a base 1.000 en la primera fecha.
  const graficado = (p: PuntoSerie): number =>
    modoTasa ? Number(p.valor) : base > 0 ? (Number(p.valorNormalizado) / base) * 1000 : Number(p.valorNormalizado);
  const valores = c.puntos.map(graficado).filter((v) => !Number.isNaN(v) && (modoTasa || v > 0));
  const [abajo, arriba] = umbralesAtipicos(valores, 4);
  const nombre = c.nombreVisible ?? c.clave;
  const comun = { nombre, tipo: c.tipo, removible: c.removible, esTasa: modoTasa };
  const datos: PuntoLinea[] = etiquetas.map((etiqueta) => {
    const p = porEtiqueta.get(etiqueta);
    if (!p) {
      return { ...comun, value: null, valorTooltip: null, rendimiento: null, saldo: null, fecha: etiqueta, imagen: '' };
    }
    const v = graficado(p);
    const atipico = v < abajo || v > arriba;
    return {
      ...comun,
      value: atipico || Number.isNaN(v) ? null : redondear(v),
      valorTooltip: valorTooltipContrato(p.valor, modoTasa, esIndicador),
      rendimiento: p.rendimiento ?? null,
      saldo: p.saldo ?? null,
      fecha: p.etiqueta,
      fechaIso: p.fechaIso,
      fechaExtracto: p.fechaExtracto ?? '',
      imagen: c.imagen ?? '',
    };
  });
  return {
    nombre: c.clave,
    nombreProducto: c.nombreProducto,
    nombreVisible: c.nombreVisible ?? (c.removible ? c.nombreProducto : c.clave),
    compania: c.compania,
    imagen: c.imagen,
    tipo: c.tipo,
    removible: c.removible,
    color: c.color,
    suave: !esCdt,
    punteada: esCdt || !!c.imagen,
    ...(esCdt ? { grosor: 1.5 } : {}),
    datos: modoTasa ? rellenarTasa(datos) : datos,
  };
}

/**
 * Datos de la gráfica de contratos: etiquetas comunes, una serie por contrato con puntos y el eje Y con un 5 % de
 * margen (desde 0 en valor de unidad; con negativos en tasa, cuando hay un CDT aplicado).
 */
export function armarGraficaContratos(contratos: readonly ContratoGrafica[], modoTasa = false): DatosGraficaContratos {
  const conPuntos = contratos.filter((c) => c.puntos.length > 0);
  if (!conPuntos.length) {
    return { etiquetas: [], series: [], yMin: 0, yMax: 0 };
  }
  const etiquetas = etiquetasContratos(conPuntos);
  const series = conPuntos.map((c) => serieContrato(c, etiquetas, modoTasa));
  const valores = series.flatMap((s) => s.datos.map((d) => d.value).filter((v): v is number => v != null));
  const min = Math.min(...valores);
  const max = Math.max(...valores);
  const margen = (max - min) * 0.05;
  return {
    etiquetas,
    series,
    yMin: modoTasa ? min - margen : Math.max(0, min - margen),
    yMax: max + margen,
  };
}

/**
 * Serie decorativa que producción pinta detrás del aviso cuando el cliente no tiene productos
 * (`EMPTY_CONTRACTS_CHART`, una serie del dólar sin nombre): sin clave, la leyenda no aparece.
 */
export function contratoDecorativo(hoy: Date, color: string): ContratoGrafica {
  const serie = { semilla: 3.3, valorHoy: 3895.53, rentabilidadAnual: 6, volatilidad: 2, soloHabiles: true };
  const rango = { inicio: aIso(restarMeses(hoy, 3)), fin: aIso(hoy) };
  return { clave: '', nombreProducto: '', nombreVisible: '', color, removible: false, tipo: 'indicador', puntos: puntosSerie(serie, rango, hoy) };
}
