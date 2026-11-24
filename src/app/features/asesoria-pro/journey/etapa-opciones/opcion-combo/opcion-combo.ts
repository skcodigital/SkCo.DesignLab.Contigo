import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { TASA_TXT, TEXTOS, TEXTOS_OPCIONES_ACUERDO as T } from '../../../constants/textos';
import { Combo } from '../../../interfaces/calculo';
import { ConversacionesStore } from '../../../state/conversaciones.store';
import { ctId, esp, impuesto, tocaNoExento } from '../../../utils/calculos';
import { pesos } from '../../../utils/formato';
import { soloLectura } from '../../../utils/validaciones';
import { JourneyUiStore } from '../../journey-ui.store';
import { Icono } from '@features/asesoria-pro/components/icono/icono';
import { PlazoCredito } from '../plazo-credito/plazo-credito';

/** Caja «Retiro + Crédito Impulso» de Opciones (cajaCombo del prototipo). */
@Component({
  selector: 'nc-opcion-combo',
  imports: [Icono, PlazoCredito],
  templateUrl: './opcion-combo.html',
  styleUrl: './opcion-combo.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OpcionCombo {
  private readonly store = inject(ConversacionesStore);
  private readonly ui = inject(JourneyUiStore);

  readonly cb = input.required<Combo>();

  protected readonly st = this.store.st;
  protected readonly ro = computed(() => soloLectura(this.st()));

  /** Desglose de «Descuentos de hoy», plegado por defecto. */
  protected readonly verDesc = signal(false);

  protected alternarDesc(e: Event): void {
    e.preventDefault(); // está dentro del <label> de la caja: no debe elegir la opción
    this.verDesc.update((v) => !v);
  }

  protected elegir(): void {
    this.store.elegirPreferencia('combo');
  }
  protected readonly imp = computed(() => impuesto(this.st(), this.cb().kt));
  /** Costo de la combinación: intereses más posible impuesto. */
  protected readonly costo = computed(() => {
    const st = this.st();
    const im = this.imp();
    const c = this.cb().cr.costo;
    if (esp(st)) return pesos(c);
    if (!st.rx) return T.hasta(pesos(c + im.max));
    return im.min === im.max ? pesos(c + im.max) : T.rango(pesos(c + im.min), pesos(c + im.max));
  });
  protected readonly tasa = TASA_TXT;
  protected readonly pesos = pesos;

  /**
   * «Ajustar» el IBC: si el retiro toca aportes no exentos y aún no se respondió la renta exenta, avisa y lleva
   * a la pregunta (sobre las cajas, resaltada) en lugar de abrir el panel de Impuestos.
   */
  protected ajustar(): void {
    const st = this.st();
    if (tocaNoExento(st, this.cb().kt) && !st.rx) {
      this.ui.pedirRentaExenta();
      return;
    }
    this.ui.abrirDetalle(ctId(st), 'impuestos');
  }
}
