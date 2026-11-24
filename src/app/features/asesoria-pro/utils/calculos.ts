import {
  CONTRATOS,
  contratoPorId,
  MONTO_REFERENCIA,
  RESPALDO,
  RX_NO,
  RX_SI,
  TASA_CREDITO,
  CREDITO_MIN,
  TOPE_CREDITO,
} from '../data/contratos.mock';
import { HOY } from '../data/conversaciones.mock';
import { TEXTOS } from '../constants/textos';
import {
  Bloqueo,
  Cajas,
  Calculo,
  Combo,
  Credito,
  CreditoPanel,
  Ficha,
  Impuesto,
  Retiro,
  TipoCaja,
} from '../interfaces/calculo';
import { Contrato } from '../interfaces/contrato';
import { EstadoConversacion, Motivo, SimCredito } from '../interfaces/conversacion';
import { deIso, iso, masDias, pesos } from './formato';

type St = EstadoConversacion;

/** Motivos que siguen el acompañamiento. «Rendimientos o expectativas» termina aquí: aún no está esa funcionalidad. */
export const enAlcance = (m: Motivo | null): boolean => m === 'liquidez' || m === 'vivienda' || m === 'objetivo' || m === 'otro';
/** Condición especial (pensión o vivienda): sin retenciones. */
export const esp = (st: St): boolean => st.motivo === 'vivienda' || st.pen === 'si';

/** Lo que se descuenta del contrato `c` para que el cliente reciba `R`. */
export function calc(c: Contrato, R: number, e: boolean): Calculo {
  if (e) {
    let cubre = true;
    let D = R * 1.004;
    if (D > c.disp) {
      cubre = false;
      D = c.disp;
      R = Math.round(D / 1.004);
    }
    const g = Math.round(R * 0.004);
    D = R + g;
    return { R, D, g, rcA: 0, rrA: 0, cubre, ex: D, sr: 0, cc: 0 };
  }
  const base = c.ex + c.sr;
  let cubre = true;
  let D: number;
  if (R === MONTO_REFERENCIA && c.exacto) D = c.exacto.D;
  else {
    D = (R * 1.004) / (1 - c.rr);
    if (D > base && c.rc) D = (R * 1.004 - c.rc * base) / (1 - c.rr - c.rc);
  }
  if (D > c.disp) {
    cubre = false;
    D = c.disp;
    const neto = D > base && c.rc ? D * (1 - c.rr - c.rc) + c.rc * base : D * (1 - c.rr);
    R = Math.round(neto / 1.004);
  }
  let rcA: number;
  let rrA: number;
  const g = Math.round(R * 0.004);
  if (cubre && R === MONTO_REFERENCIA && c.exacto) {
    rcA = c.exacto.rc;
    rrA = c.exacto.rr;
  } else {
    rcA = Math.round(c.rc * Math.max(0, D - base));
    rrA = Math.round(c.rr * D);
    D = R + g + rcA + rrA;
  }
  const ex = Math.min(D, c.ex);
  const sr = Math.min(D - ex, c.sr);
  const cc = Math.max(0, D - ex - sr);
  return { R, D, g, rcA, rrA, cubre, ex, sr, cc };
}

/** Retiro por el monto que necesita (o el total disponible) con el posible impuesto. */
export function retiro(st: St, c: Contrato, total = false): Retiro {
  const e = esp(st);
  const k = calc(c, total ? Infinity : st.monto || 0, e);
  const exacto = !total && !e && k.cubre && st.monto === MONTO_REFERENCIA;
  const imp = e ? 0 : exacto && c.impExacto ? c.impExacto : Math.round(c.imp * Math.max(0, k.D - k.ex));
  const noEx = e ? 0 : Math.max(0, k.D - k.ex);
  const srRend = Math.round((noEx * c.rendSaldo) / c.saldo);
  return {
    ...k,
    imp,
    perm: c.perm ? Math.round((c.perm * k.R) / MONTO_REFERENCIA) : 0,
    tasa: parseFloat(c.rentTxt.replace(',', '.')) / 100,
    noEx,
    srRend,
    srCap: noEx - srRend,
  };
}

/** Fichas de contrato: primero las que cubren (menor descuento), luego las que no (mayor disponible). */
export function ordenFichas(st: St): Ficha[] {
  const R = st.monto || 0;
  const e = esp(st);
  const f = CONTRATOS.map((c) => {
    const k = calc(c, R, e);
    return { c, k, desc: k.D - k.R + (c.perm ? Math.round((c.perm * k.R) / MONTO_REFERENCIA) : 0) };
  });
  return f
    .filter((x) => x.k.cubre)
    .sort((a, b) => a.desc - b.desc)
    .concat(f.filter((x) => !x.k.cubre).sort((a, b) => b.c.disp - a.c.disp));
}

export const ctId = (st: St): string => st.ctConf || st.ctMarc || ordenFichas(st)[0].c.id;
export const ctSel = (st: St): Contrato => contratoPorId(ctId(st));
export const prefEsRetiro = (st: St): boolean => st.pref === 'retiro' || st.pref === 'total' || st.pref === 'combo';
export const retiroPref = (st: St): Retiro =>
  st.pref === 'retiro'
    ? retiro(st, ctSel(st))
    : st.pref === 'combo'
      ? (combo(st, ctSel(st))?.kt ?? retiro(st, ctSel(st), true))
      : retiro(st, ctSel(st), true);
export const tocaNoExento = (st: St, k: Retiro): boolean => !esp(st) && k.noEx > 0.5;

function bloqueos(resp: number): { bloq: Bloqueo[]; falta: number } {
  let falta = resp;
  const bloq = RESPALDO.map(({ id, disp }) => {
    const b = Math.min(falta, disp);
    falta -= b;
    return { c: contratoPorId(id), b, disp };
  });
  return { bloq, falta };
}

/** Crédito Impulso por `M` con el plazo elegido (sin plazo, 12 meses). */
export function credito(st: St, M: number): Credito {
  const meses = st.plazo && !st.noRepone ? st.plazo : 12;
  const dias = meses * 30;
  const cap = Math.floor(M * 1.004);
  const int = Math.round(cap * (Math.pow(1 + TASA_CREDITO, dias / 365) - 1));
  const total = Math.floor(cap + int);
  const resp = Math.floor(cap * 1.3);
  const { bloq, falta } = bloqueos(resp);
  return {
    M, cap, dias, int, total, costo: total - M, gmf: cap - M, resp, bloq,
    faltaResp: Math.max(0, falta), pago: masDias(dias), conPlazo: !!(st.plazo && !st.noRepone),
    tope: (st.monto || 0) > TOPE_CREDITO,
  };
}

/** Crédito de la caja Crédito Impulso: lo que necesita, con el mínimo a desembolsar y el tope preaprobado. */
export const cred = (st: St): Credito =>
  credito(st, st.monto > 0 ? Math.min(Math.max(st.monto, CREDITO_MIN), TOPE_CREDITO) : 0);

/** Paso del ajuste del crédito en la combinación. */
export const PASO_CREDITO = 500000;

/**
 * Retiro + Crédito Impulso: retira lo disponible y pide el crédito por lo que falta. El crédito nunca baja del
 * mínimo a desembolsar: si lo que falta es menor, el crédito queda en el mínimo y el retiro se ajusta (baja) para
 * que entre los dos sumen exactamente lo que necesita el cliente.
 */
export function combo(st: St, c: Contrato): Combo | null {
  const total = retiro(st, c, true);
  const falta = Math.round((st.monto || 0) - total.R);
  if (falta <= 0.5 || total.R <= 0.5) return null;
  // Lo que se retira del contrato que respalda deja menos para bloquear: se descuenta del respaldo disponible
  const totalResp = RESPALDO.reduce((a, x) => a + x.disp, 0);
  const ent = RESPALDO.find((x) => x.id === c.id);
  const queda = totalResp - Math.min(ent ? ent.disp : 0, total.R + total.g);
  const disp = Math.min(TOPE_CREDITO, Math.floor(queda / 1.3 / 1.004));
  // Si el respaldo no alcanza ni para el crédito mínimo, no hay combinación
  if (disp < CREDITO_MIN) return null;
  const monto = st.monto || 0;
  // Crédito base: lo que falta, nunca menos del mínimo; si el respaldo no alcanza, lo que alcance
  const base = Math.min(Math.max(falta, CREDITO_MIN), disp);
  if (base < falta - 0.5) {
    // El respaldo no cubre lo que falta: retiro total y el crédito que alcance (no se puede subir)
    return { kt: total, falta, disp, M: base, cr: credito(st, base), recibe: total.R + base, cubre: false,
      minimo: false, mMin: base, mMax: base };
  }
  // El asesor puede subir el crédito hasta lo que permite el respaldo, dejando algo por retirar
  const mMax = Math.max(base, Math.min(disp, Math.floor((monto - PASO_CREDITO) / PASO_CREDITO) * PASO_CREDITO));
  const M = Math.min(Math.max(st.creditoCombo ?? base, base), mMax);
  if (monto - M <= 0.5) return null; // con el crédito ya alcanza: no hay combinación con retiro
  // Si el crédito es justo lo que falta, retiro total; si es más (mínimo o elegido), el retiro baja
  const kt = Math.abs(M - falta) <= 0.5 ? total : retiro({ ...st, monto: Math.round(monto - M) }, c);
  return { kt, falta, disp, M, cr: credito(st, M), recibe: kt.R + M, cubre: true,
    minimo: M === CREDITO_MIN && falta < CREDITO_MIN, mMin: base, mMax };
}

export function aniosDe(c: Contrato, k: Calculo): [number, number][] {
  const tot = c.anios.reduce((a, x) => a + x[1], 0);
  return c.anios.map((a) => [a[0], Math.round((a[1] * k.D) / tot)]);
}

export function aniosTxt(c: Contrato, k: Calculo): string {
  const an = aniosDe(c, k).map((a) => a[0] + ' (' + pesos(a[1]) + ')');
  const ult = an.pop();
  return 'Los ' + pesos(k.D) + ' salen de aportes de ' + (an.length ? an.join(', ') + ' y ' : '') + ult + '.';
}

// ---- Posible impuesto: con el IBC (por defecto), con las respuestas de «Impuestos» o con la tarifa del asesor ----
export function tarifaNum(st: St): number | null {
  const t = parseFloat(String(st.imp.tarifa).replace(',', '.'));
  return isNaN(t) ? null : t;
}
export function tarifaOk(st: St): boolean {
  const t = tarifaNum(st);
  return t != null && t >= 0 && t <= 39;
}
export const tarifaTxt = (st: St): string => String(tarifaNum(st)).replace('.', ',');
export const preguntasOk = (st: St): boolean => st.imp.paso > 4;

export function impuesto(st: St, k: Retiro): Impuesto {
  if (esp(st)) return { txt: pesos(0), nota: TEXTOS.notaEspecial, accion: '', min: 0, max: 0, no: 0, si: 0 };
  let v = { tope: k.imp, si: Math.round(k.imp * RX_SI), no: Math.round(k.imp * RX_NO) };
  let nota: string = TEXTOS.notaIbc;
  if (st.imp.metodo === 'tarifa' && tarifaOk(st)) {
    const t = (tarifaNum(st) ?? 0) / 100;
    v = { tope: Math.round(t * (k.srCap + k.srRend)), si: Math.round(t * k.srCap), no: Math.round(t * k.srRend) };
    nota = TEXTOS.notaTarifa(tarifaTxt(st));
  } else if (preguntasOk(st)) nota = TEXTOS.notaRespuestas;
  let txt: string;
  let min: number;
  let max: number;
  if (k.noEx <= 0.5) {
    txt = pesos(v.no);
    min = max = v.no;
  } else if (!st.rx) {
    txt = 'hasta ' + pesos(v.tope);
    min = Math.min(v.no, v.si);
    max = v.tope;
  } else if (st.rx === 'nosabe') {
    min = Math.min(v.no, v.si);
    max = Math.max(v.no, v.si);
    txt = min === max ? pesos(min) : pesos(min) + ' a ' + pesos(max);
  } else {
    min = max = st.rx === 'si' ? v.si : v.no;
    txt = pesos(min);
  }
  return { txt, nota, accion: TEXTOS.ajustar, min, max, no: v.no, si: v.si, tope: v.tope };
}

/** Cajas de Opciones para el contrato elegido, en el orden del prototipo. */
export function cajas(st: St): Cajas {
  const c = ctSel(st);
  const k = retiro(st, c);
  const kt = retiro(st, c, true);
  const unico = !k.cubre;
  const viv = st.motivo === 'vivienda';
  const cb = viv ? null : combo(st, c);
  const out: TipoCaja[] = [];
  if (!unico) out.push('retiro');
  if (!viv) out.push('credito');
  if (unico || st.pref === 'total' || (st.monto || 0) >= 0.9 * (kt.R + kt.g)) out.push('total');
  if (cb) out.push('combo');
  const peso = (t: TipoCaja): number => (t === 'credito' ? -1 : 0);
  return { c, k, kt, cb, unico, viv, list: unico ? out.sort((a, b) => peso(a) - peso(b)) : out };
}

/** Caja de Opciones que lleva la pregunta de renta exenta. */
export const cajaRx = (st: St, list: readonly TipoCaja[]): TipoCaja | undefined =>
  prefEsRetiro(st) && st.pref ? (st.pref as TipoCaja) : list.find((x) => x !== 'credito');

/** Cajas que se pueden elegir (con algo que ofrecer). */
export function elegibles(st: St, v: Cajas, cr: Credito): TipoCaja[] {
  return v.list.filter((t) =>
    t === 'credito' ? cr.M > 0 : t === 'combo' ? !!v.cb : (t === 'retiro' ? v.k : v.kt).R > 0.5,
  );
}

/** Simulador del crédito del panel: parte del crédito de la caja hasta que el asesor lo ajusta. */
export function simCredito(st: St): SimCredito {
  if (st.cr && st.cr.para === st.monto) return st.cr;
  const base = cred(st);
  return {
    para: st.monto, monto: base.M, fecha: iso(base.pago), abono: false, fAbono: iso(HOY),
    vAbono: Math.round(base.M / 2 / 100000) * 100000,
  };
}

export function creditoPanel(s: SimCredito): CreditoPanel {
  const M = s.monto;
  const cap = Math.floor(M * 1.004);
  const dias = Math.max(1, Math.round((deIso(s.fecha).getTime() - HOY.getTime()) / 864e5));
  const resp = Math.floor(cap * 1.3);
  if (s.abono) {
    const da = Math.max(0, Math.round((deIso(s.fAbono).getTime() - HOY.getTime()) / 864e5));
    const intA = Math.round(cap * (Math.pow(1 + TASA_CREDITO, da / 365) - 1));
    const bajo = Math.max(0, Math.min(cap, s.vAbono - intA));
    const capF = cap - bajo;
    const int2 = Math.round(capF * (Math.pow(1 + TASA_CREDITO, (dias - da) / 365) - 1));
    return { M, cap, dias, int: int2, total: capF + int2, intA, bajo, resp };
  }
  const int = Math.round(cap * (Math.pow(1 + TASA_CREDITO, dias / 365) - 1));
  return { M, cap, dias, int, total: Math.floor(cap + int), intA: 0, bajo: 0, resp };
}

export const bloqueosCredito = bloqueos;
