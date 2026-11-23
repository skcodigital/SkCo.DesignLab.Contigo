import { computed, Injectable, signal } from '@angular/core';
import { HOY_PROTOTIPO, INDICADORES_BASE } from '../data/logros.mock';
import { Indicador, MesAnio } from '../interfaces/logros';
import { desfaseMeses, indicadoresDelMes, ultimoMesCerrado } from '../utils/logros';

/**
 * Estado de la vista del dashboard: mes de los Logros y asesor elegido (vista del director). El asesor también
 * cambia Planeación Pro a solo lectura. Se provee en la page: al volver al inicio todo arranca de nuevo.
 */
@Injectable()
export class DashboardStore {
  readonly ultimoMes: MesAnio = ultimoMesCerrado(HOY_PROTOTIPO);

  private readonly _mes = signal<MesAnio>(this.ultimoMes);
  readonly mes = this._mes.asReadonly();

  /** Índice en `ASESORES`; `null` = el asesor que ingresó (sin filtro). */
  private readonly _asesor = signal<number | null>(null);
  readonly asesor = this._asesor.asReadonly();

  /** Veces que se recalcularon los indicadores (dispara la animación «actualiza»). 0 = valores iniciales. */
  private readonly _actualizacion = signal(0);
  readonly actualizacion = this._actualizacion.asReadonly();

  readonly indicadores = computed<readonly Indicador[]>(() => {
    if (this._actualizacion() === 0) return INDICADORES_BASE;
    const valores = indicadoresDelMes(INDICADORES_BASE, desfaseMeses(this._mes(), this.ultimoMes), this._asesor());
    return INDICADORES_BASE.map((ind, i) => ({ ...ind, ...valores[i] }));
  });

  elegirMes(mes: MesAnio): void {
    this._mes.set(mes);
    this._actualizacion.update((n) => n + 1);
  }

  elegirAsesor(indice: number): void {
    this._asesor.set(indice);
    this._actualizacion.update((n) => n + 1);
  }
}
