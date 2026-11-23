import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RutaEncabezado } from '@features/radiografia/components/ruta-accion/ruta-encabezado/ruta-encabezado';
import { RutaMetas } from '@features/radiografia/components/ruta-accion/ruta-metas/ruta-metas';
import { RutaPasos } from '@features/radiografia/components/ruta-accion/ruta-pasos/ruta-pasos';
import { RutaVacia } from '@features/radiografia/components/ruta-accion/ruta-vacia/ruta-vacia';
import { RUTA_ACCION_VISIBLE } from '@features/radiografia/constants/ajustes';
import { LISTADO_METAS_VISIBLE } from '@features/radiografia/constants/textos-ruta';
import { RadiografiaStore } from '@features/radiografia/state/radiografia.store';

/**
 * Ruta comercial del FP Asignado: el diagnóstico y la ruta de acción que le asignó su director.
 * Q-09 (`RUTA_ACCION_VISIBLE = false`): solo el título y las cajitas del diagnóstico.
 */
@Component({
  selector: 'nc-rx-ruta-dueno',
  imports: [RutaEncabezado, RutaVacia, RutaMetas, RutaPasos],
  templateUrl: './ruta-dueno.html',
  styleUrl: './ruta-dueno.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RutaDueno {
  private readonly store = inject(RadiografiaStore);

  /** Título y cajitas: siempre en esta versión; con la ruta de acción visible, solo al crearla. */
  protected readonly conDiagnostico = computed(() => !RUTA_ACCION_VISIBLE || this.store.rutaCreada());
  protected readonly vacia = computed(() => RUTA_ACCION_VISIBLE && !this.store.rutaCreada());
  protected readonly listado = computed(
    () => RUTA_ACCION_VISIBLE && LISTADO_METAS_VISIBLE && this.store.rutaCreada(),
  );
}
