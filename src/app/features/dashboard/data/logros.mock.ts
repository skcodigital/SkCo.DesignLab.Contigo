import { ComisionMes, Indicador, SegmentoDistribucion } from '../interfaces/logros';

/** «Hoy» del prototipo: 13 nov 2026. El último mes cerrado es octubre 2026. */
export const HOY_PROTOTIPO = new Date(2026, 10, 13);

/** Primer año que se puede consultar en el selector de mes. */
export const MIN_ANIO_LOGROS = 2024;

export const MESES_CORTOS: readonly string[] = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

export const MESES_LARGOS: readonly string[] = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
];

/** Asesores del selector de Logros (vista del director). */
export const ASESORES: readonly string[] = [
  'Juan Camilo Rodríguez',
  'María Fernanda López',
  'Andrés Felipe Gómez',
  'Laura Valentina Martínez',
  'Santiago Herrera Ruiz',
];

/** Indicadores del último mes cerrado (octubre 2026): base de los datos de ejemplo de los demás meses. */
export const INDICADORES_BASE: readonly Indicador[] = [
  { id: 'venta', etiqueta: 'Venta neta', valor: 40000000, variacion: -1, tendencia: 'baja' },
  { id: 'aportes', etiqueta: 'Aportes de clientes', valor: 10000000, variacion: 2, tendencia: 'sube' },
  { id: 'retiros', etiqueta: 'Retiros de clientes', valor: 12000000, variacion: 1, tendencia: 'sube-roja' },
  { id: 'aum', etiqueta: 'AUM', valor: 125000000, variacion: 1, tendencia: 'sube' },
];

export const DISTRIBUCION_CLIENTES: readonly SegmentoDistribucion[] = [
  { nombre: 'Pensiones y Cesantías', porcentaje: 82, color: '#0099DE' },
  { nombre: 'Ahorro Voluntario e inversión', porcentaje: 15, color: '#1DD64C' },
  { nombre: 'Seguros', porcentaje: 3, color: '#4AE6C3' },
];

export const TOTAL_COMISIONES = 25000000;

export const COMISIONES_POR_MES: readonly ComisionMes[] = [
  { mes: 'Enero', corto: 'Ene', valor: 2250000, y: 47.0 },
  { mes: 'Febrero', corto: 'Feb', valor: 1890000, y: 57.8 },
  { mes: 'Marzo', corto: 'Mar', valor: 2100000, y: 51.4 },
  { mes: 'Abril', corto: 'Abr', valor: 2320000, y: 44.9 },
  { mes: 'Mayo', corto: 'May', valor: 2290000, y: 46.0 },
  { mes: 'Junio', corto: 'Jun', valor: 2250000, y: 47.0 },
  { mes: 'Julio', corto: 'Jul', valor: 2180000, y: 49.2 },
  { mes: 'Agosto', corto: 'Ago', valor: 2100000, y: 51.4 },
  { mes: 'Septiembre', corto: 'Sep', valor: 1960000, y: 55.7 },
  { mes: 'Octubre', corto: 'Oct', valor: 800000, y: 90.2 },
  { mes: 'Noviembre', corto: 'Nov', valor: 1380000, y: 73.0 },
  { mes: 'Diciembre', corto: 'Dic', valor: 3480000, y: 10.3 },
];
