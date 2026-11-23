import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { PESTANAS_PRODUCTO } from '@features/ficha-cliente/constants/pestanas';
import { PestanaProductoId } from '@features/ficha-cliente/interfaces/pestanas';

/** Secciones del producto (pestañas en escritorio, filas en móvil). */
@Component({
  selector: 'nc-producto-tabs',
  templateUrl: './producto-tabs.html',
  styleUrl: './producto-tabs.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductoTabs {
  readonly activa = input.required<PestanaProductoId>();
  readonly elegir = output<PestanaProductoId>();

  protected readonly pestanas = PESTANAS_PRODUCTO;
}
