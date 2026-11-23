import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LineasNegocio } from '@features/radiografia/components/con-pac/comun/lineas-negocio/lineas-negocio';
import { RELACION_FP } from '@features/radiografia/data/relacion.mock';

/** "Tus líneas", vista del asesor que no es dueño (`#panel-relacion-fp`). */
@Component({
  selector: 'nc-rx-relacion-fp',
  imports: [LineasNegocio],
  templateUrl: './relacion-fp.html',
  styleUrl: './relacion-fp.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RelacionFp {
  protected readonly relacion = RELACION_FP;
}
