import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { PLAZOS } from '../../../data/contratos.mock';
import { ConversacionesStore } from '../../../state/conversaciones.store';
import { soloLectura } from '../../../utils/validaciones';

/** «Plazo · elija en cuánto tiempo podría reponerlo» (cajas de crédito puente y de la combinación). */
@Component({
  selector: 'nc-plazo-credito',
  template: `
    <div class="jw-o3-plazo">
      <p>Plazo · elija en cuánto tiempo podría reponerlo (sin elegir, 12 meses)</p>
      <div class="jw-chips" role="group" aria-label="Plazo del crédito">
        @for (p of plazos; track p[0]) {
          <button type="button" [attr.aria-pressed]="st().plazo === p[0]" [disabled]="st().noRepone || ro()" (click)="elegir(p[0])">
            {{ p[1] }}
          </button>
        }
      </div>
    </div>
  `,
  styleUrl: './plazo-credito.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlazoCredito {
  private readonly store = inject(ConversacionesStore);

  protected readonly st = this.store.st;
  protected readonly ro = computed(() => soloLectura(this.st()));
  protected readonly plazos = PLAZOS;

  protected elegir(m: number): void {
    this.store.elegirPlazo(m);
  }
}
