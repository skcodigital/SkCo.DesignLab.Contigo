import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Indicador as IndicadorLogro } from '../../../interfaces/logros';
import { formatearPesos } from '../../../utils/formato';

const ICONO_TENDENCIA: Record<IndicadorLogro['tendencia'], string> = {
  sube: 'assets/dash/tend-sube.svg',
  baja: 'assets/dash/tend-baja.svg',
  'sube-roja': 'assets/dash/tend-sube-roja.svg',
};

/**
 * Indicador de Logros (Venta neta, Aportes, Retiros, AUM) con la flecha de variación y su tooltip.
 * Se usa sobre el `<article class="ds-ind">` para que la grilla de Logros lo ubique directamente.
 */
@Component({
  selector: 'article[nc-indicador]',
  template: `
    <!-- Se vuelve a crear en cada actualización: los valores hacen la animación «actualiza» del prototipo -->
    @for (v of [actualizacion()]; track v) {
      <div class="ds-ind-tx" [class.actualiza]="v > 0">
        <span>{{ indicador().etiqueta }}</span><b class="ds-money">{{ valor() }}</b>
      </div>
      <div class="ds-ind-var" [class.actualiza]="v > 0">
        <b>{{ indicador().variacion }}%</b>
        <span class="ds-tend ds-tt">
          <button type="button" class="ds-tt-btn" [class.a-favor]="indicador().tendencia === 'sube'" [attr.aria-describedby]="idTooltip()">
            <img [src]="icono()" width="16" height="16" alt="Variación" />
          </button>
          <span class="ds-tt-box" role="tooltip" [id]="idTooltip()">% con respecto al mes anterior</span>
        </span>
      </div>
    }
  `,
  styleUrl: './indicador.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.oculto]': 'oculto()' },
})
export class Indicador {
  readonly indicador = input.required<IndicadorLogro>();
  readonly oculto = input(true);
  /** Contador de recálculos del store (0 = valores iniciales, sin animación). */
  readonly actualizacion = input(0);

  protected readonly valor = computed(() => formatearPesos(this.indicador().valor));
  protected readonly icono = computed(() => ICONO_TENDENCIA[this.indicador().tendencia]);
  protected readonly idTooltip = computed(() => `ds-tt-${this.indicador().id}`);
}
