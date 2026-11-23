// Plan corporativo por tipo de plan. Bonificaciones son los datos del prototipo de Lovable;
// Ahorro Mutuo y Beneficios Flexibles son de ejemplo.
import { DatosPlan, TipoPlan } from '@features/radiografia/interfaces/clientes';
import { ParteTexto } from '@features/radiografia/interfaces/radiografia';

export const TIPOS_PLAN: readonly { readonly id: TipoPlan; readonly nombre: string }[] = [
  { id: 'bonificaciones', nombre: 'Bonificaciones' },
  { id: 'mutuo', nombre: 'Ahorro Mutuo' },
  { id: 'flex', nombre: 'Beneficios Flexibles' },
];

export const PLANES: Readonly<Record<TipoPlan, DatosPlan>> = {
  bonificaciones: {
    sub: 'Bonificación voluntaria: AUM, aportes y retiros',
    aportes2026: 2800,
    ventaNeta: 6700,
    aum: 27400,
    aumOct25: 20900,
    participes: 156,
    contratos: 3,
    anios: [
      ['2024', 3200, 950],
      ['2025', 4100, 1800],
      ['2026*', 2800, 650],
    ],
    aumPts: [20900, 22400, 23900, 25700, 27400],
  },
  mutuo: {
    sub: 'Ahorro mutuo: la empresa iguala el aporte del empleado',
    aportes2026: 1900,
    ventaNeta: 4000,
    aum: 13600,
    aumOct25: 10400,
    participes: 312,
    contratos: 1,
    anios: [
      ['2024', 2100, 700],
      ['2025', 2400, 900],
      ['2026*', 1900, 800],
    ],
    aumPts: [10400, 11100, 11900, 12800, 13600],
  },
  flex: {
    sub: 'Beneficios flexibles: el empleado elige cómo usar su beneficio',
    aportes2026: 1100,
    ventaNeta: 2300,
    aum: 5400,
    aumOct25: 4000,
    participes: 88,
    contratos: 2,
    anios: [
      ['2024', 900, 300],
      ['2025', 1300, 450],
      ['2026*', 1100, 250],
    ],
    aumPts: [4000, 4300, 4700, 5000, 5400],
  },
};

/** Hallazgo de cada tipo de plan (con sus negritas). */
export const HALLAZGOS: Readonly<Record<TipoPlan, readonly ParteTexto[]>> = {
  bonificaciones: [
    { t: 'Los aportes de 2026 van en ' },
    { t: '$2.800 M', b: true },
    { t: ' a octubre, por debajo del ritmo de 2025 ($4.100 M), y el plan sumó solo ' },
    { t: '1 partícipe nuevo', b: true },
    { t: ' este año (9 en 2024, 6 en 2025). El saldo crece por lo que ya está adentro, no por gente nueva.' },
  ],
  mutuo: [
    { t: 'En Ahorro Mutuo participan ' },
    { t: '312 empleados', b: true },
    { t: ', el doble que en Bonificaciones, pero los retiros de 2026 ya van en ' },
    { t: '$800 M', b: true },
    { t: ', casi el total de 2025 ($900 M). Conviene revisar por qué están retirando.' },
  ],
  flex: [
    { t: 'Beneficios Flexibles es el plan más pequeño, pero el que mejor retiene: en 2026 los retiros son el ' },
    { t: '23%', b: true },
    { t: ' de los aportes. Tiene espacio para crecer: hoy participan ' },
    { t: '88 de 1.250', b: true },
    { t: ' empleados.' },
  ],
};

/** Etiquetas del eje X de la evolución del AUM y su mes (0 = oct 2025). */
export const AUM_ETIQUETAS: readonly string[] = ['Oct 2025', 'Ene 2026', 'Abr 2026', 'Jul 2026', 'Oct 2026'];
export const AUM_MESES: readonly number[] = [0, 3, 6, 9, 12];
