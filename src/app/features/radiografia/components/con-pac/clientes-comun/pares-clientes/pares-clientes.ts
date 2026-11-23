import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ChartTip } from '@features/radiografia/components/comunes/chart-tip/chart-tip.directive';
import { TEXTOS_CLIENTES } from '@features/radiografia/constants/textos-clientes';
import { AnioEvolucion } from '@features/radiografia/interfaces/clientes';
import { paresEvolucion } from '@features/radiografia/utils/graficas-clientes';

/**
 * Pares de barras de clientes nuevos y perdidos por año, con el neto bajo el eje.
 * El host es el contenedor `.pairs` (su caja la estiliza el padre con `rx-charts`).
 */
@Component({
  selector: 'nc-rx-pares-clientes',
  imports: [ChartTip],
  template: `
    @for (p of pares(); track p.anio) {
      <div class="pair" role="img" [attr.aria-label]="p.aria">
        <div class="pair-bars">
          <span class="pair-bar pair-bar--nuevos" [style.height.px]="p.altoNuevos" [ncRxChartTip]="{ titulo: p.anio, lineas: [tip.clientesNuevos + ': ' + p.nuevos] }"><span>{{ p.nuevos }}</span></span>
          <span class="pair-bar pair-bar--perdidos" [style.height.px]="p.altoPerdidos" [ncRxChartTip]="{ titulo: p.anio, lineas: [tip.clientesPerdidos + ': ' + p.perdidos] }"><span>{{ p.perdidos }}</span></span>
        </div>
        <span class="pair-year">{{ p.anio }}<small [class]="p.claseNeto">{{ p.neto }}</small></span>
      </div>
    }
  `,
  styleUrl: './pares-clientes.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'pairs' },
})
export class ParesClientes {
  readonly anios = input.required<readonly AnioEvolucion[]>();
  /** Alto mínimo de una barra (px): 8 en las gráficas por ámbito; 0 en la vista del asesor (datos fijos). */
  readonly minimo = input(8);

  protected readonly tip = TEXTOS_CLIENTES.tip;
  protected readonly pares = computed(() => paresEvolucion(this.anios(), this.minimo()));
}
