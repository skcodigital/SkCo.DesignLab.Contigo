import { ChangeDetectionStrategy, Component, input, model, signal } from '@angular/core';
import { ErrorServicio } from '@features/monitor/components/comunes/error-servicio/error-servicio';
import { Icono } from '@features/monitor/components/comunes/icono/icono';
import { Tooltip } from '@features/monitor/components/comunes/tooltip/tooltip';
import { Modal } from '@features/monitor/components/detalle/modal/modal';
import { TEXTOS_DETALLE } from '@features/monitor/constants/textos-detalle';
import { PlazoCdt } from '@features/monitor/interfaces/detalle';
import { alternarId, tituloPalabras } from '@features/monitor/utils/detalle-listas';

/**
 * Plazos CDT para comparar (`cdt-list`, panel «Comparar» del Monitor del cliente): aviso con «Conoce más aquí.»
 * (abre la modal «Más información sobre CDTs») y una tarjeta por plazo con su color; cada clic marca o desmarca
 * (`[(seleccionados)]`, por subcuenta).
 */
@Component({
  selector: 'nc-mon-lista-cdt',
  imports: [ErrorServicio, Icono, Modal, Tooltip],
  templateUrl: './lista-cdt.html',
  styleUrl: './lista-cdt.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListaCdt {
  readonly plazos = input<readonly PlazoCdt[]>([]);
  /** Subcuentas marcadas. */
  readonly seleccionados = model<readonly string[]>([]);
  readonly conError = input(false);

  protected readonly infoAbierta = signal(false);

  protected alternar(subcuenta: string): void {
    this.seleccionados.set(alternarId(this.seleccionados(), subcuenta));
  }

  protected titulo(descripcion: string): string {
    return tituloPalabras(descripcion);
  }

  protected tooltip(p: PlazoCdt): string {
    return TEXTOS_DETALLE.listas.tooltipCdt(p.descripcion.toLowerCase());
  }
}
