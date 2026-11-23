import { Contrato } from './contrato';

/** Lo que se descuenta del contrato (D) para que el cliente reciba R, con retenciones y 4×1000. */
export interface Calculo {
  R: number;
  D: number;
  g: number;
  rcA: number;
  rrA: number;
  cubre: boolean;
  ex: number;
  sr: number;
  cc: number;
}

export interface Retiro extends Calculo {
  imp: number;
  perm: number;
  tasa: number;
  noEx: number;
  srRend: number;
  srCap: number;
}

export interface Bloqueo {
  c: Contrato;
  b: number;
  disp: number;
}

export interface Credito {
  M: number;
  cap: number;
  dias: number;
  int: number;
  total: number;
  costo: number;
  gmf: number;
  resp: number;
  bloq: Bloqueo[];
  faltaResp: number;
  pago: Date;
  conPlazo: boolean;
  tope: boolean;
}

export interface Combo {
  kt: Retiro;
  falta: number;
  disp: number;
  M: number;
  cr: Credito;
  recibe: number;
  cubre: boolean;
}

export interface Ficha {
  c: Contrato;
  k: Calculo;
  desc: number;
}

export interface Impuesto {
  txt: string;
  nota: string;
  accion: string;
  min: number;
  max: number;
  no: number;
  si: number;
  tope?: number;
}

export type TipoCaja = 'retiro' | 'credito' | 'total' | 'combo';

/** Cajas de la etapa Opciones para el contrato elegido. */
export interface Cajas {
  c: Contrato;
  k: Retiro;
  kt: Retiro;
  cb: Combo | null;
  unico: boolean;
  viv: boolean;
  list: TipoCaja[];
}

/** Simulación del crédito en el panel de detalle. */
export interface CreditoPanel {
  M: number;
  cap: number;
  dias: number;
  int: number;
  total: number;
  intA: number;
  bajo: number;
  resp: number;
}
