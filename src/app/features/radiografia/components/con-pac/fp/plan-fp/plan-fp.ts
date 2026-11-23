import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Icono } from '@features/radiografia/components/con-pac/clientes-comun/icono/icono';

/** Pestaña Plan corporativo · asesor (otro FP): el plan lo atiende el FP Asignado. */
@Component({
  selector: 'nc-rx-plan-fp',
  imports: [Icono],
  templateUrl: './plan-fp.html',
  styleUrl: './plan-fp.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlanFp {}
