import { ChangeDetectionStrategy, Component, input, model, output } from '@angular/core';

export type VistaPlaneacion = 'journeys' | 'historial';

/** Cabecera de Planeación Pro: título + telemetría a la izquierda, Conversaciones / Historial a la derecha. */
@Component({
  selector: 'nc-cop-cabecera',
  template: `
    <div class="cop-h">
      <div class="cop-cab">
        <h3 class="cop-mis-tit cop-punto">Tu misión esta semana con Óscar</h3>
        <div class="cop-hud">
          <!-- «Señal detectada el …» omitido por ahora (las entradas verSenal/senal se conservan) -->
          <!-- Sin fecha de última interacción no se muestra -->
          @if (ultima()) {
            <span>Última interacción <b>{{ ultima() }}</b></span>
          }
          <span><button type="button" class="cop-que" aria-haspopup="dialog" (click)="queEs.emit()">¿Qué es Planeación Pro?</button></span>
          <!-- Avance «n de 1 completada esta semana» omitido por ahora (la entrada hechas se conserva) -->
        </div>
      </div>
      <div class="cop-seg" role="tablist" aria-label="Vista de Planeación Pro">
        <button type="button" role="tab" [attr.aria-selected]="vista() === 'journeys'" (click)="vista.set('journeys')">Conversaciones</button>
        <button type="button" role="tab" [attr.aria-selected]="vista() === 'historial'" (click)="vista.set('historial')">Historial</button>
      </div>
    </div>
  `,
  styleUrl: './cop-cabecera.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CopCabecera {
  readonly vista = model<VistaPlaneacion>('journeys');
  readonly verSenal = input(true);
  readonly senal = input('');
  readonly ultima = input('');
  /** Misiones completadas esta semana (0 o 1). */
  readonly hechas = input(0);
  /** Abre la intro de Planeación Pro. */
  readonly queEs = output<void>();
}
