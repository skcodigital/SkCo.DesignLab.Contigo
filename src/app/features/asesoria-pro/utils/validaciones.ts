import { Etapa, EstadoConversacion } from '../interfaces/conversacion';
import { enAlcance, prefEsRetiro, retiroPref, tocaNoExento } from './calculos';

type St = EstadoConversacion;

export const ETAPAS: readonly Etapa[] = [1, 2, 3, 4];

/** Solo lectura: la conversación ya se cerró. */
export const soloLectura = (st: St): boolean => st.cerrado;

/** Entender: motivo en alcance, monto y para cuándo. */
export const etapa1Completa = (st: St): boolean => enAlcance(st.motivo) && st.monto > 0 && !!st.cuando;
/** Situación: contrato confirmado. */
export const etapa2Completa = (st: St): boolean => etapa1Completa(st) && !!st.ctConf;
/** Opciones: preferencia elegida y, si el retiro toca aportes no exentos, respuesta de renta exenta. */
export const etapa3Completa = (st: St): boolean =>
  etapa2Completa(st) && !!st.pref && !(prefEsRetiro(st) && tocaNoExento(st, retiroPref(st)) && !st.rx);
/** Acuerdo: cierre registrado (no fuera de alcance). */
export const etapa4Completa = (st: St): boolean => st.cerrado && !st.fuera;

const COMPLETA: Readonly<Record<Etapa, (st: St) => boolean>> = {
  1: etapa1Completa,
  2: etapa2Completa,
  3: etapa3Completa,
  4: etapa4Completa,
};

export const completa = (st: St, n: Etapa): boolean => COMPLETA[n](st);

/** Se puede ir a la etapa `n` si las anteriores están completas (o en solo lectura). */
export const habilitada = (st: St, n: Etapa): boolean =>
  soloLectura(st) || ETAPAS.slice(0, n - 1).every((e) => completa(st, e));

/** Etapas completas («En curso · n de 4 etapas»). */
export const etapasCompletas = (st: St): number => ETAPAS.filter((e) => completa(st, e)).length;
