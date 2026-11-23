import { Injectable, signal } from '@angular/core';

export enum MotivoDescarte {
  FalsaAlarma = 'falsa',
  NoRelevante = 'norel',
  YaAcompanado = 'ya',
  Otro = 'otro',
}

export const ETIQUETA_MOTIVO: Record<Exclude<MotivoDescarte, MotivoDescarte.Otro>, string> = {
  [MotivoDescarte.FalsaAlarma]: 'Falsa alarma',
  [MotivoDescarte.NoRelevante]: 'No es relevante para mí',
  [MotivoDescarte.YaAcompanado]: 'Ya realicé el acompañamiento antes',
};

export interface Descarte {
  motivo: MotivoDescarte;
  /** Texto libre cuando el motivo es "Otro". */
  detalle?: string;
}

/** Texto legible del motivo (lo que el prototipo mostraba en «Motivo: …»). */
export function textoMotivo(d: Descarte): string {
  return d.motivo === MotivoDescarte.Otro ? (d.detalle ?? '') : ETIQUETA_MOTIVO[d.motivo];
}

/**
 * Estado de las misiones de Planeación Pro compartido entre el dashboard y la ficha del cliente
 * (en el prototipo se sincronizaban con los eventos `pp-descartada` / `pp-restaurada`).
 * Cero I/O: los datos de las misiones viven en cada feature; aquí solo el estado que ambas comparten.
 */
@Injectable({ providedIn: 'root' })
export class MisionesStore {
  private readonly _descartes = signal<Readonly<Record<string, Descarte>>>({});
  readonly descartes = this._descartes.asReadonly();

  /** Etapas completadas del journey por misión («En curso · n de m etapas»). */
  private readonly _progreso = signal<Readonly<Record<string, number>>>({});
  readonly progreso = this._progreso.asReadonly();

  descartar(id: string, descarte: Descarte): void {
    this._descartes.update((d) => ({ ...d, [id]: descarte }));
  }

  restaurar(id: string): void {
    this._descartes.update(({ [id]: _quitado, ...resto }) => resto);
  }

  registrarProgreso(id: string, etapas: number): void {
    this._progreso.update((p) => ({ ...p, [id]: etapas }));
  }
}
