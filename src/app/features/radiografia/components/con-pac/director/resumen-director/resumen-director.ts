import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ResumenPanel } from '@features/radiografia/components/con-pac/comun/resumen-panel/resumen-panel';
import { KPIS_RESUMEN_DIRECTOR, PRODUCTOS_EMPRESA, RUTA_PENETRACION_DIRECTOR } from '@features/radiografia/data/resumen.mock';

/** Resumen, vista director comercial (`#panel-resumen`). */
@Component({
  selector: 'nc-rx-resumen-director',
  imports: [ResumenPanel],
  templateUrl: './resumen-director.html',
  styleUrl: './resumen-director.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResumenDirector {
  protected readonly kpis = KPIS_RESUMEN_DIRECTOR;
  protected readonly productos = PRODUCTOS_EMPRESA;
  protected readonly ruta = RUTA_PENETRACION_DIRECTOR;
}
