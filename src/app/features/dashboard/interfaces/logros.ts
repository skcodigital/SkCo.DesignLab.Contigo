/** Mes del selector de Logros (`mes` va de 0 = enero a 11 = diciembre). */
export interface MesAnio {
  anio: number;
  mes: number;
}

/** Color de la flecha de variación: verde sube, rojo baja o sube en contra (retiros). */
export type Tendencia = 'sube' | 'baja' | 'sube-roja';

export interface ValorIndicador {
  valor: number;
  /** Variación en % con respecto al mes anterior. */
  variacion: number;
}

export interface Indicador extends ValorIndicador {
  id: string;
  etiqueta: string;
  tendencia: Tendencia;
}

export interface SegmentoDistribucion {
  nombre: string;
  porcentaje: number;
  color: string;
}

export interface ComisionMes {
  mes: string;
  corto: string;
  valor: number;
  /** Altura del punto en el viewBox 0 0 400 120 de la gráfica. */
  y: number;
}

/** Punto ya ubicado de la gráfica de comisiones. */
export interface PuntoComision extends ComisionMes {
  x: number;
  /** Posición del botón del punto sobre la gráfica, en %. */
  left: number;
  top: number;
}
