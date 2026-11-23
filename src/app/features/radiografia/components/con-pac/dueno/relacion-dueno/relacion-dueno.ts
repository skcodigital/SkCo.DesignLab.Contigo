import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LineasNegocio } from '@features/radiografia/components/con-pac/comun/lineas-negocio/lineas-negocio';
import { RELACION_DUENO } from '@features/radiografia/data/relacion.mock';

/** Relación integral, vista del FP Asignado (`#panel-relacion-own`): otros asesores van agregados. */
@Component({
  selector: 'nc-rx-relacion-dueno',
  imports: [LineasNegocio],
  templateUrl: './relacion-dueno.html',
  styleUrl: './relacion-dueno.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RelacionDueno {
  protected readonly relacion = RELACION_DUENO;
}
