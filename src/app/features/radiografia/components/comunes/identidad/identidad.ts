import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TEXTOS } from '@features/radiografia/constants/textos';
import { FP_ASIGNADO } from '@features/radiografia/data/ruta-accion.mock';
import { PlanEmpresa, Vista } from '@features/radiografia/interfaces/radiografia';

/** Franja de identidad: chip de la vista, NIT, empleados, quién implementó el plan (o FP Asignado) y agencia. */
@Component({
  selector: 'nc-rx-identidad',
  templateUrl: './identidad.html',
  styleUrl: './identidad.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Identidad {
  readonly vista = input.required<Vista>();
  readonly plan = input.required<PlanEmpresa>();
  /** Sin PAC: asesor elegido como FP Asignado (o `null`). */
  readonly fpAsignado = input<string | null>(null);

  protected readonly sinPac = computed(() => this.plan() === 'sin');
  protected readonly nit = computed(() => (this.sinPac() ? 'NIT 901.234.567-8' : 'NIT 900.456.789-1'));
  protected readonly empleados = computed(() => (this.sinPac() ? '120 empleados' : '1.250 empleados'));
  protected readonly responsable = computed(() => {
    if (!this.sinPac()) return 'Plan implementado por: ' + FP_ASIGNADO;
    const fp = this.fpAsignado();
    return fp ? TEXTOS.sinPac.fpAsignado + fp.replace(' (director comercial)', '') : TEXTOS.sinPac.sinFp;
  });
}
