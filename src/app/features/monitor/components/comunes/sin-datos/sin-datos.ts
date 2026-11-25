import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { Icono } from '@features/monitor/components/comunes/icono/icono';
import { Estilos, TipoAviso } from '@features/monitor/interfaces/comunes';

/**
 * Tarjeta gris de «sin datos» (`app-not-data`): ícono de alerta del color del tipo, título, descripción (los
 * saltos de línea `\n` se respetan), etiqueta «¡Pronto!» y botón opcional «Subir archivo».
 */
@Component({
  selector: 'nc-mon-sin-datos',
  imports: [Icono],
  templateUrl: './sin-datos.html',
  styleUrl: './sin-datos.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SinDatos {
  readonly titulo = input.required<string>();
  readonly descripcion = input('');
  readonly tipo = input<TipoAviso>('info');
  /** Muestra el botón «Subir archivo». */
  readonly conAccion = input(false);
  readonly mostrarPronto = input(false);
  readonly estiloDescripcion = input<Estilos | null>(null);

  readonly accion = output<void>();

  protected readonly lineas = computed(() => this.descripcion().split('\n'));
}
