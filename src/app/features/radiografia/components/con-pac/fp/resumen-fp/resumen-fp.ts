import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ResumenPanel } from '@features/radiografia/components/con-pac/comun/resumen-panel/resumen-panel';
import { KPIS_RESUMEN_FP, PRODUCTOS_BLOQUEADOS } from '@features/radiografia/data/resumen.mock';

/** Resumen, vista del asesor que no es dueño (`#panel-resumen-fp`): sus clientes y los productos bloqueados. */
@Component({
  selector: 'nc-rx-resumen-fp',
  imports: [ResumenPanel],
  templateUrl: './resumen-fp.html',
  styleUrl: './resumen-fp.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResumenFp {
  protected readonly kpis = KPIS_RESUMEN_FP;
  protected readonly productos = PRODUCTOS_BLOQUEADOS;
}
