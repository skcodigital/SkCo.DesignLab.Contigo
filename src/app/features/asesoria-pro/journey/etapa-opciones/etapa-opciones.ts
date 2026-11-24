import {
  afterNextRender,
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { Icono } from '@features/asesoria-pro/components/icono/icono';
import { TEXTOS } from '../../constants/textos';
import { ConversacionesStore } from '../../state/conversaciones.store';
import {
  cajas,
  cred,
  prefEsRetiro,
  retiroPref,
  tocaNoExento,
} from '../../utils/calculos';
import { mesAnio, millones, pesos } from '../../utils/formato';
import { etapa3Completa, habilitada, soloLectura } from '../../utils/validaciones';
import { OpcionCombo } from './opcion-combo/opcion-combo';
import { OpcionCredito } from './opcion-credito/opcion-credito';
import { OpcionNoRetira } from './opcion-no-retira/opcion-no-retira';
import { OpcionRetiro } from './opcion-retiro/opcion-retiro';
import { RentaExenta } from './renta-exenta/renta-exenta';
import { JourneyUiStore } from '../journey-ui.store';

/**
 * Etapa 3 · Opciones (v5 del journey): cajas de retiro, Crédito Impulso, retiro total, combinación y «Si no retira»;
 * la pregunta de renta exenta va en la caja del retiro. La preferencia del cliente se marca con el radio de cada caja.
 */
@Component({
  selector: 'nc-etapa-opciones',
  imports: [Icono, OpcionRetiro, OpcionCredito, OpcionCombo, OpcionNoRetira, RentaExenta],
  templateUrl: './etapa-opciones.html',
  styleUrl: './etapa-opciones.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EtapaOpciones {
  private readonly store = inject(ConversacionesStore);

  protected readonly st = this.store.st;
  protected readonly ro = computed(() => soloLectura(this.st()));
  /** Sin monto no hay opciones: se pide en «Entender». */
  protected readonly falta = computed(() => !(this.st().monto > 0));
  protected readonly v = computed(() => cajas(this.st()));

  // ---- Carrusel (desde 4 cajas) ----
  private readonly destroyRef = inject(DestroyRef);
  private readonly ui = inject(JourneyUiStore);
  private readonly pista = viewChild<ElementRef<HTMLElement>>('pista');
  /** Cajas en pantalla: las de la lista más «Si no retira» (que no va con vivienda). */
  protected readonly nCajas = computed(() => this.v().list.length + (this.v().viv ? 0 : 1));
  /** Desde 4 cajas ya no caben en una fila: pasan a carrusel. */
  protected readonly carrusel = computed(() => this.nCajas() >= 4);
  protected readonly puedeIzq = signal(false);
  protected readonly puedeDer = signal(false);
  private readonly rango = signal<[number, number]>([1, 1]);
  protected readonly hayMas = computed(() => this.puedeIzq() || this.puedeDer());
  protected readonly posicion = computed(() => {
    const [a, b] = this.rango();
    return (a === b ? `${a}` : `${a}–${b}`) + ` de ${this.nCajas()} opciones`;
  });

  constructor() {
    afterRenderEffect(() => {
      const pedido = this.ui.pedirRx();
      if (pedido === this.atendido) return;
      this.atendido = pedido;
      this.pedidaEn.set(pedido);
      const caja = this.rxCaja()?.nativeElement;
      if (!caja) return;
      caja.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' });
      caja.querySelector<HTMLButtonElement>('.jw-chips button:not(:disabled)')?.focus({ preventScroll: true });
    });
    afterRenderEffect(() => {
      this.v();
      this.carrusel();
      this.medir();
    });
    afterNextRender(() => {
      const el = this.pista()?.nativeElement;
      if (!el || typeof ResizeObserver === 'undefined') return;
      const ro = new ResizeObserver(() => this.medir());
      ro.observe(el);
      this.destroyRef.onDestroy(() => ro.disconnect());
    });
  }

  /** Las cajas son hijas de componentes con display:contents: se miden los .jw-o3 reales. */
  private cajasEn(el: HTMLElement): HTMLElement[] {
    return Array.from(el.querySelectorAll<HTMLElement>('.jw-o3'));
  }

  private paso(el: HTMLElement): number {
    const f = this.cajasEn(el)[0];
    return f ? f.offsetWidth + parseFloat(getComputedStyle(el).columnGap || '12') : el.clientWidth;
  }

  protected medir(): void {
    const el = this.pista()?.nativeElement;
    if (!el) return;
    if (!this.carrusel()) {
      this.puedeIzq.set(false);
      this.puedeDer.set(false);
      return;
    }
    this.puedeIzq.set(el.scrollLeft > 2);
    this.puedeDer.set(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
    const p = this.paso(el);
    const n = this.cajasEn(el).length;
    const primera = Math.min(n, Math.round(el.scrollLeft / p) + 1);
    const visibles = Math.max(1, Math.floor((el.clientWidth + 2) / p));
    this.rango.set([primera, Math.min(n, primera + visibles - 1)]);
  }

  protected mover(dir: 1 | -1): void {
    const el = this.pista()?.nativeElement;
    if (!el) return;
    const suave = !matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollBy({ left: dir * this.paso(el), behavior: suave ? 'smooth' : 'auto' });
  }
  protected readonly cr = computed(() => cred(this.st()));
  /** Retiro sobre el que se pregunta la renta exenta (el elegido o, si no hay, el del monto). */
  protected readonly kRx = computed(() => (prefEsRetiro(this.st()) ? retiroPref(this.st()) : this.v().k));
  /** La pregunta de renta exenta se muestra si el retiro toca aportes no exentos. */
  // ---- Pedido de responder la renta exenta (desde «Ajustar» del IBC) ----
  private readonly rxCaja = viewChild<ElementRef<HTMLElement>>('rxCaja');
  private readonly pedidaEn = signal(0);
  /** La pregunta queda resaltada desde que se pide hasta que se responde. */
  protected readonly rxPedida = computed(() => this.pedidaEn() > 0 && !this.st().rx);
  /** Eligió una opción con retiro y aún no responde la renta exenta (se marca en verde). */
  protected readonly rxFalta = computed(() => prefEsRetiro(this.st()) && !this.st().rx && !this.ro());
  private atendido = this.ui.pedirRx();

  protected readonly conRx = computed(() => {
    const st = this.st();
    return tocaNoExento(st, prefEsRetiro(st) ? retiroPref(st) : this.v().k);
  });
  protected readonly pie = computed(() => etapa3Completa(this.st()) || this.ro());
  /** Nombre personalizado del contrato o, si no tiene, su número (va en negrita en el título). */
  protected readonly contratoTit = computed(() => this.v().c.nom || this.v().c.num);

  /** Rendimientos generados desde la apertura por el contrato elegido (como la alerta de Situación). */
  protected readonly generado = computed(() => {
    const c = this.v().c;
    return { contrato: c.nom || c.num, monto: millones(c.gan), exacto: pesos(c.gan), desde: mesAnio(c.desde) };
  });

  protected atras(): void {
    this.store.irEtapa(2);
  }

  protected continuar(): void {
    if (habilitada(this.st(), 4)) this.store.irEtapa(4);
  }
}
