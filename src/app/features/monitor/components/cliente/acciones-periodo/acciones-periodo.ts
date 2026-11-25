import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Icono } from '@features/monitor/components/comunes/icono/icono';
import { Seleccion } from '@features/monitor/components/comunes/seleccion/seleccion';
import { SelectorFechas } from '@features/monitor/components/comunes/selector-fechas/selector-fechas';
import { RangoFechas } from '@features/monitor/interfaces/comunes';
import { OPCIONES_PERIODO_CLIENTE, PERIODO_CLIENTE } from '@features/monitor/utils/cliente-periodos';

/**
 * Periodo de la pestaña (`buttonActions` de la página): lista de periodos, el rango con el ícono de calendario
 * (oculto en móvil) y, con «Personalizado», el selector de fechas.
 */
@Component({
  selector: 'nc-mon-acciones-periodo',
  imports: [Icono, Seleccion, SelectorFechas],
  template: `
    <nc-mon-seleccion [opciones]="opciones" [seleccionado]="periodo()" (seleccion)="periodoCambio.emit(+$event)" />
    @if (insignia()) {
      <div class="contenedor-insignia">
        <p class="insignia"><nc-mon-icono class="calendario" nombre="calendario" />{{ insignia() }}</p>
      </div>
    }
    @if (periodo() === personalizado) {
      <nc-mon-selector-fechas [rangoInicial]="rangoPersonalizado()" [hoy]="hoy()" (rangoCambio)="rangoCambio.emit($event)" />
    }
  `,
  styleUrl: './acciones-periodo.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccionesPeriodo {
  readonly periodo = input.required<number>();
  /** Rango junto a la lista (vacío con «Desde el inicio» y «Personalizado»). */
  readonly insignia = input('');
  readonly rangoPersonalizado = input<RangoFechas | null>(null);
  readonly hoy = input<Date>(new Date());

  readonly periodoCambio = output<number>();
  readonly rangoCambio = output<RangoFechas>();

  protected readonly opciones = OPCIONES_PERIODO_CLIENTE;
  protected readonly personalizado = PERIODO_CLIENTE.personalizado;
}
