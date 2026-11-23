// Datos de ejemplo de la pestaña Clientes y del Equipo asignado (Empresa ABC S.A., con PAC).
import {
  AnioEvolucion,
  BarraGestion,
  DatosAmbitos,
  FilaAsesor,
  GestionAnio,
  TramoOportunidad,
} from '@features/radiografia/interfaces/clientes';

/**
 * C-03 / C-05: cada recuadro de Clientes se ve para Skandia o para Agencia Norte.
 * "Agencia" = Agencia Norte completa: FP Asignado + demás asesores (201 clientes).
 */
export const AMBITOS: DatosAmbitos = {
  skandia: {
    total: 412,
    nombre: 'la empresa',
    evol: [
      { anio: '2024', nuevos: 22, perdidos: 9 },
      { anio: '2025', nuevos: 18, perdidos: 11 },
      { anio: '2026*', nuevos: 12, perdidos: 11 },
    ],
    prod: [239, 99, 49, 25],
    seg: [268, 99, 33, 12],
    edad: [62, 158, 132, 60],
  },
  agencia: {
    total: 201,
    nombre: 'Agencia Norte',
    evol: [
      { anio: '2024', nuevos: 7, perdidos: 2 },
      { anio: '2025', nuevos: 5, perdidos: 2 },
      { anio: '2026*', nuevos: 2, perdidos: 3 },
    ],
    prod: [104, 50, 31, 16],
    seg: [120, 56, 18, 7],
    edad: [28, 80, 66, 27],
  },
};

/** Monoproducto del FP Asignado (fijo en los textos de la alerta de Productos por cliente). */
export const MONOPRODUCTO_FP_ASIGNADO = 92;

/** La oportunidad · vista director: FP Asignado, Agencia Norte, otras agencias y sin relación. */
export const OPORTUNIDAD_DIRECTOR: readonly TramoOportunidad[] = [
  { clase: 'dueno', ancho: 13.7, valor: 171, etiqueta: '171', leyenda: 'FP Asignado' },
  { clase: 'agencia', ancho: 2.4, valor: 30, leyenda: 'Agencia Norte' },
  { clase: 'otras', ancho: 16.9, valor: 211, etiqueta: '211', leyenda: 'Otras agencias' },
  { clase: 'vacio', ancho: 67, valor: 838, etiqueta: '838 sin relación con Skandia', leyenda: 'Sin relación' },
];
export const OPORTUNIDAD_DIRECTOR_ARIA =
  'De 1.250 empleados: 171 clientes del FP Asignado, 30 de Agencia Norte, 211 de otras agencias y 838 sin relación con Skandia.';

/** La oportunidad · vista del FP Asignado: lo suyo y el resto agregado. */
export const OPORTUNIDAD_DUENO: readonly TramoOportunidad[] = [
  { clase: 'dueno', ancho: 13.7, valor: 171, etiqueta: '171', leyenda: 'Tú' },
  { clase: 'otras', ancho: 19.3, valor: 241, etiqueta: '241', leyenda: 'Otros asesores' },
  { clase: 'vacio', ancho: 67, valor: 838, etiqueta: '838 sin relación con Skandia', leyenda: 'Sin relación' },
];
export const OPORTUNIDAD_DUENO_ARIA =
  'De 1.250 empleados: 171 son tus clientes, 241 de otros asesores y 838 sin relación con Skandia.';

/** Vista del asesor (otro FP): sus 2 clientes en la empresa. */
export const EVOLUCION_FP: readonly AnioEvolucion[] = [
  { anio: '2024', nuevos: 1, perdidos: 0 },
  { anio: '2025', nuevos: 1, perdidos: 0 },
  { anio: '2026*', nuevos: 1, perdidos: 1 },
];
export const PRODUCTOS_FP: readonly [number, number, number, number] = [1, 1, 0, 0];
export const SEGMENTOS_FP: readonly [number, number, number, number] = [1, 1, 0, 0];
export const EDAD_FP: readonly [number, number, number, number] = [0, 2, 0, 0];
export const TOTAL_FP = 2;

/** Equipo asignado: clientes nuevos en la empresa por quién los vinculó (alturas del prototipo). */
export const BARRAS_GESTION: readonly BarraGestion[] = [
  {
    anio: '2024',
    total: 22,
    aria: '2024: 22 clientes nuevos. FP Asignado 3, Agencia Norte 4, otras agencias 15.',
    tramos: [
      { gestion: 'otras', alto: 136, valor: 15, etiqueta: 'Otras agencias: 15' },
      { gestion: 'agencia', alto: 36, valor: 4, etiqueta: 'Agencia Norte: 4' },
      { gestion: 'dueno', alto: 27, valor: 3, etiqueta: 'FP Asignado: 3' },
    ],
  },
  {
    anio: '2025',
    total: 18,
    aria: '2025: 18 clientes nuevos. FP Asignado 2, Agencia Norte 3, otras agencias 13.',
    tramos: [
      { gestion: 'otras', alto: 118, valor: 13, etiqueta: 'Otras agencias: 13' },
      { gestion: 'agencia', alto: 27, valor: 3, etiqueta: 'Agencia Norte: 3' },
      { gestion: 'dueno', alto: 18, valor: 2, etiqueta: 'FP Asignado: 2', sinValor: true },
    ],
  },
  {
    anio: '2026*',
    total: 12,
    aria: '2026*: 12 clientes nuevos. FP Asignado 0, Agencia Norte 2, otras agencias 10.',
    tramos: [
      { gestion: 'otras', alto: 91, valor: 10, etiqueta: 'Otras agencias: 10' },
      { gestion: 'agencia', alto: 18, valor: 2, etiqueta: 'Agencia Norte: 2', sinValor: true },
    ],
  },
];

/** Asesores con clientes en la empresa (14). */
export const ASESORES: readonly FilaAsesor[] = [
  { gestion: 'dueno', nombre: 'Juan Alberto Rodríguez González', detalle: 'FP Asignado · Agencia Norte', clientes: '171', activos: '$36.550 M', nuevos: '5', ultimo: 'Ago 2025', estado: 'Activo', propio: true },
  { gestion: 'agencia', nombre: 'Felipe Arango Mejía', detalle: 'Agencia Norte', clientes: '17', activos: '$2.100 M', nuevos: '6', ultimo: 'Jul 2026', estado: 'Activo' },
  { gestion: 'agencia', nombre: 'Diana Cortés Rojas', detalle: 'Agencia Norte', clientes: '13', activos: '$1.590 M', nuevos: '3', ultimo: 'Sep 2026', estado: 'Activo' },
  { gestion: 'otras', nombre: 'Otras agencias', detalle: '11 asesores', clientes: '211', activos: '$21.340 M', nuevos: '38', ultimo: 'Oct 2026', estado: 'Agregado', agregado: true },
];

/** Gestión de la agencia del FP Asignado por año (2026 va a octubre). contratos = clientes con cross-sell. */
export const GESTION: Readonly<Record<number, GestionAnio>> = {
  2024: { nuevos: 7, empresa: 22, perdidos: 2, netoEmpresa: 13, participes: 9, contratos: 4 },
  2025: { nuevos: 5, empresa: 18, perdidos: 2, netoEmpresa: 7, participes: 6, contratos: 3 },
  2026: { nuevos: 2, empresa: 12, perdidos: 3, netoEmpresa: 1, participes: 1, contratos: 2 },
};
export const ANIOS_GESTION: readonly number[] = [2024, 2025, 2026];
