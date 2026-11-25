import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { OpcionSeleccion, VistaMonitor } from '@features/monitor/interfaces/comunes';

/**
 * Lista desplegable nativa (`app-select`, un `form-select` con flecha verde). Emite el valor de la opción
 * elegida con su tipo original (producción emitía el texto del `<option>`).
 *
 * Diferencia entre vistas: deshabilitada, el Monitor del cliente la atenúa (`disabled-custom`); el exterior
 * solo la deja con el fondo gris de Bootstrap.
 */
@Component({
  selector: 'nc-mon-seleccion',
  templateUrl: './seleccion.html',
  styleUrl: './seleccion.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Seleccion {
  readonly opciones = input.required<readonly OpcionSeleccion[]>();
  readonly seleccionado = input.required<string | number>();
  readonly deshabilitado = input(false);
  readonly vista = input<VistaMonitor>('cliente');

  readonly seleccion = output<string | number>();

  protected esSeleccionado(o: OpcionSeleccion): boolean {
    return String(o.valor) === String(this.seleccionado());
  }

  protected cambiar(valor: string): void {
    const opcion = this.opciones().find((o) => String(o.valor) === valor);
    this.seleccion.emit(opcion ? opcion.valor : valor);
  }
}
