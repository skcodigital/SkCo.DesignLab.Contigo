// Empresa XYZ S.A.S. (sin Plan de Ahorro Corporativo): datos de ejemplo del prototipo.
import {
  CandidatoFp,
  ColumnaVinculados,
  FilaAsesor,
  GrupoClientes,
  LineaNegocio,
  ParAnual,
  RangoEdad,
  TramoPct,
} from '@features/radiografia/interfaces/sin-pac';

/** Resumen · Ruta de penetración: clientes activos hoy por agencia (anchos en %). */
export const RUTA_PENETRACION_SP: readonly TramoPct[] = [
  { clase: 'agencia', ancho: 5.8, leyenda: 'Tu agencia (Agencia Norte)', n: 7 },
  { clase: 'otras', ancho: 3.4, leyenda: 'Otras agencias', n: 4 },
];

/** Asesores · clientes nuevos por quién los vinculó (2026 a octubre). */
export const VINCULADOS_SP: readonly ColumnaVinculados[] = [
  {
    anio: '2024',
    total: 4,
    tramos: [
      { gestion: 'otras', etiqueta: 'Otras agencias', valor: 1, alto: 48 },
      { gestion: 'agencia', etiqueta: 'Tu agencia', valor: 3, alto: 144 },
    ],
  },
  {
    anio: '2025',
    total: 3,
    tramos: [
      { gestion: 'otras', etiqueta: 'Otras agencias', valor: 1, alto: 48 },
      { gestion: 'agencia', etiqueta: 'Tu agencia', valor: 2, alto: 96 },
    ],
  },
  {
    anio: '2026*',
    total: 2,
    tramos: [
      { gestion: 'otras', etiqueta: 'Otras agencias', valor: 1, alto: 48 },
      { gestion: 'agencia', etiqueta: 'Tu agencia', valor: 1, alto: 48 },
    ],
  },
];

export const ASESORES_SP: readonly FilaAsesor[] = [
  { gestion: 'agencia', nombre: 'Felipe Arango Mejía', detalle: 'Agencia Norte · más relación con la empresa', clientes: '4', activos: '$430 M', productosPorCliente: '1,8', nuevos: '3', ultimo: 'Sep 2026' },
  { gestion: 'agencia', nombre: 'Diana Cortés Rojas', detalle: 'Agencia Norte', clientes: '2', activos: '$250 M', productosPorCliente: '1,5', nuevos: '2', ultimo: 'Jun 2025' },
  { gestion: 'agencia', nombre: 'Tú', detalle: 'Director comercial · Agencia Norte', clientes: '1', activos: '$80 M', productosPorCliente: '1,0', nuevos: '1', ultimo: 'Mar 2024' },
  { gestion: 'otras', nombre: 'Otras agencias', detalle: '2 asesores', clientes: '4', activos: '$420 M', productosPorCliente: '1,3', nuevos: '3', ultimo: 'Oct 2026', agregada: true },
];

/** Clientes · la oportunidad: 120 empleados repartidos por relación con Skandia. */
export const OPORTUNIDAD_SP: readonly TramoPct[] = [
  { clase: 'seg--agencia', ancho: 5.8, leyenda: 'Tu agencia', n: 7 },
  { clase: 'seg--otras', ancho: 3.4, leyenda: 'Otras agencias', n: 4 },
  { clase: 'stack-empty', ancho: 90.8, leyenda: 'Sin relación', n: 109, texto: '109 sin relación con Skandia' },
];

/** Clientes · evolución en Agencia Norte (2026 a octubre). */
export const EVOLUCION_SP: readonly ParAnual[] = [
  { anio: '2024', nuevos: 3, perdidos: 1 },
  { anio: '2025', nuevos: 2, perdidos: 1 },
  { anio: '2026*', nuevos: 1, perdidos: 1 },
];

export const PRODUCTOS_POR_CLIENTE_SP: readonly GrupoClientes[] = [
  { nombre: '1 producto (1P)', n: 7, color: 'p1' },
  { nombre: '2 productos (2P)', n: 3, color: 'p2' },
  { nombre: '3 productos (3P)', n: 1, color: 'p3' },
  { nombre: '4 productos o más (4P+)', n: 0, color: 'p4' },
];

export const SEGMENTOS_SP: readonly GrupoClientes[] = [
  { nombre: 'Finanzas Personales', n: 7, color: 'var(--charts-c18)' },
  { nombre: 'Privilegio', n: 3, color: 'var(--sk-charts-c01)' },
  { nombre: 'Elite', n: 1, color: 'var(--sk-charts-c04)' },
  { nombre: 'Wealth', n: 0, color: 'var(--charts-c08)' },
];

export const EDADES_SP: readonly RangoEdad[] = [
  { rango: '18–30', etiqueta: '18–30 años', n: 2 },
  { rango: '31–45', etiqueta: '31–45 años', n: 5 },
  { rango: '46–60', etiqueta: '46–60 años', n: 3 },
  { rango: 'Más de 60', etiqueta: 'Más de 60 años', n: 1 },
];

export const CLIENTES_EMPRESA_SP = 11;

/** Relación integral: activos por línea de negocio (millones). */
export const LINEAS_SP: readonly LineaNegocio[] = [
  { nombre: 'Total en la empresa', sub: 'De sus empleados', clientes: '11 clientes', agencia: 760, otras: 420, anchoAgencia: 64.4, anchoOtras: 35.6, pctAgencia: 64, total: true },
  { nombre: 'Pensión obligatoria', sub: 'FPOB', clientes: '11 clientes', agencia: 440, otras: 300, anchoAgencia: 59.5, anchoOtras: 40.5, pctAgencia: 59 },
  { nombre: 'Pensión voluntaria', sub: 'Multifund individual', clientes: '5 clientes', agencia: 200, otras: 120, anchoAgencia: 62.5, anchoOtras: 37.5, pctAgencia: 62 },
  { nombre: 'Cesantías', clientes: '4 clientes', agencia: 40, otras: 0, anchoAgencia: 100, anchoOtras: 0, pctAgencia: 100 },
  { nombre: 'Fiduciaria', sub: 'FICs', clientes: '2 clientes', agencia: 80, otras: 0, anchoAgencia: 100, anchoOtras: 0, pctAgencia: 100 },
];

/** Asesores elegibles como FP Asignado (modal "Asignar un FP a la empresa"). */
export const CANDIDATOS_FP_SP: readonly CandidatoFp[] = [
  { valor: 'Felipe Arango Mejía', nombre: 'Felipe Arango Mejía', etiqueta: 'Asignar a Felipe Arango Mejía', masRelacion: true, clientes: '4', aum: '$430 M', productosPorCliente: '1,8', productos: [['Obligatoria', 4], ['Voluntaria', 2], ['Fiduciaria', 1]] },
  { valor: 'Diana Cortés Rojas', nombre: 'Diana Cortés Rojas', etiqueta: 'Asignar a Diana Cortés Rojas', clientes: '2', aum: '$250 M', productosPorCliente: '1,5', productos: [['Obligatoria', 2], ['Cesantías', 1]] },
  { valor: 'Tú (director comercial)', nombre: 'Tú', etiqueta: 'Asignar a Tú', cargo: 'Director comercial', clientes: '1', aum: '$80 M', productosPorCliente: '1,0', productos: [['Obligatoria', 1]] },
];
