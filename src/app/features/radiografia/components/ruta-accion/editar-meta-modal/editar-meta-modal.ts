import { ChangeDetectionStrategy, Component, computed, inject, linkedSignal } from '@angular/core';
import { Dialogo } from '@features/radiografia/components/comunes/dialogo/dialogo';
import { SEGUIMIENTO, UNIDAD_META } from '@features/radiografia/data/ruta-accion.mock';
import { RadiografiaStore } from '@features/radiografia/state/radiografia.store';
import { textoCalcMeta } from '@features/radiografia/utils/ruta-accion';

/**
 * Modal "Editar meta" de una meta de la ruta de acción. Al guardar, la modal de crear/editar ruta
 * queda con el mismo valor. (En el prototipo no tiene disparador: se conserva igual.)
 */
@Component({
  selector: 'nc-rx-editar-meta-modal',
  imports: [Dialogo],
  templateUrl: './editar-meta-modal.html',
  styleUrl: './editar-meta-modal.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditarMetaModal {
  protected readonly store = inject(RadiografiaStore);

  protected readonly meta = this.store.metaEditando;
  protected readonly valor = linkedSignal(() => this.meta()?.valor ?? 0);
  protected readonly nombre = computed(() => {
    const m = this.meta();
    return m ? SEGUIMIENTO[m.id].nombre : '';
  });
  protected readonly unidad = computed(() => {
    const m = this.meta();
    return m ? UNIDAD_META[m.id] : (['', ''] as const);
  });
  protected readonly calc = computed(() => {
    const m = this.meta();
    return m ? textoCalcMeta(m.id, this.valor(), this.store.configRuta()) : '';
  });

  protected alEscribir(e: Event): void {
    if (e.target instanceof HTMLInputElement) this.valor.set(Number(e.target.value) || 0);
  }
}
