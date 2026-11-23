import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ChartTip } from '@features/radiografia/components/comunes/chart-tip/chart-tip.directive';
import { RutaPenetracion } from '@features/radiografia/interfaces/resumen';
import { tipRuta } from '@features/radiografia/utils/graficas-resumen';

/** "Ruta de penetración" del Resumen: clientes activos hoy por quién los atiende, hoy y meta 2027. */
@Component({
  selector: 'nc-rx-ruta-penetracion',
  imports: [ChartTip],
  templateUrl: './ruta-penetracion.html',
  styleUrl: './ruta-penetracion.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RutaPenetracionCard {
  readonly ruta = input.required<RutaPenetracion>();
  /** Sufijo de los ids (`-own` en la vista del FP Asignado). */
  readonly sufijo = input('');

  /** Cada tramo con su tooltip: el texto sale de la leyenda en la misma posición. */
  protected readonly tramos = computed(() => {
    const r = this.ruta();
    return r.segmentos.map((s, i) => ({ ...s, tip: tipRuta(r.leyenda[i]?.texto ?? '', s.ancho) }));
  });
}
