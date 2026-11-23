import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  effect,
  inject,
  input,
  OnInit,
  untracked,
} from '@angular/core';
import { Router } from '@angular/router';
import { RUTAS } from '@core/constants/rutas';
import { UiStore } from '@core/state/ui.store';
import { injectMediaQuery } from '@core/utils/media-query';
import { CopilotoPanel } from '@features/asesoria-pro/components/copiloto-panel/copiloto-panel';
import { FichaTabs } from '@features/ficha-cliente/components/ficha-tabs/ficha-tabs';
import { ProductosPanel } from '@features/ficha-cliente/components/productos-panel/productos-panel';
import { SaldosResumen } from '@features/ficha-cliente/components/saldos-resumen/saldos-resumen';
import { MQ_FICHA_MOVIL } from '@features/ficha-cliente/constants/pestanas';
import { CATEGORIAS_PRODUCTOS } from '@features/ficha-cliente/data/productos.mock';
import { SALDOS_OSCAR } from '@features/ficha-cliente/data/saldos.mock';
import { PestanaFichaId } from '@features/ficha-cliente/interfaces/pestanas';
import { TipoProducto } from '@features/ficha-cliente/interfaces/productos';
import { FichaStore } from '@features/ficha-cliente/state/ficha.store';
import { normalizarPestana } from '@features/ficha-cliente/utils/pestanas';

/** Ficha del cliente: saldos, pestañas y el panel de la pestaña activa (`/ficha?tab=…`). */
@Component({
  selector: 'nc-ficha-page',
  imports: [SaldosResumen, FichaTabs, ProductosPanel, CopilotoPanel],
  templateUrl: './ficha-page.html',
  styleUrl: './ficha-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FichaPage implements OnInit {
  /** Query param `?tab=copiloto|productos|datos|…` (enlace directo o desde el dashboard). */
  readonly tab = input<string>();

  protected readonly store = inject(FichaStore);
  protected readonly ui = inject(UiStore);
  private readonly router = inject(Router);
  private readonly ventana = inject(DOCUMENT).defaultView;
  private readonly movil = injectMediaQuery(MQ_FICHA_MOVIL);

  protected readonly saldos = SALDOS_OSCAR;
  protected readonly categorias = CATEGORIAS_PRODUCTOS;

  constructor() {
    // El query param manda sobre la pestaña abierta (enlaces directos y llegada desde el dashboard).
    effect(() => {
      const tab = normalizarPestana(this.tab());
      untracked(() => this.store.abrirPestana(tab));
    });

    // Planeación Pro pone toda la ficha en modo misión; al entrar los saldos se recogen solos.
    effect(() => {
      const mision = this.store.enMision();
      untracked(() => {
        if (mision && !this.ui.activo('modo-mision')) this.ui.set('saldos-recogidos', true);
        this.ui.set('modo-mision', mision);
      });
    });

    // Al salir del modo misión (por cualquier vía) los saldos vuelven a verse.
    effect(() => {
      if (this.ui.modoMision() || !this.ui.activo('saldos-recogidos')) return;
      untracked(() => this.ui.set('saldos-recogidos', false));
    });
  }

  ngOnInit(): void {
    // Llegar con una pestaña explícita en móvil equivale a tocarla: abre como pantalla aparte.
    if (this.tab() && this.movil()) this.ui.set('m-detalle', true);
  }

  protected abrirPestana(id: PestanaFichaId): void {
    this.store.abrirPestana(id);
    if (this.movil()) {
      this.ui.set('m-detalle', true);
      this.ventana?.scrollTo(0, 0);
    }
  }

  /** El Multifund es `/ficha/producto`; el FIC, `/ficha/producto?tipo=fic`. */
  protected abrirProducto(tipo: TipoProducto): void {
    void this.router.navigate(['/', RUTAS.ficha, RUTAS.producto], tipo === 'mf' ? {} : { queryParams: { tipo } });
  }
}
