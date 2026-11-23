import { computed, inject, Injectable, signal } from '@angular/core';
import { UiStore } from '@core/state/ui.store';
import { SeccionMenu } from './data/menu';

/** Estado de navegación del shell: drawer de escritorio, menú móvil y su acordeón. Cero I/O. */
@Injectable()
export class NavStore {
  private readonly ui = inject(UiStore);

  private readonly _seccion = signal<SeccionMenu | null>(null);
  /** Sección abierta en el drawer de escritorio. */
  readonly seccion = this._seccion.asReadonly();

  private readonly _subMovil = signal<SeccionMenu | null>(null);
  /** Submenú desplegado dentro del menú móvil. */
  readonly subMovil = this._subMovil.asReadonly();

  readonly menuMovil = computed(() => this.ui.modos().has('nav-open'));
  readonly drawerAbierto = computed(() => this._seccion() !== null);
  readonly veloVisible = computed(() => this.drawerAbierto() || this.menuMovil());
  /** El botón hamburguesa se vuelve «X» con el drawer o el menú móvil abiertos. */
  readonly burgerCerrar = this.veloVisible;

  alternarSeccion(id: SeccionMenu): void {
    this._seccion.set(this._seccion() === id ? null : id);
    this.ui.set('dr-open', this._seccion() !== null);
  }

  alternarSubMovil(id: SeccionMenu): void {
    this._subMovil.set(this._subMovil() === id ? null : id);
  }

  cerrarDrawer(): void {
    this._seccion.set(null);
    this.ui.set('dr-open', false);
  }

  abrirMenuMovil(): void {
    this.ui.set('nav-open', true);
  }

  /** Cierra todo: drawer y menú móvil (velo, Escape, navegación, cambio a escritorio). */
  cerrarTodo(): void {
    this.cerrarDrawer();
    this.ui.set('nav-open', false);
  }
}
