import { Directive, input, linkedSignal } from '@angular/core';
import { injectMediaQuery } from '@core/utils/media-query';
import { MQ_MOBILE } from '@core/constants/breakpoints';

/**
 * Celular: tarjeta del Resumen que se expande y se comprime (arranca comprimida dejando ver su valor).
 * En escritorio queda siempre abierta. Uso:
 *
 * ```html
 * <article class="kpi" ncRxPlegable #p="ncRxPlegable" nombre="Clientes">
 *   <button type="button" class="plg-btn" [attr.aria-expanded]="!p.plegado()" [attr.aria-label]="p.etiqueta()"
 *           (click)="p.alternar($event)"><svg …chevron…/></button>
 *   <span class="kpi-label" (click)="p.alCabecera($event)">Clientes …</span>
 *   …
 * </article>
 * ```
 * Los estilos (`.plegable`, `.plegado`, `.plg-btn`) están en `styles/_rx-card.scss`.
 */
@Directive({
  selector: '[ncRxPlegable]',
  exportAs: 'ncRxPlegable',
  host: {
    class: 'plegable',
    '[class.plegado]': 'plegado()',
  },
})
export class Plegable {
  /** Nombre de la tarjeta para el aria-label del botón ("Expandir …" / "Comprimir …"). */
  readonly nombre = input('');

  private readonly movil = injectMediaQuery(MQ_MOBILE);
  /** Se reinicia al cambiar de escritorio a celular y viceversa. */
  readonly plegado = linkedSignal(() => this.movil());

  etiqueta(): string {
    return (this.plegado() ? 'Expandir ' : 'Comprimir ') + this.nombre();
  }

  alternar(e: Event): void {
    e.stopPropagation();
    this.plegado.update((p) => !p);
  }

  /** Tocar la cabecera también alterna (solo en celular y fuera de tooltips, enlaces y botones). */
  alCabecera(e: Event): void {
    const t = e.target instanceof Element ? e.target : null;
    if (!this.movil() || t?.closest('.tip, .tip-wrap, a, button')) return;
    this.plegado.update((p) => !p);
  }
}
