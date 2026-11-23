import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  input,
  output,
  viewChildren,
} from '@angular/core';
import { nombrePestana } from '@features/radiografia/constants/textos';
import { PlanEmpresa, TabId, Vista } from '@features/radiografia/interfaces/radiografia';

/**
 * Pestañas tipo carpeta (tablist accesible: clic y flechas). En celular son una lista de secciones
 * como tarjetas; al tocar una se entra a su detalle (lo resuelve la página).
 */
@Component({
  selector: 'nc-rx-pestanas',
  templateUrl: './pestanas.html',
  styleUrl: './pestanas.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Pestanas {
  readonly tabs = input.required<readonly TabId[]>();
  readonly activa = input.required<TabId>();
  readonly vista = input.required<Vista>();
  readonly plan = input.required<PlanEmpresa>();
  readonly seleccionar = output<TabId>();

  private readonly botones = viewChildren<ElementRef<HTMLButtonElement>>('tab');

  protected readonly items = computed(() =>
    this.tabs().map((id) => ({ id, nombre: nombrePestana(id, this.vista(), this.plan()) })),
  );

  protected alTeclear(e: KeyboardEvent, i: number): void {
    const n = this.tabs().length;
    let destino = -1;
    if (e.key === 'ArrowRight') destino = (i + 1) % n;
    if (e.key === 'ArrowLeft') destino = (i - 1 + n) % n;
    if (destino < 0) return;
    this.seleccionar.emit(this.tabs()[destino]);
    this.botones()[destino]?.nativeElement.focus();
  }

  /** Devuelve el foco a la pestaña activa (al volver a la lista de secciones en celular). */
  enfocarActiva(): void {
    const i = this.tabs().indexOf(this.activa());
    this.botones()[i]?.nativeElement.focus();
  }
}
