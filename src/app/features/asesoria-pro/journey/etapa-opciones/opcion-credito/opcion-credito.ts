import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { Icono } from '@features/asesoria-pro/components/icono/icono';
import { TASA_TXT } from '../../../constants/textos';
import { Credito } from '../../../interfaces/calculo';
import { ConversacionesStore } from '../../../state/conversaciones.store';
import { pesos } from '../../../utils/formato';
import { soloLectura } from '../../../utils/validaciones';
import { PlazoCredito } from '../plazo-credito/plazo-credito';

/** Caja «Crédito puente» de Opciones (cajaCredito del prototipo). */
@Component({
  selector: 'nc-opcion-credito',
  imports: [Icono, PlazoCredito],
  templateUrl: './opcion-credito.html',
  styleUrl: './opcion-credito.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OpcionCredito {
  private readonly store = inject(ConversacionesStore);

  readonly cr = input.required<Credito>();

  protected readonly st = this.store.st;
  protected readonly ro = computed(() => soloLectura(this.st()));
  protected readonly tasa = TASA_TXT;
  protected readonly pesos = pesos;

  protected alternarNoRepone(): void {
    this.store.alternarNoRepone();
  }
}
