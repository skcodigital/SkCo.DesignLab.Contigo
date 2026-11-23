import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ClientesDirector } from '@features/radiografia/components/con-pac/director/clientes-director/clientes-director';
import { EquipoAsignado } from '@features/radiografia/components/con-pac/director/equipo-asignado/equipo-asignado';
import { PlanCorporativo } from '@features/radiografia/components/con-pac/director/plan-corporativo/plan-corporativo';
import { RelacionDirector } from '@features/radiografia/components/con-pac/director/relacion-director/relacion-director';
import { ResumenDirector } from '@features/radiografia/components/con-pac/director/resumen-director/resumen-director';
import { RutaDirector } from '@features/radiografia/components/con-pac/director/ruta-director/ruta-director';
import { ClientesDueno } from '@features/radiografia/components/con-pac/dueno/clientes-dueno/clientes-dueno';
import { RelacionDueno } from '@features/radiografia/components/con-pac/dueno/relacion-dueno/relacion-dueno';
import { ResumenDueno } from '@features/radiografia/components/con-pac/dueno/resumen-dueno/resumen-dueno';
import { RutaDueno } from '@features/radiografia/components/con-pac/dueno/ruta-dueno/ruta-dueno';
import { ClientesFp } from '@features/radiografia/components/con-pac/fp/clientes-fp/clientes-fp';
import { PlanFp } from '@features/radiografia/components/con-pac/fp/plan-fp/plan-fp';
import { RelacionFp } from '@features/radiografia/components/con-pac/fp/relacion-fp/relacion-fp';
import { ResumenFp } from '@features/radiografia/components/con-pac/fp/resumen-fp/resumen-fp';
import { AsesoresSinPac } from '@features/radiografia/components/sin-pac/asesores-sin-pac/asesores-sin-pac';
import { ClientesSinPac } from '@features/radiografia/components/sin-pac/clientes-sin-pac/clientes-sin-pac';
import { PlanSinPac } from '@features/radiografia/components/sin-pac/plan-sin-pac/plan-sin-pac';
import { RelacionSinPac } from '@features/radiografia/components/sin-pac/relacion-sin-pac/relacion-sin-pac';
import { ResumenSinPac } from '@features/radiografia/components/sin-pac/resumen-sin-pac/resumen-sin-pac';
import { RutaSinPac } from '@features/radiografia/components/sin-pac/ruta-sin-pac/ruta-sin-pac';
import { PlanEmpresa, TabId, Vista } from '@features/radiografia/interfaces/radiografia';

/**
 * Elige el contenido de la pestaña según la empresa y la vista (los `data-dir` / `data-own` / `data-fp`
 * de las pestañas del prototipo). Sin PAC siempre es la vista director.
 */
@Component({
  selector: 'nc-rx-panel-radiografia',
  imports: [
    ResumenDirector,
    EquipoAsignado,
    ClientesDirector,
    RelacionDirector,
    PlanCorporativo,
    RutaDirector,
    ResumenDueno,
    ClientesDueno,
    RelacionDueno,
    RutaDueno,
    ResumenFp,
    ClientesFp,
    RelacionFp,
    PlanFp,
    ResumenSinPac,
    AsesoresSinPac,
    ClientesSinPac,
    RelacionSinPac,
    PlanSinPac,
    RutaSinPac,
  ],
  templateUrl: './panel-radiografia.html',
  styles: ':host { display: block; }',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PanelRadiografia {
  readonly plan = input.required<PlanEmpresa>();
  readonly vista = input.required<Vista>();
  readonly tab = input.required<TabId>();

  protected readonly clave = computed(() =>
    this.plan() === 'sin' ? `sin-${this.tab()}` : `${this.vista()}-${this.tab()}`,
  );
}
