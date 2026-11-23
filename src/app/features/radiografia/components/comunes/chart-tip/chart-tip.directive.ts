import { Directive, inject, input } from '@angular/core';
import { ChartTipState } from '@features/radiografia/components/comunes/chart-tip/chart-tip.state';
import { DatoTip } from '@features/radiografia/interfaces/radiografia';

/**
 * Marca un segmento o barra de gráfica (`.seg`, `.pair-bar`, `.line-seg`, `.stack-seg`, `.route-seg`,
 * `.aum-hit`, `.donut-seg`) con el contenido de su tooltip. Hover lo muestra y lo sigue; en táctil,
 * tocarlo lo muestra (tocar fuera lo cierra: lo resuelve `nc-rx-chart-tip`).
 *
 * `<span class="pair-bar pair-bar--nuevos" [ncRxChartTip]="{ titulo: '2025', lineas: ['Clientes nuevos: 18'] }">`
 */
@Directive({
  selector: '[ncRxChartTip]',
  host: {
    '(mouseenter)': 'mostrar($event)',
    '(mousemove)': 'mover($event)',
    '(mouseleave)': 'ocultar()',
    '(click)': 'tocar($event)',
  },
})
export class ChartTip {
  readonly dato = input.required<DatoTip>({ alias: 'ncRxChartTip' });
  private readonly state = inject(ChartTipState);

  protected mostrar(e: MouseEvent): void {
    this.state.mostrar(this.dato(), e.clientX, e.clientY);
  }

  protected mover(e: MouseEvent): void {
    this.state.mover(e.clientX, e.clientY);
  }

  protected ocultar(): void {
    this.state.ocultar();
  }

  protected tocar(e: MouseEvent): void {
    e.stopPropagation();
    this.state.mostrar(this.dato(), e.clientX, e.clientY);
  }
}
