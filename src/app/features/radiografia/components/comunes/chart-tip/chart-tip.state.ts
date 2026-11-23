import { Injectable, signal } from '@angular/core';
import { DatoTip } from '@features/radiografia/interfaces/radiografia';

export interface TipVisible {
  readonly dato: DatoTip;
  /** Posición del cursor (clientX / clientY). */
  readonly x: number;
  readonly y: number;
}

/**
 * Tooltip único de las gráficas: muestra solo el segmento o barra que está bajo el cursor.
 * Lo alimenta la directiva `ncRxChartTip` y lo pinta `nc-rx-chart-tip`. Se provee en la página.
 */
@Injectable()
export class ChartTipState {
  private readonly _tip = signal<TipVisible | null>(null);
  readonly tip = this._tip.asReadonly();

  mostrar(dato: DatoTip, x: number, y: number): void {
    this._tip.set({ dato, x, y });
  }

  mover(x: number, y: number): void {
    const t = this._tip();
    if (t) this._tip.set({ ...t, x, y });
  }

  ocultar(): void {
    this._tip.set(null);
  }
}
