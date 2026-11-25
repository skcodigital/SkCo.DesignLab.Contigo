import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';
import { GrupoCasillas, ValoresCasillas } from '@features/monitor/interfaces/comunes';

/**
 * Grupos de casillas de verificación con título y scroll (`app-checkbox`): filtra las opciones por nombre y
 * guarda lo marcado en `valores` (por el `valor` de cada opción). Reemplaza el `FormGroup` de producción.
 */
@Component({
  selector: 'nc-mon-casillas',
  templateUrl: './casillas.html',
  styleUrl: './casillas.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Casillas {
  readonly grupos = input.required<GrupoCasillas | readonly GrupoCasillas[]>();
  readonly filtro = input('');
  readonly valores = model.required<ValoresCasillas>();

  protected readonly visibles = computed<readonly GrupoCasillas[]>(() => {
    const g = this.grupos();
    const grupos: readonly GrupoCasillas[] = Array.isArray(g) ? g : [g as GrupoCasillas];
    const termino = this.filtro().toLowerCase();
    if (!termino) {
      return grupos;
    }
    return grupos.map((grupo) => ({
      ...grupo,
      opciones: grupo.opciones.filter((o) => o.nombre.toLowerCase().includes(termino)),
    }));
  });

  protected cambiar(valor: string, marcada: boolean): void {
    this.valores.update((v) => ({ ...v, [valor]: marcada }));
  }
}
