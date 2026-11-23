// Textos que arma el TS en Clientes, Equipo asignado y Plan corporativo (cambian con el ámbito o el dato).
import { DatosAmbito } from '@features/radiografia/interfaces/clientes';
import { Ambito, ParteTexto } from '@features/radiografia/interfaces/radiografia';
import { signo } from '@features/radiografia/utils/formato';

export const TEXTOS_CLIENTES = {
  evolSub: {
    skandia: 'Clientes nuevos y perdidos por año en la empresa',
    agencia: 'Clientes nuevos y perdidos por año, Agencia Norte (FP Asignado y demás asesores)',
  },
  prodSub: (d: DatosAmbito): string => `Base: ${d.total} clientes de ${d.nombre}`,
  segSub: {
    skandia: 'Los 412 clientes de Skandia en la empresa, según su segmento',
    agencia: 'Los 201 clientes de Agencia Norte en la empresa, según su segmento',
  },
  edadSub: {
    skandia: 'Los 412 clientes de Skandia en la empresa, por edad',
    agencia: 'Los 201 clientes de Agencia Norte en la empresa, por edad',
  },
  aria1p: {
    director: '1 producto (1P): ver los clientes monoproducto de tu agencia',
    dueno: '1 producto (1P): ver tus clientes monoproducto',
    fp: '1 producto (1P): ver tu cliente monoproducto',
  },
  tip: {
    clientesActivos: 'Clientes activos',
    productosPorCliente: 'Productos por cliente',
    clientesPorSegmento: 'Clientes por segmento',
    saldoAdministrado: 'Saldo administrado',
    clientesNuevos: 'Clientes nuevos',
    clientesPerdidos: 'Clientes perdidos',
    aportes: 'Aportes',
    retiros: 'Retiros',
  },
  netoAlerta: 'Alerta: perdió más clientes de los que trajo',
} as const;

/** Alerta bajo "Evolución de clientes" según el ámbito. */
export function alertaEvolucion(a: Ambito, d: DatosAmbito): readonly ParteTexto[] {
  const neto = d.evol.map((e) => signo(e.nuevos - e.perdidos));
  const e3 = d.evol[2];
  return a === 'skandia'
    ? [
        { t: 'En 2026, ' },
        { t: `la empresa ganó ${e3.nuevos} clientes y perdió ${e3.perdidos}.`, b: true },
        { t: ` El neto se desacelera: ${neto[0]} en 2024, ${neto[1]} en 2025 y ${neto[2]} en 2026.` },
      ]
    : [
        { t: 'En 2026, ' },
        { t: `Agencia Norte ganó ${e3.nuevos} clientes y perdió ${e3.perdidos}.`, b: true },
        { t: ` El neto pasó de ${neto[0]} en 2024 a ${neto[2]} en 2026.` },
      ];
}

/** Alerta bajo "Productos por cliente" según el ámbito (92 monoproducto son del FP Asignado). */
export function alertaProductos(a: Ambito, d: DatosAmbito, delFp: number): readonly ParteTexto[] {
  const mono = d.prod[0];
  return a === 'skandia'
    ? [
        { t: `${mono} clientes monoproducto`, b: true },
        {
          t: ` son la vía rápida: ya confían en Skandia, les falta el segundo producto. ${delFp} son del FP Asignado; los otros ${mono - delFp} los atienden otros asesores.`,
        },
      ]
    : [
        { t: `${mono} clientes monoproducto`, b: true },
        {
          t: ` de Agencia Norte son la vía rápida: ya confían en Skandia, les falta el segundo producto. ${delFp} son del FP Asignado y ${mono - delFp} de los demás asesores de la agencia.`,
        },
      ];
}
