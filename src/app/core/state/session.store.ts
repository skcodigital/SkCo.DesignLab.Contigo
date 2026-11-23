import { Injectable, signal } from '@angular/core';
import { RUTAS, VistaGuardada } from '@core/constants/rutas';
import { STORAGE_KEYS } from '@core/constants/storage-keys';
import { guardarSesion, leerSesion } from '@core/utils/safe-storage';

const VISTAS: readonly VistaGuardada[] = [RUTAS.inicio, RUTAS.ficha, RUTAS.radiografia];

/** Sesión simulada del prototipo: no hay autenticación real, solo el flag de "ingresó". */
@Injectable({ providedIn: 'root' })
export class SessionStore {
  private readonly _dentro = signal(leerSesion(STORAGE_KEYS.sesion) === '1');
  readonly dentro = this._dentro.asReadonly();

  entrar(): void {
    guardarSesion(STORAGE_KEYS.sesion, '1');
    this._dentro.set(true);
  }

  salir(): void {
    guardarSesion(STORAGE_KEYS.sesion, null);
    guardarSesion(STORAGE_KEYS.vista, null);
    this._dentro.set(false);
  }

  recordarVista(vista: VistaGuardada): void {
    guardarSesion(STORAGE_KEYS.vista, vista);
  }

  /** Última vista de la sesión; por defecto el dashboard (como en el prototipo). */
  vistaGuardada(): VistaGuardada {
    const v = leerSesion(STORAGE_KEYS.vista);
    return VISTAS.find((x) => x === v) ?? RUTAS.inicio;
  }
}
