import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DetalleProducto } from '@features/ficha-cliente/interfaces/productos';

/** Móvil: contrato como en Portal Clientes (identidad arriba, una tarjeta principal, beneficio compacto). */
@Component({
  selector: 'nc-producto-movil',
  templateUrl: './producto-movil.html',
  styleUrl: './producto-movil.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductoMovil {
  readonly producto = input.required<DetalleProducto>();
}
