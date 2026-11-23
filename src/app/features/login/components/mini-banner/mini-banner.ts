import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  signal,
} from '@angular/core';
import { injectMediaQuery } from '@core/utils/media-query';
import { TIEMPOS_LOGIN, UMBRAL_SWIPE } from '../../constants/textos';
import { NOVEDADES_MINI } from '../../data/login.mock';

/**
 * Banner mínimo del login en móvil (≤900px, el panel derecho se oculta): carrusel de novedades cada 7 s,
 * se desliza con el dedo o el mouse, tiene puntos y se pausa al tocarlo o mientras se escribe.
 */
@Component({
  selector: 'aside[nc-mini-banner]',
  templateUrl: './mini-banner.html',
  styleUrl: './mini-banner.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'aria-roledescription': 'carrusel',
    'aria-label': 'Novedades para asesores',
    '[class.arrastra]': 'arrastra()',
    '(pointerdown)': 'presionar($event)',
    '(window:pointerup)': 'soltar($event)',
    '(window:pointercancel)': 'cancelar()',
  },
})
export class MiniBanner {
  /** El banner está a la vista (en el prototipo: `offsetParent` no nulo). */
  readonly visible = input(false);
  /** Pausa externa: el asesor está escribiendo en un campo del login. */
  readonly pausaExterna = input(false);

  protected readonly novedades = NOVEDADES_MINI;
  protected readonly indice = signal(0);
  protected readonly arrastra = signal(false);
  /** Contador de saltos de Sami (alterna dos clases para reiniciar la animación). */
  private readonly salto = signal(0);
  protected readonly saltaA = computed(() => this.salto() % 2 === 1);
  protected readonly saltaB = computed(() => this.salto() > 0 && this.salto() % 2 === 0);

  private readonly quieto = injectMediaQuery('(prefers-reduced-motion: reduce)');
  private readonly pausaPuntero = signal(false);
  private x0: number | null = null;
  private timer: ReturnType<typeof setInterval> | undefined;

  constructor() {
    inject(DestroyRef).onDestroy(() => clearInterval(this.timer));
    afterNextRender(() => this.reproducir());
  }

  protected etiqueta(i: number): string {
    return `${i + 1} de ${this.novedades.length}`;
  }

  protected elegir(i: number): void {
    this.ir(i);
    this.reproducir();
  }

  protected presionar(e: PointerEvent): void {
    if ((e.target as Element).closest('button')) return;
    this.x0 = e.clientX;
    this.pausaPuntero.set(true);
    this.arrastra.set(true);
  }

  protected soltar(e: PointerEvent): void {
    this.arrastra.set(false);
    this.pausaPuntero.set(false);
    if (this.x0 === null) return;
    const dx = e.clientX - this.x0;
    this.x0 = null;
    if (Math.abs(dx) > UMBRAL_SWIPE) {
      this.ir(this.indice() + (dx < 0 ? 1 : -1));
      this.reproducir();
    }
  }

  protected cancelar(): void {
    this.x0 = null;
    this.pausaPuntero.set(false);
    this.arrastra.set(false);
  }

  private reproducir(): void {
    clearInterval(this.timer);
    if (this.quieto()) return;
    this.timer = setInterval(() => {
      if (!this.pausaPuntero() && !this.pausaExterna() && this.visible()) this.ir(this.indice() + 1);
    }, TIEMPOS_LOGIN.carrusel);
  }

  private ir(n: number): void {
    const total = this.novedades.length;
    this.indice.set((n + total) % total);
    if (!this.quieto()) this.salto.update((s) => s + 1);
  }
}
