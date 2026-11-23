import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Icono } from '../../components/icono/icono';
import { DEC_CAT, MOTIVO, NOM_CAJA, PARTES, TEXTOS } from '../../constants/textos';
import { nombreContrato } from '../../data/contratos.mock';
import { Etapa, EstadoConversacion } from '../../interfaces/conversacion';
import { ConversacionesStore } from '../../state/conversaciones.store';
import { combo, cred, ctSel, enAlcance, retiro } from '../../utils/calculos';
import { deIso, fLarga, pesos } from '../../utils/formato';
import { completa, ETAPAS, habilitada, soloLectura } from '../../utils/validaciones';

/** Fila del resumen: etiqueta, valor (null = «Por definir») y si va en verde. */
type Fila = readonly [string, string | null, boolean?];

function filasEntender(st: EstadoConversacion): Fila[] {
  if (st.motivo && !enAlcance(st.motivo)) return [['Motivo', TEXTOS.fueraDeAlcance(MOTIVO[st.motivo])]];
  const f: Fila[] = [
    ['Desea retirar', st.monto > 0 ? pesos(st.monto) : null, true],
    ['Motivo', st.motivo ? MOTIVO[st.motivo] : null],
  ];
  return f;
}

function filasSituacion(st: EstadoConversacion): Fila[] {
  const c = ctSel(st);
  const k = st.ctConf ? retiro(st, c) : null;
  const f: Fila[] = [
    ['Contrato', st.ctConf ? nombreContrato(c) : null],
    ['Recibe', k ? pesos(k.R) : null, true],
    ['Se descuenta del contrato', k ? pesos(k.D) : null],
  ];
  if (st.pen) f.push(['Requisitos de pensión', st.pen === 'si' ? 'Sí' : 'No']);
  return f;
}

function filasOpciones(st: EstadoConversacion): Fila[] {
  const c = ctSel(st);
  const pref = st.pref;
  const prefTxt = pref === 'retiro' ? 'Retiro por ' + pesos(st.monto) : pref ? NOM_CAJA[pref] : null;
  if (pref === 'credito') return [['Prefiere', prefTxt], ['Total a pagar', pesos(cred(st).total)]];
  let recibe: string | null = null;
  if (pref === 'combo') {
    const cb = combo(st, c);
    recibe = cb ? pesos(cb.recibe) : null;
  } else if (pref) recibe = pesos((pref === 'retiro' ? retiro(st, c) : retiro(st, c, true)).R);
  return [['Prefiere', prefTxt], ['Recibe', recibe, true]];
}

function filasAcuerdo(st: EstadoConversacion): Fila[] {
  const reg = st.cerrado && !st.fuera;
  const f: Fila[] = [['Decisión', reg && st.dec ? DEC_CAT[st.dec] : null]];
  if (reg) f.push(['Seguimiento', fLarga(deIso(st.segHasta))]);
  return f;
}

const FILAS: Readonly<Record<Etapa, (st: EstadoConversacion) => Fila[]>> = {
  1: filasEntender,
  2: filasSituacion,
  3: filasOpciones,
  4: filasAcuerdo,
};

/** Resumen de la conversación (columna izquierda): se arma con cada etapa. */
@Component({
  selector: 'nc-jw-resumen',
  imports: [Icono],
  templateUrl: './resumen.html',
  styleUrl: './resumen.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Resumen {
  private readonly store = inject(ConversacionesStore);

  protected readonly porDefinir = TEXTOS.porDefinir;
  protected readonly secciones = computed(() => {
    const st = this.store.st();
    const ro = soloLectura(st);
    return ETAPAS.map((n) => {
      const ok = completa(st, n);
      const on = st.etapa === n;
      const nombre = PARTES[n - 1];
      return {
        n, nombre, ok, on,
        est: on ? 'on' : ok ? 'ok' : 'pend',
        hab: habilitada(st, n),
        editar: (ro ? 'Ver ' : 'Editar ') + nombre,
        filas: on || ok ? FILAS[n](st) : [],
      };
    });
  });

  protected ir(n: Etapa): void {
    if (habilitada(this.store.st(), n)) this.store.irEtapa(n);
  }
}
