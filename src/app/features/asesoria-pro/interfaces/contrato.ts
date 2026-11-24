/** Portafolio de un contrato: nombre, saldo, participación (texto) y rentabilidad E.A. (null si no se conoce). */
export interface Portafolio {
  nombre: string;
  saldo: number;
  participacion: string;
  rentabilidad: number | null;
}

/** Tramos de aportes según la retención que generan al retirar. */
export type TipoTramo = 'ex' | 'sr' | 'cc' | 'sc';

export interface Tramo {
  tipo: TipoTramo;
  nombre: string;
  descripcion: string;
}

/** Contrato ficticio del prototipo WPP (Fondo Voluntario de Pensión). */
export interface Contrato {
  id: string;
  nom: string;
  num: string;
  prod: string;
  saldo: number;
  /** Disponible para retiro. */
  disp: number;
  /** Retención contingente si retirara todo hoy. */
  rcTodo: number;
  desde: string;
  gan: number;
  retirado: number;
  rendSaldo: number;
  capRet: number;
  rendRet: number;
  /** Saldos por tramo. */
  ex: number;
  sr: number;
  cc: number;
  sc: number;
  /** Tasas efectivas de retención sobre rendimientos y contingente. */
  rr: number;
  rc: number;
  /** Cifras exactas del prototipo WPP para un retiro de $150.000.000. */
  exacto?: { D: number; rc: number; rr: number };
  /** Cobro por permanencia (capital más seguro) para $150.000.000. */
  perm?: number;
  cerrados?: boolean;
  port: readonly Portafolio[];
  /** Aportes por año: [año, valor]. */
  anios: readonly (readonly [number, number])[];
  /** Posible impuesto como proporción de lo no exento. */
  imp: number;
  impExacto?: number;
  /** Rentabilidad de los últimos 12 meses ("14,15"). */
  rentTxt: string;
}

/** Contrato que respalda el Crédito Impulso y su disponible para bloquear. */
export interface Respaldo {
  id: string;
  disp: number;
}
