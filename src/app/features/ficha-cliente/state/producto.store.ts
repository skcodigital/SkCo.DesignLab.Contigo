import { computed, Injectable, signal } from '@angular/core';
import { SegmentoComposicion } from '../interfaces/composicion';
import { FECHA_HOY, FECHA_MINIMA, FONDOS_POTENCIALIZAR } from '../data/composicion.mock';
import { calcularComposicion, etiquetaDona, gradienteDona } from '../utils/composicion';
import { formatoFechaCorta } from '../utils/fechas';

/** Estado de "Composición y saldos" de la ficha del producto. Se provee en la página del producto. */
@Injectable()
export class ProductoStore {
  readonly hoy = FECHA_HOY;
  readonly minima = FECHA_MINIMA;

  private readonly _segmento = signal<SegmentoComposicion>('actual');
  private readonly _fechaCorte = signal<Date>(new Date(FECHA_HOY));

  readonly segmento = this._segmento.asReadonly();
  readonly fechaCorte = this._fechaCorte.asReadonly();

  readonly filas = computed(() => calcularComposicion(FONDOS_POTENCIALIZAR, this.hoy, this._fechaCorte()));
  readonly gradiente = computed(() => gradienteDona(this.filas()));
  readonly etiquetaDona = computed(() => etiquetaDona(this.filas(), this._fechaCorte()));
  readonly fechaCorteTexto = computed(() => formatoFechaCorta(this._fechaCorte()));

  elegirSegmento(segmento: SegmentoComposicion): void {
    this._segmento.set(segmento);
  }

  elegirFechaCorte(fecha: Date): void {
    this._fechaCorte.set(fecha);
  }
}
