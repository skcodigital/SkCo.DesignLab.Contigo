import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ChartTip } from '@features/radiografia/components/comunes/chart-tip/chart-tip.directive';
import { barrasEdad } from '@features/radiografia/utils/graficas-clientes';

/** Clientes por rango de edad. El host es el contenedor `.bars.bars--edad` (lo estiliza el padre). */
@Component({
  selector: 'nc-rx-barras-edad',
  imports: [ChartTip],
  template: `
    @for (b of barras(); track b.rango) {
      <div class="bar-col">
        <span class="bar-total num">{{ b.n }}</span>
        <div class="bar" role="img" [attr.aria-label]="b.aria"><span class="seg seg--edad" [style.height.px]="b.alto" [ncRxChartTip]="{ titulo: b.rango, lineas: [b.tip] }"></span></div>
        <span class="bar-year">{{ b.rango }}</span>
      </div>
    }
  `,
  styleUrl: './barras-edad.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'bars bars--edad' },
})
export class BarrasEdad {
  /** 18–30, 31–45, 46–60, más de 60. */
  readonly valores = input.required<readonly number[]>();
  readonly total = input.required<number>();

  protected readonly barras = computed(() => barrasEdad(this.valores(), this.total()));
}
