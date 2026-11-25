import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Icono } from '../../components/icono/icono';
import { AGENDA_NOM, DEC_CAT, MOTIVO, NOM_CAJA, PARTES, TEXTOS } from '../../constants/textos';
import { nombreContrato } from '../../data/contratos.mock';
import { Etapa, EstadoConversacion } from '../../interfaces/conversacion';
import { ConversacionesStore } from '../../state/conversaciones.store';
import { agendada, cuandoAgenda } from '../../utils/agenda';
import { combo, cred, ctSel, enAlcance, ordenFichas, retiro } from '../../utils/calculos';
import { deIso, fLarga, pesos } from '../../utils/formato';
import { completa, ETAPAS, habilitada, soloLectura } from '../../utils/validaciones';

const mayuscula = (t: string): string => t.charAt(0).toUpperCase() + t.slice(1);

/** Tag de una fila del resumen (mismo estilo que en las fichas de Situación). */
interface TagFila {
  txt: string;
  tipo: 'ok' | 'no' | 'menor';
}

/** Fila del resumen: etiqueta, valor (null = «Por definir»), si va en verde y tags opcionales. */
type Fila = readonly [string, string | null, boolean?, (readonly TagFila[])?];

/** Tags del contrato elegido: Cubre / No alcanza y Menor descuento (mismo criterio que la ficha de Situación). */
function tagsContrato(st: EstadoConversacion): TagFila[] {
  const orden = ordenFichas(st);
  const f = orden.find((x) => x.c.id === ctSel(st).id);
  if (!f) return [];
  const tags: TagFila[] = [f.k.cubre ? { txt: 'Cubre', tipo: 'ok' } : { txt: 'No alcanza', tipo: 'no' }];
  if (orden.length > 1 && orden[0].c.id === f.c.id && f.k.cubre) tags.push({ txt: 'Menor descuento', tipo: 'menor' });
  return tags;
}

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
    ['Contrato', st.ctConf ? nombreContrato(c) : null, false, st.ctConf ? tagsContrato(st) : []],
    ['Recibe', k ? pesos(k.R) : null, true],
    ['Valor total del retiro', k ? pesos(k.D) : null],
  ];
  if (st.pen) f.push(['Requisitos de pensión', st.pen === 'si' ? 'Sí' : 'No']);
  return f;
}

function filasOpciones(st: EstadoConversacion): Fila[] {
  const c = ctSel(st);
  const pref = st.pref;
  if (pref === 'noretira') return [['Prefiere', 'No retirar'], ['Sigue invertido', pesos(retiro(st, c).D), true]];
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
  // La reunión agendada se registra aunque aún no se haya cerrado el acompañamiento
  const a = st.agenda;
  if (a && a.estado !== 'no') {
    f.push(['Reunión de seguimiento', agendada(a) ? cuandoAgenda(a) + ' · ' + mayuscula(AGENDA_NOM[a.via]) : 'Por confirmar fecha y hora']);
  }
  if (reg) f.push(['En seguimiento hasta', fLarga(deIso(st.segHasta))]);
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
        filas: on || ok || (n === 4 && !!st.agenda && st.agenda.estado !== 'no') ? FILAS[n](st) : [],
      };
    });
  });

  protected ir(n: Etapa): void {
    if (habilitada(this.store.st(), n)) this.store.irEtapa(n);
  }
}
