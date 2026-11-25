import { ChangeDetectionStrategy, Component, computed, input, untracked } from '@angular/core';
import { injectMediaQuery } from '@core/utils/media-query';
import { Grafica } from '@features/monitor/components/comunes/grafica/grafica';
import { TEXTOS } from '@features/monitor/constants/textos';
import { PorcionTorta } from '@features/monitor/interfaces/comunes';
import { opcionesTorta } from '@features/monitor/utils/graficas-torta';

/**
 * Torta (dona) con título de la composición actual de contratos o portafolios (`ui/shared/pie-chart`): tarjeta
 * gris de 52vh y tooltip con saldo y porcentaje.
 */
@Component({
  selector: 'nc-mon-grafica-torta',
  imports: [Grafica],
  template: '<div class="contenido"><nc-mon-grafica class="grafica" [opciones]="opciones()" /></div>',
  styleUrl: './grafica-torta.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GraficaTorta {
  readonly datos = input<readonly PorcionTorta[]>([]);
  readonly titulo = input<string>(TEXTOS.graficas.tituloComposicion);

  private readonly esMovil = injectMediaQuery('(max-width: 768px)');

  // Como producción, el tamaño del título se decide al pintar (no se repinta al cambiar el ancho).
  protected readonly opciones = computed(() =>
    opcionesTorta(this.datos(), this.titulo(), untracked(() => this.esMovil())),
  );
}
