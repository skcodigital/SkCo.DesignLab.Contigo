import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { OpcionBoton } from '@features/monitor/interfaces/comunes';

/**
 * Grilla de botones de selección múltiple (`app-btn-group-custom`, del panel «Comparar»): cada clic marca o
 * desmarca el botón (borde verde).
 */
@Component({
  selector: 'nc-mon-grupo-botones',
  templateUrl: './grupo-botones.html',
  styleUrl: './grupo-botones.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GrupoBotones {
  readonly opciones = input<readonly OpcionBoton[]>([]);
  /** Ids marcados, en el orden en que se marcaron. */
  readonly seleccionados = model<readonly string[]>([]);

  protected alternar(id: string): void {
    this.seleccionados.update((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  }
}
