import { SemanaMisiones } from '../interfaces/mision';

/** Id de la única misión con ficha de cliente y conversación completa en el prototipo. */
export const ID_MISION_OSCAR = 'oscar';

/** Máximo de misiones por semana (lista fija desde el lunes, no se rellena sola). */
export const MISIONES_POR_SEMANA = 5;

/**
 * Misiones de esta semana del asesor que ingresó. Óscar va primero porque es el único con ficha de cliente.
 * Orden real: 1) seguimientos acordados, 2) retiros radicados, 3) prioridad Fligo, 4) contactados por Sami / con lead,
 * 5) proporción del saldo y días restantes.
 */
export const SEMANA_PROPIA: SemanaMisiones = {
  pendientes: [
    {
      id: ID_MISION_OSCAR,
      nombre: 'Óscar Camilo Hernández Ramírez',
      segmento: 'Wealth Builders',
      chip: 'alta',
      saldo: 52732191,
      origen: 'sami',
      origenTexto: 'Sami ya le escribió · en la lista desde el 12 nov',
    },
    {
      id: 'pardo',
      nombre: 'Luis Fernando Pardo Ruiz',
      segmento: 'Stability Seekers',
      chip: 'seg',
      saldo: 90400000,
      origen: 'acuerdo',
      origenTexto: 'Iniciaste la conversación el 14 nov',
    },
    {
      id: 'mejia',
      nombre: 'Carlos Andrés Mejía Torres',
      segmento: 'Capital Investor',
      chip: 'alta',
      saldo: 310250000,
      origen: 'lista',
      origenTexto: 'En la lista desde el 19 sep',
    },
    {
      id: 'torres',
      nombre: 'Ana María Torres Gil',
      segmento: 'Family Guardians',
      chip: 'alta',
      saldo: 64800000,
      origen: 'lista',
      origenTexto: 'En la lista desde el 3 oct',
    },
  ],
  completadas: [{ nombre: 'Patricia Gómez Salazar', texto: 'Acuerdo registrado el 17 nov' }],
};

// Vista del director (selector de asesor de Logros): misma estructura, otros clientes, solo lectura.
export const CLIENTES_EJEMPLO: readonly string[] = [
  'Jorge Iván Salazar',
  'Martha Lucía Rincón',
  'Andrés Felipe Cano',
  'Gloria Inés Mora',
  'Ricardo Vélez Ochoa',
  'Sofía Restrepo Lara',
  'Camilo Duarte Pinzón',
  'Alejandra Ríos Mesa',
  'Germán Ortiz Bello',
  'Valentina Cruz Soto',
  'Hernando Peña Gil',
  'Carolina Quintero',
];

export const SEGMENTOS_EJEMPLO: readonly string[] = [
  'Stability Seekers',
  'Wealth Builders',
  'Capital Investor',
  'Family Guardians',
  'Financial Explorer',
];

/** Misiones ya completadas esta semana por cada asesor del selector (mismo orden que `ASESORES`). */
export const COMPLETADAS_POR_ASESOR: readonly number[] = [2, 0, 3, 1, 4];

export const SALDOS_EJEMPLO: readonly number[] = [72e6, 158e6, 41e6, 226e6, 93e6];
