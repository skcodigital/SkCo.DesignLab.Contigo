import { FilaContrato, ProductoContrato } from '@features/monitor/interfaces/cliente';
import { PorcionTorta, RangoFechas } from '@features/monitor/interfaces/comunes';
import { ActivoComparado, DefinicionContrato } from '@features/monitor/interfaces/detalle';
import { claveCubierta } from '@features/monitor/utils/cliente-comparacion';
import { separarPlazoCdt } from '@features/monitor/utils/detalle-comparacion';
import { claveContrato, saldoHoy } from '@features/monitor/utils/detalle-contratos';
import { metricasPuntos, puntosSerie, redondear } from '@features/monitor/utils/detalle-series';

/**
 * Pestaña «Contratos» de la página del Monitor del cliente: filas de «Indicadores por contrato» (contratos propios
 * y portafolios agregados con «Comparar»), torta de composición y porcentajes (`enrichContractsWithNameRef`,
 * `getFilteredAndSortedAssets`, `mapDataContractyPie`).
 */

/** Productos que entran en la torta de contratos (`PIE_PRODUCT_CODES`). */
export const CODIGOS_TORTA: readonly string[] = ['MFUND', 'SIPEN', 'ICRFLO', 'OMINMA', 'FCO', 'FCPIMP'];

/**
 * `buildNameRef`: el nombre del producto (si tiene 4 palabras o más, las dos primeras, las 3 primeras letras de la
 * tercera, «...» y la última) y el número del contrato.
 */
export function nombreReferencia(nombreProducto: string, contrato: string): string {
  const palabras = nombreProducto.split(/\s+/);
  const corto =
    palabras.length < 4
      ? nombreProducto
      : `${palabras[0]} ${palabras[1]} ${palabras[2].slice(0, 3)}... ${palabras[palabras.length - 1]}`;
  return `${corto} | ${contrato}`;
}

/** `calculatePercentage`: porcentaje con 2 decimales (texto), 0.00 si no hay total. */
export function porcentaje(valor: number, total: number): string {
  return total > 0 ? ((valor / total) * 100).toFixed(2) : '0.00';
}

/** TIR aproximada a partir de la TEA del rango (la misma aproximación del desempeño del detalle). */
export function tirAproximada(tea: number): number {
  return redondear(tea - 0.37);
}

/**
 * Filas de los contratos propios con datos en el rango, de mayor a menor saldo (el color es el de la gráfica). Las
 * series ocultas desde la leyenda no van y el porcentaje se calcula sobre las que quedan. Los rendimientos solo se
 * muestran con «Desde el inicio».
 */
export function filasContratos(
  defs: readonly DefinicionContrato[],
  productos: readonly ProductoContrato[],
  rango: RangoFechas,
  hoy: Date,
  paleta: readonly string[],
  ocultas: readonly string[],
  conRendimientos: boolean,
): FilaContrato[] {
  const filas = [...defs]
    .sort((a, b) => saldoHoy(b) - saldoHoy(a))
    .map((def, i) => ({ def, color: paleta[i % paleta.length], clave: claveContrato(def.producto, def.contrato) }))
    .map(({ def, color, clave }) => ({ def, color, clave, m: metricasPuntos(puntosSerie(def.serie, rango, hoy)) }))
    .filter(({ m, clave }) => !!m && !ocultas.includes(clave));
  const total = filas.reduce((suma, f) => suma + saldoHoy(f.def), 0);
  return filas.map(({ def, color, clave, m }) => {
    const producto = productos.find((p) => p.contrato === def.contrato);
    const saldo = saldoHoy(def);
    return {
      clave,
      nombre: nombreReferencia(def.nombreProducto, def.contrato),
      contrato: def.contrato,
      ...(producto ? { tipoProducto: producto.tipo } : {}),
      porcentaje: porcentaje(saldo, total),
      valorInicial: m?.valorInicial ?? 0,
      valorFinal: m?.valorFinal ?? 0,
      variacion: (m?.variacion ?? 0).toFixed(2),
      tir: tirAproximada(m?.tea ?? 0).toFixed(2),
      ...(conRendimientos ? { rendimientos: def.rendimientosHoy } : {}),
      saldo,
      color,
      removible: false,
    };
  });
}

/**
 * Portafolios Skandia agregados con «Comparar» como filas de la tabla de contratos: con el color de su serie, sin
 * las ocultas, con el plazo del CDT debajo del nombre y de mayor a menor saldo (el valor final).
 */
export function filasFondosContratos(
  fondos: readonly ActivoComparado[],
  colores: ReadonlyMap<string, string>,
  ocultas: readonly string[],
): FilaContrato[] {
  return fondos
    .filter((a) => !!a.metricas && colores.has(a.clave) && !claveCubierta(a.clave, ocultas))
    .map((a) => {
      const m = a.metricas as NonNullable<ActivoComparado['metricas']>;
      const plazo = separarPlazoCdt(a.nombre);
      return {
        clave: a.clave,
        nombre: plazo?.base ?? a.nombre,
        ...(plazo ? { plazoCdt: plazo.plazo } : {}),
        valorInicial: m.valorInicial,
        valorFinal: m.valorFinal,
        variacion: m.variacion.toFixed(2),
        saldo: m.valorFinal,
        color: colores.get(a.clave) ?? a.color,
        removible: true,
      };
    })
    .sort((a, b) => b.saldo - a.saldo);
}

/** `hasZeroTirContracts`: algún contrato con TIR en cero (muestra el aviso sobre la tabla). */
export function hayTirCero(filas: readonly FilaContrato[]): boolean {
  return filas.some((f) => f.tir !== undefined && Number(f.tir) === 0);
}

/**
 * Torta de composición de los contratos: los de los productos de inversión, de mayor a menor saldo, con el nombre
 * «MFUND - 100000063061» y el porcentaje con 2 decimales.
 */
export function tortaContratos(
  defs: readonly DefinicionContrato[],
  productos: readonly ProductoContrato[],
  paleta: readonly string[],
): PorcionTorta[] {
  const conCodigo = defs
    .map((def) => ({ def, codigo: productos.find((p) => p.contrato === def.contrato)?.codigo ?? '' }))
    .filter(({ codigo }) => CODIGOS_TORTA.includes(codigo))
    .sort((a, b) => saldoHoy(b.def) - saldoHoy(a.def));
  const total = conCodigo.reduce((suma, c) => suma + saldoHoy(c.def), 0);
  return conCodigo.map(({ def, codigo }, i) => ({
    nombre: `${codigo} - ${def.contrato}`,
    valor: Number(porcentaje(saldoHoy(def), total)),
    color: paleta[i % paleta.length],
    saldo: saldoHoy(def),
  }));
}
