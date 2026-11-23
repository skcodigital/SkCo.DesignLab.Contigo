import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { RadiografiaStore } from '@features/radiografia/state/radiografia.store';

/** Ruta comercial sin ruta de acción: el director la crea; el FP Asignado espera a que se la asignen. */
@Component({
  selector: 'nc-rx-ruta-vacia',
  template: `
    @if (rol() === 'director') {
      <section class="card ruta-vacia" aria-labelledby="ruta-vacia-title">
        <h3 class="ruta-vacia-title" id="ruta-vacia-title">Aún no hay una ruta de acción para esta empresa</h3>
        <p class="ruta-vacia-desc">Crea la ruta con las metas sugeridas para el FP Asignado. Puedes ajustarlas antes de enviarla.</p>
        <button class="btn-primary" aria-haspopup="dialog" (click)="store.abrirCrearRuta()">Crear Ruta de Acción</button>
      </section>
    } @else {
      <section class="card ruta-vacia" aria-labelledby="ruta-vacia-own-title">
        <h3 class="ruta-vacia-title" id="ruta-vacia-own-title">Tu director comercial aún no te ha asignado una ruta de acción</h3>
        <p class="ruta-vacia-desc">Cuando la cree, aquí verás las metas para esta empresa y su cumplimiento.</p>
      </section>
    }
  `,
  styleUrl: './ruta-vacia.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RutaVacia {
  readonly rol = input.required<'director' | 'dueno'>();
  protected readonly store = inject(RadiografiaStore);
}
