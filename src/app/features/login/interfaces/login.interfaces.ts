/** Título con una parte resaltada: `Herramientas para que llegues <span>más lejos</span>`. */
export interface TituloResaltado {
  antes: string;
  resaltado: string;
  despues: string;
}

export type IconoChip =
  | 'decisiones'
  | 'clientes'
  | 'crecimiento'
  | 'metas'
  | 'desempeno'
  | 'participes'
  | 'consolidado'
  | 'nit'
  | 'journeys'
  | 'momentos'
  | 'conversaciones'
  | 'historial';

export interface ChipSlide {
  icono: IconoChip;
  texto: string;
}

/** Diapositiva del carrusel del panel derecho. */
export interface LoginSlide {
  eyebrow: string;
  titulo: TituloResaltado;
  texto: string;
  chips: readonly ChipSlide[];
}

/** Novedad del banner móvil. */
export interface NovedadMini {
  eyebrow: string;
  titulo: TituloResaltado;
}

export type ReglaClave = 'len' | 'may' | 'min' | 'num' | 'sim' | 'igual';

export interface ReglaClaveVista {
  id: ReglaClave;
  texto: string;
}
