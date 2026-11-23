import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { ChartTipState } from '@features/radiografia/components/comunes/chart-tip/chart-tip.state';

/** Tooltip flotante de las gráficas (uno por página). Se reubica para no salirse de la ventana. */
@Component({
  selector: 'nc-rx-chart-tip',
  template: `
    @if (state.tip(); as t) {
      <div #caja class="chart-tip" aria-hidden="true" [style.left.px]="pos().x" [style.top.px]="pos().y">
        @if (t.dato.titulo) {
          <b>{{ t.dato.titulo }}</b>
        }
        @for (l of t.dato.lineas; track $index) {
          <div>{{ l }}</div>
        }
      </div>
    }
  `,
  styles: `
    .chart-tip {
      position: fixed;
      z-index: 70;
      max-width: 280px;
      padding: 10px 12px;
      border-radius: 8px;
      background: var(--primarygrey-d04);
      color: var(--sk-color-surface);
      font: 400 13px/1.45 var(--sk-font-body);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.18);
      pointer-events: none;
    }
    .chart-tip b {
      display: block;
      margin-bottom: 2px;
      font-weight: 700;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:scroll)': 'state.ocultar()',
    '(document:click)': 'state.ocultar()',
  },
})
export class ChartTipView {
  protected readonly state = inject(ChartTipState);
  private readonly caja = viewChild<ElementRef<HTMLElement>>('caja');
  protected readonly pos = signal({ x: 0, y: 0 });

  constructor() {
    // Medida del tooltip para que no se salga de la ventana (igual que `moverTip` del prototipo).
    afterRenderEffect(() => {
      const t = this.state.tip();
      const el = this.caja()?.nativeElement;
      if (!t || !el) return;
      const r = el.getBoundingClientRect();
      let x = t.x + 14;
      let y = t.y + 14;
      if (x + r.width > innerWidth - 8) x = t.x - r.width - 14;
      if (y + r.height > innerHeight - 8) y = t.y - r.height - 14;
      const nueva = { x: Math.max(8, x), y: Math.max(8, y) };
      const actual = this.pos();
      if (actual.x !== nueva.x || actual.y !== nueva.y) this.pos.set(nueva);
    });
  }
}
