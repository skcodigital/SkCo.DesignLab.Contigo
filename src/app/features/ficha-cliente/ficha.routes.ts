import { Routes } from '@angular/router';
import { RUTAS } from '@core/constants/rutas';

/**
 * Ficha del cliente. El layout pinta lo que se mantiene en las dos vistas (retiros, migas, identidad)
 * y provee el estado de la ficha; las hijas son la ficha con pestañas y la ficha del producto.
 */
export const FICHA_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/ficha-layout/ficha-layout').then((m) => m.FichaLayout),
    children: [
      { path: '', loadComponent: () => import('./pages/ficha-page/ficha-page').then((m) => m.FichaPage) },
      {
        path: RUTAS.producto,
        loadComponent: () => import('./pages/producto-page/producto-page').then((m) => m.ProductoPage),
      },
      {
        // Monitor Contigo del cliente (feature monitor), dentro del layout de la ficha
        path: RUTAS.monitor,
        loadComponent: () =>
          import('@features/monitor/pages/monitor-cliente-page/monitor-cliente-page').then(
            (m) => m.MonitorClientePage,
          ),
      },
    ],
  },
];
