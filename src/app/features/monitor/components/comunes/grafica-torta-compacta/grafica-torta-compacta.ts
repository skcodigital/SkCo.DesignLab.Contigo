import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Grafica } from '@features/monitor/components/comunes/grafica/grafica';
import { PorcionTortaCompacta } from '@features/monitor/interfaces/comunes';
import { opcionesTortaCompacta } from '@features/monitor/utils/graficas-torta';

/** Torta (dona) sin título de las secciones de detalle (`shared/pie-charts`: tendencia y rebalanceos), 35vh. */
@Component({
  selector: 'nc-mon-grafica-torta-compacta',
  imports: [Grafica],
  template: '<nc-mon-grafica class="grafica" [opciones]="opciones()" />',
  styles: ':host { display: block; width: 100%; } .grafica { width: 100%; height: 35vh; }',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GraficaTortaCompacta {
  readonly datos = input<readonly PorcionTortaCompacta[]>([]);

  protected readonly opciones = computed(() => opcionesTortaCompacta(this.datos()));
}
