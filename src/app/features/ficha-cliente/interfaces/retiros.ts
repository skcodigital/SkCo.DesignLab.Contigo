export interface DetalleRetiro {
  readonly etiqueta: string;
  readonly valor: string;
}

/** Retiro en curso de un contrato del cliente (modal "Retiros en curso"). */
export interface Retiro {
  readonly id: string;
  readonly titulo: string;
  readonly cuando: string;
  readonly pasosTotales: number;
  readonly pasosHechos: number;
  readonly paso: string;
  readonly detalle: readonly DetalleRetiro[];
}
