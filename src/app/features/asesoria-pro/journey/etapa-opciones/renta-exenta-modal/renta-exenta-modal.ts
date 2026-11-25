import { afterRenderEffect, ChangeDetectionStrategy, Component, ElementRef, inject, input, viewChild } from '@angular/core';
import { ADV_CORTA, ADV_RESTO } from '../../../constants/textos';
import { Retiro } from '../../../interfaces/calculo';
import { ConversacionesStore } from '../../../state/conversaciones.store';
import { JourneyUiStore } from '../../journey-ui.store';
import { RentaExenta } from '../renta-exenta/renta-exenta';

/**
 * Modal de renta exenta: se abre al elegir «Retiro» (o «Retiro total») o «Retiro + Crédito Impulso» cuando el retiro
 * toca aportes no exentos, y desde «Ajustar» del IBC si aún no se ha respondido. Contiene la pregunta y el desglose.
 */
@Component({
  selector: 'nc-renta-exenta-modal',
  imports: [RentaExenta],
  template: `
    @if (ui.rxModal()) {
      <div class="rxm-velo" (click)="clicVelo($event)" (keydown)="atraparFoco($event)">
        <div #caja class="rxm" role="dialog" aria-modal="true" aria-labelledby="rxm-t">
          <button type="button" class="rxm-x" aria-label="Cerrar" (click)="cerrar()">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
          <p class="rxm-eb">Para estimar el posible impuesto</p>
          <h2 id="rxm-t">Renta exenta</h2>
          <nc-renta-exenta [k]="k()" parte="pregunta" />
          <p class="rxm-adv">{{ adv }}</p>
          <div class="rxm-pie">
            <button #ok type="button" class="rxm-ok" [disabled]="!st().rx" (click)="cerrar()">Continuar</button>
          </div>
        </div>
      </div>
    }
  `,
  styleUrl: './renta-exenta-modal.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown.escape)': 'ui.rxModal() && cerrar()' },
})
export class RentaExentaModal {
  protected readonly ui = inject(JourneyUiStore);
  protected readonly st = inject(ConversacionesStore).st;

  /** Retiro sobre el que se pregunta (el de la opción elegida). */
  readonly k = input.required<Retiro>();

  protected readonly adv = ADV_CORTA + ADV_RESTO;
  private readonly caja = viewChild<ElementRef<HTMLElement>>('caja');
  private volverA: HTMLElement | null = null;

  constructor() {
    // Al abrir: foco en la primera respuesta y se recuerda a dónde devolverlo al cerrar
    afterRenderEffect(() => {
      if (!this.ui.rxModal()) return;
      const caja = this.caja()?.nativeElement;
      if (!caja || caja.contains(document.activeElement)) return;
      this.volverA = document.activeElement as HTMLElement | null;
      caja.querySelector<HTMLButtonElement>('.jw-chips button:not(:disabled)')?.focus();
    });
  }

  protected cerrar(): void {
    this.ui.cerrarRentaExenta();
    const destino = this.volverA;
    this.volverA = null;
    if (destino?.isConnected) destino.focus();
  }

  protected clicVelo(e: MouseEvent): void {
    if (e.target === e.currentTarget) this.cerrar();
  }

  /** Mantiene el foco dentro de la modal con Tab / Shift+Tab. */
  protected atraparFoco(e: KeyboardEvent): void {
    if (e.key !== 'Tab') return;
    const focos = [...(this.caja()?.nativeElement.querySelectorAll<HTMLElement>('button:not(:disabled)') ?? [])];
    const primero = focos[0];
    const ultimo = focos[focos.length - 1];
    if (e.shiftKey && document.activeElement === primero) {
      e.preventDefault();
      ultimo?.focus();
    } else if (!e.shiftKey && document.activeElement === ultimo) {
      e.preventDefault();
      primero?.focus();
    }
  }
}
