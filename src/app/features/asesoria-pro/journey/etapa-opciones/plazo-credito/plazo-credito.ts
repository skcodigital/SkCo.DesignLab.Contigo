import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { PLAZOS } from '../../../data/contratos.mock';
import { ConversacionesStore } from '../../../state/conversaciones.store';
import { ctId } from '../../../utils/calculos';
import { soloLectura } from '../../../utils/validaciones';
import { JourneyUiStore } from '../../journey-ui.store';

const PLAZO_DEFECTO = 12;

/**
 * «Plazo» del Crédito Impulso (cajas de Crédito Impulso y de la combinación): 1, 3, 6 o 12 meses, con 12 meses
 * marcado por defecto. «Personalizar» es un enlace (como «Ajustar» del IBC) que abre el detalle del crédito,
 * donde se ajustan monto, fecha de pago y abono.
 */
@Component({
  selector: 'nc-plazo-credito',
  template: `
    <div class="jw-o3-plazo">
      <p aria-hidden="true">Estimado de pago en:</p>
      <div class="jw-plazo-fila">
        <div class="jw-chips" role="group" aria-label="Estimado de pago en">
          @for (p of plazos; track p[0]) {
            <button type="button" [attr.aria-pressed]="marcado() === p[0]" [disabled]="ro()" (click)="elegir($event, p[0])">
              {{ p[1] }}
            </button>
          }
        </div>
        @if (conPersonalizar()) {
          <button type="button" class="jw-link jw-ro-ok" (click)="personalizar($event)">Personalizar</button>
        }
      </div>
    </div>
  `,
  styleUrl: './plazo-credito.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlazoCredito {
  private readonly store = inject(ConversacionesStore);
  private readonly ui = inject(JourneyUiStore);

  /** Muestra el enlace «Personalizar» (la caja Crédito Impulso no lo lleva: ya tiene «Ver detalle del crédito»). */
  readonly conPersonalizar = input(true);

  protected readonly st = this.store.st;
  protected readonly ro = computed(() => soloLectura(this.st()));
  protected readonly plazos = PLAZOS;

  /** Chip marcado: el plazo elegido o, si no se ha elegido, 12 meses (el que se usa por defecto). */
  protected readonly marcado = computed(() => this.st().plazo || PLAZO_DEFECTO);

  // Los botones están dentro del <label> de la caja: preventDefault para no cambiar la opción elegida
  protected elegir(e: Event, m: number): void {
    e.preventDefault();
    this.store.elegirPlazo(m);
  }

  /** Lo mismo que «Ver detalle del crédito»: abre la pestaña Crédito del panel de detalle. */
  protected personalizar(e: Event): void {
    e.preventDefault();
    this.ui.abrirDetalle(ctId(this.st()), 'credito');
  }
}
