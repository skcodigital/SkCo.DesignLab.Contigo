import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  DOCUMENT,
  effect,
  inject,
  input,
  untracked,
  viewChild,
} from '@angular/core';
import { UiStore } from '@core/state/ui.store';
import { injectMediaQuery } from '@core/utils/media-query';
import { ProductoComposicion } from '@features/ficha-cliente/components/producto/producto-composicion/producto-composicion';
import { ProductoMovil } from '@features/ficha-cliente/components/producto/producto-movil/producto-movil';
import { ProductoMovimientos } from '@features/ficha-cliente/components/producto/producto-movimientos/producto-movimientos';
import { ProductoTabs } from '@features/ficha-cliente/components/producto/producto-tabs/producto-tabs';
import { ProductoTarjetas } from '@features/ficha-cliente/components/producto/producto-tarjetas/producto-tarjetas';
import { MQ_FICHA_MOVIL } from '@features/ficha-cliente/constants/pestanas';
import { TEXTOS_FICHA } from '@features/ficha-cliente/constants/textos';
import { MOVIMIENTOS_FIC } from '@features/ficha-cliente/data/productos.mock';
import { PestanaProductoId } from '@features/ficha-cliente/interfaces/pestanas';
import { FichaStore } from '@features/ficha-cliente/state/ficha.store';
import { NovedadesStore } from '@features/ficha-cliente/state/novedades.store';
import { ProductoStore } from '@features/ficha-cliente/state/producto.store';
import { normalizarTipoProducto } from '@features/ficha-cliente/utils/pestanas';

/** Espera antes de llevar el foco a "Saldos a otras fechas" desde el aviso (deja pintar la sección). */
const ESPERA_FOCO_MS = 150;

/**
 * Ficha del producto (`/ficha/producto` Multifund, `/ficha/producto?tipo=fic` FIC). Las migas y la
 * identidad del cliente vienen del layout; saldos, pestañas y retiros no se muestran (modo `vista-producto`).
 */
@Component({
  selector: 'nc-producto-page',
  imports: [ProductoMovil, ProductoTarjetas, ProductoTabs, ProductoComposicion, ProductoMovimientos],
  providers: [ProductoStore],
  templateUrl: './producto-page.html',
  styleUrl: './producto-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductoPage {
  /** Query param `?tipo=fic` (por defecto, Multifund). */
  readonly tipo = input<string>();

  protected readonly ficha = inject(FichaStore);
  protected readonly store = inject(ProductoStore);
  protected readonly novedades = inject(NovedadesStore);
  private readonly ui = inject(UiStore);
  private readonly ventana = inject(DOCUMENT).defaultView;
  private readonly movil = injectMediaQuery(MQ_FICHA_MOVIL);
  private readonly composicion = viewChild(ProductoComposicion);
  private timer?: ReturnType<typeof setTimeout>;

  protected readonly movimientos = MOVIMIENTOS_FIC;
  protected readonly etiqueta = computed(() => TEXTOS_FICHA.producto.fichaDe(this.ficha.producto().nombre));

  constructor() {
    this.ui.set('vista-producto', true);

    // El query param decide el producto; abrirlo siempre empieza en Composición y saldos, corte a hoy.
    effect(() => {
      const tipo = normalizarTipoProducto(this.tipo());
      untracked(() => {
        this.ficha.abrirProducto(tipo);
        this.store.cargarProducto(tipo);
      });
    });

    inject(DestroyRef).onDestroy(() => {
      clearTimeout(this.timer);
      this.ui.set('vista-producto', false);
      this.ui.set('m-pf-sec', false);
    });
  }

  /** En móvil cada sección del producto abre como pantalla aparte. */
  protected abrirSeccion(id: PestanaProductoId): void {
    this.ficha.abrirSeccionProducto(id);
    if (this.movil()) {
      if (id === 'composicion') this.novedades.apagarSaldosOtrasFechas();
      this.ui.set('m-pf-sec', true);
      this.ventana?.scrollTo(0, 0);
    }
  }

  /** Globo de novedad: abre Composición y saldos y lleva el foco al selector de fecha. */
  protected irANovedad(): void {
    this.abrirSeccion('composicion');
    this.novedades.apagarSaldosOtrasFechas();
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.composicion()?.enfocarFecha(!this.movil()), ESPERA_FOCO_MS);
  }
}
