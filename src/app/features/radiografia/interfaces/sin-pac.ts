// Datos de las gráficas y tablas de la radiografía sin Plan de Ahorro Corporativo (Empresa XYZ S.A.S.).
import { Gestion } from '@features/radiografia/interfaces/radiografia';

/** Tramo de una barra apilada por quién vinculó (Asesores en la empresa). */
export interface TramoBarra {
  readonly gestion: Gestion;
  readonly etiqueta: string;
  readonly valor: number;
  readonly alto: number;
}

/** Columna de "Clientes nuevos en la empresa, por quién los vinculó". */
export interface ColumnaVinculados {
  readonly anio: string;
  readonly total: number;
  /** De arriba hacia abajo, como en el prototipo. */
  readonly tramos: readonly TramoBarra[];
}

/** Fila de la tabla "Asesores con clientes en la empresa". */
export interface FilaAsesor {
  readonly gestion: Gestion;
  readonly nombre: string;
  readonly detalle: string;
  readonly clientes: string;
  readonly activos: string;
  readonly productosPorCliente: string;
  readonly nuevos: string;
  readonly ultimo: string;
  /** Fila agregada de otras agencias (candado y texto gris). */
  readonly agregada?: boolean;
}

/** Tramo de una barra apilada por porcentaje (ancho en %). */
export interface TramoPct {
  readonly clase: string;
  readonly ancho: number;
  readonly leyenda: string;
  readonly n: number;
  /** Texto dentro del tramo (si cabe). */
  readonly texto?: string;
}

/** Año de "Evolución de clientes": nuevos frente a perdidos. */
export interface ParAnual {
  readonly anio: string;
  readonly nuevos: number;
  readonly perdidos: number;
}

/** Grupo de "Productos por cliente" o de "Clientes por segmento". */
export interface GrupoClientes {
  readonly nombre: string;
  readonly n: number;
  /** Clase de color (`p1`…`p4`) o color CSS (dona). */
  readonly color: string;
}

/** Rango de edad. */
export interface RangoEdad {
  readonly rango: string;
  readonly etiqueta: string;
  readonly n: number;
}

/** Línea de negocio en "Activos administrados por línea de negocio". */
export interface LineaNegocio {
  readonly nombre: string;
  readonly sub?: string;
  readonly clientes: string;
  readonly agencia: number;
  readonly otras: number;
  readonly anchoAgencia: number;
  readonly anchoOtras: number;
  readonly pctAgencia: number;
  readonly total?: boolean;
}

/** Asesor elegible como FP Asignado. */
export interface CandidatoFp {
  readonly valor: string;
  readonly nombre: string;
  readonly etiqueta: string;
  readonly masRelacion?: boolean;
  readonly cargo?: string;
  readonly clientes: string;
  readonly aum: string;
  readonly productosPorCliente: string;
  readonly productos: readonly (readonly [string, number])[];
}
