import { computed, inject, Injectable, signal } from '@angular/core';
import { MisionesStore } from '@core/state/misiones.store';
import { PREF_A_DECISION } from '../constants/textos';
import { CLIENTE, CONVERSACION_ANTERIOR, HOY, nuevaConversacion } from '../data/conversaciones.mock';
import {
  Conversacion,
  Cuando,
  Decision,
  Etapa,
  EstadoConv,
  EstadoConversacion,
  MetodoImpuesto,
  OrigenConv,
  PeriodoRent,
  Preferencia,
  PreguntaEntender,
  ProximoPaso,
  RespuestaRx,
  SiNo,
  SimCredito,
  Tramite,
  VistaAportes,
  Motivo,
} from '../interfaces/conversacion';
import { validarCierre } from '../utils/acuerdo';
import { enAlcance, ordenFichas, simCredito } from '../utils/calculos';
import { iso, masDias } from '../utils/formato';
import { etapa1Completa, etapasCompletas } from '../utils/validaciones';

type St = EstadoConversacion;

/** Estado de la conversación en la ficha: abiertas, en seguimiento o completadas. */
export const estadoDe = (cv: Conversacion): EstadoConv =>
  cv.estado === 'finalizada' ? 'finalizada' : cv.st.cerrado ? 'cerrada-seguimiento' : 'en-curso';

const PESO_HISTORIAL: Readonly<Record<EstadoConv, number>> = { 'en-curso': 0, 'cerrada-seguimiento': 1, finalizada: 2 };

/**
 * Conversaciones «Acompañamiento al retirar» de la sesión (misión, catálogo e historial) y la que está abierta.
 * Vive en root para que la pestaña Planeación Pro conserve las conversaciones al cambiar de pestaña, como el prototipo.
 * Cero I/O: todo es estado-cliente; los cálculos están en `utils/`.
 */
@Injectable({ providedIn: 'root' })
export class ConversacionesStore {
  private readonly misiones = inject(MisionesStore);

  /** Conversaciones de la sesión (la más nueva primero) más la anterior del historial. */
  private readonly _convs = signal<readonly Conversacion[]>([CONVERSACION_ANTERIOR]);
  private readonly _activaId = signal<number | null>(null);
  private seq = 0;

  readonly activa = computed(() => this._convs().find((c) => c.id === this._activaId()) ?? null);
  /** Estado de la conversación abierta. */
  readonly st = computed<St>(() => this.activa()?.st ?? nuevaConversacion());

  readonly mision = computed(() => this._convs().find((c) => c.origen === 'mision') ?? null);
  /** La misión ya se gestionó (cierre registrado). */
  readonly gestionada = computed(() => !!this.mision()?.st.cerrado);
  readonly misionEnCurso = computed(() => !!this.mision() && !this.gestionada());
  readonly etapasMision = computed(() => {
    const m = this.mision();
    return m ? etapasCompletas(m.st) : 0;
  });
  /** Hay conversaciones nuevas en la sesión (la telemetría muestra «Última conversación» de hoy). */
  readonly hayNuevas = computed(() => this._convs().some((c) => c.origen !== 'historial'));
  /** Historial: abiertas primero, luego en seguimiento y al final las completadas. */
  readonly historial = computed(() =>
    this._convs()
      .map((cv, i) => ({ cv, i }))
      .sort((a, b) => PESO_HISTORIAL[estadoDe(a.cv)] - PESO_HISTORIAL[estadoDe(b.cv)] || a.i - b.i)
      .map((x) => x.cv),
  );

  // ---- Abrir y cerrar ----
  abrirMision(): void {
    this.abrir('mision', (c) => c.origen === 'mision');
  }

  abrirCatalogo(): void {
    this.abrir('catalogo', (c) => c.origen === 'catalogo' && !c.st.cerrado);
  }

  abrirConversacion(id: number): void {
    this._activaId.set(id);
    this.prepararApertura();
  }

  /** Cierra el journey sumando el tiempo que estuvo abierto. */
  cerrarJourney(segundos: number): void {
    if (segundos > 0) this.patch((s) => ({ segundos: s.segundos + segundos }));
    this.sincronizar();
  }

  private abrir(origen: OrigenConv, buscar: (c: Conversacion) => boolean): void {
    let cv = this._convs().find(buscar);
    if (!cv) {
      cv = { id: ++this.seq, origen, estado: 'en-curso', creada: HOY, st: nuevaConversacion() };
      this._convs.update((l) => [cv as Conversacion, ...l]);
    }
    this._activaId.set(cv.id);
    this.prepararApertura();
  }

  private prepararApertura(): void {
    this.patch(() => ({ eligeFecha: false }));
    this.irEtapa(this.st().etapa);
    this.sincronizar();
  }

  /** Progreso de la misión de Óscar para el dashboard («En curso · n de m»). */
  private sincronizar(): void {
    const m = this.mision();
    if (m) this.misiones.registrarProgreso(CLIENTE.id, etapasCompletas(m.st));
  }

  // ---- Navegación ----
  irEtapa(n: Etapa): void {
    this.patch((s) => {
      const cambios: Partial<St> = { etapa: n, visitadas: s.visitadas.includes(n) ? s.visitadas : [...s.visitadas, n] };
      // Al pintar Situación el contrato marcado queda fijo (el de menor descuento si no hay otro)
      if (n === 2 && !s.ctMarc && (etapa1Completa(s) || s.cerrado)) cambios.ctMarc = s.ctConf || ordenFichas(s)[0].c.id;
      // Al pintar Acuerdo la decisión parte de la preferencia
      if (n === 4 && !s.dec && s.pref && !s.cerrado) cambios.dec = PREF_A_DECISION[s.pref];
      return cambios;
    });
  }

  // ---- Entender ----
  definirMonto(v: number): void {
    this.patch((s) => (v > 0 && v !== s.monto ? { monto: v, cuando: s.cuando ?? 'este-mes' } : {}));
  }

  elegirMotivo(m: Motivo): void {
    this.patch((s) => ({ motivo: m, abierta: null, cuando: enAlcance(m) && !s.cuando ? 'este-mes' : s.cuando }));
  }

  anotarMotivoFuera(txt: string): void {
    this.patch(() => ({ otro: txt.slice(0, 300) }));
  }

  cerrarFueraDeAlcance(): void {
    this.patch(() => ({ dec: 'fuera' }));
    this.cerrarConversacion(true);
  }

  /** «Volver a editar»: reabre un acompañamiento finalizado como fuera de alcance para cambiar el motivo. */
  reabrirFueraDeAlcance(): void {
    if (!this.st().fuera) return;
    this.patch(() => ({ dec: null, cerrado: false, fuera: false, estado: 'en-curso', segHasta: '', msg: null }));
    this.sincronizar();
  }

  cambiar(q: PreguntaEntender): void {
    this.patch(() => ({ abierta: q, eligeFecha: false }));
  }

  elegirCuando(v: Cuando): void {
    const fecha =
      v === 'esta-semana'
        ? iso(masDias(7))
        : v === 'en-meses'
          ? iso(new Date(HOY.getFullYear(), HOY.getMonth() + 3, HOY.getDate()))
          : iso(new Date(HOY.getFullYear(), HOY.getMonth() + 1, 0));
    this.patch(() => ({ eligeFecha: false, cuando: v, fecha, fechaTipo: v === 'en-meses' ? 'meses' : null, abierta: null }));
  }

  abrirFecha(): void {
    this.patch(() => ({ eligeFecha: true }));
  }

  confirmarFecha(fecha: string): void {
    this.patch(() => ({ cuando: 'en-meses', fecha, fechaTipo: 'fecha', eligeFecha: false, abierta: null }));
  }

  // ---- Situación ----
  elegirPension(v: SiNo): void {
    this.patchEditable(() => ({ pen: v }));
  }

  marcarContrato(id: string): void {
    this.patchEditable(() => ({ ctMarc: id }));
  }

  confirmarContrato(): void {
    this.patch((s) => ({ ctConf: s.ctMarc || ordenFichas(s)[0].c.id }));
    this.irEtapa(3);
  }

  // ---- Opciones ----
  /** Monto del crédito en «Retiro + Crédito Impulso»: al subirlo, el retiro baja en la misma medida. */
  fijarCreditoCombo(m: number): void {
    this.patchEditable(() => ({ creditoCombo: m }));
  }

  elegirPlazo(m: number): void {
    this.patchEditable(() => ({ plazo: m, cr: null }));
  }

  alternarNoRepone(): void {
    this.patchEditable((s) =>
      s.noRepone ? { noRepone: false } : { noRepone: true, plazo: null, pref: s.pref === 'credito' ? null : s.pref },
    );
  }

  responderRentaExenta(v: RespuestaRx): void {
    this.patchEditable(() => ({ rx: v }));
  }

  alternarInfoRentaExenta(): void {
    this.patch((s) => ({ rxInfo: !s.rxInfo }));
  }

  leerMas(): void {
    this.patch(() => ({ lm: true }));
  }

  elegirPreferencia(p: Preferencia): void {
    this.patchEditable(() => ({ pref: p, dec: PREF_A_DECISION[p], tram: null, msg: null }));
  }

  // ---- Acuerdo ----
  elegirDecision(d: Decision): void {
    this.patchEditable((s) => (s.dec !== d ? { dec: d, tram: null, msg: null } : { msg: null }));
  }

  elegirTramite(t: Tramite): void {
    this.patchEditable(() => ({ tram: t, msg: null }));
  }

  marcarProximoPaso(k: ProximoPaso, on: boolean): void {
    this.patch((s) => ({ np: { ...s.np, [k]: on } }));
  }

  definirSeguimiento(fecha: string): void {
    this.patch(() => ({ fseg: fecha }));
  }

  anotarNotas(txt: string): void {
    this.patch(() => ({ notas: txt.slice(0, 500) }));
  }

  marcarValidacion(on: boolean): void {
    this.patch(() => ({ validar: on }));
  }

  /** Registra el cierre; `false` si falta elegir el trámite (queda el mensaje). */
  registrarCierre(): boolean {
    const s = this.st();
    if (!s.dec || s.cerrado) return false;
    const r = validarCierre(s);
    if ('error' in r) {
      this.patch(() => ({ msg: { t: r.error } }));
      return false;
    }
    this.patch(() => ({ msg: { ok: true, t: r.ok } }));
    this.cerrarConversacion(false);
    return true;
  }

  /** Marca el resumen como enviado; `false` si aún no hay cierre. */
  enviarResumen(): boolean {
    if (!this.st().cerrado) return false;
    this.patch(() => ({ enviado: true }));
    return true;
  }

  private cerrarConversacion(fuera: boolean): void {
    this.patch((s) => ({
      cerrado: true, fuera, estado: 'cerrada-seguimiento', segHasta: s.fseg || iso(masDias(30)), abierta: null,
    }));
    this.sincronizar();
  }

  // ---- Panel de detalle ----
  alternarDesglose(): void {
    this.patch((s) => ({ verCalc: !s.verCalc }));
  }

  elegirPeriodo(p: PeriodoRent): void {
    this.patch(() => ({ rentPer: p }));
  }

  elegirVistaAportes(v: VistaAportes): void {
    this.patch(() => ({ apVista: v }));
  }

  elegirMetodoImpuesto(m: MetodoImpuesto): void {
    this.patchImp(() => ({ metodo: m }));
  }

  cambiarPreguntaImpuesto(n: number): void {
    this.patchImp(() => ({ paso: n }));
  }

  escribirIngreso(v: number): void {
    this.patchImp(() => ({ ingreso: v }));
  }

  escribirOtrosIngresos(v: number): void {
    this.patchImp(() => ({ otrosTmp: v }));
  }

  /** «Continuar» en las preguntas 1 y 3. */
  siguientePreguntaImpuesto(n: 1 | 3): void {
    this.patchImp((i) => (n === 3 ? { otros: i.otrosTmp, paso: 4 } : { paso: 2 }));
  }

  sinOtrosIngresos(): void {
    this.patchImp(() => ({ otros: null, otrosTmp: 0, paso: 4 }));
  }

  elegirBeneficios(v: RespuestaRx): void {
    this.patchImp(() => ({ benef: v, paso: 3 }));
  }

  elegirDependientes(v: SiNo): void {
    this.patchImp(() => ({ dep: v, paso: 5 }));
  }

  escribirTarifa(txt: string): void {
    this.patchImp(() => ({ tarifa: txt.replace(/[^\d.,]/g, '') }));
  }

  ajustarCredito(cambios: Partial<SimCredito>): void {
    this.patchEditable((s) => ({ cr: { ...simCredito(s), ...cambios } }));
  }

  // ---- Interno ----
  private patch(fn: (s: St) => Partial<St>): void {
    const id = this._activaId();
    if (id === null) return;
    this._convs.update((l) => l.map((c) => (c.id === id ? { ...c, st: { ...c.st, ...fn(c.st) } } : c)));
  }

  /** Cambios que la solo lectura no permite. */
  private patchEditable(fn: (s: St) => Partial<St>): void {
    if (!this.st().cerrado) this.patch(fn);
  }

  private patchImp(fn: (i: St['imp']) => Partial<St['imp']>): void {
    this.patchEditable((s) => ({ imp: { ...s.imp, ...fn(s.imp) } }));
  }
}
