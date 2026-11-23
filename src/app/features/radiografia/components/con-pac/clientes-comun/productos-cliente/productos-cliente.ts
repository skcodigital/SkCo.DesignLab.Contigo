import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { ChartTip } from '@features/radiografia/components/comunes/chart-tip/chart-tip.directive';
import { TEXTOS_CLIENTES } from '@features/radiografia/constants/textos-clientes';
import { RadiografiaStore } from '@features/radiografia/state/radiografia.store';
import { ariaProductos, tramosProductos } from '@features/radiografia/utils/graficas-clientes';

/** Productos por cliente: barra apilada (1P…4P+) y su lista; "1 producto" abre el listado de monoproducto. */
@Component({
  selector: 'nc-rx-productos-cliente',
  imports: [ChartTip],
  template: `
    <div class="stack stack--prod" role="img" [attr.aria-label]="etiqueta() || ariaPorDefecto()">
      @for (t of tramos(); track t.clase) {
        <span [class]="'stack-seg ' + t.clase" [style.width.%]="t.pct" [ncRxChartTip]="{ titulo: tituloTip, lineas: [t.nombre + ': ' + t.n + ' clientes · ' + t.pct + '%'] }">
          @if (t.conValor) {
            <span class="stack-val" [class.stack-val--light]="t.claro">{{ t.pct }}%</span>
          }
        </span>
      }
    </div>
    <ul class="prod-list">
      @for (t of tramos(); track t.clase; let i = $index) {
        <li>
          <i [class]="'sw ' + t.clase"></i>
          @if (i === 0) {
            <button class="link-btn link-btn--row" [attr.aria-label]="aria1p()" (click)="store.abrirLista('monoproducto')">{{ t.nombre }}</button>
          } @else {
            <span>{{ t.nombre }}</span>
          }
          <b class="num">{{ t.n }}</b><span class="num pct">{{ t.pct }}%</span>
        </li>
      }
    </ul>
  `,
  styleUrl: './productos-cliente.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductosCliente {
  protected readonly store = inject(RadiografiaStore);

  /** Clientes con 1, 2, 3 y 4+ productos. */
  readonly conteos = input.required<readonly number[]>();
  readonly total = input.required<number>();
  /** aria-label del botón "1 producto (1P)". */
  readonly aria1p = input.required<string>();
  /** aria-label de la barra; por defecto los cuatro porcentajes. */
  readonly etiqueta = input('');

  protected readonly tituloTip = TEXTOS_CLIENTES.tip.productosPorCliente;
  protected readonly tramos = computed(() => tramosProductos(this.conteos(), this.total()));
  protected readonly ariaPorDefecto = computed(() => ariaProductos(this.tramos()));
}
