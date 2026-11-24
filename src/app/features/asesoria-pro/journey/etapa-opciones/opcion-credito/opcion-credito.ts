import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { Icono } from '@features/asesoria-pro/components/icono/icono';
import { TASA_TXT } from '../../../constants/textos';
import { Credito } from '../../../interfaces/calculo';
import { ConversacionesStore } from '../../../state/conversaciones.store';
import { pesos } from '../../../utils/formato';
import { ctId } from '../../../utils/calculos';
import { soloLectura } from '../../../utils/validaciones';
import { JourneyUiStore } from '../../journey-ui.store';
import { PlazoCredito } from '../plazo-credito/plazo-credito';

/** Caja «Crédito Impulso» de Opciones (cajaCredito del prototipo). */
@Component({
  selector: 'nc-opcion-credito',
  imports: [Icono, PlazoCredito],
  templateUrl: './opcion-credito.html',
  styleUrl: './opcion-credito.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OpcionCredito {
  private readonly store = inject(ConversacionesStore);
  private readonly ui = inject(JourneyUiStore);

  readonly cr = input.required<Credito>();

  protected readonly st = this.store.st;
  protected readonly ro = computed(() => soloLectura(this.st()));
  protected readonly tasa = TASA_TXT;
  protected readonly pesos = pesos;

  /** Abre la pestaña Crédito del panel de detalle (sin cambiar la opción elegida: está dentro del <label>). */
  protected verDetalle(e: Event): void {
    e.preventDefault();
    this.ui.abrirDetalle(ctId(this.st()), 'credito');
  }

  protected elegir(): void {
    this.store.elegirPreferencia('credito');
  }
}
