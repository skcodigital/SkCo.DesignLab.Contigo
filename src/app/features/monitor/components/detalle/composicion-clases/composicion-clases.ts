import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { GraficaTortaCompacta } from '@features/monitor/components/comunes/grafica-torta-compacta/grafica-torta-compacta';
import { FormatoRegional, PorcionTortaCompacta, VistaMonitor } from '@features/monitor/interfaces/comunes';
import { formatearNumero } from '@features/monitor/utils/formatos';

/**
 * Composición en torta con su lista de porciones en dos columnas (punto de color, % en negrita y nombre), como la
 * pintan `tendency` y `asset-trend`. En móvil la lista va arriba de la torta (`flex-column-reverse`).
 */
@Component({
  selector: 'nc-mon-composicion-clases',
  imports: [GraficaTortaCompacta],
  templateUrl: './composicion-clases.html',
  styleUrl: './composicion-clases.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.invertida]': 'invertida()' },
})
export class ComposicionClases {
  readonly porciones = input<readonly PorcionTortaCompacta[]>([]);
  /** Formato del % (`1,5` en el cliente, `1.5` en el exterior). */
  readonly vista = input<VistaMonitor>('cliente');
  readonly invertida = input(false);

  private readonly formato = computed<FormatoRegional>(() => (this.vista() === 'cliente' ? 'es-CO' : 'en-US'));

  protected porcentaje(valor: number): string {
    return formatearNumero(valor, 0, 2, this.formato());
  }
}
