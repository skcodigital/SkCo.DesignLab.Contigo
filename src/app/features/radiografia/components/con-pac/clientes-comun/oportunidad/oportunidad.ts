import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { ChartTip } from '@features/radiografia/components/comunes/chart-tip/chart-tip.directive';
import { Variacion } from '@features/radiografia/components/comunes/variacion/variacion';
import { Icono } from '@features/radiografia/components/con-pac/clientes-comun/icono/icono';
import { TEXTOS_CLIENTES } from '@features/radiografia/constants/textos-clientes';
import { TramoOportunidad } from '@features/radiografia/interfaces/clientes';
import { RadiografiaStore } from '@features/radiografia/state/radiografia.store';
import { pctAncho } from '@features/radiografia/utils/graficas-clientes';

/**
 * "La oportunidad": empleados, clientes Skandia (abre el listado), sin relación y la barra de clientes
 * activos por quién los atiende. Director y FP Asignado cambian solo los tramos de la barra.
 */
@Component({
  selector: 'nc-rx-oportunidad',
  imports: [ChartTip, Variacion, Icono],
  templateUrl: './oportunidad.html',
  styleUrl: './oportunidad.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Oportunidad {
  protected readonly store = inject(RadiografiaStore);

  readonly tramos = input.required<readonly TramoOportunidad[]>();
  readonly etiquetaBarra = input.required<string>();
  /** Sufijo de los ids (`-own` en la vista del FP Asignado). */
  readonly sufijo = input('');

  protected readonly tituloTip = TEXTOS_CLIENTES.tip.clientesActivos;

  protected tip(t: TramoOportunidad): string {
    return `${t.leyenda}: ${t.valor} empleados · ${pctAncho(t.ancho)}`;
  }
}
