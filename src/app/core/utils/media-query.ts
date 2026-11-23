import { DestroyRef, inject, signal, Signal } from '@angular/core';

/**
 * Signal que refleja un media query y se limpia sola con el DestroyRef del contexto de inyección.
 * Úsala con `MQ_MOBILE` en lugar de leer `window.innerWidth`.
 */
export function injectMediaQuery(query: string): Signal<boolean> {
  const mql = window.matchMedia(query);
  const matches = signal(mql.matches);
  const onChange = (e: MediaQueryListEvent): void => matches.set(e.matches);
  mql.addEventListener('change', onChange);
  inject(DestroyRef).onDestroy(() => mql.removeEventListener('change', onChange));
  return matches.asReadonly();
}
