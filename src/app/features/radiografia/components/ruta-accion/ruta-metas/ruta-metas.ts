import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { TEXTOS_RUTA } from '@features/radiografia/constants/textos-ruta';
import { SEGUIMIENTO } from '@features/radiografia/data/ruta-accion.mock';
import { RadiografiaStore } from '@features/radiografia/state/radiografia.store';
import { fmtFechaLarga } from '@features/radiografia/utils/formato';
import { fmtSeguimiento, textoModificacion, valorMeta } from '@features/radiografia/utils/ruta-accion';

const CLASE_TAG = { curso: '', lograda: 'tag tag--success', descartada: 'tag tag--neutral' } as const;

/**
 * Listado de metas de la ruta enviada (`#plan-seg` del director / `#ruta-own` del FP Asignado):
 * cada meta se marca como lograda, se descarta (con confirmación) o se deshace.
 */
@Component({
  selector: 'nc-rx-ruta-metas',
  templateUrl: './ruta-metas.html',
  styleUrl: './ruta-metas.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RutaMetas {
  readonly rol = input.required<'director' | 'dueno'>();

  protected readonly store = inject(RadiografiaStore);
  protected readonly textos = TEXTOS_RUTA;
  protected readonly modificacion = computed(() => textoModificacion(this.store.rutaMod(), this.rol() === 'dueno'));
  protected readonly metas = computed(() => {
    const cfg = this.store.configRuta();
    return this.store.ruta().map((m) => ({
      ...m,
      nombre: SEGUIMIENTO[m.id].nombre,
      hoy: fmtSeguimiento(m.id, SEGUIMIENTO[m.id].ini),
      meta: fmtSeguimiento(m.id, valorMeta(m.id, m.valor, cfg)),
      desde: fmtFechaLarga(m.inicio),
      claseTag: CLASE_TAG[m.estado],
      tag: TEXTOS_RUTA.estado[m.estado],
    }));
  });
}
