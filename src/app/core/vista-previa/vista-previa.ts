import {
  DestroyRef,
  DOCUMENT,
  EnvironmentProviders,
  inject,
  InjectionToken,
  makeEnvironmentProviders,
  provideEnvironmentInitializer,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

/** Parámetro con el que la vista «Móvil» carga la app dentro del teléfono. */
export const PARAM_EMBED = 'embed';
/** Hash con el que un enlace abre directo la vista «Móvil» (como en el prototipo). */
export const HASH_MOVIL = 'movil';

/** Mensaje que el teléfono manda a la ventana de afuera con la página que muestra. */
export interface MensajeTelefono {
  nc: 'url';
  url: string;
}

export function esMensajeTelefono(data: unknown): data is MensajeTelefono {
  return (
    typeof data === 'object' &&
    data !== null &&
    (data as MensajeTelefono).nc === 'url' &&
    typeof (data as MensajeTelefono).url === 'string'
  );
}

/**
 * `true` cuando la app corre dentro del teléfono de la vista previa (`?embed=1`).
 * Se lee una sola vez al arrancar: las navegaciones internas del router no conservan el parámetro.
 */
export const EN_TELEFONO = new InjectionToken<boolean>('EN_TELEFONO', {
  providedIn: 'root',
  factory: () => new URLSearchParams(inject(DOCUMENT).location.search).has(PARAM_EMBED),
});

/** Quita `embed` de una URL interna para mostrarla afuera. */
export function sinEmbed(url: string): string {
  const [ruta, query = ''] = url.split('?');
  const params = new URLSearchParams(query);
  params.delete(PARAM_EMBED);
  const q = params.toString();
  return q ? `${ruta}?${q}` : ruta;
}

/**
 * Dentro del teléfono: marca el body (`pv-embed`, deja espacio abajo) y avisa a la ventana de afuera
 * qué página se está viendo, para que su barra de direcciones muestre el enlace listo para copiar.
 */
export function provideVistaPrevia(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideEnvironmentInitializer(() => {
      if (!inject(EN_TELEFONO)) return;
      const doc = inject(DOCUMENT);
      const win = doc.defaultView;
      doc.body.classList.add('pv-embed');
      inject(Router)
        .events.pipe(
          filter((e): e is NavigationEnd => e instanceof NavigationEnd),
          takeUntilDestroyed(inject(DestroyRef)),
        )
        .subscribe((e) => {
          if (!win || win.parent === win) return;
          const msg: MensajeTelefono = { nc: 'url', url: sinEmbed(e.urlAfterRedirects) };
          win.parent.postMessage(msg, win.location.origin);
        });
    }),
  ]);
}
