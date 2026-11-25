import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';
import { Icono } from '@features/monitor/components/comunes/icono/icono';
import { Tooltip } from '@features/monitor/components/comunes/tooltip/tooltip';
import { GrupoCasillas, ValoresCasillas } from '@features/monitor/interfaces/comunes';

/**
 * Casillas como tarjetas seleccionables (`app-checkbox-custom`, del panel «Comparar»): un clic en la tarjeta la
 * marca (borde verde); las opciones desactualizadas llevan un ícono de alerta con tooltip.
 */
@Component({
  selector: 'nc-mon-casillas-tarjeta',
  imports: [Icono, Tooltip],
  templateUrl: './casillas-tarjeta.html',
  styleUrl: './casillas-tarjeta.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CasillasTarjeta {
  readonly grupo = input.required<GrupoCasillas>();
  readonly filtro = input('');
  readonly valores = model.required<ValoresCasillas>();

  protected readonly opciones = computed(() => {
    const termino = this.filtro().toLowerCase();
    return this.grupo().opciones.filter((o) => o.nombre.toLowerCase().includes(termino));
  });

  protected alternar(valor: string): void {
    this.valores.update((v) => ({ ...v, [valor]: !v[valor] }));
  }
}
