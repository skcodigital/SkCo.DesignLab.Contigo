import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { TEXTOS } from '@features/radiografia/constants/textos';
import { RadiografiaStore } from '@features/radiografia/state/radiografia.store';
import { notaRutaSinPac } from '@features/radiografia/utils/sin-pac';

/**
 * Ruta comercial sin plan corporativo: no hay ruta hasta tener plan y FP Asignado.
 * El botón "Crear Ruta de Acción" está deshabilitado y oculto en el prototipo (`disabled hidden`).
 */
@Component({
  selector: 'nc-rx-ruta-sin-pac',
  templateUrl: './ruta-sin-pac.html',
  styleUrl: './ruta-sin-pac.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RutaSinPac {
  protected readonly store = inject(RadiografiaStore);
  protected readonly textos = TEXTOS.ruta;
  /** En el prototipo el CTA existe pero va `disabled hidden`: sin PAC la ruta solo se crea con plan. */
  protected readonly crearVisible = false;
  protected readonly nota = computed(() => notaRutaSinPac(this.store.fpAsignado()));
}
