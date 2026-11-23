import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RUTA_ACCION_VISIBLE } from '@features/radiografia/constants/ajustes';
import { RadiografiaStore } from '@features/radiografia/state/radiografia.store';
import { textoModificacion } from '@features/radiografia/utils/ruta-accion';

/** Título de la Ruta comercial, última modificación de la ruta y "Editar ruta". */
@Component({
  selector: 'nc-rx-ruta-encabezado',
  template: `
    <div class="block-head block-head--space">
      <div>
        <h2 class="block-title">Ruta comercial</h2>
        <p class="ruta-diag-sub">Diagnóstico de la empresa: qué hacer en cada etapa y la meta sugerida.</p>
        <p class="card-sub">{{ modificacion() }}</p>
      </div>
      @if (editable()) {
        <button class="btn-outline btn-inline" aria-haspopup="dialog" (click)="store.abrirEditarRuta()">Editar ruta</button>
      }
    </div>
  `,
  styleUrl: './ruta-encabezado.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RutaEncabezado {
  readonly rol = input.required<'director' | 'dueno'>();

  protected readonly store = inject(RadiografiaStore);
  protected readonly modificacion = computed(() => textoModificacion(this.store.rutaMod(), this.rol() === 'dueno'));
  /** Un solo botón general: en la modal se cambian valores, se quitan o se vuelven a agregar metas. */
  protected readonly editable = computed(() => RUTA_ACCION_VISIBLE && this.store.rutaCreada());
}
