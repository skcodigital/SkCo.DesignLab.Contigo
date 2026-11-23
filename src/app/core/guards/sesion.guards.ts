import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateChildFn, CanActivateFn, Router } from '@angular/router';
import { RUTAS, VistaGuardada } from '@core/constants/rutas';
import { SessionStore } from '@core/state/session.store';
import { UiStore } from '@core/state/ui.store';

const VISTAS: readonly string[] = [RUTAS.inicio, RUTAS.ficha, RUTAS.radiografia];

/**
 * Como en el prototipo, un enlace directo a una página entra sin pasar por el login
 * (útil para revisiones de diseño) y se recuerda como última vista de la sesión.
 */
export const entrarDirectoGuard: CanActivateChildFn = (child: ActivatedRouteSnapshot) => {
  const session = inject(SessionStore);
  session.entrar();
  const vista = child.url[0]?.path;
  if (vista && VISTAS.includes(vista)) session.recordarVista(vista as VistaGuardada);
  return true;
};

/** Abrir /login equivale a cerrar sesión (antes `?p=login`). */
export const loginGuard: CanActivateFn = () => {
  inject(SessionStore).salir();
  inject(UiStore).limpiar();
  return true;
};

/** La raíz abre el login o, si ya hay sesión, la última vista. */
export const raizGuard: CanActivateFn = () => {
  const session = inject(SessionStore);
  const destino = session.dentro() ? session.vistaGuardada() : RUTAS.login;
  return inject(Router).parseUrl(`/${destino}`);
};
