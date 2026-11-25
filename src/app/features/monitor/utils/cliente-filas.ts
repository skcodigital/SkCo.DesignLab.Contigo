import { FilaCompararPortafolio, FilaMezcla, VistaCliente } from '@features/monitor/interfaces/cliente';
import { ActivoComparado, MetricasActivo } from '@features/monitor/interfaces/detalle';
import { ActivosCliente, claveCubierta, definicionComparada } from '@features/monitor/utils/cliente-comparacion';
import { separarPlazoCdt } from '@features/monitor/utils/detalle-comparacion';

/**
 * Filas de las tablas de lo comparado en la página del Monitor del cliente: «Mezcla Invest-ed, Competencia, CDTs e
 * Indicadores» (`mapMixesTableRows`, `mapBenchmarkTableRows`, `mapCdtTableRows` y las de indicadores) e
 * «Indicadores para comparar» (`dataTableCompararPortfolio`).
 */

const dos = (v: number | null | undefined): string => (v ?? 0).toFixed(2);

/** Separa el plazo del CDT del nombre («… - Rentabilidad móvil 30 días (A 30 DIAS)» → nombre y «CDT A 30 días»). */
function nombreYPlazo(nombre: string): { nombre: string; plazoCdt?: string } {
  const plazo = separarPlazoCdt(nombre);
  return plazo ? { nombre: plazo.base, plazoCdt: plazo.plazo } : { nombre };
}

function fila(a: ActivoComparado, m: MetricasActivo, color: string): FilaMezcla {
  const esCdt = a.tipo === 'cdt';
  return {
    clave: a.clave,
    ...(esCdt ? { nombre: a.nombre } : nombreYPlazo(a.nombre)),
    tipo: a.tipo,
    valorInicial: m.valorInicial,
    valorFinal: m.valorFinal,
    variacion: esCdt ? m.variacion : dos(m.variacion),
    volatilidad: dos(m.volatilidad),
    tea: dos(m.tea),
    retorno: esCdt ? null : dos(m.retorno),
    color,
    removible: true,
    ...(a.imagen ? { imagen: a.imagen } : {}),
  };
}

/**
 * Filas de la tabla de lo comparado: mezclas, competencia, CDT e indicadores (en Portafolios, los CDT van antes de
 * la competencia), con el color de su serie y sin las ocultas desde la leyenda.
 */
export function filasMezclas(
  a: ActivosCliente,
  vista: VistaCliente,
  colores: ReadonlyMap<string, string>,
  ocultas: readonly string[],
): FilaMezcla[] {
  const grupos =
    vista === 'contratos'
      ? [a.mezclas, a.referencias, a.cdt, a.indicadores]
      : [a.mezclas, a.cdt, a.referencias, a.indicadores];
  return grupos
    .flat()
    .filter((x) => !!x.metricas && !claveCubierta(x.clave, ocultas))
    .map((x) => fila(x, x.metricas as MetricasActivo, colores.get(x.clave) ?? x.color));
}

/** La fila abre el detalle con «Ver más»: solo las mezclas y la competencia. */
export function filaMezclaExpandible(f: { tipo?: unknown }): boolean {
  return f.tipo === 'mezcla' || f.tipo === 'referencia';
}

/** Id del portafolio sin el sufijo del plazo («FPVLIQCOL_30» → «FPVLIQCOL»). */
function idBase(clave: string): string {
  return definicionComparada(clave)?.clave ?? clave;
}

/**
 * Portafolios Skandia comparados en la pestaña Portafolios: «<nombre> - <id>», valor de unidad inicial, fecha de
 * corte y saldo (el valor final), con el color de su serie; de mayor a menor saldo.
 */
export function filasCompararPortafolios(
  fondos: readonly ActivoComparado[],
  colores: ReadonlyMap<string, string>,
  ocultas: readonly string[],
): FilaCompararPortafolio[] {
  return fondos
    .filter((a) => !!a.metricas && colores.has(a.clave) && !claveCubierta(a.clave, ocultas))
    .map((a) => {
      const m = a.metricas as MetricasActivo;
      const { nombre, plazoCdt } = nombreYPlazo(a.nombre);
      const ultimo = a.puntos[a.puntos.length - 1];
      return {
        clave: a.clave,
        nombre: `${nombre} - ${plazoCdt ? idBase(a.clave) : a.clave}`,
        ...(plazoCdt ? { plazoCdt } : {}),
        valorUnidad: m.valorInicial,
        fechaCorte: `${ultimo?.fechaIso ?? ''}T00:00:00`,
        saldo: m.valorFinal,
        color: colores.get(a.clave) ?? a.color,
        removible: true as const,
      };
    })
    .sort((a, b) => b.saldo - a.saldo);
}
