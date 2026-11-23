import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { TEXTOS_FICHA } from '@features/ficha-cliente/constants/textos';
import { ProductoResumen, TipoProducto } from '@features/ficha-cliente/interfaces/productos';
import { MontoPipe } from '@features/ficha-cliente/pipes/monto-pipe';

/** Contrato dentro de una categoría de Productos: toda la fila abre la ficha del producto. */
@Component({
  selector: 'nc-producto-fila',
  imports: [MontoPipe],
  templateUrl: './producto-fila.html',
  styleUrl: './producto-fila.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductoFila {
  readonly producto = input.required<ProductoResumen>();
  readonly oculto = input(false);
  readonly abrir = output<TipoProducto>();

  protected readonly etiquetaAbrir = computed(() =>
    TEXTOS_FICHA.producto.verFicha(this.producto().nombre, this.producto().contrato),
  );

  /** Clic en la fila (menos en el enlace "Más"). */
  protected alFila(e: MouseEvent): void {
    if (e.target instanceof Element && e.target.closest('a')) return;
    this.abrir.emit(this.producto().tipo);
  }

  protected alBoton(e: MouseEvent): void {
    e.stopPropagation();
    this.abrir.emit(this.producto().tipo);
  }
}
