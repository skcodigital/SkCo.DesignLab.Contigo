import { PORTAFOLIOS } from '@features/ficha-cliente/data/composicion.mock';
import { MOVIMIENTOS_FIC, PRODUCTOS } from '@features/ficha-cliente/data/productos.mock';
import { DETALLES_PORTAFOLIOS_OSCAR } from '@features/monitor/data/detalle-cliente.mock';
import { MovimientoPortafolio, PortafolioCliente, ProductoContrato } from '@features/monitor/interfaces/cliente';

/**
 * Monitor del cliente: lo que la página necesita de Óscar además de sus contratos (`CONTRATOS_OSCAR`): el
 * producto de cada contrato, sus portafolios (los de la ficha, con su valor de unidad en el tiempo) y los
 * movimientos de cada portafolio. Todo es ficticio y determinista; saldos, unidades y rendimientos cuadran con
 * la ficha.
 */

const MF = PRODUCTOS.mf.contrato;
const FIC = PRODUCTOS.fic.contrato;

/** Producto de cada contrato de Óscar. */
export const PRODUCTOS_CONTRATO_OSCAR: readonly ProductoContrato[] = [
  { contrato: MF, codigo: 'MFUND', tipo: 'mf', meta: PRODUCTOS.mf.nombre, nombreProducto: PRODUCTOS.mf.fondo },
  { contrato: FIC, codigo: 'FCO', tipo: 'fic', meta: PRODUCTOS.fic.nombre, nombreProducto: PRODUCTOS.fic.fondo },
];

/** Primer día con datos de los contratos de Óscar («Desde el inicio»). */
export const INICIO_HISTORIA_OSCAR = '2025-11-12';

const aporte = (fecha: string, valor: number, tipo = 'Adición'): MovimientoPortafolio => ({ fecha, contrato: MF, tipo, valor });
const retiro = (fecha: string, valor: number): MovimientoPortafolio => ({ fecha, contrato: MF, tipo: 'Retiro parcial', valor: -valor });
const ajuste = (fecha: string, valor: number): MovimientoPortafolio => ({ fecha, contrato: MF, tipo: 'Ajuste', valor, devolucion: true });
const traslado = (fecha: string, valor: number) => aporte(fecha, valor, 'Traslado entre portafolios');

/** `$ -1.200.000` → -1200000. */
const pesos = (texto: string): number => Number(texto.replace(/[$\s.]/g, ''));
/** `05/11/2026` → `2026-11-05`. */
const iso = (fecha: string): string => fecha.split('/').reverse().join('-');

/** Movimientos del FIC: los de la ficha y, antes, la apertura y los aportes del primer semestre. */
const MOVIMIENTOS_EFECTIVO: readonly MovimientoPortafolio[] = [
  { fecha: '2026-01-13', contrato: FIC, tipo: 'Adición', valor: 5_000_000 },
  ...['2026-02-05', '2026-03-05', '2026-04-05', '2026-05-05'].map((fecha) => ({
    fecha,
    contrato: FIC,
    tipo: 'Adición',
    valor: 500_000,
  })),
  ...MOVIMIENTOS_FIC.map((m) => ({
    fecha: iso(m.fecha),
    contrato: FIC,
    tipo: m.tipo,
    valor: pesos(m.bruto),
    ...(m.tipo === 'Ajuste' ? { devolucion: true } : {}),
  })),
];

/** Id, primera compra y movimientos de cada portafolio, en el orden de la ficha (Multifund y luego el FIC). */
const PORTAFOLIOS_DEF: readonly { id: string; desde: string; movimientos: readonly MovimientoPortafolio[] }[] = [
  {
    id: 'FVPCAT0230',
    desde: '2025-11-12',
    movimientos: [
      aporte('2025-11-12', 8_000_000),
      aporte('2026-02-05', 500_000),
      aporte('2026-05-05', 500_000),
      aporte('2026-08-05', 500_000),
      ajuste('2026-10-14', 12_350),
    ],
  },
  {
    id: 'FVPCAT1127',
    desde: '2025-11-12',
    movimientos: [
      aporte('2025-11-12', 8_000_000),
      aporte('2026-03-05', 500_000),
      retiro('2026-06-19', 400_000),
      aporte('2026-09-05', 400_000),
    ],
  },
  {
    id: 'FVPCAT0430',
    desde: '2026-02-03',
    movimientos: [
      traslado('2026-02-03', 11_800_000),
      aporte('2026-04-05', 500_000),
      aporte('2026-07-06', 500_000),
      aporte('2026-10-05', 500_000),
    ],
  },
  {
    id: 'FVPCAT12MD',
    desde: '2025-11-12',
    movimientos: [
      aporte('2025-11-12', 14_000_000),
      aporte('2026-01-05', 600_000),
      retiro('2026-04-22', 900_000),
      aporte('2026-07-06', 600_000),
      ajuste('2026-09-30', -8_420),
      aporte('2026-10-05', 600_000),
    ],
  },
  {
    id: 'FPVLIQCOL',
    desde: '2025-11-12',
    movimientos: [aporte('2025-11-12', 120_000), aporte('2026-06-05', 15_000)],
  },
  {
    id: 'FVPRFMAR29',
    desde: '2026-03-16',
    movimientos: [traslado('2026-03-16', 2_900_000), aporte('2026-08-05', 100_000)],
  },
  { id: 'FICEFECTIVO', desde: '2026-01-13', movimientos: MOVIMIENTOS_EFECTIVO },
];

/**
 * Portafolios de Óscar: los de la ficha con su valor de unidad en el tiempo. La receta de la serie es la misma del
 * detalle de cada portafolio (`DETALLES_PORTAFOLIOS_OSCAR`) y empieza en la primera compra.
 */
export const PORTAFOLIOS_OSCAR: readonly PortafolioCliente[] = [
  ...PORTAFOLIOS.mf.map((f) => ({ f, contrato: MF, producto: 'MFUND' })),
  ...PORTAFOLIOS.fic.map((f) => ({ f, contrato: FIC, producto: 'FCO' })),
].map(({ f, contrato, producto }, i) => {
  const def = PORTAFOLIOS_DEF[i];
  return {
    id: def.id,
    nombre: f.nombre,
    contrato,
    producto,
    fechaPrimeraCompra: def.desde,
    unidades: f.unidades,
    saldo: f.saldo,
    rendimientos: f.rendimientos,
    serie: {
      semilla: 0.5 + i * 0.8,
      valorHoy: f.valorUnidad,
      rentabilidadAnual: f.ea,
      volatilidad: 0.6 + (i % 3) * 0.4,
      inicio: def.desde,
    },
    detalle: DETALLES_PORTAFOLIOS_OSCAR[i],
    movimientos: def.movimientos,
  };
});
