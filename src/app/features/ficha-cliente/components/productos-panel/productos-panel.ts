import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ProductoFila } from '@features/ficha-cliente/components/producto-fila/producto-fila';
import { CategoriaProductos } from '@features/ficha-cliente/interfaces/productos';

/**
 * Contenido de la pestaña Productos: categorías en acordeón con sus contratos, Monitor Contigo y,
 * en móvil, "Ir a Pipeline" y el aviso legal. Se pinta dentro del `section.panel` de la página.
 */
@Component({
  selector: 'nc-productos-panel',
  imports: [ProductoFila],
  templateUrl: './productos-panel.html',
  styleUrl: './productos-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductosPanel {
  readonly categorias = input.required<readonly CategoriaProductos[]>();
  readonly oculto = input(false);
  readonly abrirProducto = output<void>();
}
