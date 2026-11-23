import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Direccion } from '@features/radiografia/interfaces/radiografia';

let siguienteId = 0;

/**
 * Variación frente al año anterior con la iconografía de Logros: % visible + ícono en círculo con
 * semáforo + tooltip (`.kpi-var` del prototipo). El host es el propio `.kpi-var`.
 *
 * `<nc-rx-variacion direccion="up" texto="+0,2%" etiqueta="Subió 0,2% frente a …" detalle="Hoy 412 clientes · oct 2025: 411" />`
 */
@Component({
  selector: 'nc-rx-variacion',
  templateUrl: './variacion.html',
  styleUrl: './variacion.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'kpi-var',
    '[class.kpi-var--up]': "direccion() === 'up'",
    '[class.kpi-var--down]': "direccion() === 'down'",
    '[class.kpi-var--flat]': "direccion() === 'flat'",
  },
})
export class Variacion {
  readonly direccion = input.required<Direccion>();
  /** "+0,2%" */
  readonly texto = input.required<string>();
  /** aria-label del botón. */
  readonly etiqueta = input.required<string>();
  /** Línea pequeña del tooltip ("Hoy 412 clientes · oct 2025: 411"). */
  readonly detalle = input('');
  readonly titulo = input('% con respecto a octubre de 2025');

  protected readonly idTip = 'tt-var-' + ++siguienteId;
}
