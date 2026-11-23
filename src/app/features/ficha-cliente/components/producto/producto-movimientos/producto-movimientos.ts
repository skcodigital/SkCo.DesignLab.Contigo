import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Movimiento } from '@features/ficha-cliente/interfaces/productos';

/** Sección Movimientos del FIC: tabla con tipo, fecha y valores bruto / neto. */
@Component({
  selector: 'nc-producto-movimientos',
  templateUrl: './producto-movimientos.html',
  styleUrl: './producto-movimientos.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductoMovimientos {
  readonly movimientos = input.required<readonly Movimiento[]>();
}
