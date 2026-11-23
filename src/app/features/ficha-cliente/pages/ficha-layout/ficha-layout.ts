import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  DOCUMENT,
  effect,
  inject,
  untracked,
} from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { RUTAS } from '@core/constants/rutas';
import { ModoPagina, UiStore } from '@core/state/ui.store';
import { injectMediaQuery } from '@core/utils/media-query';
import { FichaCabecera } from '@features/ficha-cliente/components/ficha-cabecera/ficha-cabecera';
import { MSeccion } from '@features/ficha-cliente/components/m-seccion/m-seccion';
import { RetirosEnCurso } from '@features/ficha-cliente/components/retiros-en-curso/retiros-en-curso';
import { MQ_FICHA_MOVIL } from '@features/ficha-cliente/constants/pestanas';
import { CLIENTE_OSCAR } from '@features/ficha-cliente/data/cliente.mock';
import { RETIROS_EN_CURSO } from '@features/ficha-cliente/data/retiros.mock';
import { FichaStore } from '@features/ficha-cliente/state/ficha.store';

/** Modos de página que activa la ficha; al salir de ella no queda ninguno encendido. */
const MODOS_FICHA: readonly ModoPagina[] = ['modo-mision', 'saldos-recogidos', 'm-detalle', 'vista-producto', 'm-pf-sec'];

/**
 * Marco de la ficha del cliente: lo que se mantiene igual en la ficha y en la ficha del producto
 * (retiros en curso, flecha + nombre en móvil, migas, barra de identidad) y la navegación por niveles.
 */
@Component({
  selector: 'nc-ficha-layout',
  imports: [RouterOutlet, RetirosEnCurso, FichaCabecera, MSeccion],
  providers: [FichaStore],
  templateUrl: './ficha-layout.html',
  styleUrl: './ficha-layout.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FichaLayout {
  protected readonly store = inject(FichaStore);
  private readonly ui = inject(UiStore);
  private readonly router = inject(Router);
  private readonly ventana = inject(DOCUMENT).defaultView;
  private readonly movil = injectMediaQuery(MQ_FICHA_MOVIL);

  protected readonly cliente = CLIENTE_OSCAR;
  protected readonly retiros = RETIROS_EN_CURSO;

  protected readonly productoAbierto = computed(() => this.ui.activo('vista-producto'));

  /** Nivel de la navegación móvil: 0 ficha · 1 pestaña · 2 producto · 3 sección del producto. */
  protected readonly nivel = computed(() =>
    this.ui.activo('m-pf-sec') ? 3 : this.ui.activo('vista-producto') ? 2 : this.ui.activo('m-detalle') ? 1 : 0,
  );

  constructor() {
    // Al pasar a escritorio no quedan pantallas móviles abiertas.
    effect(() => {
      if (this.movil()) return;
      untracked(() => {
        this.ui.set('m-detalle', false);
        this.ui.set('m-pf-sec', false);
      });
    });
    inject(DestroyRef).onDestroy(() => MODOS_FICHA.forEach((m) => this.ui.set(m, false)));
  }

  protected irInicio(): void {
    void this.router.navigate(['/', RUTAS.inicio]);
  }

  protected cerrarProducto(): void {
    this.ui.set('m-pf-sec', false);
    void this.router.navigate(['/', RUTAS.ficha]);
  }

  /** Flecha verde (móvil): sube un nivel; en el primer nivel vuelve al inicio. */
  protected volver(): void {
    if (this.ui.activo('m-pf-sec')) {
      this.ui.set('m-pf-sec', false);
      this.arriba();
    } else if (this.ui.activo('vista-producto')) {
      this.cerrarProducto();
    } else if (this.ui.activo('m-detalle')) {
      this.ui.set('m-detalle', false);
      this.store.volverAProductos();
      this.arriba();
    } else {
      this.irInicio();
    }
  }

  /** Barra de sección (móvil): la ruta permite subir directo a un nivel. */
  protected subirA(nivel: number): void {
    if (nivel >= this.nivel()) return;
    if (nivel === 2) {
      this.ui.set('m-pf-sec', false);
      this.arriba();
    } else if (nivel === 1) {
      this.cerrarProducto();
    }
  }

  private arriba(): void {
    this.ventana?.scrollTo(0, 0);
  }
}
