import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { Icono } from '@features/monitor/components/comunes/icono/icono';
import { paginasPaginador } from '@features/monitor/utils/tabla';

/** Paginador de la tabla: anterior, páginas con «...», siguiente y el tamaño de página. */
@Component({
  selector: 'nc-mon-tabla-paginador',
  imports: [Icono],
  templateUrl: './tabla-paginador.html',
  styleUrl: './tabla-paginador.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TablaPaginador {
  readonly pagina = input.required<number>();
  readonly totalPaginas = input.required<number>();
  readonly tamano = input.required<number>();
  readonly tamanos = input.required<readonly number[]>();

  readonly irA = output<number>();
  readonly cambiarTamano = output<number>();

  protected readonly paginas = computed(() => paginasPaginador(this.pagina(), this.totalPaginas()));
}
