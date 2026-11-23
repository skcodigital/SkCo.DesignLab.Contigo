import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // Sin zone.js: todo el estado vive en signals.
    provideZonelessChangeDetection(),
    provideRouter(
      routes,
      // Los query params de los enlaces directos (?plan=sin&rol=fp&tab=…) llegan como input() a las páginas.
      withComponentInputBinding(),
      // El prototipo volvía arriba en cada cambio de vista.
      withInMemoryScrolling({ scrollPositionRestoration: 'top' }),
    ),
  ],
};
