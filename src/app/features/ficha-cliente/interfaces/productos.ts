export type IconoCategoria = 'ahorro' | 'seguros';

/** Fila de producto dentro de una categoría de la pestaña Productos. */
export interface ProductoResumen {
  readonly edicion: string;
  readonly nombre: string;
  readonly contrato: string;
  readonly tag: string;
  readonly fondo: string;
  readonly saldoTotal: string;
}

export interface CategoriaProductos {
  readonly id: string;
  readonly nombre: string;
  readonly icono: IconoCategoria;
  readonly abierta: boolean;
  readonly productos: readonly ProductoResumen[];
}

/** Ficha del producto (contrato) que se abre desde Productos. */
export interface DetalleProducto {
  readonly nombre: string;
  readonly contrato: string;
  readonly fondo: string;
  readonly administradora: string;
  readonly tag: string;
  readonly saldoTotal: string;
  readonly saldoRetiro: string;
  readonly capital: string;
  readonly rendimientos: string;
  readonly beneficio: {
    readonly saldoSinPerder: string;
    readonly acumulado: string;
    readonly devuelto: string;
  };
  readonly creditoPreaprobado: string;
}
