import { CLIENTE, HOY } from '../data/conversaciones.mock';
import { ADV_USTED, DEC_CAT, ETAPAS_BD, MOTIVO, PROXIMOS_PASOS, RX_TXT, TIPO_CREDITO } from '../constants/textos';
import { Cajas, Credito, Retiro } from '../interfaces/calculo';
import { EstadoConversacion } from '../interfaces/conversacion';
import { saleDe } from './acuerdo';
import {
  aniosDe,
  cajas,
  cred,
  ctSel,
  enAlcance,
  esp,
  impuesto,
  preguntasOk,
  prefEsRetiro,
  retiro,
  retiroPref,
  tarifaOk,
  tarifaTxt,
} from './calculos';
import { deIso, fLarga, iso, pesos } from './formato';

type St = EstadoConversacion;

/** «Para cuándo» en la tarjeta de Entender. */
export function etiquetaCuando(st: St): string {
  if (st.cuando === 'esta-semana') return 'Esta semana';
  if (st.cuando === 'este-mes') return 'Este mes';
  return st.fechaTipo === 'fecha' ? 'Para el ' + fLarga(deIso(st.fecha)) : 'En unos meses (' + fLarga(deIso(st.fecha)) + ')';
}

/** «Para cuándo» en minúscula (resumen y texto para el cliente). */
export function cuandoTxt(st: St): string {
  if (st.cuando === 'esta-semana') return 'esta semana';
  if (st.cuando === 'este-mes') return 'este mes';
  return 'para el ' + fLarga(deIso(st.fecha));
}

/** «Lectura de las cifras»: solo va en el resumen para el cliente. */
export function regla(st: St, v: Cajas, cr: Credito): string | null {
  if (!cr.conPlazo || !(cr.M > 0) || esp(st)) return null;
  const im = impuesto(st, v.k);
  const base = v.k.perm + v.k.g;
  const min = base + Math.min(im.no, im.si);
  const max = base + Math.max(im.no, im.si, im.tope || 0);
  if (cr.costo < min) return 'Con estas cifras, el crédito suma menos que el posible impuesto y los cargos del retiro.';
  if (cr.costo > max) return 'Con estas cifras, el posible impuesto y los cargos del retiro suman menos que el crédito.';
  return 'Si usaron estos aportes como renta exenta, el crédito suma menos. Valídelo antes de decidir.';
}

/** Resumen de la conversación para el cliente (texto plano, una línea por dato). */
export function textoCliente(st: St): string {
  const L = ['Acompañamiento en el retiro · ' + CLIENTE.nombre];
  const add = (l: string, x: string): void => {
    L.push(l + ': ' + x);
  };
  const c = ctSel(st);
  const v = cajas(st);
  const cr = cred(st);
  if (st.motivo && !enAlcance(st.motivo)) {
    add('Motivo', st.otro.trim() ? MOTIVO[st.motivo] + ': ' + st.otro.trim() : MOTIVO[st.motivo] + ' (fuera de alcance)');
  } else if (st.motivo) {
    add('Motivo', MOTIVO[st.motivo]);
    add('Necesidad', st.monto > 0 ? 'Recibir ' + pesos(st.monto) + (st.cuando ? ' ' + cuandoTxt(st) : '') : 'Liquidez (sin monto)');
    const cond: string[] = [];
    if (st.pen === 'si') cond.push('Cumple requisitos de pensión');
    if (st.motivo === 'vivienda') cond.push('Retiro para compra de vivienda');
    if (cond.length) add('Condición especial', cond.join(', '));
  }
  if (st.ctConf) add('Contrato elegido', c.nom + ' · ' + c.num + ' (' + pesos(c.saldo) + ')');
  if (st.visitadas.includes(3) && st.monto > 0) {
    const rg = regla(st, v, cr);
    if (rg) add('Lectura de las cifras', rg);
    if (st.pref) {
      const sigue = (x: number): string => pesos(c.saldo - x);
      const desc = (k: Retiro): string =>
        ': se descuentan ' + pesos(k.D) + ' del contrato y recibe ' + pesos(k.R) + '; se retiene hoy ' + pesos(k.rcA + k.rrA) +
        ' (retención contingente ' + pesos(k.rcA) + ' y retención sobre rendimientos ' + pesos(k.rrA) + ')' +
        (k.g > 0.5 ? '; 4×1000 ' + pesos(k.g) : '') + '; sigue invertido ' + sigue(k.D);
      let txt: string;
      if (st.pref === 'retiro') txt = 'Retiro por ' + pesos(st.monto) + desc(v.k);
      else if (st.pref === 'total') txt = 'Retiro total' + desc(v.kt);
      else if (st.pref === 'credito')
        txt = 'Crédito puente: recibe ' + pesos(cr.M) + ', costo estimado ' + pesos(cr.costo) + ' (intereses ' + pesos(cr.int) +
          ' y 4×1000 ' + pesos(cr.gmf) + '), sigue invertido ' + pesos(c.saldo);
      else if (v.cb)
        txt = 'Retiro + crédito puente: retira ' + pesos(v.cb.kt.D) + ' del contrato y recibe ' + pesos(v.cb.kt.R) +
          '; crédito puente por ' + pesos(v.cb.M) + ', costo estimado ' + pesos(v.cb.cr.costo) + ' (intereses ' + pesos(v.cb.cr.int) +
          ' y 4×1000 ' + pesos(v.cb.cr.gmf) + '); recibe en total ' + pesos(v.cb.recibe) + '; sigue invertido ' + sigue(v.cb.kt.D);
      else txt = 'Retiro + crédito puente';
      add('Opción que prefiere', txt);
    }
    if (st.pref === 'credito' || st.pref === 'combo') add('Tipo de crédito', TIPO_CREDITO);
    if (st.plazo || st.noRepone)
      add('En cuánto tiempo podría reponerlo', st.noRepone ? 'No va a reponer el dinero' : 'Podría reponerlo en ' + (st.plazo === 1 ? '1 mes' : st.plazo + ' meses'));
    add('Lo que se retiene al retirar', 'Es un anticipo: se descuenta del impuesto en la declaración de renta. ' + ADV_USTED);
    if (st.rx) add('¿Alguno de los aportes del retiro se usó como renta exenta?', RX_TXT[st.rx]);
    const conTarifa = st.imp.metodo === 'tarifa' && tarifaOk(st);
    if (!esp(st) && (preguntasOk(st) || conTarifa)) {
      const im = impuesto(st, prefEsRetiro(st) ? retiroPref(st) : v.k);
      add(
        'Posible impuesto en la declaración (estimación orientativa)',
        conTarifa
          ? im.txt + '. Estimado con la tarifa de ' + tarifaTxt(st) + '% ingresada por el asesor. Lo que se retiene hoy se descuenta de ese impuesto. No reemplaza la revisión que hagan usted o su contador.'
          : 'Si usted o su contador no usaron los aportes como renta exenta: ' + pesos(im.no) + '. Si usted o su contador sí usaron los aportes como renta exenta: ' + pesos(im.si) + '. Año gravable 2026. Lo que se retiene hoy se descuenta de ese impuesto. No reemplaza la revisión que hagan usted o su contador.',
      );
    }
  }
  if (st.dec && st.dec !== 'fuera') {
    if ((st.dec === 'credito' || st.dec === 'combo') && !(st.pref === 'credito' || st.pref === 'combo')) add('Tipo de crédito', TIPO_CREDITO);
    const s = saleDe(st.dec, v);
    if (s != null) add('Sigue invertido', pesos(c.saldo - s));
  }
  if (st.validar) add('Validación tributaria', 'Se le recomendó validarlo antes de retirar, usted o con su contador. ' + ADV_USTED);
  add('Etapas conversadas', st.visitadas.map((n) => ETAPAS_BD[n - 1]).join(' → '));
  if (st.dec) add('Decisión del cliente', DEC_CAT[st.dec]);
  const np: string[] = [];
  if (st.np.resumen) np.push(PROXIMOS_PASOS.resumen);
  if (st.np.seguimiento) np.push(PROXIMOS_PASOS.seguimiento);
  if (np.length) add('Próximos pasos', np.join('; '));
  if (st.fseg) add('Seguimiento', fLarga(deIso(st.fseg)));
  if (st.notas.trim()) add('Notas', st.notas.trim());
  return L.join('\n');
}

/** Detalle de aportes para el contador (en Angular es un Excel; aquí un CSV que abre en Excel). */
export function csvContador(st: St): { nombre: string; contenido: string } {
  const c = ctSel(st);
  const k = st.dec === 'retiro' ? retiro(st, c) : retiro(st, c, true);
  const filas: (string | number)[][] = [
    ['Detalle de aportes para usted o su contador'],
    ['Generado el ' + fLarga(HOY) + ' · Contratos: ' + c.num],
    [],
    ['Contrato', 'Año del aporte', 'Valor que sale', 'Estado'],
    ...aniosDe(c, k).map((a) => [c.num, a[0], a[1], a[0] <= 2016 ? 'Exento' : c.cc > 0 ? 'Con retención contingente' : 'Sin retención al retirar']),
    [],
    ['Cifras de Contigo a la fecha de generación. Es información de apoyo: no reemplaza la asesoría tributaria.'],
  ];
  const contenido = '﻿' + filas.map((f) => f.map((x) => '"' + String(x).replace(/"/g, '""') + '"').join(';')).join('\r\n');
  return { nombre: 'detalle-de-aportes-' + iso(HOY) + '.csv', contenido };
}
