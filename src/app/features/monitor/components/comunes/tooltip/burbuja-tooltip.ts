import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/** Lado del elemento donde aparece el tooltip (`placement` de ng-bootstrap; `start` = izquierda). */
export type PosicionTooltip = 'top' | 'bottom' | 'left' | 'right' | 'start';

/** Rectángulo del elemento que abre el tooltip, en coordenadas de la ventana. */
export interface RectAncla {
  top: number;
  left: number;
  width: number;
  height: number;
}

/**
 * Burbuja del tooltip (`ngbTooltip` de Bootstrap 5): fondo negro al 90 %, texto blanco de 14px y flecha. La crea
 * la directiva `ncMonTooltip`; va fija en la ventana para que no la recorte el scroll de una tabla.
 */
@Component({
  selector: 'nc-mon-burbuja-tooltip',
  templateUrl: './burbuja-tooltip.html',
  styleUrl: './burbuja-tooltip.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'tooltip',
    '[class]': 'lado()',
    '[class.ancha]': 'ancha()',
    '[style.top.px]': 'punto().top',
    '[style.left.px]': 'punto().left',
  },
})
export class BurbujaTooltip {
  readonly texto = input.required<string>();
  readonly ancla = input.required<RectAncla>();
  readonly posicion = input<PosicionTooltip>('top');
  /** `tooltip-header-wide` de producción: hasta 400px, alineado a la izquierda y respetando saltos de línea. */
  readonly ancha = input(false);

  protected readonly lado = computed(() => {
    const p = this.posicion();
    return p === 'start' ? 'left' : p;
  });

  protected readonly punto = computed(() => {
    const a = this.ancla();
    switch (this.lado()) {
      case 'bottom':
        return { top: a.top + a.height, left: a.left + a.width / 2 };
      case 'left':
        return { top: a.top + a.height / 2, left: a.left };
      case 'right':
        return { top: a.top + a.height / 2, left: a.left + a.width };
      default:
        return { top: a.top, left: a.left + a.width / 2 };
    }
  });
}
