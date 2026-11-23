import { Fondo } from '../interfaces/composicion';

/** "Hoy" de los datos de ejemplo y primer día con datos disponibles. */
export const FECHA_HOY = new Date(2026, 10, 12);
export const FECHA_MINIMA = new Date(2025, 10, 12);

/** Portafolios del contrato #100000063061 a la fecha de hoy. */
export const FONDOS_POTENCIALIZAR: readonly Fondo[] = [
  {
    nombre: 'Skandia Renta Fija Pesos',
    color: 'var(--sk-charts-c01)',
    unidades: 1222.77,
    valorUnidad: 28031.45,
    saldo: 34275924,
    rendimientos: 3150000,
    ea: 9.12,
  },
  {
    nombre: 'FPV Strategist Liquidez Col',
    color: 'var(--sk-charts-c02)',
    unidades: 6584.07,
    valorUnidad: 2803.14,
    saldo: 18456267,
    rendimientos: 2098910,
    ea: 7.49,
  },
];
