import { Injectable, signal } from '@angular/core';

export type TabDetalle = 'contrato' | 'portafolios' | 'aportes' | 'calculo' | 'credito' | 'impuestos';
export type TipoToast = 'exito' | 'info' | 'error';

export interface ToastJourney {
  id: number;
  tipo: TipoToast;
  titulo: string;
  desc: string;
}

export interface DetalleAbierto {
  ct: string;
  tab: TabDetalle;
  /** «combo»: la pestaña Crédito muestra el crédito de «Retiro + Crédito Impulso». */
  credito?: 'combo';
}

const DURACION_TOAST_MS = 5000;

/**
 * Estado de UI del journey abierto: panel de detalle (contrato y pestaña) y avisos de abajo a la derecha.
 * Se provee en `nc-journey`: muere al cerrar el journey, como en el prototipo (prepararDom).
 */
@Injectable()
export class JourneyUiStore {
  private readonly _detalle = signal<DetalleAbierto | null>(null);
  readonly detalle = this._detalle.asReadonly();

  private readonly _toasts = signal<readonly ToastJourney[]>([]);
  readonly toasts = this._toasts.asReadonly();
  private seq = 0;
  private readonly timers = new Map<number, ReturnType<typeof setTimeout>>();

  /** Cada incremento pide a Entender enfocar y seleccionar el monto (chip «Desea retirar» de la barra de contexto). */
  private readonly _focoMonto = signal(0);
  readonly focoMonto = this._focoMonto.asReadonly();

  pedirFocoMonto(): void {
    this._focoMonto.update((n) => n + 1);
  }

  /** Cada incremento pide al journey cerrarse y volver a la ficha («Salir»). */
  private readonly _salir = signal(0);
  readonly salir = this._salir.asReadonly();

  pedirSalir(): void {
    this._salir.update((n) => n + 1);
  }

  /** Cada incremento pide a Opciones resaltar la pregunta de renta exenta y llevar el foco a ella. */
  private readonly _pedirRx = signal(0);
  readonly pedirRx = this._pedirRx.asReadonly();

  pedirRentaExenta(): void {
    this._pedirRx.update((n) => n + 1);
  }

  abrirDetalle(ct: string, tab: TabDetalle = 'contrato', credito?: 'combo'): void {
    this._detalle.set(credito ? { ct, tab, credito } : { ct, tab });
  }

  elegirContratoDetalle(ct: string): void {
    this._detalle.update((d) => (d ? { ...d, ct } : d));
  }

  elegirTabDetalle(tab: TabDetalle): void {
    this._detalle.update((d) => (d ? { ...d, tab } : d));
  }

  cerrarDetalle(): void {
    this._detalle.set(null);
  }

  /** Aviso del journey; los de error se quedan hasta cerrarlos. */
  toast(tipo: TipoToast, titulo: string, desc: string): void {
    const id = ++this.seq;
    this._toasts.update((l) => [...l, { id, tipo, titulo, desc }]);
    if (tipo !== 'error') this.timers.set(id, setTimeout(() => this.quitarToast(id), DURACION_TOAST_MS));
  }

  quitarToast(id: number): void {
    clearTimeout(this.timers.get(id));
    this.timers.delete(id);
    this._toasts.update((l) => l.filter((t) => t.id !== id));
  }

  limpiar(): void {
    this.timers.forEach((t) => clearTimeout(t));
    this.timers.clear();
  }
}
