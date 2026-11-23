import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  Injector,
  input,
  output,
  signal,
  viewChild,
  viewChildren,
} from '@angular/core';
import { TEXTOS } from '../../../constants/textos';

/**
 * Selector de asesor de Logros (listbox del DS: lista blanca, hover verde claro, seleccionado en verde con check).
 * Teclado: flechas, Inicio/Fin, Enter/Espacio elige, Escape cierra y devuelve el foco, Tab cierra.
 */
@Component({
  selector: 'nc-selector-asesor',
  templateUrl: './selector-asesor.html',
  styleUrl: './selector-asesor.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:click)': 'clicFuera($event)' },
})
export class SelectorAsesor {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);

  readonly asesores = input.required<readonly string[]>();
  readonly seleccion = input<number | null>(null);
  readonly elegir = output<number>();

  protected readonly abierta = signal(false);
  /** Opción activa (aria-activedescendant). -1 = ninguna. */
  protected readonly activa = signal(-1);
  protected readonly etiqueta = computed(() => {
    const i = this.seleccion();
    return i === null ? TEXTOS.logros.asesorVacio : this.asesores()[i];
  });

  private readonly boton = viewChild.required<ElementRef<HTMLButtonElement>>('boton');
  private readonly lista = viewChild.required<ElementRef<HTMLUListElement>>('lista');
  private readonly opciones = viewChildren<ElementRef<HTMLLIElement>>('opcion');

  protected alternar(): void {
    if (this.abierta()) this.cerrar(false);
    else this.abrir();
  }

  protected teclaBoton(e: KeyboardEvent): void {
    if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && !this.abierta()) {
      e.preventDefault();
      this.abrir();
    }
  }

  protected teclaLista(e: KeyboardEvent): void {
    const ultimo = this.asesores().length - 1;
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        this.marcar(Math.min(this.activa() + 1, ultimo));
        break;
      case 'ArrowUp':
        e.preventDefault();
        this.marcar(Math.max(this.activa() - 1, 0));
        break;
      case 'Home':
        e.preventDefault();
        this.marcar(0);
        break;
      case 'End':
        e.preventDefault();
        this.marcar(ultimo);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (this.activa() >= 0) this.elegirOpcion(this.activa());
        break;
      case 'Escape':
        e.preventDefault();
        this.cerrar(true);
        break;
      case 'Tab':
        this.cerrar(false);
        break;
    }
  }

  protected marcar(i: number): void {
    this.activa.set(i);
    if (i >= 0) this.opciones()[i]?.nativeElement.scrollIntoView({ block: 'nearest' });
  }

  protected elegirOpcion(i: number): void {
    this.elegir.emit(i);
    this.cerrar(true);
  }

  protected clicFuera(e: MouseEvent): void {
    if (this.abierta() && !this.host.nativeElement.contains(e.target as Node)) this.cerrar(false);
  }

  private abrir(): void {
    this.abierta.set(true);
    this.activa.set(this.seleccion() ?? 0);
    afterNextRender(() => this.lista().nativeElement.focus(), { injector: this.injector });
  }

  private cerrar(devolverFoco: boolean): void {
    this.abierta.set(false);
    this.activa.set(-1);
    if (devolverFoco) this.boton().nativeElement.focus();
  }
}
