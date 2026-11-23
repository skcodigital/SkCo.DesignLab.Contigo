import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LineasNegocio } from '@features/radiografia/components/con-pac/comun/lineas-negocio/lineas-negocio';
import { RELACION_DIRECTOR } from '@features/radiografia/data/relacion.mock';

/** Relación integral, vista director comercial (`#panel-relacion`). */
@Component({
  selector: 'nc-rx-relacion-director',
  imports: [LineasNegocio],
  templateUrl: './relacion-director.html',
  styleUrl: './relacion-director.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RelacionDirector {
  protected readonly relacion = RELACION_DIRECTOR;
}
