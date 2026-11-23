import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Tarjetas de posición de Skandia en la empresa (patrón de la ficha de cliente).
 * Omitidas por ahora (`TARJETAS_POSICION_VISIBLES`); se retoman más adelante.
 */
@Component({
  selector: 'nc-rx-tarjetas-posicion',
  templateUrl: './tarjetas-posicion.html',
  styleUrl: './tarjetas-posicion.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TarjetasPosicion {}
