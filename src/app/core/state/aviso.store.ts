import { Injectable, signal } from '@angular/core';

export interface Aviso {
  id: number;
  texto: string;
  deshacer?: () => void;
}

const DURACION_MS = 4000;
const DURACION_CON_DESHACER_MS = 6000;

/** Aviso flotante (toast) de la app, con acción opcional «Deshacer». */
@Injectable({ providedIn: 'root' })
export class AvisoStore {
  private readonly _actual = signal<Aviso | null>(null);
  readonly actual = this._actual.asReadonly();
  private timer?: ReturnType<typeof setTimeout>;
  private seq = 0;

  mostrar(texto: string, deshacer?: () => void): void {
    clearTimeout(this.timer);
    this._actual.set({ id: ++this.seq, texto, deshacer });
    this.timer = setTimeout(() => this.cerrar(), deshacer ? DURACION_CON_DESHACER_MS : DURACION_MS);
  }

  deshacer(): void {
    this._actual()?.deshacer?.();
    this.cerrar();
  }

  cerrar(): void {
    clearTimeout(this.timer);
    this._actual.set(null);
  }
}
