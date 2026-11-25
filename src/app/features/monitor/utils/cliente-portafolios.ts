import { TEXTOS_CLIENTE } from '@features/monitor/constants/textos-cliente';
import { FilaPortafolio, MovimientoPortafolio, PortafolioCliente } from '@features/monitor/interfaces/cliente';
import { GrupoCasillas, PorcionTorta, RangoFechas } from '@features/monitor/interfaces/comunes';
import { ContratoGrafica, PlazoCdt } from '@features/monitor/interfaces/detalle';
import { claveCubierta } from '@features/monitor/utils/cliente-comparacion';
import { tirAproximada } from '@features/monitor/utils/cliente-contratos';
import { diasPlazo, plazoVisible, puntosTasaMovil } from '@features/monitor/utils/detalle-activos';
import { diasEntre, metricasPuntos, puntosSerie, redondear, valorSerie } from '@features/monitor/utils/detalle-series';
import { aIso, desdeIso } from '@features/monitor/utils/fechas';

/**
 * Pestaña «Portafolios» de la página del Monitor del cliente: filas de «Indicadores por portafolio» con las medidas
 * del periodo, filtro por categoría o producto, torta y series de la gráfica (`adaptPorfolioToContractMonitor`,
 * `onDataSelectedFilter`, `setTableOptionsPortFolio`, `setCompararPortfolio`).
 */

/** Clave de la serie de un portafolio: su id y los 3 últimos dígitos del contrato. */
export function clavePortafolio(p: Pick<PortafolioCliente, 'id' | 'contrato'>): string {
  return `${p.id} ${p.contrato.slice(-3)}`;
}

/** Valor de unidad de un portafolio en una fecha ISO. */
export function valorUnidadEn(p: PortafolioCliente, fechaIso: string, hoy: Date): number {
  const fecha = desdeIso(fechaIso) ?? hoy;
  return valorSerie(p.serie, Math.max(0, diasEntre(fecha, hoy)));
}

/** Unidades de un movimiento: su valor entre el valor de unidad de ese día. */
export function unidadesMovimiento(p: PortafolioCliente, m: MovimientoPortafolio, hoy: Date): number {
  return redondear(m.valor / valorUnidadEn(p, m.fecha, hoy), 4);
}

/**
 * Valor promedio de compra y de venta (ponderado por monto): las entradas y las salidas que no son devoluciones.
 * Sin salidas no hay promedio de venta.
 */
export function promediosCompraVenta(p: PortafolioCliente, hoy: Date): { compra: number | null; venta: number | null } {
  const promedio = (lista: readonly MovimientoPortafolio[]): number | null => {
    const valor = lista.reduce((s, m) => s + Math.abs(m.valor), 0);
    const unidades = lista.reduce((s, m) => s + Math.abs(unidadesMovimiento(p, m, hoy)), 0);
    return unidades > 0 ? redondear(valor / unidades) : null;
  };
  const propios = p.movimientos.filter((m) => !m.devolucion);
  return { compra: promedio(propios.filter((m) => m.valor > 0)), venta: promedio(propios.filter((m) => m.valor < 0)) };
}

/** Movimientos dentro del rango (ambos extremos incluidos). */
export function movimientosEnRango(p: PortafolioCliente, rango: RangoFechas): MovimientoPortafolio[] {
  return p.movimientos.filter((m) => m.fecha >= rango.inicio && m.fecha <= rango.fin);
}

const porcentajeDe = (valor: number | null, total: number): number | null =>
  valor === null || !total ? null : redondear((valor / total) * 100);

/**
 * Filas de los portafolios del cliente en el rango, de mayor a menor saldo y con el color de la paleta en ese
 * orden. El rendimiento del periodo es la parte del rendimiento acumulado (el de la ficha) que corresponde a la
 * subida del valor de unidad en el rango; con «Desde el inicio» es el acumulado. Sin datos en el rango, las
 * medidas del periodo quedan vacías.
 */
export function filasPortafolios(
  portafolios: readonly PortafolioCliente[],
  rango: RangoFechas,
  hoy: Date,
  paleta: readonly string[],
): FilaPortafolio[] {
  const base = [...portafolios]
    .sort((a, b) => b.saldo - a.saldo)
    .map((p, i) => {
      const m = metricasPuntos(puntosSerie(p.serie, rango, hoy));
      const subidaTotal = valorSerie(p.serie, 0) - valorUnidadEn(p, p.fechaPrimeraCompra, hoy);
      const rendimientoPeriodo = m && subidaTotal ? Math.round(p.rendimientos * ((m.valorFinal - m.valorInicial) / subidaTotal)) : null;
      const { compra, venta } = promediosCompraVenta(p, hoy);
      const valorUnidad = p.serie.valorHoy;
      return {
        clave: clavePortafolio(p),
        id: p.id,
        nombre: p.nombre,
        producto: p.producto,
        contrato: p.contrato,
        color: paleta[i % paleta.length],
        porcentaje: 0,
        fechaPrimeraCompra: p.fechaPrimeraCompra,
        vupCompra: compra,
        vupVenta: venta,
        valorUnidad,
        saldo: p.saldo,
        rendimientoAcumulado: p.rendimientos,
        contribucionAcumulado: null,
        rendimientoPeriodo,
        contribucionPeriodo: null,
        retorno: rendimientoPeriodo === null ? null : redondear((rendimientoPeriodo / (p.saldo - rendimientoPeriodo)) * 100),
        tea: m ? m.tea : null,
        tir: m ? tirAproximada(m.tea) : null,
        transacciones: movimientosEnRango(p, rango).length,
        variacionCompra: compra ? redondear((valorUnidad / compra - 1) * 100) : null,
        variacionVenta: compra && venta ? redondear((venta / compra - 1) * 100) : null,
        fechaCorte: aIso(hoy),
      };
    });
  const totalAcumulado = base.reduce((s, f) => s + f.rendimientoAcumulado, 0);
  const totalPeriodo = base.reduce((s, f) => s + (f.rendimientoPeriodo ?? 0), 0);
  return base.map((f) => ({
    ...f,
    contribucionAcumulado: porcentajeDe(f.rendimientoAcumulado, totalAcumulado),
    contribucionPeriodo: porcentajeDe(f.rendimientoPeriodo, totalPeriodo),
  }));
}

/** Productos del catálogo que se pueden filtrar, con su categoría. */
const PRODUCTOS_FILTRO = TEXTOS_CLIENTE.filtro.catalogo;

/**
 * `onDataSelectedFilter`: sin nada marcado, todas; si no, las filas de los productos marcados o de los productos
 * de las categorías marcadas.
 */
export function filtrarPorProductos(filas: readonly FilaPortafolio[], marcados: readonly string[]): FilaPortafolio[] {
  if (!marcados.length) {
    return [...filas];
  }
  const codigos: readonly string[] = PRODUCTOS_FILTRO.filter((p) => marcados.includes(p.categoria) || marcados.includes(p.codigo)).map(
    (p) => p.codigo,
  );
  return filas.filter((f) => codigos.includes(f.producto));
}

/** Filas sin las series ocultas desde la leyenda, con el porcentaje sobre el saldo de las que quedan. */
export function filasVisibles(filas: readonly FilaPortafolio[], ocultas: readonly string[]): FilaPortafolio[] {
  const visibles = filas.filter((f) => !ocultas.includes(f.clave));
  const total = visibles.reduce((s, f) => s + f.saldo, 0);
  return visibles.map((f) => ({ ...f, porcentaje: total > 0 ? Number(((f.saldo / total) * 100).toFixed(2)) : 0 }));
}

/** Torta de composición de los portafolios (la sigue al filtro y a la leyenda, como la tabla). */
export function tortaPortafolios(filas: readonly FilaPortafolio[]): PorcionTorta[] {
  return filas.map((f) => ({ nombre: f.nombre, valor: f.porcentaje, color: f.color, saldo: f.saldo }));
}

/** `buildCheckboxFilterProperties`: categorías y productos que tiene el cliente. */
export function gruposFiltro(filas: readonly FilaPortafolio[]): GrupoCasillas[] {
  if (!filas.length) {
    return [];
  }
  const productos = PRODUCTOS_FILTRO.filter((p) => filas.some((f) => f.producto === p.codigo));
  const F = TEXTOS_CLIENTE.filtro;
  return [
    {
      titulo: F.categorias,
      opciones: F.categoriasProducto
        .filter((c) => productos.some((p) => p.categoria === c.valor))
        .map((c) => ({ nombre: c.nombre, valor: c.valor })),
    },
    { titulo: F.productos, opciones: productos.map((p) => ({ nombre: p.descripcion, valor: p.codigo })) },
  ];
}

/**
 * Series de los portafolios del cliente para la gráfica: valor de unidad (o, con un CDT aplicado, su
 * rentabilidad móvil en el plazo, con «· CDT A 30 días» en el nombre).
 */
export function contratosPortafolios(
  filas: readonly FilaPortafolio[],
  portafolios: readonly PortafolioCliente[],
  rango: RangoFechas,
  hoy: Date,
  plazo?: PlazoCdt,
): ContratoGrafica[] {
  return filas.flatMap((f) => {
    const p = portafolios.find((x) => clavePortafolio(x) === f.clave);
    if (!p) {
      return [];
    }
    const puntos = plazo
      ? puntosTasaMovil({ clave: f.clave, nombre: p.nombre, tipo: 'portafolio', serie: p.serie }, rango, hoy, diasPlazo(plazo))
      : puntosSerie(p.serie, rango, hoy);
    const nombre = plazo ? `${p.nombre} · ${plazoVisible(plazo)}` : p.nombre;
    return [{ clave: f.clave, nombreProducto: nombre, nombreVisible: nombre, color: f.color, removible: false, puntos }];
  });
}

/**
 * `setCompararPortfolio`: al agregar portafolios, indicadores o mezclas, la gráfica vuelve a pintar los propios y
 * lo agregado con la paleta desde la mitad (la competencia y los CDT conservan su color). La tabla y la torta
 * conservan los colores originales, como en producción.
 */
export function recolorearComparacion(
  propios: readonly ContratoGrafica[],
  agregados: readonly ContratoGrafica[],
  paleta: readonly string[],
): ContratoGrafica[] {
  const conPuntos = agregados.filter((c) => c.puntos.length > 0);
  if (!conPuntos.length) {
    return [...propios];
  }
  const mitad = Math.floor(paleta.length / 2);
  return [...propios, ...conPuntos].map((c, i) => ({ ...c, color: paleta[(mitad + i) % paleta.length] }));
}

/** Colores de las series de la gráfica por clave (lo comparado toma el color de su serie en las tablas). */
export function coloresSeries(contratos: readonly ContratoGrafica[]): Map<string, string> {
  return new Map(contratos.filter((c) => c.puntos.length > 0).map((c) => [c.clave, c.color]));
}

/** Claves ocultas o del activo: la fila se oculta si su clave está cubierta (con o sin sufijo de plazo). */
export function estaOculta(clave: string, ocultas: readonly string[]): boolean {
  return claveCubierta(clave, ocultas);
}
