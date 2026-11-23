import { CLIENTES_EMPRESA_SP, LINEAS_SP, OPORTUNIDAD_SP, SEGMENTOS_SP } from '@features/radiografia/data/sin-pac.mock';
import {
  altoBarra,
  arcosDona,
  conPorcentaje,
  netoPar,
  notaRutaSinPac,
  textoAncho,
  textoClientes,
  tipOportunidad,
  tipPar,
  tipSegmento,
  tramosLinea,
} from '@features/radiografia/utils/sin-pac';

describe('utils sin PAC', () => {
  it('formatea el ancho de un tramo con coma decimal', () => {
    expect(textoAncho(5.8)).toBe('5,8%');
    expect(textoAncho(90.8)).toBe('90,8%');
    expect(textoAncho(64)).toBe('64%');
  });

  it('usa singular para un cliente', () => {
    expect(textoClientes(1)).toBe('1 cliente');
    expect(textoClientes(0)).toBe('0 clientes');
  });

  it('calcula alturas proporcionales como el prototipo', () => {
    expect([3, 2, 1].map((v) => altoBarra(v, 3, 170, 8))).toEqual([170, 113, 57]);
    expect([2, 5, 3, 1].map((v) => altoBarra(v, 5, 180))).toEqual([72, 180, 108, 36]);
  });

  it('arma el tooltip de la oportunidad con empleados y porcentaje', () => {
    expect(tipOportunidad(OPORTUNIDAD_SP[2])).toEqual({
      titulo: 'Clientes activos',
      lineas: ['Sin relación: 109 empleados · 90,8%'],
    });
  });

  it('marca el neto en cero y negativo', () => {
    expect(netoPar({ anio: '2026*', nuevos: 1, perdidos: 1 })).toEqual({ texto: 'Neto 0', clase: 'neto-cero' });
    expect(netoPar({ anio: '2024', nuevos: 3, perdidos: 1 })).toEqual({ texto: 'Neto +2', clase: '' });
    expect(netoPar({ anio: 'x', nuevos: 1, perdidos: 3 })).toEqual({ texto: 'Neto −2', clase: 'neto-neg' });
    expect(tipPar('2025', false, 1).lineas).toEqual(['Clientes perdidos: 1']);
  });

  it('reproduce los arcos de la dona del prototipo', () => {
    const arcos = arcosDona(SEGMENTOS_SP.map((s) => s.n), CLIENTES_EMPRESA_SP);
    expect(arcos.map((a) => a.dasharray)).toEqual(['279.89 159.94', '119.95 319.87', '39.98 399.84', '0.00 439.82']);
    expect(arcos.map((a) => a.offset)).toEqual(['0.00', '-279.89', '-399.84', '-439.82']);
  });

  it('calcula porcentajes y tooltips de segmentos', () => {
    const g = conPorcentaje(SEGMENTOS_SP, CLIENTES_EMPRESA_SP);
    expect(g.map((x) => x.pct)).toEqual([64, 27, 9, 0]);
    expect(tipSegmento(g[2], g[2].pct).lineas).toEqual(['Elite: 1 cliente · 9%']);
  });

  it('arma los tramos de una línea de negocio', () => {
    expect(tramosLinea(LINEAS_SP[0])).toEqual({
      aria: 'Total en la empresa: Agencia Norte $760 M, otras agencias $420 M',
      agencia: 'Agencia Norte $760 M',
      otras: 'Otras agencias $420 M',
    });
    expect(tramosLinea(LINEAS_SP[3]).otras).toBeNull();
  });

  it('cambia la nota de la ruta al asignar un FP', () => {
    expect(notaRutaSinPac(null)[1]).toEqual({ t: 'Plan de Ahorro Corporativo', b: true });
    expect(notaRutaSinPac('Tú (director comercial)')[1]).toEqual({ t: 'ti', b: true });
    expect(notaRutaSinPac('Diana Cortés Rojas')[1]).toEqual({ t: 'Diana Cortés Rojas', b: true });
  });
});
