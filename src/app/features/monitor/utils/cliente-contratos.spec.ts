import { PRODUCTOS_CONTRATO_OSCAR } from '@features/monitor/data/cliente.mock';
import { HOY_MONITOR } from '@features/monitor/data/detalle-catalogos.mock';
import { CONTRATOS_OSCAR } from '@features/monitor/data/detalle-cliente.mock';
import { SELECCION_VACIA, activosCliente } from '@features/monitor/utils/cliente-comparacion';
import {
  filasContratos,
  filasFondosContratos,
  hayTirCero,
  nombreReferencia,
  porcentaje,
  tortaContratos,
} from '@features/monitor/utils/cliente-contratos';
import { COLORES_GRAFICA } from '@features/monitor/utils/graficas';

const YTD = { inicio: '2026-01-01', fin: '2026-11-12' };
const PALETA = COLORES_GRAFICA.cliente;

describe('cliente-contratos', () => {
  it('acorta el nombre del producto como producción y le pone el contrato', () => {
    expect(nombreReferencia('Fondo Voluntario de Pensión Skandia Multifund', '100000063061')).toBe(
      'Fondo Voluntario de... Multifund | 100000063061',
    );
    expect(nombreReferencia('Skandia Multifund', '1')).toBe('Skandia Multifund | 1');
    expect(porcentaje(1, 4)).toBe('25.00');
    expect(porcentaje(1, 0)).toBe('0.00');
  });

  it('arma las filas de Óscar en el año en curso: saldos de la ficha y porcentajes', () => {
    const filas = filasContratos(CONTRATOS_OSCAR, PRODUCTOS_CONTRATO_OSCAR, YTD, HOY_MONITOR, PALETA, [], false);
    expect(filas.map((f) => [f.clave, f.saldo, f.porcentaje, f.color, f.tipoProducto])).toEqual([
      ['Multifund 061', 52_732_191, '86.24', PALETA[0], 'mf'],
      ['Efectivo 847', 8_415_300, '13.76', PALETA[1], 'fic'],
    ]);
    expect(filas[0].nombre).toBe('Fondo Voluntario de... Multifund | 100000063061');
    expect(filas[0].variacion).toBe('10.42');
    expect(filas[0].rendimientos).toBeUndefined();
    expect(hayTirCero(filas)).toBe(false);
  });

  it('con «Desde el inicio» trae los rendimientos de la ficha', () => {
    const filas = filasContratos(
      CONTRATOS_OSCAR,
      PRODUCTOS_CONTRATO_OSCAR,
      { inicio: '2025-11-12', fin: '2026-11-12' },
      HOY_MONITOR,
      PALETA,
      [],
      true,
    );
    expect(filas.map((f) => f.rendimientos)).toEqual([5_248_910, 612_480]);
  });

  it('sin las series ocultas recalcula el porcentaje; sin datos en el rango no hay fila', () => {
    const ocultas = filasContratos(CONTRATOS_OSCAR, PRODUCTOS_CONTRATO_OSCAR, YTD, HOY_MONITOR, PALETA, ['Multifund 061'], false);
    expect(ocultas.map((f) => [f.clave, f.porcentaje])).toEqual([['Efectivo 847', '100.00']]);
    const anio2025 = { inicio: '2025-01-01', fin: '2025-12-31' };
    const filas = filasContratos(CONTRATOS_OSCAR, PRODUCTOS_CONTRATO_OSCAR, anio2025, HOY_MONITOR, PALETA, [], false);
    expect(filas.map((f) => f.clave)).toEqual(['Multifund 061']);
  });

  it('agrega los portafolios comparados con el color de su serie y el plazo del CDT', () => {
    const a = activosCliente({ ...SELECCION_VACIA, portafolios: ['FPVLIQCOL', 'FPVSTGMOD'], cdt: ['30'] }, YTD, HOY_MONITOR, PALETA, 2);
    const colores = new Map([
      ['FPVLIQCOL_30', '#111111'],
      ['FPVSTGMOD_30', '#222222'],
    ]);
    const filas = filasFondosContratos(a.fondos, colores, []);
    expect(filas.map((f) => [f.nombre, f.plazoCdt, f.color, f.removible])).toEqual([
      ['FPV Strategist Moderado', 'CDT A 30 días', '#222222', true],
      ['FPV Strategist Liquidez Col', 'CDT A 30 días', '#111111', true],
    ]);
    expect(filas[0].saldo).toBe(filas[0].valorFinal);
    expect(filasFondosContratos(a.fondos, colores, ['FPVSTGMOD']).length).toBe(1);
    expect(filasFondosContratos(a.fondos, new Map(), []).length).toBe(0);
  });

  it('arma la torta de contratos con el código del producto', () => {
    expect(tortaContratos(CONTRATOS_OSCAR, PRODUCTOS_CONTRATO_OSCAR, PALETA)).toEqual([
      { nombre: 'MFUND - 100000063061', valor: 86.24, color: PALETA[0], saldo: 52_732_191 },
      { nombre: 'FCO - 301000052847', valor: 13.76, color: PALETA[1], saldo: 8_415_300 },
    ]);
  });
});
