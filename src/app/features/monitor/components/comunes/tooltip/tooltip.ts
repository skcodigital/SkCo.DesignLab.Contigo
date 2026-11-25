import { ComponentRef, DestroyRef, Directive, ElementRef, inject, input, ViewContainerRef } from '@angular/core';
import {
  BurbujaTooltip,
  PosicionTooltip,
} from '@features/monitor/components/comunes/tooltip/burbuja-tooltip';

/**
 * Tooltip al pasar el mouse o enfocar (reemplaza `ngbTooltip`). Sin texto no muestra nada, como ng-bootstrap.
 *
 * `<span [ncMonTooltip]="'Ver más'" tooltipPosicion="left" [tooltipAncho]="true">…</span>`
 */
@Directive({
  selector: '[ncMonTooltip]',
  exportAs: 'ncMonTooltip',
  host: {
    '(mouseenter)': 'mostrar()',
    '(mouseleave)': 'ocultar()',
    '(focusin)': 'mostrar()',
    '(focusout)': 'ocultar()',
  },
})
export class Tooltip {
  readonly texto = input<string | null | undefined>(undefined, { alias: 'ncMonTooltip' });
  readonly posicion = input<PosicionTooltip>('top', { alias: 'tooltipPosicion' });
  readonly ancho = input(false, { alias: 'tooltipAncho' });

  private readonly vcr = inject(ViewContainerRef);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private burbuja: ComponentRef<BurbujaTooltip> | null = null;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.ocultar());
  }

  mostrar(): void {
    const texto = this.texto();
    if (!texto) {
      return;
    }
    const r = this.host.nativeElement.getBoundingClientRect();
    this.burbuja ??= this.vcr.createComponent(BurbujaTooltip);
    this.burbuja.setInput('texto', texto);
    this.burbuja.setInput('posicion', this.posicion());
    this.burbuja.setInput('ancha', this.ancho());
    this.burbuja.setInput('ancla', { top: r.top, left: r.left, width: r.width, height: r.height });
  }

  ocultar(): void {
    this.burbuja?.destroy();
    this.burbuja = null;
  }
}
