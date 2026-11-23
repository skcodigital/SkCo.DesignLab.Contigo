import { computed, inject, Injectable, linkedSignal } from '@angular/core';
import { Descarte, MisionesStore } from '@core/state/misiones.store';
import { TEXTOS } from '../constants/textos';
import { ASESORES } from '../data/logros.mock';
import { SEMANA_PROPIA } from '../data/misiones.mock';
import { Mision } from '../interfaces/mision';
import { nombreCorto } from '../utils/formato';
import { indiceValido, misionesDeAsesor, sinDescartes } from '../utils/misiones';
import { DashboardStore } from './dashboard.store';

const T = TEXTOS.planeacion;

/**
 * Planeación Pro · Tu semana. Las misiones propias reflejan los descartes compartidos con la ficha
 * (`MisionesStore`); al elegir otro asesor en Logros se ven sus misiones en solo lectura.
 */
@Injectable()
export class PlaneacionStore {
  private readonly dashboard = inject(DashboardStore);
  private readonly misiones = inject(MisionesStore);

  readonly lectura = computed(() => this.dashboard.asesor() !== null);

  private readonly semana = computed(() => {
    const asesor = this.dashboard.asesor();
    return asesor === null ? SEMANA_PROPIA : misionesDeAsesor(asesor);
  });

  readonly pendientes = computed<readonly Mision[]>(() =>
    this.lectura() ? this.semana().pendientes : sinDescartes(this.semana().pendientes, this.misiones.descartes()),
  );
  readonly completadas = computed(() => this.semana().completadas);

  /** Misión destacada (vista ampliada). Vuelve a la primera al cambiar de asesor. */
  private readonly _seleccion = linkedSignal({ source: this.dashboard.asesor, computation: () => 0 });
  readonly indiceDestacada = computed(() => indiceValido(this._seleccion(), this.pendientes().length));
  readonly destacada = computed<Mision | null>(() => this.pendientes()[this.indiceDestacada()] ?? null);

  readonly quien = computed(() => {
    const asesor = this.dashboard.asesor();
    return asesor === null ? T.quienPropio : T.quienAsesor(nombreCorto(ASESORES[asesor]));
  });

  readonly textoVacio = computed(() => {
    if (!this.completadas().length) return T.vacioSinMisiones;
    return this.lectura() ? T.vacioCompletasAsesor : T.vacioCompletasPropio;
  });

  seleccionar(indice: number): void {
    this._seleccion.set(indice);
  }

  descartar(id: string, descarte: Descarte): void {
    this.misiones.descartar(id, descarte);
  }

  /** «Deshacer» del aviso: la misión vuelve a su lugar y queda destacada. */
  restaurar(id: string): void {
    this.misiones.restaurar(id);
    const indice = this.pendientes().findIndex((m) => m.id === id);
    if (indice >= 0) this._seleccion.set(indice);
  }
}
