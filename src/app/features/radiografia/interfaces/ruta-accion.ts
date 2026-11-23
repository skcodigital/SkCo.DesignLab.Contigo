/** Metas de la ruta de acción (las cuatro etapas de la ruta comercial). */
export type MetaId = 'activar' | 'profundizar' | 'consolidar' | 'retener';

export type EstadoMeta = 'curso' | 'lograda' | 'descartada';

/** Plazo para que el asesor revise la ruta: sin plazo, 15, 30 días u otro valor. */
export type Plazo = '' | '15' | '30' | 'otro';

/** Una meta en la modal de crear/editar ruta. */
export interface MetaForm {
  readonly id: MetaId;
  readonly incluida: boolean;
  readonly valor: number;
  readonly sugerida: number;
}

/** Una meta de la ruta ya enviada (seguimiento). */
export interface MetaRuta {
  readonly id: MetaId;
  readonly valor: number;
  readonly estado: EstadoMeta;
  readonly inicio: Date;
}

/** Última modificación de la ruta: quién y cuándo. */
export interface ModificacionRuta {
  readonly quien: 'director' | 'dueno';
  readonly fecha: Date;
}

/** Línea del resumen de la confirmación ("Metas de la ruta"). */
export interface MetaEnviada {
  readonly id: MetaId;
  readonly texto: string;
  readonly editada: boolean;
}

/** Confirmación que reemplaza el formulario al enviar la ruta. */
export interface RutaEnviada {
  readonly editada: boolean;
  readonly metas: readonly MetaEnviada[];
  /** Días de plazo; 0 = sin plazo (no se menciona en la confirmación). */
  readonly plazo: number;
}

/** Datos de hoy de la empresa con los que se calculan las metas. */
export interface DatosHoy {
  readonly empleados: number;
  readonly clientes: number;
  readonly clientes2p: number;
  readonly afiliados: number;
  readonly agencia: number;
}

/** Configuración de la ruta de acción según la empresa (con o sin PAC). */
export interface ConfigRuta {
  readonly hoy: DatosHoy;
  /** Penetración de hoy, ya formateada (p. ej. "33,0%"). */
  readonly penetracionHoy: string;
  /** Cross-sell 2P+ de hoy en % (texto del resumen enviado). */
  readonly baseProfundizar: number;
  /** Share de FPOB de hoy en % (texto del resumen enviado). */
  readonly baseConsolidar: number;
  /** Neto anual de hoy, ya formateado (p. ej. "+1"). */
  readonly retenerHoy: string;
  readonly sugeridas: Readonly<Record<MetaId, number>>;
  /** Mínimos de los campos numéricos de la modal. */
  readonly minimos: Readonly<Record<MetaId, number>>;
  readonly empresa: string;
}

/** Seguimiento de una meta (solo con PAC): dato inicial, avance de ejemplo y cómo se calcula la meta. */
export interface SeguimientoMeta {
  readonly nombre: string;
  /** Dato de ejemplo del avance después de crear la ruta. */
  readonly hoyDemo: number;
  readonly ini: number;
  readonly pre: string;
  readonly unidad: string;
}
