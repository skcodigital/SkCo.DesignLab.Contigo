import { Ambito, Gestion } from '@features/radiografia/interfaces/radiografia';

/** Clientes nuevos y perdidos de un año (`2026*` = hasta octubre). */
export interface AnioEvolucion {
  readonly anio: string;
  readonly nuevos: number;
  readonly perdidos: number;
}

/** Datos de los recuadros de Clientes para un ámbito (Skandia en la empresa o Agencia Norte). */
export interface DatosAmbito {
  readonly total: number;
  readonly nombre: string;
  readonly evol: readonly AnioEvolucion[];
  /** Clientes con 1, 2, 3 y 4+ productos. */
  readonly prod: readonly [number, number, number, number];
  /** Finanzas Personales, Privilegio, Elite, Wealth. */
  readonly seg: readonly [number, number, number, number];
  /** 18–30, 31–45, 46–60, más de 60. */
  readonly edad: readonly [number, number, number, number];
}

export type DatosAmbitos = Readonly<Record<Ambito, DatosAmbito>>;

/** Tramo de la barra apilada de "Clientes activos" (La oportunidad). */
export interface TramoOportunidad {
  /** `dueno` | `agencia` | `otras` | `vacio` (sin relación). */
  readonly clase: Gestion | 'vacio';
  readonly ancho: number;
  readonly valor: number;
  /** Texto dentro del tramo (si cabe). */
  readonly etiqueta?: string;
  /** Texto de la leyenda, sin la cifra ("FP Asignado"). */
  readonly leyenda: string;
}

/** Segmento de una barra apilada de "Clientes nuevos por quién los vinculó". */
export interface TramoGestion {
  readonly gestion: Gestion;
  readonly alto: number;
  readonly valor: number;
  readonly etiqueta: string;
  /** El número no cabe en el tramo: no se pinta (solo en el tooltip). */
  readonly sinValor?: boolean;
}

export interface BarraGestion {
  readonly anio: string;
  readonly total: number;
  readonly aria: string;
  /** De arriba hacia abajo: otras agencias, Agencia Norte, FP Asignado. */
  readonly tramos: readonly TramoGestion[];
}

/** Fila de "Asesores con clientes en la empresa". */
export interface FilaAsesor {
  readonly gestion: Gestion;
  readonly nombre: string;
  readonly detalle: string;
  readonly clientes: string;
  readonly activos: string;
  readonly nuevos: string;
  readonly ultimo: string;
  readonly estado: 'Activo' | 'Agregado';
  readonly propio?: boolean;
  readonly agregado?: boolean;
}

/** Gestión de la agencia del FP Asignado en un año. */
export interface GestionAnio {
  readonly nuevos: number;
  readonly empresa: number;
  readonly perdidos: number;
  readonly netoEmpresa: number;
  readonly participes: number;
  readonly contratos: number;
}

export type TipoPlan = 'bonificaciones' | 'mutuo' | 'flex';

/** Datos de ejemplo de un tipo de plan corporativo. */
export interface DatosPlan {
  readonly sub: string;
  readonly aportes2026: number;
  readonly ventaNeta: number;
  readonly aum: number;
  /** AUM de octubre de 2025 (base de la variación). */
  readonly aumOct25: number;
  readonly participes: number;
  readonly contratos: number;
  /** [año, aportes, retiros] en millones. */
  readonly anios: readonly (readonly [string, number, number])[];
  /** AUM: oct 2025, ene, abr, jul y oct 2026. */
  readonly aumPts: readonly number[];
}
