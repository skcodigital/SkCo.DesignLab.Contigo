import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  input,
  output,
  signal,
  viewChild,
  viewChildren,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { injectMediaQuery } from '@core/utils/media-query';
import { MQ_FICHA_MOVIL } from '@features/ficha-cliente/constants/pestanas';
import { PestanaProducto, PestanaProductoId } from '@features/ficha-cliente/interfaces/pestanas';

interface PosicionGlobo {
  readonly left: number;
  readonly top: number;
  /** Posición horizontal de la flecha del globo. */
  readonly flecha: number;
  readonly movil: boolean;
}

/**
 * Secciones del producto (pestañas en escritorio, filas en móvil) y el globo de novedad
 * "Ahora en Contigo: Saldos a otras fechas" sobre Composición y saldos.
 */
@Component({
  selector: 'nc-producto-tabs',
  imports: [NgTemplateOutlet],
  templateUrl: './producto-tabs.html',
  styleUrl: './producto-tabs.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(window:resize)': 'ubicarGlobo()' },
})
export class ProductoTabs {
  readonly pestanas = input.required<readonly PestanaProducto[]>();
  readonly activa = input.required<PestanaProductoId>();
  /** Muestra la novedad (globo en escritorio; tag "Nuevo" + subtítulo en la fila móvil). */
  readonly novedad = input(false);

  readonly elegir = output<PestanaProductoId>();
  readonly cerrarNovedad = output<void>();
  readonly irANovedad = output<void>();

  private readonly movil = injectMediaQuery(MQ_FICHA_MOVIL);
  private readonly envoltura = viewChild.required<ElementRef<HTMLElement>>('envoltura');
  private readonly globo = viewChild<ElementRef<HTMLElement>>('globo');
  private readonly tabs = viewChildren<ElementRef<HTMLElement>>('tab');

  protected readonly posicion = signal<PosicionGlobo | null>(null);

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const observador = new ResizeObserver(() => this.ubicarGlobo());
      observador.observe(this.envoltura().nativeElement);
      destroyRef.onDestroy(() => observador.disconnect());
      this.ubicarGlobo();
    });
  }

  /** Escritorio: globo centrado sobre la pestaña; móvil: colgado del borde superior, a la derecha. */
  protected ubicarGlobo(): void {
    const g = this.globo()?.nativeElement;
    const i = this.pestanas().findIndex((p) => p.id === 'composicion');
    const tab = this.tabs()[i]?.nativeElement;
    if (!g || !tab) return;
    const r = tab.getBoundingClientRect();
    const rw = this.envoltura().nativeElement.getBoundingClientRect();
    const gw = g.offsetWidth;
    const movil = this.movil();
    let left = movil ? r.right - rw.left - gw - 40 : r.left - rw.left + r.width / 2 - gw / 2;
    left = Math.max(0, Math.min(left, rw.width - gw));
    const x = r.left - rw.left + (movil ? r.width - 68 : r.width / 2) - left;
    this.posicion.set({
      left,
      top: r.top - rw.top - g.offsetHeight - (movil ? -8 : 8),
      flecha: Math.max(14, Math.min(x, gw - 14)),
      movil,
    });
  }
}
