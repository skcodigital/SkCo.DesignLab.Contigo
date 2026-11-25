export type Etapa = 1 | 2 | 3 | 4;
export type Motivo = 'liquidez' | 'vivienda' | 'objetivo' | 'rendimientos' | 'otro';
export type Cuando = 'esta-semana' | 'este-mes' | 'en-meses';
/** Chip marcado en «¿Para cuándo lo necesita?» (incluye «Con fecha»). */
export type OpcionCuando = Cuando | 'fecha';
export type PreguntaEntender = 'motivo' | 'cuando';
export type SiNo = 'si' | 'no';
export type RespuestaRx = 'si' | 'no' | 'nosabe';
export type Preferencia = 'retiro' | 'total' | 'credito' | 'combo' | 'noretira';
export type Decision = Preferencia | 'noretira' | 'pensara' | 'fuera';
export type Tramite = 'portal' | 'especificado' | 'credito';
export type EstadoConv = 'en-curso' | 'cerrada-seguimiento' | 'finalizada';
export type MetodoImpuesto = 'preguntas' | 'tarifa';
export type VistaAportes = 'resumen' | 'tabla';
export type PeriodoRent = 'inicio' | '12' | '6' | '3';
export type OrigenConv = 'mision' | 'catalogo' | 'historial';
export type ProximoPaso = 'resumen';
/** Herramienta donde el asesor agenda la llamada de seguimiento (la fecha y la hora se eligen allí). */
export type HerramientaAgenda = 'google' | 'teams' | 'ios';
/**
 * Como las herramientas no devuelven la fecha, el asesor la confirma:
 * pendiente (¿la agendaste?) → «si» (fecha y hora, se guardan solas) o «no».
 */
export type EstadoAgenda = 'pendiente' | 'si' | 'no';

export interface AgendaSeguimiento {
  via: HerramientaAgenda;
  estado: EstadoAgenda;
  /** `AAAA-MM-DD` y `HH:MM` que indicó el asesor. */
  fecha: string;
  hora: string;
}

export interface EstadoImpuestos {
  metodo: MetodoImpuesto;
  /** Pregunta actual (1–4); 5 = todas respondidas. */
  paso: number;
  ingreso: number;
  benef: RespuestaRx | null;
  otros: number | null;
  otrosTmp: number;
  dep: SiNo | null;
  tarifa: string;
}

/** Simulador del crédito en el panel de detalle (parte del crédito de la caja). */
export interface SimCredito {
  para: number;
  monto: number;
  fecha: string;
  abono: boolean;
  fAbono: string;
  vAbono: number;
}

export interface MensajeCierre {
  t: string;
  ok?: boolean;
}

/** Estado completo de una conversación «Acompañamiento al retirar» (el `st` del prototipo). */
export interface EstadoConversacion {
  etapa: Etapa;
  visitadas: readonly Etapa[];
  monto: number;
  motivo: Motivo | null;
  otro: string;
  cuando: Cuando | null;
  fecha: string;
  fechaTipo: 'fecha' | 'meses' | null;
  abierta: PreguntaEntender | null;
  eligeFecha: boolean;
  pen: SiNo | null;
  ctMarc: string | null;
  ctConf: string | null;
  pref: Preferencia | null;
  plazo: number | null;
  noRepone: boolean;
  rx: RespuestaRx | null;
  rxInfo: boolean;
  lm: boolean;
  dec: Decision | null;
  tram: Tramite | null;
  np: Readonly<Record<ProximoPaso, boolean>>;
  /** Dónde se agendó la llamada de seguimiento (queda registrada aunque no se cierre el acompañamiento). */
  agenda: AgendaSeguimiento | null;
  notas: string;
  validar: boolean;
  msg: MensajeCierre | null;
  cerrado: boolean;
  fuera: boolean;
  estado: EstadoConv;
  resultado: string | null;
  segHasta: string;
  enviado: boolean;
  segundos: number;
  imp: EstadoImpuestos;
  cr: SimCredito | null;
  /** Crédito que el asesor fijó en «Retiro + Crédito Impulso» (null = lo que falta o el mínimo). */
  creditoCombo: number | null;
  apVista: VistaAportes;
  rentPer: PeriodoRent;
  verCalc: boolean;
}

export interface Conversacion {
  id: number;
  origen: OrigenConv;
  estado: EstadoConv;
  creada: Date;
  st: EstadoConversacion;
}
