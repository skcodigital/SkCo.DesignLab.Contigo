import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Icono } from '@features/monitor/components/comunes/icono/icono';
import { VistaMonitor } from '@features/monitor/interfaces/comunes';

/**
 * Tarjeta gris de error al cargar un módulo (`app-service-error`). En el laboratorio no hay servicios: la usan
 * las páginas para mostrar el estado de error.
 */
@Component({
  selector: 'nc-mon-error-servicio',
  imports: [Icono],
  templateUrl: './error-servicio.html',
  styleUrl: './error-servicio.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.vista-exterior]': "vista() === 'exterior'" },
})
export class ErrorServicio {
  /** El exterior respeta los espacios del texto (`white-space: break-spaces`). */
  readonly vista = input<VistaMonitor>('cliente');
}
