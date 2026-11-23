import { ChangeDetectionStrategy, Component, computed, ElementRef, input, signal, viewChild } from '@angular/core';
import { DetalleProducto } from '@features/ficha-cliente/interfaces/productos';
import { etiquetaRendimientos, gradienteRendimientos } from '@features/ficha-cliente/utils/composicion';

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
  /** Un punto por tarjeta (el FIC no tiene la de beneficio de permanencia). */
  protected readonly puntos = computed(() => (this.producto().beneficio ? [0, 1, 2] : [0, 1]));
  protected readonly donaGradiente = computed(() => gradienteRendimientos(this.producto().pctRendimientos));
  protected readonly donaEtiqueta = computed(() => etiquetaRendimientos(this.producto().pctRendimientos));
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
