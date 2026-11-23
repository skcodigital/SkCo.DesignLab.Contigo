import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

/**
 * Migas: en escritorio flecha + "Inicio / Empresa"; en celular flecha verde + nombre (como la ficha de
 * persona natural). El padre decide a dónde lleva cada una.
 */
@Component({
  selector: 'nc-rx-migas',
  template: `
    <!-- Nuevo Contigo · móvil: flecha + nombre, igual que la ficha de persona natural -->
    <div class="m-emp">
      <button type="button" class="m-emp-volver" aria-label="Volver" (click)="volver.emit()"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg></button><span class="m-emp-nombre">{{ empresa() }}</span>
    </div>
    <div class="crumbs">
      <button class="back" aria-label="Volver al buscador" (click)="inicio.emit()"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 12H4"/><path d="m10 6-6 6 6 6"/></svg></button>
      <nav class="crumbs-path" aria-label="Ruta"><a href="/inicio" (click)="irInicio($event)">Inicio</a> / <span class="crumbs-current">{{ empresa() }}</span></nav>
    </div>
  `,
  styleUrl: './migas.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Migas {
  readonly empresa = input.required<string>();
  /** Flecha del celular. */
  readonly volver = output<void>();
  /** "Inicio" y la flecha de escritorio. */
  readonly inicio = output<void>();

  protected irInicio(e: Event): void {
    e.preventDefault();
    this.inicio.emit();
  }
}
