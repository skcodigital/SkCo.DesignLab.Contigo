import { afterRenderEffect, ChangeDetectionStrategy, Component, ElementRef, input, model, viewChild } from '@angular/core';

/**
 * Modal de éxito al registrar el cierre del acompañamiento (Acuerdo). Mismo diseño que la modal
 * «¿Por qué descartas esta misión?», con ícono de éxito; en modo misión toma la variante grafito.
 */
@Component({
  selector: 'nc-cierre-exitoso-modal',
  template: `
    @if (abierta()) {
      <div class="pp-md-velo" (click)="clicVelo($event)" (keydown)="atraparFoco($event)">
        <div #caja class="pp-md" role="dialog" aria-modal="true" aria-labelledby="pp-cierre-tit" aria-describedby="pp-cierre-d">
          <button type="button" class="pp-md-x" aria-label="Cerrar" (click)="cerrar()">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
          <span class="pp-md-ico">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 5 5 9-10" /></svg>
          </span>
          <h2 id="pp-cierre-tit">Gracias a tu acompañamiento, tu cliente tomará mejores decisiones.</h2>
          <p id="pp-cierre-d">
            @if (alCliente()) {
              Hemos enviado a ti y a tu cliente un resumen de la conversación de hoy a sus respectivos correos registrados.
            } @else {
              Te hemos enviado el resumen de la conversación de hoy a tu correo.
            }
          </p>
          <button #ok type="button" class="pp-md-ok" (click)="cerrar()">Entendido</button>
        </div>
      </div>
    }
  `,
  styleUrl: './cierre-exitoso-modal.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown.escape)': 'abierta() && cerrar()' },
})
export class CierreExitosoModal {
  readonly abierta = model(false);
  /** «Enviar resumen de la conversación al cliente» marcado en Próximos pasos. */
  readonly alCliente = input(false);

  private readonly caja = viewChild<ElementRef<HTMLElement>>('caja');
  private readonly ok = viewChild<ElementRef<HTMLButtonElement>>('ok');
  private volverA: HTMLElement | null = null;

  constructor() {
    // Al abrir: foco en «Entendido» y se recuerda a dónde devolver el foco al cerrar.
    afterRenderEffect(() => {
      if (!this.abierta()) return;
      const caja = this.caja()?.nativeElement;
      if (!caja || caja.contains(document.activeElement)) return;
      this.volverA = document.activeElement as HTMLElement | null;
      this.ok()?.nativeElement.focus();
    });
  }

  protected cerrar(): void {
    this.abierta.set(false);
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
    const focos = [...(this.caja()?.nativeElement.querySelectorAll<HTMLElement>('button') ?? [])];
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
