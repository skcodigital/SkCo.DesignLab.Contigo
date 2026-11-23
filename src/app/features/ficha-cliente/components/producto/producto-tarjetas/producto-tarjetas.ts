import { ChangeDetectionStrategy, Component, ElementRef, input, signal, viewChild } from '@angular/core';
import { DetalleProducto } from '@features/ficha-cliente/interfaces/productos';

/** Tarjetas del producto: saldo principal, evolución histórica y beneficio de permanencia (+ puntos del carrusel). */
@Component({
  selector: 'nc-producto-tarjetas',
  templateUrl: './producto-tarjetas.html',
  styleUrl: './producto-tarjetas.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductoTarjetas {
  readonly producto = input.required<DetalleProducto>();

  private readonly carrusel = viewChild.required<ElementRef<HTMLElement>>('carrusel');
  protected readonly puntos = [0, 1, 2] as const;
  protected readonly activa = signal(0);

  /** Carrusel (móvil): el punto activo es la tarjeta más cercana al centro. */
  protected alDesplazar(): void {
    const cards = this.carrusel().nativeElement;
    const centro = cards.scrollLeft + cards.clientWidth / 2;
    let k = 0;
    let min = Number.POSITIVE_INFINITY;
    Array.from(cards.children).forEach((h, i) => {
      if (!(h instanceof HTMLElement)) return;
      const d = Math.abs(h.offsetLeft + h.offsetWidth / 2 - centro);
      if (d < min) {
        min = d;
        k = i;
      }
    });
    this.activa.set(k);
  }
}
