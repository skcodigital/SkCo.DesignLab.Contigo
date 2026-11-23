import { afterNextRender, DestroyRef, Directive, ElementRef, inject, input, output } from '@angular/core';
import { UiStore } from '@core/state/ui.store';

const ENFOCABLES = 'button, input:not([disabled]), textarea, a[href]';

/**
 * Comportamiento común de las capas (overlay) de la radiografía, que en el prototipo repetía cada modal:
 * - al montarse bloquea el scroll de la página y enfoca `ncRxDialogoFoco` (por defecto la X);
 * - Escape y el clic en el fondo emiten `cerrar`;
 * - Tab no deja salir el foco de la capa;
 * - al desmontarse devuelve el foco a quien la abrió.
 * Se usa sobre el elemento `.overlay` / `.drawer-overlay`, que el padre pinta con `@if`.
 */
@Directive({
  selector: '[ncRxDialogo]',
  host: {
    '(click)': 'alClic($event)',
    '(keydown)': 'alTeclear($event)',
  },
})
export class Dialogo {
  /** Selector (dentro de la capa) que recibe el foco al abrir. */
  readonly foco = input('.modal-close', { alias: 'ncRxDialogoFoco' });
  readonly cerrar = output<void>();

  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly ui = inject(UiStore);
  private readonly previo = document.activeElement instanceof HTMLElement ? document.activeElement : null;

  constructor() {
    this.ui.set('pp-md-abierta', true);
    afterNextRender(() => this.el.nativeElement.querySelector<HTMLElement>(this.foco())?.focus());
    inject(DestroyRef).onDestroy(() => {
      this.ui.set('pp-md-abierta', false);
      if (this.previo?.isConnected) this.previo.focus();
    });
  }

  protected alClic(e: MouseEvent): void {
    if (e.target === this.el.nativeElement) this.cerrar.emit();
  }

  protected alTeclear(e: KeyboardEvent): void {
    if (e.key === 'Escape') {
      this.cerrar.emit();
      return;
    }
    if (e.key !== 'Tab') return;
    const f = [...this.el.nativeElement.querySelectorAll<HTMLElement>(ENFOCABLES)].filter((x) => x.offsetParent);
    if (!f.length) return;
    const primero = f[0];
    const ultimo = f[f.length - 1];
    if (e.shiftKey && document.activeElement === primero) {
      e.preventDefault();
      ultimo.focus();
    } else if (!e.shiftKey && document.activeElement === ultimo) {
      e.preventDefault();
      primero.focus();
    }
  }
}
