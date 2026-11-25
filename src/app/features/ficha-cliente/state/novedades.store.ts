import { Injectable, signal } from '@angular/core';

/**
 * Novedades de la ficha del producto ("Ahora en Contigo: Saldos a otras fechas"). Como en el prototipo,
 * el aviso aparece en cada carga de la app y, una vez cerrado o usada la función, no vuelve en la sesión
 * aunque se cambie de producto o de pantalla. Por eso vive en root. Cero I/O.
 */
@Injectable({ providedIn: 'root' })
export class NovedadesStore {
  private readonly _saldosOtrasFechas = signal(true);
  readonly saldosOtrasFechas = this._saldosOtrasFechas.asReadonly();

  /** «Ahora en Contigo» sobre la pestaña Planeación Pro. */
  private readonly _planeacionPro = signal(true);
  readonly planeacionPro = this._planeacionPro.asReadonly();

  /** Se apaga solo al cerrarla con la X. */
  apagarPlaneacionPro(): void {
    this._planeacionPro.set(false);
  }

  /** Se apaga al cerrarla o al usar la función (calendario o En proceso / Efectivo). */
  apagarSaldosOtrasFechas(): void {
    this._saldosOtrasFechas.set(false);
  }
}
