import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Icono } from '@features/monitor/components/comunes/icono/icono';
import { TEXTOS } from '@features/monitor/constants/textos';

/**
 * Aviso azul que tapa la gráfica cuando no hay datos (`empty-data-chart`). Va en posición absoluta arriba del
 * contenedor de la gráfica (que debe ser `position: relative`).
 */
@Component({
  selector: 'nc-mon-grafica-sin-datos',
  imports: [Icono],
  templateUrl: './grafica-sin-datos.html',
  styleUrl: './grafica-sin-datos.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GraficaSinDatos {
  readonly mensaje = input<string>(TEXTOS.graficas.sinDatosMensaje);
  /** Imagen propia en lugar del ícono de información. */
  readonly imagen = input<string | null>(null);
}
