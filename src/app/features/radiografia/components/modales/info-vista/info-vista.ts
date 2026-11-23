import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { Dialogo } from '@features/radiografia/components/comunes/dialogo/dialogo';
import { PlanEmpresa, Vista } from '@features/radiografia/interfaces/radiografia';

/** Modal informativa de la vista: qué ve y qué no ve cada rol. Se abre con la ayuda del título. */
@Component({
  selector: 'nc-rx-info-vista',
  imports: [Dialogo],
  templateUrl: './info-vista.html',
  styleUrl: './info-vista.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InfoVista {
  readonly vista = input.required<Vista>();
  readonly plan = input.required<PlanEmpresa>();
  readonly cerrar = output<void>();

  protected readonly sinPac = computed(() => this.plan() === 'sin');
}
