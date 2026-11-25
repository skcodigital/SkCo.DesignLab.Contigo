import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { EChartsCoreOption, EChartsType, iniciarGrafica } from '@features/monitor/utils/echarts';

/**
 * Componente base de todas las gráficas del Monitor: inicia ECharts en su elemento (con el tema de producción),
 * aplica las opciones cada vez que cambian, se ajusta al tamaño con `ResizeObserver` y se libera al destruirse.
 * El alto lo pone quien lo usa (CSS sobre `nc-mon-grafica`).
 *
 * Las gráficas que necesitan eventos o acciones de ECharts (leyenda, zoom) reciben la instancia en `lista`.
 */
@Component({
  selector: 'nc-mon-grafica',
  template: '',
  styles: ':host { display: block; position: relative; width: 100%; height: 100%; }',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Grafica {
  readonly opciones = input.required<EChartsCoreOption>();
  /** `notMerge` de `setOption`: producción reemplaza las opciones completas en cada cambio. */
  readonly reemplazar = input(true);
  /** La instancia de ECharts, una vez iniciada (antes de aplicar las primeras opciones). */
  readonly lista = output<EChartsType>();

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly instancia = signal<EChartsType | null>(null);

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const grafica = iniciarGrafica(this.host.nativeElement);
      const observador = new ResizeObserver(() => grafica.resize());
      observador.observe(this.host.nativeElement);
      destroyRef.onDestroy(() => {
        observador.disconnect();
        grafica.dispose();
      });
      this.lista.emit(grafica);
      this.instancia.set(grafica);
    });

    effect(() => {
      const grafica = this.instancia();
      const opciones = this.opciones();
      if (grafica && !grafica.isDisposed()) {
        grafica.setOption(opciones, this.reemplazar());
      }
    });
  }
}
