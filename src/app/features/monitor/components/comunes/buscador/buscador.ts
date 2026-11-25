import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Icono } from '@features/monitor/components/comunes/icono/icono';
import { VistaMonitor } from '@features/monitor/interfaces/comunes';

/**
 * Buscador con título a la izquierda (`app-search`): emite el texto en cada tecla.
 *
 * Diferencias entre vistas: en el cliente la lupa va en un recuadro blanco con borde y el título centrado
 * verticalmente; en el exterior la lupa va en el recuadro gris de Bootstrap y el campo tiene borde azul claro.
 */
@Component({
  selector: 'nc-mon-buscador',
  imports: [Icono],
  templateUrl: './buscador.html',
  styleUrl: './buscador.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.vista-exterior]': "vista() === 'exterior'" },
})
export class Buscador {
  readonly titulo = input('');
  readonly placeholder = input('');
  readonly vista = input<VistaMonitor>('cliente');

  readonly criterio = output<string>();
}
