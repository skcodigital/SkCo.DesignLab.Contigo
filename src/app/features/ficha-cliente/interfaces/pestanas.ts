import { TipoProducto } from './productos';

export type PestanaFichaId =
  | 'copiloto'
  | 'productos'
  | 'datos'
  | 'documentos'
  | 'casos'
  | 'recomendacion'
  | 'actividades';

export interface PestanaFicha {
  readonly id: PestanaFichaId;
  readonly etiqueta: string;
  /** Texto completo cuando la etiqueta va abreviada. */
  readonly titulo?: string;
}

/** Panel que se pinta debajo de las pestañas: las que no tienen contenido muestran el panel vacío. */
export type PanelFicha = 'copiloto' | 'productos' | 'otros';

export type PestanaProductoId =
  | 'comportamiento'
  | 'composicion'
  | 'movimientos'
  | 'retenciones'
  | 'detalles'
  | 'cuentas'
  | 'actividad';

export interface PestanaProducto {
  readonly id: PestanaProductoId;
  readonly etiqueta: string;
  /** Sección que solo tiene un tipo de producto (Comportamiento: Multifund; Retenciones: FIC). */
  readonly solo?: TipoProducto;
}

/** Panel de la ficha del producto: las secciones sin contenido comparten el panel vacío. */
export type PanelProducto = 'composicion' | 'movimientos' | 'otros';
