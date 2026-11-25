import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { TEXTOS, TONO_HISTORIAL } from '../../constants/textos';
import { Conversacion } from '../../interfaces/conversacion';
import { estadoDe } from '../../state/conversaciones.store';
import { agendada } from '../../utils/agenda';
import { deIso, fNumerica, horaTxt } from '../../utils/formato';

/** Historial de conversaciones de la ficha (clicable: la conversación se abre, en solo lectura si ya se cerró). */
@Component({
  selector: 'nc-cop-historial',
  template: `
    <div class="cop-hist-lista">
      @for (f of filas(); track f.id) {
        <button type="button" class="cop-hist" (click)="abrir.emit(f.id)">
          <div><span class="jy-t">{{ titulo }}</span><span class="jy-d">{{ f.detalle }}</span></div>
          <span class="cop-estado" [class]="'cop-estado cop-estado--' + f.tono">{{ f.estado }}</span>
        </button>
      }
    </div>
  `,
  styleUrl: './cop-historial.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CopHistorial {
  readonly conversaciones = input.required<readonly Conversacion[]>();
  readonly abrir = output<number>();

  protected readonly titulo = TEXTOS.tituloJourney;
  protected readonly filas = computed(() =>
    this.conversaciones().map((cv) => {
      const [estado, tono] = TONO_HISTORIAL[estadoDe(cv)];
      const min = cv.st.segundos > 0 ? Math.max(1, Math.round(cv.st.segundos / 60)) : 0;
      const a = cv.st.agenda;
      const agenda = agendada(a) ? ' · Llamada el ' + fNumerica(deIso(a.fecha)) + ' a las ' + horaTxt(a.hora) : '';
      return { id: cv.id, estado, tono, detalle: TEXTOS.conversacionDel(fNumerica(cv.creada), min) + agenda };
    }),
  );
}
