import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { injectMediaQuery } from '@core/utils/media-query';
import { TIEMPOS_LOGIN } from '../../constants/textos';
import { LoginSlide } from '../../interfaces/login.interfaces';
import { ChipIcono } from '../chip-icono/chip-icono';

/**
 * Carrusel del panel derecho (patrón de Portal Clientes): flechas, puntos, teclado y avance automático
 * cada 7 s con pausa al pasar el mouse o al enfocar. Con una sola diapositiva no hay flechas, puntos ni avance.
 */
@Component({
  selector: 'div[nc-login-carousel]',
  imports: [ChipIcono],
  templateUrl: './login-carousel.html',
  styleUrl: './login-carousel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'region',
    'aria-roledescription': 'carrusel',
    'aria-label': 'Novedades para asesores',
    '(keydown)': 'teclado($event)',
    '(mouseenter)': 'detener()',
    '(mouseleave)': 'reproducir()',
    '(focusin)': 'detener()',
    '(focusout)': 'reproducir()',
  },
})
export class LoginCarousel {
  readonly slides = input.required<readonly LoginSlide[]>();
  /** Cambió de diapositiva (no se emite en la carga inicial): hace saltar a Sami. */
  readonly cambio = output<void>();

  protected readonly indice = signal(0);
  protected readonly multiples = computed(() => this.slides().length > 1);

  private readonly quieto = injectMediaQuery('(prefers-reduced-motion: reduce)');
  private timer: ReturnType<typeof setInterval> | undefined;

  constructor() {
    inject(DestroyRef).onDestroy(() => clearInterval(this.timer));
    afterNextRender(() => this.reproducir());
  }

  protected etiqueta(i: number): string {
    return `${i + 1} de ${this.slides().length}`;
  }

  protected anterior(): void {
    this.ir(this.indice() - 1);
    this.reproducir();
  }

  protected siguiente(): void {
    this.ir(this.indice() + 1);
    this.reproducir();
  }

  protected elegir(i: number): void {
    this.ir(i);
    this.reproducir();
  }

  protected teclado(e: KeyboardEvent): void {
    if (!this.multiples()) return;
    if (e.key === 'ArrowLeft') this.ir(this.indice() - 1);
    if (e.key === 'ArrowRight') this.ir(this.indice() + 1);
  }

  protected reproducir(): void {
    if (!this.multiples() || this.quieto()) return;
    clearInterval(this.timer);
    this.timer = setInterval(() => this.ir(this.indice() + 1), TIEMPOS_LOGIN.carrusel);
  }

  protected detener(): void {
    clearInterval(this.timer);
  }

  private ir(n: number): void {
    const total = this.slides().length;
    this.indice.set((n + total) % total);
    this.cambio.emit();
  }
}
