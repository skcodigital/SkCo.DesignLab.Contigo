import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ChartTip } from '@features/radiografia/components/comunes/chart-tip/chart-tip.directive';
import { RelacionIntegral } from '@features/radiografia/interfaces/resumen';
import { tipLinea } from '@features/radiografia/utils/graficas-resumen';

/**
 * Relación integral: activos administrados por línea de negocio (barra por quién gestiona, detalle y
 * hallazgo). Lo usan las tres vistas con datos distintos.
 */
@Component({
  selector: 'nc-rx-lineas-negocio',
  imports: [ChartTip],
  templateUrl: './lineas-negocio.html',
  styleUrl: './lineas-negocio.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LineasNegocio {
  readonly relacion = input.required<RelacionIntegral>();
  /** Sufijo de los ids (`-own`, `-fp`). */
  readonly sufijo = input('');

  protected readonly lineas = computed(() =>
    this.relacion().lineas.map((l) => ({
      ...l,
      tramos: l.tramos.map((t) => ({ ...t, tip: tipLinea(l.nombre, l.aria, t.gestion) })),
    })),
  );
}
