import { describe, expect, it } from 'vitest';
import { FECHA_HOY, PORTAFOLIOS } from '../data/composicion.mock';
import {
  calcularComposicion,
  etiquetaDona,
  etiquetaRendimientos,
  filasTabla,
  gradienteDona,
  gradienteRendimientos,
  textoCopiaTabla,
  totalSaldos,
} from './composicion';
import { formatoPesos } from './montos';

const MF_HOY = calcularComposicion(PORTAFOLIOS.mf, FECHA_HOY, FECHA_HOY);

describe('calcularComposicion', () => {
  it('a la fecha de hoy conserva los saldos y la participación va sin redondear', () => {
    expect(MF_HOY[0].saldo).toBe(9528707);
    expect(MF_HOY[0].ea).toBe(10.85);
    expect(MF_HOY[0].porcentaje).toBeCloseTo(18.07, 2);
    expect(MF_HOY.reduce((a, f) => a + f.porcentaje, 0)).toBeCloseTo(100, 10);
  });

  it('a una fecha anterior descuenta saldo y rendimientos', () => {
    const filas = calcularComposicion(PORTAFOLIOS.mf, FECHA_HOY, new Date(2026, 0, 15));
    expect(filas[0].saldo).toBeLessThan(9528707);
    expect(filas[0].valorUnidad).toBeLessThan(10956.697029);
    expect(filas.every((f) => f.rendimientos >= 0)).toBe(true);
    expect(filas[0].ea).not.toBe(10.85);
  });
});

describe('total y disponibles', () => {
  it('el total del Multifund es el saldo del contrato', () => {
    expect(formatoPesos(totalSaldos(MF_HOY))).toBe('$ 52.732.191');
  });

  it('solo FPV Strategist Liquidez Col está disponible (saldo para retiro $147.650)', () => {
    const disp = filasTabla(MF_HOY).filter((f) => f.disponible);
    expect(disp.map((f) => f.nombre)).toEqual(['FPV Strategist Liquidez Col']);
    expect(disp[0].saldo).toBe('$ 147.650');
    expect(disp[0].disponibleTexto).toBe('Sí');
    expect(filasTabla(MF_HOY)[0].disponibleTexto).toBe('No');
  });

  it('formatea las filas de la tabla', () => {
    expect(filasTabla(MF_HOY)[0]).toMatchObject({
      participacion: '18,07 %',
      unidades: '869,67',
      valorUnidad: '$ 10.956,70',
      rendimientos: '$ 948.478',
      ea: '10,85 %',
      saldo: '$ 9.528.707',
    });
  });
});

describe('dona', () => {
  it('arma el conic-gradient acumulado', () => {
    const g = gradienteDona(MF_HOY);
    expect(g.startsWith('conic-gradient(var(--sk-charts-c01) 0% 18.07')).toBe(true);
    expect(g.split(',')).toHaveLength(6);
  });

  it('describe la composición y la disponibilidad para lectores de pantalla', () => {
    const e = etiquetaDona(MF_HOY, FECHA_HOY);
    expect(e.startsWith('Composición al 12 de noviembre de 2026: 18,07 % FVP Especial CAT 4/02/2030 (no disponible)')).toBe(true);
    expect(e).toContain('FPV Strategist Liquidez Col (disponible)');
  });

  it('dona de evolución', () => {
    expect(gradienteRendimientos(7)).toBe('conic-gradient(var(--sk-charts-c01) 0 7%,var(--sk-charts-c02) 7% 100%)');
    expect(etiquetaRendimientos(10)).toBe('10 % rendimientos y 90 % capital');
  });
});

describe('textoCopiaTabla', () => {
  const base = {
    contrato: '100000063061',
    estado: 'efectivo' as const,
    fechaTexto: '12/11/2026',
    filas: filasTabla(MF_HOY),
    total: '$ 52.732.191',
  };

  it('Multifund: título, encabezados separados por tabulación, una línea por portafolio y total', () => {
    const lineas = textoCopiaTabla({ ...base, tipo: 'mf' }).split('\n');
    expect(lineas[0]).toBe('Composición del contrato #100000063061 · saldos en efectivo al 12/11/2026');
    expect(lineas[1]).toBe('');
    expect(lineas[2]).toBe('Portafolio\tParticipación\tNo. unidades\tValor unidad\tRendimientos\tRendimientos E.A.\tDisponible\tSaldo');
    expect(lineas[3]).toBe('FVP Especial CAT 4/02/2030\t18,07 %\t869,67\t$ 10.956,70\t$ 948.478\t10,85 %\tNo\t$ 9.528.707');
    expect(lineas).toHaveLength(3 + 6 + 1);
    expect(lineas.at(-1)).toBe('Total\t100 %\t\t\t\t\t\t$ 52.732.191');
  });

  it('FIC en proceso: sin fila de total', () => {
    const fic = calcularComposicion(PORTAFOLIOS.fic, FECHA_HOY, FECHA_HOY);
    const texto = textoCopiaTabla({ ...base, tipo: 'fic', contrato: '301000052847', estado: 'proceso', filas: filasTabla(fic) });
    const lineas = texto.split('\n');
    expect(lineas[0]).toBe('Composición del contrato #301000052847 · saldos en proceso al 12/11/2026');
    expect(lineas).toHaveLength(4);
    expect(lineas[3]).toBe('FIC Skandia Efectivo\t100,00 %\t633,33\t$ 13.287,45\t$ 612.480\t9,12 %\tSí\t$ 8.415.300');
  });
});
