export type IconoMetaCliente = 'persona' | 'celular' | 'correo';

/** Dato corto de la barra de identidad (documento, edad, celular, correo). */
export interface MetaCliente {
  readonly icono: IconoMetaCliente;
  readonly texto: string;
}

export interface Cliente {
  readonly nombre: string;
  /** Texto del chip verde de la barra de identidad. */
  readonly chip: string;
  readonly metas: readonly MetaCliente[];
}
