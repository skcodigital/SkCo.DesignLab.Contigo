import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ChartTip } from '@features/radiografia/components/comunes/chart-tip/chart-tip.directive';
import { TEXTOS_CLIENTES } from '@features/radiografia/constants/textos-clientes';
import { ariaDona, segmentosDona } from '@features/radiografia/utils/graficas-clientes';

/** Clientes por segmento: dona con el total al centro y la lista al lado. El host es `.segmentos-body`. */
@Component({
  selector: 'nc-rx-dona-segmentos',
  imports: [ChartTip],
  template: `
    <svg class="donut" viewBox="0 0 180 180" role="img" [attr.aria-label]="aria()">
      <g transform="rotate(-90 90 90)">
        @for (s of segmentos(); track s.nombre) {
          <circle class="donut-seg" cx="90" cy="90" r="70" [attr.stroke]="s.color" [attr.stroke-dasharray]="s.dash" [attr.stroke-dashoffset]="s.offset" [ncRxChartTip]="{ titulo: tituloTip, lineas: [s.tip] }" />
        }
      </g>
      <text x="90" y="86" text-anchor="middle" class="donut-total">{{ total() }}</text>
      <text x="90" y="106" text-anchor="middle" class="donut-label">clientes</text>
    </svg>
    <ul class="prod-list segmentos-list">
      @for (s of segmentos(); track s.nombre) {
        <li><i class="sw" [style.background]="s.color"></i><span>{{ s.nombre }}</span><b class="num">{{ s.n }}</b><span class="num pct">{{ s.pct }}%</span></li>
      }
    </ul>
  `,
  styleUrl: './dona-segmentos.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'segmentos-body' },
})
export class DonaSegmentos {
  /** Finanzas Personales, Privilegio, Elite, Wealth. */
  readonly valores = input.required<readonly number[]>();
  readonly total = input.required<number>();

  protected readonly tituloTip = TEXTOS_CLIENTES.tip.clientesPorSegmento;
  protected readonly segmentos = computed(() => segmentosDona(this.valores(), this.total()));
  protected readonly aria = computed(() => ariaDona(this.segmentos()));
}
