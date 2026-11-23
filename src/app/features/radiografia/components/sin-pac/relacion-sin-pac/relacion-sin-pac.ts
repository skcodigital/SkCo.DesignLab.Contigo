import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ChartTip } from '@features/radiografia/components/comunes/chart-tip/chart-tip.directive';
import { IconoSpView } from '@features/radiografia/components/sin-pac/icono-sp/icono-sp';
import { LINEAS_SP } from '@features/radiografia/data/sin-pac.mock';
import { fmtPesos } from '@features/radiografia/utils/formato';
import { tramosLinea } from '@features/radiografia/utils/sin-pac';

/** Relación integral sin plan corporativo: activos por línea de negocio, tu agencia frente a otras. */
@Component({
  selector: 'nc-rx-relacion-sin-pac',
  imports: [ChartTip, IconoSpView],
  templateUrl: './relacion-sin-pac.html',
  styleUrl: './relacion-sin-pac.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RelacionSinPac {
  protected readonly lineas = LINEAS_SP.map((l) => {
    const tramos = tramosLinea(l);
    return {
      ...l,
      tramos,
      valAgencia: fmtPesos(l.agencia) + ' M',
      valOtras: fmtPesos(l.otras) + ' M',
      tipAgencia: { titulo: l.nombre, lineas: [tramos.agencia] },
      tipOtras: tramos.otras ? { titulo: l.nombre, lineas: [tramos.otras] } : null,
    };
  });
}
