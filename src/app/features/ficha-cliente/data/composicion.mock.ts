import { Fondo } from '../interfaces/composicion';
import { TipoProducto } from '../interfaces/productos';

/** "Hoy" de los datos de ejemplo y primer día con datos disponibles. */
export const FECHA_HOY = new Date(2026, 10, 12);
export const FECHA_MINIMA = new Date(2025, 10, 12);

/**
 * Portafolios de ejemplo de cada contrato a la fecha de hoy (composición con FVP Especial CAT, renta fija
 * y liquidez, escalada al saldo del contrato). El FIC tiene un solo portafolio, disponible.
 */
export const PORTAFOLIOS: Readonly<Record<TipoProducto, readonly Fondo[]>> = {
  mf: [
    { nombre: 'FVP Especial CAT 4/02/2030', color: 'var(--sk-charts-c01)', unidades: 869.6697, valorUnidad: 10956.697029, saldo: 9528707, rendimientos: 948478, ea: 10.85, disponible: false },
    { nombre: 'FVP Especial CAT 4/11/2027', color: 'var(--sk-charts-c02)', unidades: 860.8594, valorUnidad: 10995.324876, saldo: 9465428, rendimientos: 942179, ea: 10.62, disponible: false },
    { nombre: 'FVP Especial CAT 30/04/2030', color: 'var(--sk-charts-c03)', unidades: 1202.7212, valorUnidad: 11276.694625, saldo: 13562720, rendimientos: 1350020, ea: 11.04, disponible: false },
    { nombre: 'FVP Especial CAT 12 meses - D', color: 'var(--sk-charts-c04)', unidades: 1213.341, valorUnidad: 13824.728964, saldo: 16774110, rendimientos: 1669678, ea: 12.31, disponible: false },
    { nombre: 'FPV Strategist Liquidez Col', color: 'var(--sk-charts-c05)', unidades: 51.8516, valorUnidad: 2847.550228, saldo: 147650, rendimientos: 14697, ea: 7.49, disponible: true },
    { nombre: 'FVP Renta Fija Marzo 2029-I', color: 'var(--sk-charts-c06)', unidades: 298.8594, valorUnidad: 10886.643559, saldo: 3253576, rendimientos: 323858, ea: 9.76, disponible: false },
  ],
  fic: [
    { nombre: 'FIC Skandia Efectivo', color: 'var(--sk-charts-c01)', unidades: 633.3326, valorUnidad: 13287.4512, saldo: 8415300, rendimientos: 612480, ea: 9.12, disponible: true },
  ],
};

/** Standing allocation del Multifund. */
export const STANDING_ALLOCATION = {
  porcentaje: '100%',
  portafolio: 'FVP Especial Skandia TS2026',
  etiqueta: 'Standing allocation: 100 % FVP Especial Skandia TS2026',
} as const;
