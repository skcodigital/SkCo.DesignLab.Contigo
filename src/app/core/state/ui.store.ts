import { computed, Injectable, signal } from '@angular/core';

/**
 * Modos de página que en el prototipo eran clases de `<body>` y que afectan a varias partes a la vez
 * (shell + feature). La raíz de la app los refleja en `document.body`, así los componentes pueden
 * reaccionar con `:host-context(.modo-mision)` sin acoplarse entre sí.
 */
export type ModoPagina =
  | 'modo-mision' // Asesoría Pro abierta: ficha, header y menú en oscuro "espacial"
  | 'saldos-recogidos' // Asesoría Pro: sección de saldos recogida
  | 'cop-cargando' // Loading introductorio de Asesoría Pro
  | 'jw-abierto' // Journey "Acompañamiento al retirar" abierto
  | 'pp-md-abierta' // Modal "Descartar misión" abierta
  | 'vista-producto' // Ficha de producto abierta (dentro de la ficha del cliente)
  | 'm-detalle' // Móvil: una pestaña de la ficha abierta como pantalla aparte
  | 'm-pf-sec' // Móvil: una sección de la ficha de producto abierta
  | 'dr-open' // Escritorio: submenú lateral (drawer) abierto
  | 'nav-open'; // Móvil: menú lateral abierto

/** Estado-cliente transversal de la UI. Cero I/O. */
@Injectable({ providedIn: 'root' })
export class UiStore {
  private readonly _modos = signal<ReadonlySet<ModoPagina>>(new Set());
  readonly modos = this._modos.asReadonly();

  readonly modoMision = computed(() => this._modos().has('modo-mision'));

  activo(modo: ModoPagina): boolean {
    return this._modos().has(modo);
  }

  set(modo: ModoPagina, on: boolean): void {
    if (this._modos().has(modo) === on) return;
    const next = new Set(this._modos());
    if (on) next.add(modo);
    else next.delete(modo);
    this._modos.set(next);
  }

  toggle(modo: ModoPagina): void {
    this.set(modo, !this._modos().has(modo));
  }

  /** Al salir de la ficha o cerrar sesión no queda ningún modo de página abierto. */
  limpiar(...excepto: ModoPagina[]): void {
    this._modos.set(new Set([...this._modos()].filter((m) => excepto.includes(m))));
  }
}
