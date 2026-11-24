import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  Injector,
  signal,
  viewChild,
  viewChildren,
} from '@angular/core';
import { Icono } from '@features/asesoria-pro/components/icono/icono';
import { DEC_CAT, DEC_NOM, PREF_A_DECISION, TEXTOS } from '../../constants/textos';
import { Decision } from '../../interfaces/conversacion';
import { ConversacionesStore } from '../../state/conversaciones.store';
import { detalleDecision, listaDecisiones, saleDe } from '../../utils/acuerdo';
import { cajas, cred } from '../../utils/calculos';
import { pct, pesos } from '../../utils/formato';
import { soloLectura } from '../../utils/validaciones';
import { AcuerdoProximos } from './acuerdo-proximos/acuerdo-proximos';
import { CierreExitosoModal } from './cierre-exitoso-modal/cierre-exitoso-modal';
import { AcuerdoTramite } from './acuerdo-tramite/acuerdo-tramite';

interface OpcionDecision {
  d: Decision;
  nombre: string;
  detalle: string;
  preferida: boolean;
  deshabilitada: boolean;
}

/**
 * Etapa 4 · Acuerdo (v5 del journey): decisión del cliente, cómo se tramita, próximos pasos, lo que está en juego,
 * resumen para el cliente y registro del cierre. El detalle para el contador va al final, debajo del trámite.
 */
@Component({
  selector: 'nc-etapa-acuerdo',
  imports: [Icono, AcuerdoTramite, AcuerdoProximos, CierreExitosoModal],
  templateUrl: './etapa-acuerdo.html',
  styleUrl: './etapa-acuerdo.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EtapaAcuerdo {
  private readonly store = inject(ConversacionesStore);
  private readonly injector = inject(Injector);

  private readonly titulo = viewChild.required<ElementRef<HTMLElement>>('titulo');
  private readonly botonesDec = viewChildren<ElementRef<HTMLButtonElement>>('decBtn');
  private readonly cierre = viewChild<ElementRef<HTMLButtonElement>>('cierre');
  private readonly tramite = viewChild(AcuerdoTramite);

  protected readonly st = this.store.st;
  protected readonly ro = computed(() => soloLectura(this.st()));
  private readonly v = computed(() => cajas(this.st()));
  private readonly cr = computed(() => cred(this.st()));

  protected readonly decisiones = computed<OpcionDecision[]>(() => {
    const st = this.st();
    const v = this.v();
    const cr = this.cr();
    const ro = this.ro();
    return listaDecisiones(st, v, cr).map((d) => ({
      d,
      nombre: DEC_NOM[d],
      detalle: detalleDecision(d, st, v, cr),
      preferida: !!st.pref && PREF_A_DECISION[st.pref] === d,
      deshabilitada: (d === 'credito' && st.noRepone && st.dec !== 'credito') || ro,
    }));
  });

  /** «Sigue invertido» destacado con la decisión (no aplica a «Lo va a pensar» ni a fuera de alcance). */
  protected readonly destacada = computed(() => {
    const st = this.st();
    const dec = st.dec;
    if (!dec || dec === 'pensara' || dec === 'fuera') return null;
    const sale = saleDe(dec, this.v());
    if (sale == null) return null;
    const cerr = st.cerrado && !st.fuera;
    const sigue = this.v().c.saldo - sale;
    // Rendimientos estimados en 12 meses sobre lo que sigue invertido, con la rentabilidad de los últimos 12 meses
    const tasa = this.v().k.tasa;
    return {
      valor: pesos(sigue),
      texto: (cerr ? TEXTOS.sigueInvertidoCerrado : TEXTOS.sigueInvertidoSi) + DEC_CAT[dec].toLowerCase(),
      rend: pesos(sigue * tasa),
      tasa: pct(tasa * 100, 2) + ' E.A.',
    };
  });

  protected readonly conDecision = computed(() => !!this.st().dec && this.st().dec !== 'fuera');
  protected readonly textoCierre = computed(() => (this.ro() ? TEXTOS.cierreHecho : TEXTOS.registrarCierre));

  protected elegir(d: Decision): void {
    this.store.elegirDecision(d);
  }

  protected atras(): void {
    this.store.irEtapa(3);
  }

  /** Modal de éxito tras registrar el cierre. */
  protected readonly exito = signal(false);

  protected registrarCierre(): void {
    const st = this.st();
    if (!st.dec || st.cerrado) return;
    if (this.store.registrarCierre()) {
      this.exito.set(true); // modal «Tu acompañamiento fue exitoso»; al cerrarla el foco vuelve al botón del cierre
    } else if (this.store.st().msg) {
      afterNextRender(() => this.tramite()?.enfocar(), { injector: this.injector });
    }
  }
}
