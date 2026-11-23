import { describe, expect, it } from 'vitest';
import { FECHA_HOY, FONDOS_POTENCIALIZAR } from '../data/composicion.mock';
import { calcularComposicion, etiquetaDona, gradienteDona } from './composicion';

describe('calcularComposicion', () => {
  it('a la fecha de hoy devuelve los valores originales con 65 % / 35 %', () => {
    const filas = calcularComposicion(FONDOS_POTENCIALIZAR, FECHA_HOY, FECHA_HOY);
    expect(filas.map((f) => f.porcentaje)).toEqual([65, 35]);
    expect(filas[0].saldo).toBe(34275924);
    expect(filas[0].ea).toBe(9.12);
    expect(filas[1].rendimientos).toBe(2098910);
  });

  it('a una fecha anterior descuenta saldo y rendimientos y los porcentajes suman 100', () => {
    const filas = calcularComposicion(FONDOS_POTENCIALIZAR, FECHA_HOY, new Date(2026, 0, 15));
    expect(filas[0].saldo).toBeLessThan(34275924);
    expect(filas[0].valorUnidad).toBeLessThan(28031.45);
    expect(filas.every((f) => f.rendimientos >= 0)).toBe(true);
    expect(filas.reduce((a, f) => a + f.porcentaje, 0)).toBe(100);
    expect(filas[0].ea).not.toBe(9.12);
  });
});

describe('dona', () => {
  const filas = calcularComposicion(FONDOS_POTENCIALIZAR, FECHA_HOY, FECHA_HOY);

  it('arma el conic-gradient acumulado', () => {
    expect(gradienteDona(filas)).toBe(
      'conic-gradient(var(--sk-charts-c01) 0% 65%,var(--sk-charts-c02) 65% 100%)',
    );
  });

  it('describe la composición para lectores de pantalla', () => {
    expect(etiquetaDona(filas, FECHA_HOY)).toBe(
      'Composición al 12 de noviembre de 2026: 65 % Skandia Renta Fija Pesos, 35 % FPV Strategist Liquidez Col',
    );
  });
});
