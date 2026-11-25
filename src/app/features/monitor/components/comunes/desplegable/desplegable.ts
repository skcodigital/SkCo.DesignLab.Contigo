import { ChangeDetectionStrategy, Component, input, linkedSignal, output } from '@angular/core';
import { Icono } from '@features/monitor/components/comunes/icono/icono';
import { EtiquetaDesplegable, NombreIcono, VistaMonitor } from '@features/monitor/interfaces/comunes';

/**
 * Sección plegable con título (`app-dropdown`): ícono opcional, título y subtítulo, chevron (al lado del título
 * o a la derecha), etiqueta de estado y punto azul de novedad. El contenido se proyecta.
 *
 * Diferencias entre vistas: el Monitor del cliente arranca abierto y deja 8px debajo del encabezado; el
 * exterior arranca cerrado. `abiertoInicial` las reemplaza.
 */
@Component({
  selector: 'nc-mon-desplegable',
  imports: [Icono],
  templateUrl: './desplegable.html',
  styleUrl: './desplegable.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.vista-cliente]': "vista() === 'cliente'" },
})
export class Desplegable {
  readonly titulo = input('');
  readonly subtitulo = input('');
  readonly icono = input<NombreIcono | null>(null);
  /** Tamaño del ícono (p. ej. '14px'). */
  readonly tamanoIcono = input('');
  /** Chevron a la derecha (izquierda/derecha) en vez de junto al título; arranca cerrado. */
  readonly iconoDerecha = input(false);
  readonly abiertoInicial = input<boolean | undefined>(undefined);
  readonly mostrarEtiqueta = input(false);
  readonly etiqueta = input<EtiquetaDesplegable | null>(null);
  readonly conPunto = input(false);
  readonly vista = input<VistaMonitor>('cliente');

  /** Se abrió la sección. */
  readonly abierto = output<void>();

  protected readonly colapsado = linkedSignal(
    () => this.iconoDerecha() || !(this.abiertoInicial() ?? this.vista() === 'cliente'),
  );

  protected alternar(): void {
    this.colapsado.update((c) => !c);
    if (!this.colapsado()) {
      this.abierto.emit();
      // Producción avisaba un resize para que las gráficas de adentro tomen el ancho.
      setTimeout(() => window.dispatchEvent(new Event('resize')));
    }
  }

  /** Cierra la sección. */
  cerrar(): void {
    this.colapsado.set(true);
  }
}
