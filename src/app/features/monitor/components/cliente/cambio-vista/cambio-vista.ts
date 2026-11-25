import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

/**
 * Cambio «Contratos» / «Portafolios» de la página del Monitor del cliente: dos botones con el degradado verde en
 * una píldora gris; el de la pestaña que no se ve queda gris. Como en producción, cualquiera de los dos alterna la
 * pestaña.
 */
@Component({
  selector: 'nc-mon-cambio-vista',
  template: `
    <div class="fondo">
      <button type="button" class="boton" [class.inactivo]="!esContratos()" (click)="cambiar.emit()">Contratos</button>
      <button type="button" class="boton" [class.inactivo]="esContratos()" (click)="cambiar.emit()">Portafolios</button>
    </div>
  `,
  styleUrl: './cambio-vista.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CambioVista {
  readonly esContratos = input(true);
  readonly cambiar = output<void>();
}
