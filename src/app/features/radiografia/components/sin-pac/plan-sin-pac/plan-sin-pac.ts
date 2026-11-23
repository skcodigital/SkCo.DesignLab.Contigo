import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IconoSpView } from '@features/radiografia/components/sin-pac/icono-sp/icono-sp';

/** Plan corporativo cuando la empresa no lo tiene: invitación a proponerlo a Gestión Humana. */
@Component({
  selector: 'nc-rx-plan-sin-pac',
  imports: [IconoSpView],
  templateUrl: './plan-sin-pac.html',
  styleUrl: './plan-sin-pac.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanSinPac {}
