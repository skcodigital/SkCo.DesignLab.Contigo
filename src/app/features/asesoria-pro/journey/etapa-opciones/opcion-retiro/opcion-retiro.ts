import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { Icono } from '@features/asesoria-pro/components/icono/icono';
import { NOM_CAJA } from '../../../constants/textos';
import { Retiro, TipoCaja } from '../../../interfaces/calculo';
import { ConversacionesStore } from '../../../state/conversaciones.store';
import { ctId, impuesto } from '../../../utils/calculos';
import { pesos } from '../../../utils/formato';
import { JourneyUiStore } from '../../journey-ui.store';
import { RentaExenta } from '../renta-exenta/renta-exenta';

/** Caja «Retiro» / «Retiro total» de Opciones (cajaRetiro del prototipo). */
@Component({
  selector: 'nc-opcion-retiro',
  imports: [Icono, RentaExenta],
  templateUrl: './opcion-retiro.html',
  styleUrl: './opcion-retiro.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OpcionRetiro {
  private readonly store = inject(ConversacionesStore);
  private readonly ui = inject(JourneyUiStore);

  readonly tipo = input.required<TipoCaja>();
  readonly k = input.required<Retiro>();
  /** Esta caja lleva la pregunta de renta exenta. */
  readonly conRx = input(false);

  protected readonly st = this.store.st;
  protected readonly titulo = computed(() => NOM_CAJA[this.tipo()]);
  protected readonly imp = computed(() => impuesto(this.st(), this.k()));
  protected readonly faltan = computed(() => (this.st().monto || 0) - this.k().R);
  protected readonly pesos = pesos;

  protected ajustar(): void {
    this.ui.abrirDetalle(ctId(this.st()), 'impuestos');
  }
}
