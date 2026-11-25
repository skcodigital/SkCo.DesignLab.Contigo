import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { PanelComparar } from '@features/monitor/components/cliente/panel-comparar/panel-comparar';
import { Icono } from '@features/monitor/components/comunes/icono/icono';
import { SeleccionComparar } from '@features/monitor/interfaces/cliente';

/**
 * Botón «Comparar» (`app-btn-comparar`): abre el panel lateral. «Aplicar» y «Borrar» avisan y lo cierran; lo
 * marcado en el panel (`seleccion`) lo guarda quien lo usa.
 */
@Component({
  selector: 'nc-mon-boton-comparar',
  imports: [Icono, PanelComparar],
  template: `
    <button type="button" class="comparar" [disabled]="deshabilitado()" (click)="abierto.set(true)">
      <p class="texto">Comparar</p>
      <nc-mon-icono class="icono" nombre="comparar" />
    </button>
    @if (abierto()) {
      <nc-mon-panel-comparar
        [seleccion]="seleccion()"
        [hoy]="hoy()"
        (seleccionCambio)="seleccionCambio.emit($event)"
        (aplicar)="alAplicar()"
        (borrar)="alBorrar()"
        (cerrar)="abierto.set(false)"
      />
    }
  `,
  styleUrl: './boton-comparar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BotonComparar {
  readonly seleccion = input.required<SeleccionComparar>();
  readonly hoy = input<Date>(new Date());
  readonly deshabilitado = input(false);

  readonly seleccionCambio = output<SeleccionComparar>();
  readonly aplicar = output<void>();
  readonly borrar = output<void>();

  protected readonly abierto = signal(false);

  protected alAplicar(): void {
    this.aplicar.emit();
    this.abierto.set(false);
  }

  protected alBorrar(): void {
    this.borrar.emit();
    this.abierto.set(false);
  }
}
