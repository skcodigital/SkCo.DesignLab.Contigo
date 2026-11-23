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
  | 'detalles'
  | 'cuentas'
  | 'actividad';

export interface PestanaProducto {
  readonly id: PestanaProductoId;
  readonly etiqueta: string;
}
