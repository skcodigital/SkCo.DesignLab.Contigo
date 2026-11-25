import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';

/**
 * Tamaño del diálogo, según cómo lo abría producción con `NgbModal`:
 * - `contigo`: `modal-contigo-dialog modal-contigo-xl` (detalle del cliente, 1140px, sin borde y con sombra).
 * - `xl`: `modal-xl-custom` (detalle del exterior, 80 % del ancho).
 * - `lg`: `size: 'lg'` (información de los CDT).
 * - `pantalla-completa`: `fullscreen: true` (móvil del exterior).
 */
export type VarianteModal = 'contigo' | 'xl' | 'lg' | 'pantalla-completa';

/** Modales abiertas, de la más antigua a la de encima. */
const ABIERTAS: Modal[] = [];

/**
 * Modal centrada de producción (reemplaza `NgbModal` con `centered: true` y `modal-contigo-backdrop`): fondo
 * blanco al 94 %, se cierra con Escape o con un clic por fuera del diálogo. Quien la usa la pinta con `@if` y la
 * quita al recibir `cerrar`.
 */
@Component({
  selector: 'nc-mon-modal',
  templateUrl: './modal.html',
  styleUrl: './modal.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown.escape)': 'alEscape()' },
})
export class Modal {
  readonly variante = input<VarianteModal>('lg');
  /** Pantalla completa en móvil (≤767px): `modal-contigo-mobile-fullscreen`. */
  readonly completaEnMovil = input(false);
  /** Etiqueta accesible del diálogo. */
  readonly etiqueta = input('');

  readonly cerrar = output<void>();

  private readonly ventana = viewChild.required<ElementRef<HTMLElement>>('ventana');
  private presionadoFuera = false;

  constructor() {
    ABIERTAS.push(this);
    inject(DestroyRef).onDestroy(() => ABIERTAS.splice(ABIERTAS.indexOf(this), 1));
    // Como ng-bootstrap, el foco pasa a la ventana de la modal al abrirse.
    afterNextRender(() => this.ventana().nativeElement.focus());
  }

  /** Escape cierra solo la modal de encima (con una abierta sobre otra). */
  protected alEscape(): void {
    if (ABIERTAS[ABIERTAS.length - 1] === this) {
      this.cerrar.emit();
    }
  }

  /** Solo cierra si el clic empezó y terminó fuera del diálogo. */
  protected alPresionar(e: MouseEvent): void {
    this.presionadoFuera = e.target === this.ventana().nativeElement;
  }

  protected alSoltar(e: MouseEvent): void {
    if (this.presionadoFuera && e.target === this.ventana().nativeElement) {
      this.cerrar.emit();
    }
    this.presionadoFuera = false;
  }
}
