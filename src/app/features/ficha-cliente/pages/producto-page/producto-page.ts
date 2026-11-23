import { ChangeDetectionStrategy, Component, DestroyRef, DOCUMENT, inject } from '@angular/core';
import { UiStore } from '@core/state/ui.store';
import { injectMediaQuery } from '@core/utils/media-query';
import { ProductoComposicion } from '@features/ficha-cliente/components/producto/producto-composicion/producto-composicion';
import { ProductoMovil } from '@features/ficha-cliente/components/producto/producto-movil/producto-movil';
import { ProductoTabs } from '@features/ficha-cliente/components/producto/producto-tabs/producto-tabs';
import { ProductoTarjetas } from '@features/ficha-cliente/components/producto/producto-tarjetas/producto-tarjetas';
import { MQ_FICHA_MOVIL } from '@features/ficha-cliente/constants/pestanas';
import { PRODUCTO_POTENCIALIZAR } from '@features/ficha-cliente/data/productos.mock';
import { PestanaProductoId } from '@features/ficha-cliente/interfaces/pestanas';
import { FichaStore } from '@features/ficha-cliente/state/ficha.store';
import { ProductoStore } from '@features/ficha-cliente/state/producto.store';

/**
 * Ficha del producto «Potencializar mi inversión» (`/ficha/producto`). Las migas y la identidad del
 * cliente vienen del layout; saldos, pestañas y retiros no se muestran (modo `vista-producto`).
 */
@Component({
  selector: 'nc-producto-page',
  imports: [ProductoMovil, ProductoTarjetas, ProductoTabs, ProductoComposicion],
  providers: [ProductoStore],
  templateUrl: './producto-page.html',
  styleUrl: './producto-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductoPage {
  protected readonly ficha = inject(FichaStore);
  protected readonly store = inject(ProductoStore);
  private readonly ui = inject(UiStore);
  private readonly ventana = inject(DOCUMENT).defaultView;
  private readonly movil = injectMediaQuery(MQ_FICHA_MOVIL);

  protected readonly producto = PRODUCTO_POTENCIALIZAR;

  constructor() {
    this.ui.set('vista-producto', true);
    inject(DestroyRef).onDestroy(() => {
      this.ui.set('vista-producto', false);
      this.ui.set('m-pf-sec', false);
    });
  }

  /** En móvil cada sección del producto abre como pantalla aparte. */
  protected abrirSeccion(id: PestanaProductoId): void {
    this.ficha.abrirSeccionProducto(id);
    if (this.movil()) {
      this.ui.set('m-pf-sec', true);
      this.ventana?.scrollTo(0, 0);
    }
  }
}
