import { TipoProducto } from './productos';

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
  /** Disponible para retiro. */
  readonly disponible: boolean;
}

/** Portafolio recalculado a una fecha de corte, con su peso (sin redondear) dentro del contrato. */
export interface FilaComposicion extends Fondo {
  readonly porcentaje: number;
}

/** Fila de la tabla de "Indicadores por portafolio", ya formateada. */
export interface FilaTablaComposicion {
  readonly nombre: string;
  readonly color: string;
  readonly participacion: string;
  readonly unidades: string;
  readonly valorUnidad: string;
  readonly rendimientos: string;
  readonly ea: string;
  readonly disponible: boolean;
  readonly disponibleTexto: string;
  readonly saldo: string;
}

export type SegmentoComposicion = 'actual' | 'standing';
export type EstadoSaldos = 'proceso' | 'efectivo';

/** Todo lo que pinta "Composición y saldos" para el producto y la fecha de corte elegidos. */
export interface VistaComposicion {
  readonly tipo: TipoProducto;
  readonly contrato: string;
  readonly segmento: SegmentoComposicion;
  readonly estado: EstadoSaldos;
  readonly fecha: Date;
  readonly fechaTexto: string;
  readonly filas: readonly FilaTablaComposicion[];
  readonly total: string;
  readonly gradiente: string;
  readonly etiquetaDona: string;
}

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
