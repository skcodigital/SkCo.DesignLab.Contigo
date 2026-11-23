/** Productos de Óscar con ficha propia: Multifund (fondo voluntario de pensión) y FIC (fondo de inversión colectiva). */
export type TipoProducto = 'mf' | 'fic';

/** Fila de producto dentro de una categoría de la pestaña Productos. */
export interface ProductoResumen {
  readonly tipo: TipoProducto;
  readonly edicion?: string;
  readonly nombre: string;
  readonly emoji?: string;
  readonly contrato: string;
  readonly tag?: string;
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

export type IconoCategoria = 'ahorro' | 'seguros';

/** Ficha del producto (contrato) que se abre desde Productos. */
export interface DetalleProducto {
  readonly tipo: TipoProducto;
  readonly nombre: string;
  readonly emoji?: string;
  /** Número de contrato sin "#". */
  readonly contrato: string;
  readonly fondo: string;
  readonly administradora: string;
  /** Tag del plan (solo Multifund). */
  readonly tag?: string;
  readonly saldoTotal: string;
  readonly saldoRetiro: string;
  readonly capital: string;
  readonly rendimientos: string;
  /** Porcentaje del saldo que son rendimientos (dona de evolución). */
  readonly pctRendimientos: number;
  /** Beneficio de permanencia (solo Multifund). */
  readonly beneficio?: {
    readonly saldoSinPerder: string;
    readonly acumulado: string;
    readonly devuelto: string;
    readonly creditoPreaprobado: string;
  };
  /** Etiqueta de la sección "Cuentas y débito" (en el FIC solo "Cuentas"). */
  readonly etiquetaCuentas: string;
}

/** Movimiento del contrato (tabla de la sección Movimientos del FIC). */
export interface Movimiento {
  readonly tipo: string;
  readonly fecha: string;
  readonly bruto: string;
  readonly neto: string;
}
