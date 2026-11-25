import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  untracked,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { RUTAS } from '@core/constants/rutas';
import { AvisoStore } from '@core/state/aviso.store';
import { Icono } from '@features/monitor/components/comunes/icono/icono';
import { Tooltip } from '@features/monitor/components/comunes/tooltip/tooltip';
import { Comparacion } from '@features/monitor/components/detalle/comparacion/comparacion';
import { Modal } from '@features/monitor/components/detalle/modal/modal';
import { Asistente } from '@features/monitor/components/exterior/asistente/asistente';
import { PanelSeleccion } from '@features/monitor/components/exterior/panel-seleccion/panel-seleccion';
import { TEXTOS } from '@features/monitor/constants/textos';
import { TEXTOS_EXTERIOR } from '@features/monitor/constants/textos-exterior';
import { DEMORA_RESPUESTA_MS } from '@features/monitor/data/exterior-asistente.mock';
import { MonitorExteriorStore } from '@features/monitor/stores/monitor-exterior.store';
import { estadoExterior } from '@features/monitor/utils/exterior-seleccion';

/**
 * Monitor Contigo exterior (`/monitor`, `<monitor-exterior-element>` de producción): migas, encabezado con
 * «Monitor antiguo», «Asistente» y pantallazo, «Selecciona y compara» a la izquierda, la comparación y el aviso
 * legal. En móvil, «Compara» abre «Selecciona y compara» en una modal de pantalla completa.
 *
 * Estados de ejemplo por la URL: `?estado=error` (servicios caídos), `?estado=ejemplo` (con una selección) y
 * `?estado=ejemplo-cdt` (comparada contra un CDT a 90 días).
 */
@Component({
  selector: 'nc-monitor-exterior-page',
  imports: [Asistente, Comparacion, Icono, Modal, PanelSeleccion, RouterLink, Tooltip],
  providers: [MonitorExteriorStore],
  templateUrl: './monitor-exterior-page.html',
  styleUrl: './monitor-exterior-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MonitorExteriorPage {
  /** Query param `estado` (ver `EstadoExterior`). */
  readonly estado = input<string>();

  protected readonly store = inject(MonitorExteriorStore);
  private readonly avisos = inject(AvisoStore);

  protected readonly inicio = ['/', RUTAS.inicio];
  protected readonly tooltipPantallazo = TEXTOS_EXTERIOR.tooltipPantallazo;

  private temporizador?: ReturnType<typeof setTimeout>;

  constructor() {
    // Sincroniza el estado de ejemplo de la URL con el store.
    effect(() => {
      const estado = estadoExterior(this.estado());
      untracked(() => this.store.configurar(estado));
    });
    inject(DestroyRef).onDestroy(() => clearTimeout(this.temporizador));
  }

  /** En producción abre el Monitor anterior en otra pestaña; aquí no hay a dónde ir. */
  protected abrirMonitorAntiguo(): void {
    this.avisos.mostrar(TEXTOS_EXTERIOR.sinMonitorAntiguo);
  }

  /** En producción descarga una imagen de la vista y la copia al portapapeles. */
  protected tomarPantallazo(): void {
    this.avisos.mostrar(TEXTOS.sinDescargas);
  }

  /** El asistente responde con un ejemplo fijo tras un momento «Escribiendo». */
  protected enviarAlAsistente(texto: string): void {
    this.store.enviarAlAsistente(texto);
    clearTimeout(this.temporizador);
    this.temporizador = setTimeout(() => this.store.responderAsistente(), DEMORA_RESPUESTA_MS);
  }
}
