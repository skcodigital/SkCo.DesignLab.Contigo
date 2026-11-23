import { afterNextRender, ChangeDetectionStrategy, Component, DestroyRef, inject, output, signal } from '@angular/core';
import { Icono } from '../../components/icono/icono';

type EstadoPaso = '' | 'va' | 'on';

const PASOS = ['Leyendo la ficha del cliente', 'Armando su contexto financiero', 'Preparando la conversación guiada'] as const;
/** Tiempos del prototipo (≈2,6 s; versión corta con movimiento reducido). */
const TIEMPOS = [100, 800, 1500, 2600] as const;
const TIEMPOS_CORTOS = [0, 150, 300, 450] as const;

/** «Sami está preparando la conversación»: loading antes de abrir el journey. Emite `lista` al terminar. */
@Component({
  selector: 'nc-journey-carga',
  imports: [Icono],
  template: `
    <div class="jm-carga" role="status" aria-live="polite" [class.corre]="corre()">
      <div class="jm-carga-sami" aria-hidden="true"><span class="cop-intro-ring"><i></i></span><img src="assets/sami-cabeza.png" alt="" width="96" height="70" /></div>
      <h2>Sami está preparando la conversación</h2>
      <p class="jm-carga-sub">Estoy reuniendo los datos de Óscar para guiarte paso a paso.</p>
      <ul class="jm-carga-pasos">
        @for (p of pasos; track $index) {
          <li [class.va]="estados()[$index] === 'va'" [class.on]="estados()[$index] === 'on'"><span class="jm-ck"><svg ncIcono="check"></svg></span>{{ p }}</li>
        }
      </ul>
      <div class="jm-carga-barra"><i></i></div>
    </div>
  `,
  styleUrl: './journey-carga.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JourneyCarga {
  readonly lista = output<void>();

  protected readonly pasos = PASOS;
  protected readonly estados = signal<readonly EstadoPaso[]>(['va', '', '']);
  /** Arranca la barra en el siguiente pintado para que corra la transición. */
  protected readonly corre = signal(false);

  constructor() {
    const t = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? TIEMPOS_CORTOS : TIEMPOS;
    const timers = [
      setTimeout(() => this.estados.set(['on', 'va', '']), t[1]),
      setTimeout(() => this.estados.set(['on', 'on', 'va']), t[2]),
      setTimeout(() => this.estados.set(['on', 'on', 'on']), t[3] - 300),
      setTimeout(() => this.lista.emit(), t[3]),
    ];
    afterNextRender(() => requestAnimationFrame(() => this.corre.set(true)));
    inject(DestroyRef).onDestroy(() => timers.forEach(clearTimeout));
  }
}
