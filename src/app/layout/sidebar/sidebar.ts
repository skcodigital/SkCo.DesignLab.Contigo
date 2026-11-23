import { ChangeDetectionStrategy, Component, effect, inject, untracked } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MQ_MOBILE } from '@core/constants/breakpoints';
import { RUTAS } from '@core/constants/rutas';
import { injectMediaQuery } from '@core/utils/media-query';
import { Bell } from '../bell/bell';
import { ASESOR, PIE_MENU, SeccionMenu, SUBMENUS } from '../data/menu';
import { IaSwitch } from '../ia-switch/ia-switch';
import { NavStore } from '../nav.store';

/**
 * Menú lateral (riel de 112px) con su drawer de submenús en escritorio y, en móvil, menú a todo el ancho
 * con los submenús en acordeón, los asistentes de IA, la campana y el pie.
 */
@Component({
  selector: 'nc-sidebar',
  imports: [RouterLink, IaSwitch, Bell],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown.escape)': 'nav.cerrarTodo()' },
})
export class Sidebar {
  protected readonly nav = inject(NavStore);
  private readonly router = inject(Router);

  protected readonly movil = injectMediaQuery(MQ_MOBILE);
  protected readonly submenus = SUBMENUS;
  protected readonly pie = PIE_MENU;
  protected readonly asesor = ASESOR;
  protected readonly rutaInicio = `/${RUTAS.inicio}`;

  constructor() {
    // Al pasar a escritorio se cierra el menú móvil (y viceversa con el drawer).
    effect(() => {
      this.movil();
      untracked(() => this.nav.cerrarTodo());
    });
  }

  /** Hamburguesa: en escritorio abre/cierra el drawer (Afiliaciones por defecto); en móvil cierra el menú. */
  protected burger(): void {
    if (this.movil()) {
      this.nav.cerrarTodo();
      return;
    }
    if (this.nav.drawerAbierto()) this.nav.cerrarDrawer();
    else this.nav.alternarSeccion('f-afil');
  }

  protected submenu(id: SeccionMenu): void {
    if (this.movil()) this.nav.alternarSubMovil(id);
    else this.nav.alternarSeccion(id);
  }

  protected abierto(id: SeccionMenu): boolean {
    return this.movil() ? this.nav.subMovil() === id : this.nav.seccion() === id;
  }

  protected cerrarSesion(e: Event): void {
    e.preventDefault();
    void this.router.navigate(['/', RUTAS.login]);
  }
}
