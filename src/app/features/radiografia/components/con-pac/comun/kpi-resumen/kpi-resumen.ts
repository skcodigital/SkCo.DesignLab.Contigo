import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { Plegable } from '@features/radiografia/components/comunes/plegable/plegable';
import { Variacion } from '@features/radiografia/components/comunes/variacion/variacion';
import { KpiResumen } from '@features/radiografia/interfaces/resumen';
import { RadiografiaStore } from '@features/radiografia/state/radiografia.store';

let siguienteId = 0;

/**
 * Tarjeta (`.kpi`) del Resumen: etiqueta con ayuda, cifra (con variación o enlace al listado), subtítulo
 * y desglose por quién gestiona. En celular se expande y se comprime (`ncRxPlegable`).
 * El host es `display: contents`: la tarjeta es la celda de la grilla `.kpis` del panel.
 */
@Component({
  selector: 'nc-rx-kpi-resumen',
  imports: [Plegable, Variacion],
  templateUrl: './kpi-resumen.html',
  styleUrl: './kpi-resumen.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KpiResumenCard {
  readonly kpi = input.required<KpiResumen>();

  protected readonly store = inject(RadiografiaStore);
  private readonly n = ++siguienteId;
  protected readonly idTarjeta = 'plg-' + this.n;
  protected readonly idTip = 'tip-kpi-' + this.n;
}
