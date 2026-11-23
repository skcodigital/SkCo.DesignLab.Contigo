export type IconoKpi = 'ahorro' | 'pensiones' | 'seguros' | 'credito';
export type Tendencia = 'sube' | 'baja';

/** Dato secundario de una tarjeta de saldos (Rendimientos, IBC, Prima mes…). */
export interface SubKpi {
  readonly titulo: string;
  readonly valor: string;
  /** Variante con borde y chevron (TIR). */
  readonly desplegable?: boolean;
}

export interface Kpi {
  readonly icono: IconoKpi;
  readonly etiqueta: string;
  readonly valor: string;
  /** Color de fondo del círculo del ícono. */
  readonly fondoIcono: string;
  readonly tendencia?: Tendencia;
  readonly subs: readonly SubKpi[];
  /** Enlace "Conoce más" (crédito preaprobado). */
  readonly enlace?: string;
}

export interface ResumenSaldos {
  readonly total: string;
  readonly tooltip: string;
  readonly kpis: readonly Kpi[];
}
