import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  model,
  signal,
} from '@angular/core';

/** Posición del popover respecto al elemento que lo abre (`placement` de ng-bootstrap). */
export type PosicionPopover = 'left' | 'bottom';

/**
 * Popover anclado a un elemento (reemplaza `ngbPopover` con `autoClose="outside"`): se cierra con un clic por
 * fuera o con Escape. Va fijo en la ventana y sigue al ancla al hacer scroll.
 *
 * `<button #ancla (click)="abierto.set(!abierto())">…</button>
 *  <nc-mon-popover [ancla]="ancla" [(abierto)]="abierto" posicion="bottom" [conFlecha]="true">…</nc-mon-popover>`
 */
@Component({
  selector: 'nc-mon-popover',
  templateUrl: './popover.html',
  styleUrl: './popover.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:click)': 'alClicDocumento($event)',
    '(document:keydown.escape)': 'abierto.set(false)',
  },
})
export class Popover {
  readonly abierto = model(false);
  readonly ancla = input.required<HTMLElement>();
  readonly posicion = input<PosicionPopover>('left');
  /** Muestra la flecha de Bootstrap (los popovers con clase propia de producción la ocultaban). */
  readonly conFlecha = input(false);
  /** Corrimiento horizontal en px (las clases propias de producción movían el popover con `right`). */
  readonly corrimiento = input(0);

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  protected readonly punto = signal({ top: 0, left: 0 });

  constructor() {
    const ubicar = (): void => this.ubicar();
    effect((onCleanup) => {
      if (!this.abierto()) {
        return;
      }
      this.ubicar();
      window.addEventListener('scroll', ubicar, true);
      window.addEventListener('resize', ubicar);
      onCleanup(() => {
        window.removeEventListener('scroll', ubicar, true);
        window.removeEventListener('resize', ubicar);
      });
    });
    inject(DestroyRef).onDestroy(() => this.abierto.set(false));
  }

  protected alClicDocumento(e: MouseEvent): void {
    if (!this.abierto()) {
      return;
    }
    const destino = e.target as Node | null;
    if (destino && (this.host.nativeElement.contains(destino) || this.ancla().contains(destino))) {
      return;
    }
    this.abierto.set(false);
  }

  private ubicar(): void {
    const r = this.ancla().getBoundingClientRect();
    const desplazamiento = this.corrimiento();
    this.punto.set(
      this.posicion() === 'bottom'
        ? { top: r.bottom, left: r.left + r.width / 2 + desplazamiento }
        : { top: r.top + r.height / 2, left: r.left + desplazamiento },
    );
  }
}
