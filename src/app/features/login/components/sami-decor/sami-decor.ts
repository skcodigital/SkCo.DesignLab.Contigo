import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/**
 * Sami decorativo del panel derecho (imagen oficial `assets/sami-grande.png`) con íconos de trazo
 * detrás y delante. Flota en bucle y salta cuando cambia la diapositiva del carrusel.
 */
@Component({
  selector: 'div[nc-sami-decor]',
  templateUrl: './sami-decor.html',
  styleUrl: './sami-decor.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'aria-hidden': 'true',
    '[class.salta]': 'saltaA()',
    '[class.salta-b]': 'saltaB()',
  },
})
export class SamiDecor {
  /**
   * Contador de saltos (0 = quieto). Alterna dos clases con la misma animación para reiniciarla
   * en saltos seguidos sin tocar el DOM.
   */
  readonly salto = input(0);

  protected readonly saltaA = computed(() => this.salto() % 2 === 1);
  protected readonly saltaB = computed(() => this.salto() > 0 && this.salto() % 2 === 0);
}
