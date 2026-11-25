import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { Icono } from '@features/asesoria-pro/components/icono/icono';
import { NOM_CAJA, TEXTOS } from '../../../constants/textos';
import { Retiro, TipoCaja } from '../../../interfaces/calculo';
import { ConversacionesStore } from '../../../state/conversaciones.store';
import { ctId, impuesto, tocaNoExento } from '../../../utils/calculos';
import { soloLectura } from '../../../utils/validaciones';
import { pesos } from '../../../utils/formato';
import { JourneyUiStore } from '../../journey-ui.store';

/** Caja «Retiro» / «Retiro total» de Opciones (cajaRetiro del prototipo). */
@Component({
  selector: 'nc-opcion-retiro',
  imports: [Icono],
  templateUrl: './opcion-retiro.html',
  styleUrl: './opcion-retiro.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OpcionRetiro {
  private readonly store = inject(ConversacionesStore);
  private readonly ui = inject(JourneyUiStore);

  readonly tipo = input.required<TipoCaja>();
  readonly k = input.required<Retiro>();

  protected readonly st = this.store.st;
  protected readonly titulo = computed(() => NOM_CAJA[this.tipo()]);
  protected readonly imp = computed(() => impuesto(this.st(), this.k()));
  /** Tooltip del posible impuesto: «Lo que se retiene hoy es un anticipo… con el IBC: no reemplaza la declaración de renta.» */
  protected readonly anticipo = computed(() => TEXTOS.anticipo(this.imp().nota === TEXTOS.notaIbc));
  protected readonly faltan = computed(() => (this.st().monto || 0) - this.k().R);
  protected readonly pesos = pesos;
  protected readonly ro = computed(() => soloLectura(this.st()));

  /** Desglose de «Descuentos de hoy», plegado por defecto. */
  protected readonly verDesc = signal(false);

  protected alternarDesc(e: Event): void {
    e.preventDefault(); // está dentro del <label> de la caja: no debe elegir la opción
    this.verDesc.update((v) => !v);
  }

  protected elegir(): void {
    this.store.elegirPreferencia(this.tipo());
    // Con aportes no exentos y sin respuesta, se pregunta la renta exenta en la modal
    const st = this.st();
    if (!st.cerrado && tocaNoExento(st, this.k()) && !st.rx) this.ui.pedirRentaExenta();
  }

  /** Abre la pestaña Cálculo del panel de detalle (sin cambiar la opción elegida: está dentro del <label>). */
  protected verCalculo(e: Event): void {
    e.preventDefault();
    this.ui.abrirDetalle(ctId(this.st()), 'calculo');
  }

  /**
   * «Ajustar» el IBC: si el retiro toca aportes no exentos y aún no se respondió la renta exenta, abre la modal
   * de renta exenta en lugar del panel de Impuestos.
   */
  protected ajustar(): void {
    const st = this.st();
    if (tocaNoExento(st, this.k()) && !st.rx) {
      this.ui.pedirRentaExenta();
      return;
    }
    this.ui.abrirDetalle(ctId(st), 'impuestos');
  }
}
