import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ResumenPanel } from '@features/radiografia/components/con-pac/comun/resumen-panel/resumen-panel';
import { KPIS_RESUMEN_DUENO, PRODUCTOS_EMPRESA, RUTA_PENETRACION_DUENO } from '@features/radiografia/data/resumen.mock';

/** Resumen, vista del FP Asignado (`#panel-resumen-own`): su porción frente a la de otros asesores. */
@Component({
  selector: 'nc-rx-resumen-dueno',
  imports: [ResumenPanel],
  templateUrl: './resumen-dueno.html',
  styleUrl: './resumen-dueno.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResumenDueno {
  protected readonly kpis = KPIS_RESUMEN_DUENO;
  protected readonly productos = PRODUCTOS_EMPRESA;
  protected readonly ruta = RUTA_PENETRACION_DUENO;
}
