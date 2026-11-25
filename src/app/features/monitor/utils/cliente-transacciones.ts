import { TEXTOS_CLIENTE } from '@features/monitor/constants/textos-cliente';
import { FilaTransaccion, PortafolioCliente, ProductoContrato } from '@features/monitor/interfaces/cliente';
import { GrupoCasillas, OpcionesTabla, RangoFechas, ValoresCasillas } from '@features/monitor/interfaces/comunes';
import { movimientosEnRango, unidadesMovimiento, valorUnidadEn } from '@features/monitor/utils/cliente-portafolios';

/**
 * Tabla del visor de transacciones de un portafolio (`transaction-info`): movimientos del periodo de la pestaña
 * Portafolios, del más reciente al más antiguo, con «Ocultar devoluciones» y el contrato con su meta en un
 * tooltip.
 */

const C = TEXTOS_CLIENTE.transacciones.columnas;

/** Fecha y hora local (la tabla la muestra `dd/MM/yyyy` sin correrse de día). */
const fechaLocal = (iso: string): string => `${iso}T00:00:00`;

/** Movimientos del periodo como filas de la tabla; con `ocultarDevoluciones` no van las devoluciones. */
export function filasTransacciones(
  p: PortafolioCliente,
  rango: RangoFechas,
  hoy: Date,
  ocultarDevoluciones: boolean,
): FilaTransaccion[] {
  return movimientosEnRango(p, rango)
    .filter((m) => !(ocultarDevoluciones && m.devolucion))
    .map((m) => ({
      fecha: fechaLocal(m.fecha),
      contrato: m.contrato,
      unidades: unidadesMovimiento(p, m, hoy),
      tipo: m.tipo,
      valorUnidad: valorUnidadEn(p, m.fecha, hoy),
      total: m.valor,
      devolucion: !!m.devolucion,
    }))
    .sort((a, b) => b.fecha.localeCompare(a.fecha));
}

/** El interruptor «Ocultar devoluciones» solo aparece si hay devoluciones en el periodo. */
export function hayDevoluciones(p: PortafolioCliente, rango: RangoFechas): boolean {
  return movimientosEnRango(p, rango).some((m) => !!m.devolucion);
}

/** Tooltip del contrato: «<meta> |  <producto> - <contrato>» (con el doble espacio de producción). */
export function tooltipContrato(contrato: string, productos: readonly ProductoContrato[]): string {
  const p = productos.find((x) => x.contrato === contrato);
  if (!p) {
    return '';
  }
  const meta = p.meta ? `${p.meta} | ` : '';
  return `${meta} ${p.nombreProducto} - ${p.contrato}`;
}

/** Casillas de «Personaliza» del visor. */
export const CASILLAS_TRANSACCIONES: GrupoCasillas = {
  opciones: [
    { valor: 'fecha', nombre: C.fecha },
    { valor: 'contrato', nombre: C.contrato },
    { valor: 'unidades', nombre: C.unidades },
    { valor: 'tipo', nombre: C.tipo },
    { valor: 'valorUnidad', nombre: C.valorUnidad },
    { valor: 'total', nombre: C.total },
  ],
};

export const COLUMNAS_TRANSACCIONES: ValoresCasillas = Object.fromEntries(
  CASILLAS_TRANSACCIONES.opciones.map((o) => [o.valor, true]),
);

/** Opciones de la tabla de transacciones (ordenable, sin paginador ni columna de acciones). */
export function opcionesTablaTransacciones(
  filas: readonly FilaTransaccion[],
  columnas: ValoresCasillas,
  productos: readonly ProductoContrato[],
): OpcionesTabla {
  return {
    claves: ['fecha', 'contrato', 'unidades', 'tipo', 'valorUnidad', 'total'],
    etiquetas: [C.fecha, C.contrato, C.unidades, C.tipo, C.valorUnidad, C.total],
    tiposColumna: ['fecha', 'texto', 'numero', 'texto', 'dinero', 'dinero'],
    datos: filas,
    ordenable: true,
    conAcciones: false,
    desactivarColumnaAcciones: true,
    conPaginador: false,
    columnasVisibles: columnas,
    tooltipCelda: (f, clave) => (clave === 'contrato' ? tooltipContrato(String(f['contrato'] ?? ''), productos) : ''),
  };
}
