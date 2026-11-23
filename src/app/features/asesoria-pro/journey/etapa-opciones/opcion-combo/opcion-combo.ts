import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { TASA_TXT, TEXTOS_OPCIONES_ACUERDO as T } from '../../../constants/textos';
import { Combo } from '../../../interfaces/calculo';
import { ConversacionesStore } from '../../../state/conversaciones.store';
import { ctId, esp, impuesto } from '../../../utils/calculos';
import { pesos } from '../../../utils/formato';
import { JourneyUiStore } from '../../journey-ui.store';
import { PlazoCredito } from '../plazo-credito/plazo-credito';
import { RentaExenta } from '../renta-exenta/renta-exenta';

/** Caja «Retiro + crédito puente» de Opciones (cajaCombo del prototipo). */
@Component({
  selector: 'nc-opcion-combo',
  imports: [PlazoCredito, RentaExenta],
  templateUrl: './opcion-combo.html',
  styleUrl: './opcion-combo.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OpcionCombo {
  private readonly store = inject(ConversacionesStore);
  private readonly ui = inject(JourneyUiStore);

  readonly cb = input.required<Combo>();
  /** Esta caja lleva la pregunta de renta exenta. */
  readonly conRx = input(false);

  protected readonly st = this.store.st;
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

  protected ajustar(): void {
    this.ui.abrirDetalle(ctId(this.st()), 'impuestos');
  }
}
