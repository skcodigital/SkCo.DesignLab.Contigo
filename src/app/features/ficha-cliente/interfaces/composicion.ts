/** Portafolio del contrato con sus valores a la fecha de hoy. */
export interface Fondo {
  readonly nombre: string;
  /** Color de la serie (custom property del DS). */
  readonly color: string;
  readonly unidades: number;
  readonly valorUnidad: number;
  readonly saldo: number;
  readonly rendimientos: number;
  /** Rendimiento efectivo anual, en %. */
  readonly ea: number;
}

/** Portafolio recalculado a una fecha de corte, con su peso dentro del contrato. */
export interface FilaComposicion extends Fondo {
  readonly porcentaje: number;
}

export type SegmentoComposicion = 'actual' | 'standing';

export interface DiaCalendario {
  readonly dia: number;
  readonly fecha: Date;
  readonly deshabilitado: boolean;
  readonly hoy: boolean;
  readonly seleccionado: boolean;
  readonly etiqueta: string;
}

export interface MesCalendario {
  readonly titulo: string;
  /** Huecos antes del día 1 (semana empieza en lunes). */
  readonly vacios: number;
  readonly dias: readonly DiaCalendario[];
  readonly puedeAnterior: boolean;
  readonly puedeSiguiente: boolean;
}
