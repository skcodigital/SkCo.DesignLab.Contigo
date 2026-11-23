import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ChartTip } from '@features/radiografia/components/comunes/chart-tip/chart-tip.directive';
import { Plegable } from '@features/radiografia/components/comunes/plegable/plegable';
import { Variacion } from '@features/radiografia/components/comunes/variacion/variacion';
import { IconoSpView } from '@features/radiografia/components/sin-pac/icono-sp/icono-sp';
import { RUTA_PENETRACION_SP } from '@features/radiografia/data/sin-pac.mock';
import { tipRuta } from '@features/radiografia/utils/sin-pac';

/** Resumen sin plan corporativo: indicadores, productos de la empresa y ruta de penetración. */
@Component({
  selector: 'nc-rx-resumen-sin-pac',
  imports: [Plegable, Variacion, ChartTip, IconoSpView],
  templateUrl: './resumen-sin-pac.html',
  styleUrl: './resumen-sin-pac.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResumenSinPac {
  protected readonly ruta = RUTA_PENETRACION_SP.map((t) => ({ ...t, tip: tipRuta(t) }));
  /** Productos de la empresa: por defecto solo "Ahorro e inversión" queda abierto. */
  protected readonly ahorroAbierto = signal(true);

  protected alternarAhorro(): void {
    this.ahorroAbierto.update((a) => !a);
  }
}
