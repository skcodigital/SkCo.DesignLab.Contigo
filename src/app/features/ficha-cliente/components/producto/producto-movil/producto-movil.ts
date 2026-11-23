import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { DetalleProducto } from '@features/ficha-cliente/interfaces/productos';
import { etiquetaRendimientos, gradienteRendimientos } from '@features/ficha-cliente/utils/composicion';

/** Móvil: contrato como en Portal Clientes (identidad arriba, una tarjeta principal, beneficio compacto). */
@Component({
  selector: 'nc-producto-movil',
  templateUrl: './producto-movil.html',
  styleUrl: './producto-movil.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductoMovil {
  readonly producto = input.required<DetalleProducto>();

  protected readonly nombre = computed(() => {
    const p = this.producto();
    return p.emoji ? `${p.nombre} ${p.emoji}` : p.nombre;
  });
  protected readonly donaGradiente = computed(() => gradienteRendimientos(this.producto().pctRendimientos));
  protected readonly donaEtiqueta = computed(() => etiquetaRendimientos(this.producto().pctRendimientos));
}
