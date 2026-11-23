import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { GrupoProductos } from '@features/radiografia/interfaces/resumen';
import { RadiografiaStore } from '@features/radiografia/state/radiografia.store';

/** Grupo que arranca abierto en el acordeón. */
const ABIERTO_POR_DEFECTO = 'Ahorro e inversión';

/**
 * "Productos de la empresa" del Resumen: grupos que se expanden y se comprimen (solo Ahorro e inversión
 * arranca abierto). Con `bloqueados` es la vista del asesor que no es dueño: los ve, pero no puede
 * ingresar ni ver saldos. Atiende "Ver detalles del plan" (`store.productosPedidos()`).
 */
@Component({
  selector: 'nc-rx-productos-empresa',
  imports: [NgTemplateOutlet],
  templateUrl: './productos-empresa.html',
  styleUrl: './productos-empresa.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductosEmpresa {
  readonly grupos = input.required<readonly GrupoProductos[]>();
  /** id de la sección (`products` / `products-own`): destino de "Ver detalles del plan". */
  readonly idSeccion = input.required<string>();
  readonly bloqueados = input(false);

  private readonly store = inject(RadiografiaStore);
  private readonly seccion = viewChild.required<ElementRef<HTMLElement>>('seccion');
  protected readonly abiertos = signal<ReadonlySet<string>>(new Set([ABIERTO_POR_DEFECTO]));

  constructor() {
    // "Ver detalles del plan" lleva a los productos de la empresa
    afterRenderEffect(() => {
      if (!this.store.productosPedidos() || this.bloqueados()) return;
      const el = this.seccion().nativeElement;
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      el.focus({ preventScroll: true });
      this.store.productosMostrados();
    });
  }

  protected alternar(titulo: string): void {
    this.abiertos.update((s) => {
      const n = new Set(s);
      if (n.has(titulo)) n.delete(titulo);
      else n.add(titulo);
      return n;
    });
  }
}
