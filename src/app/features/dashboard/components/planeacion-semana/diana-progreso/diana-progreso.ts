import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { TEXTOS } from '../../../constants/textos';
import { MISIONES_POR_SEMANA } from '../../../data/misiones.mock';

const T = TEXTOS.planeacion;

/**
 * Diana «n/5» de misiones completadas con su tooltip (también con toque; se cierra al tocar fuera).
 * Nota: el prototipo la oculta por ahora (`.pp-prog-w{display:none!important}`, 2026-11-19).
 */
@Component({
  selector: 'nc-diana-progreso',
  template: `
    <span class="pp-prog" tabindex="0" role="img" aria-describedby="pp-prog-tt" [attr.aria-label]="aria()">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>
      <span class="pp-prog-tx" aria-hidden="true"><span class="pp-prog-pre" hidden>{{ pre() }}</span><b>{{ completadas() }}</b>/{{ total }}</span>
    </span>
    <span class="pp-tt pp-prog-tt" role="tooltip" id="pp-prog-tt">Cantidad de misiones completadas esta semana</span>
  `,
  styleUrl: './diana-progreso.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'pp-tt-w pp-prog-w',
    '[class.ver]': 'ver()',
    '(click)': 'alternar($event)',
    '(document:click)': 'ver.set(false)',
  },
})
export class DianaProgreso {
  readonly completadas = input.required<number>();
  readonly lectura = input(false);

  protected readonly total = MISIONES_POR_SEMANA;
  protected readonly ver = signal(false);
  protected readonly pre = computed(() => (this.lectura() ? T.progresoPre.asesor : T.progresoPre.propio));
  protected readonly aria = computed(() => T.progresoAria(this.pre(), this.completadas(), this.total));

  protected alternar(e: MouseEvent): void {
    e.stopPropagation();
    this.ver.update((v) => !v);
  }
}
