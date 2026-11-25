import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { TASA_TXT, TEXTOS, TEXTOS_OPCIONES_ACUERDO as T } from '../../../constants/textos';
import { Combo } from '../../../interfaces/calculo';
import { ConversacionesStore } from '../../../state/conversaciones.store';
import { ctId, esp, impuesto, tocaNoExento } from '../../../utils/calculos';
import { miles, pesos, soloDigitos } from '../../../utils/formato';
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

  /** Abre la pestaña Crédito con el crédito de la combinación (sin elegir la caja: está dentro del <label>). */
  protected verDetalle(e: Event): void {
    e.preventDefault();
    this.ui.abrirDetalle(ctId(this.st()), 'credito', 'combo');
  }

  protected elegir(): void {
    this.store.elegirPreferencia('combo');
    // Con aportes no exentos y sin respuesta, se pregunta la renta exenta en la modal
    const st = this.st();
    if (!st.cerrado && tocaNoExento(st, this.cb().kt) && !st.rx) this.ui.pedirRentaExenta();
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

  /** Edición del monto del crédito con el lápiz (el retiro se recalcula para completar el monto). */
  protected readonly editando = signal(false);
  protected readonly miles = miles;

  protected editar(e: Event): void {
    e.preventDefault(); // dentro del <label> de la caja: no debe elegir la opción
    this.editando.set(true);
    setTimeout(() => document.querySelector<HTMLInputElement>('.jw-cmb-campo input')?.select());
  }

  protected escribir(e: Event): void {
    const input = e.target as HTMLInputElement;
    input.value = miles(soloDigitos(input.value));
  }

  protected aplicar(e: Event, valor: string): void {
    e.preventDefault();
    if (!this.editando()) return;
    const m = soloDigitos(valor);
    // El cálculo lo deja entre el mínimo y el máximo permitidos
    if (m > 0) this.store.fijarCreditoCombo(m);
    this.editando.set(false);
  }

  protected cancelar(e: Event): void {
    e.preventDefault();
    this.editando.set(false);
  }
  protected readonly pesos = pesos;

  /**
   * «Ajustar» el IBC: si el retiro toca aportes no exentos y aún no se respondió la renta exenta, abre la modal
   * de renta exenta en lugar del panel de Impuestos.
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
