import { DEC_NOM, PROXIMOS_PASOS, TEXTOS } from '../constants/textos';
import { Cajas, Credito } from '../interfaces/calculo';
import { Decision, EstadoConversacion } from '../interfaces/conversacion';
import { elegibles } from './calculos';
import { deIso, fLarga, pesos } from './formato';

type St = EstadoConversacion;

export const esRetiro = (d: Decision | null): boolean => d === 'retiro' || d === 'total' || d === 'combo';

/** Lo que sale del contrato con la decisión (null si no se sabe). */
export function saleDe(d: Decision, v: Cajas): number | null {
  if (d === 'retiro') return v.k.D;
  if (d === 'total' || d === 'combo') return v.kt.D;
  if (d === 'credito' || d === 'noretira') return 0;
  return null;
}

/** Decisiones que se ofrecen en Acuerdo, en el orden del prototipo. */
export function listaDecisiones(st: St, v: Cajas, cr: Credito): Decision[] {
  const ofr = elegibles(st, v, cr);
  const base: Decision[] = ofr.includes('retiro') ? ['retiro', 'total', 'combo', 'credito'] : ['credito', 'total', 'combo'];
  const lista: Decision[] = base.filter((t) => (ofr as Decision[]).includes(t)).concat(['noretira', 'pensara']);
  if (st.dec && st.dec !== 'fuera' && !lista.includes(st.dec)) lista.push(st.dec);
  return lista;
}

/** Línea de detalle de cada decisión. */
export function detalleDecision(d: Decision, st: St, v: Cajas, cr: Credito): string {
  const c = v.c;
  switch (d) {
    case 'retiro':
      return 'Recibe ' + pesos(v.k.R) + ' de ' + c.nom;
    case 'total':
      return 'Recibe ' + pesos(v.kt.R) + ' de ' + c.nom;
    case 'combo':
      return v.cb ? 'Recibe ' + pesos(v.cb.recibe) : '';
    case 'credito':
      return st.noRepone ? 'No lo repondría' : 'Total a pagar ' + pesos(cr.total);
    case 'noretira':
      return 'Sigue invertido ' + pesos(c.saldo);
    case 'pensara':
      return 'Agenda un seguimiento';
    default:
      return '';
  }
}

export const pagoTxt = (cr: Credito): string =>
  cr.conPlazo ? 'Pago previsto: ' + fLarga(cr.pago) : 'Pago al vencimiento (360 días)';

export function respaldoTxt(cr: Credito): string {
  const b = cr.bloq.filter((x) => x.b > 0);
  return (
    'Respaldo: ' + pesos(cr.resp) + ' bloqueados en el contrato ' +
    b.map((x, i) => (i ? 'el contrato ' : '') + x.c.num + ' (' + pesos(x.b) + ')').join(' y ')
  );
}

/** Línea de la solicitud del crédito («Crédito Impulso · Monto…» o «Y solicitar crédito…»). */
export const lineaCredito = (cr: Credito): string =>
  'Monto: ' + pesos(cr.M) + ' · con GMF ' + pesos(cr.cap) + ' · Tasa: 17,78 % E.A. · ' + pagoTxt(cr) + ' · ' + respaldoTxt(cr) + ' · Sin cuotas mensuales';

/** Error si falta el trámite, o el mensaje de cierre registrado. */
export function validarCierre(st: St): { error: string } | { ok: string } {
  const dec = st.dec as Decision;
  const ret = esRetiro(dec);
  const esCr = dec === 'credito';
  if ((ret || esCr) && !st.tram) return { error: ret ? TEXTOS.faltaTramRetiro : TEXTOS.faltaTramCredito };
  const accion = ret ? (st.tram === 'especificado' ? TEXTOS.accionEspecificado : TEXTOS.accionPortal) : esCr ? TEXTOS.accionCredito : '';
  const pasos: string[] = [];
  if (st.np.resumen) pasos.push(PROXIMOS_PASOS.resumen);
  if (st.np.seguimiento) pasos.push(PROXIMOS_PASOS.seguimiento);
  const pend = [accion, ...pasos].filter(Boolean);
  const seg = st.np.seguimiento && st.fseg ? fLarga(deIso(st.fseg)) : '';
  return { ok: TEXTOS.cierreRegistrado(DEC_NOM[dec]) + (pend.length ? TEXTOS.cierrePendientes(pend.join(' · '), seg) : '') };
}
