import { Routes } from '@angular/router';
import { RUTAS } from '@core/constants/rutas';
import { entrarDirectoGuard, loginGuard, raizGuard } from '@core/guards/sesion.guards';

export const routes: Routes = [
  { path: '', pathMatch: 'full', canActivate: [raizGuard], children: [] },
  {
    path: RUTAS.login,
    canActivate: [loginGuard],
    title: 'Iniciar sesión · Portal Contigo',
    loadComponent: () => import('@features/login/pages/login-page/login-page').then((m) => m.LoginPage),
  },
  {
    // Shell: menú lateral + header. Las vistas del asesor van adentro.
    path: '',
    canActivateChild: [entrarDirectoGuard],
    loadComponent: () => import('@layout/shell/shell').then((m) => m.Shell),
    children: [
      {
        path: RUTAS.inicio,
        title: 'Inicio · Portal Contigo',
        loadComponent: () =>
          import('@features/dashboard/pages/dashboard-page/dashboard-page').then((m) => m.DashboardPage),
      },
      {
        path: RUTAS.ficha,
        title: 'Ficha cliente · Portal Contigo',
        loadChildren: () => import('@features/ficha-cliente/ficha.routes').then((m) => m.FICHA_ROUTES),
      },
      {
        path: RUTAS.radiografia,
        title: 'Radiografía de empresa · Portal Contigo',
        loadComponent: () =>
          import('@features/radiografia/pages/radiografia-page/radiografia-page').then((m) => m.RadiografiaPage),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
