import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';
import { ErrorServicio } from '@features/monitor/components/comunes/error-servicio/error-servicio';
import { Tooltip } from '@features/monitor/components/comunes/tooltip/tooltip';
import { VistaMonitor } from '@features/monitor/interfaces/comunes';
import { MezclaInversion } from '@features/monitor/interfaces/detalle';
import { alternarId, mezclasPorPerfil, tituloPalabras } from '@features/monitor/utils/detalle-listas';

/**
 * Mezclas Invest-ed para comparar (`mezcla-invest-list`): grilla de tarjetas ordenadas de la más conservadora a
 * la más arriesgada; cada clic marca o desmarca (`[(seleccionadas)]`, por id).
 *
 * Diferencias entre vistas: el cliente usa 4 columnas y sin tooltip; el exterior, 3 columnas con margen arriba,
 * scroll y el perfil de riesgo en un tooltip.
 */
@Component({
  selector: 'nc-mon-lista-mezclas',
  imports: [ErrorServicio, Tooltip],
  template: `
    @if (conError()) {
      <nc-mon-error-servicio [vista]="vista()" />
    } @else {
      <div class="lista">
        @for (m of mezclas(); track m.id) {
          <button
            type="button"
            class="item"
            [class.activo]="seleccionadas().includes(m.id)"
            [ncMonTooltip]="vista() === 'exterior' ? m.tooltip : null"
            (click)="seleccionadas.set(alternar(m.id))"
          >
            <p class="texto-item">{{ titulo(m.nombre) }}</p>
          </button>
        }
      </div>
    }
  `,
  styleUrl: './lista-mezclas.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.vista-exterior]': "vista() === 'exterior'" },
})
export class ListaMezclas {
  readonly catalogo = input<readonly MezclaInversion[]>([]);
  /** Ids de las mezclas marcadas, en el orden en que se marcaron. */
  readonly seleccionadas = model<readonly number[]>([]);
  readonly vista = input<VistaMonitor>('cliente');
  readonly conError = input(false);

  protected readonly mezclas = computed(() => mezclasPorPerfil(this.catalogo()));

  protected alternar(id: number): number[] {
    return alternarId(this.seleccionadas(), id);
  }

  protected titulo(nombre: string): string {
    return tituloPalabras(nombre);
  }
}
