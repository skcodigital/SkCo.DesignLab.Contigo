import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Cliente } from '@features/ficha-cliente/interfaces/cliente';

/** Flecha + nombre (móvil), migas de pan y barra de identidad del cliente. */
@Component({
  selector: 'nc-ficha-cabecera',
  templateUrl: './ficha-cabecera.html',
  styleUrl: './ficha-cabecera.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FichaCabecera {
  readonly cliente = input.required<Cliente>();
  /** Número de contrato que muestran las migas cuando la ficha del producto está abierta. */
  readonly contrato = input.required<string>();
  readonly productoAbierto = input(false);

  readonly inicio = output<void>();
  readonly cerrarProducto = output<void>();
  readonly volver = output<void>();

  protected alVolver(e: Event): void {
    e.preventDefault();
    this.volver.emit();
  }

  /** La flecha de las migas cierra la ficha del producto; si no hay producto abierto, va al inicio. */
  protected alFlecha(): void {
    if (this.productoAbierto()) this.cerrarProducto.emit();
    else this.inicio.emit();
  }

  protected alCliente(e: Event): void {
    e.preventDefault();
    if (this.productoAbierto()) this.cerrarProducto.emit();
  }

  protected alInicio(e: Event): void {
    e.preventDefault();
    this.inicio.emit();
  }
}
