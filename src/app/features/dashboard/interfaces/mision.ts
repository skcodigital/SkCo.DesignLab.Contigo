/** Etiqueta de la fila: «Prioridad alta» o «Misión iniciada» (seguimiento acordado). */
export type ChipMision = 'alta' | 'seg';

/** De dónde viene la misión (lo que entrega Fligo hoy). `sami` no pinta línea en la misión destacada. */
export type OrigenMision = 'sami' | 'acuerdo' | 'lista';

/** Misión de Planeación Pro pendiente esta semana (Acompañamiento al retirar). */
export interface Mision {
  id: string;
  nombre: string;
  segmento: string;
  chip: ChipMision;
  /** Saldo disponible para retiro en Contigo. */
  saldo: number;
  origen: OrigenMision;
  origenTexto: string;
}

export interface MisionCompletada {
  nombre: string;
  texto: string;
}

/** Hasta 5 misiones por semana: pendientes primero, completadas al final. */
export interface SemanaMisiones {
  pendientes: readonly Mision[];
  completadas: readonly MisionCompletada[];
}
