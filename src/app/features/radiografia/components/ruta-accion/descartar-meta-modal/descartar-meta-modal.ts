import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Dialogo } from '@features/radiografia/components/comunes/dialogo/dialogo';
import { SEGUIMIENTO } from '@features/radiografia/data/ruta-accion.mock';
import { RadiografiaStore } from '@features/radiografia/state/radiografia.store';
import { textoDetalleDescarte } from '@features/radiografia/utils/ruta-accion';

/** Confirmación "¿Descartar esta meta?": la meta sale de la ruta y se desmarca en la modal de crear ruta. */
@Component({
  selector: 'nc-rx-descartar-meta-modal',
  imports: [Dialogo],
  templateUrl: './descartar-meta-modal.html',
  styleUrl: './descartar-meta-modal.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DescartarMetaModal {
  protected readonly store = inject(RadiografiaStore);

  protected readonly nombre = computed(() => {
    const m = this.store.metaDescartando();
    return m ? SEGUIMIENTO[m.id].nombre : '';
  });
  protected readonly detalle = computed(() => {
    const m = this.store.metaDescartando();
    return m ? textoDetalleDescarte(m, this.store.configRuta()) : '';
  });
}
