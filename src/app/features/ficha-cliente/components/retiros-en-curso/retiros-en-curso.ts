import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  Injector,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { Retiro } from '@features/ficha-cliente/interfaces/retiros';
import { MontoPipe } from '@features/ficha-cliente/pipes/monto-pipe';

/** Botón "Retiros en curso" (franja en escritorio, botón flotante en móvil) y su modal / hoja inferior. */
@Component({
  selector: 'nc-retiros-en-curso',
  imports: [MontoPipe],
  templateUrl: './retiros-en-curso.html',
  styleUrl: './retiros-en-curso.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown.escape)': 'alEscape()' },
})
export class RetirosEnCurso {
  readonly retiros = input.required<readonly Retiro[]>();
  /** Ojo de saldos cerrado: los montos del detalle se enmascaran. */
  readonly oculto = input(false);

  private readonly injector = inject(Injector);
  private readonly boton = viewChild.required<ElementRef<HTMLButtonElement>>('boton');
  private readonly botonCerrar = viewChild.required<ElementRef<HTMLButtonElement>>('botonCerrar');

  protected readonly abierta = signal(false);
  private readonly colapsados = signal<ReadonlySet<string>>(new Set());

  /** Barra de avance: un segmento por paso, encendidos los ya hechos. */
  protected readonly items = computed(() =>
    this.retiros().map((r) => ({
      ...r,
      segmentos: Array.from({ length: r.pasosTotales }, (_, i) => i < r.pasosHechos),
    })),
  );

  protected colapsado(id: string): boolean {
    return this.colapsados().has(id);
  }

  protected abrir(): void {
    this.abierta.set(true);
    afterNextRender(() => this.botonCerrar().nativeElement.focus(), { injector: this.injector });
  }

  protected cerrar(): void {
    this.abierta.set(false);
    afterNextRender(() => this.boton().nativeElement.focus(), { injector: this.injector });
  }

  /** Clic en el velo (fuera del diálogo) cierra. */
  protected alVelo(e: MouseEvent): void {
    if (e.target === e.currentTarget) this.cerrar();
  }

  protected alEscape(): void {
    if (this.abierta()) this.cerrar();
  }

  protected alternar(id: string): void {
    this.colapsados.update((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }
}
