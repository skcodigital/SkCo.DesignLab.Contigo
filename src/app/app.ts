import { ChangeDetectionStrategy, Component, DOCUMENT, effect, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ModoPagina, UiStore } from '@core/state/ui.store';

@Component({
  selector: 'nc-root',
  imports: [RouterOutlet],
  template: '<router-outlet />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly ui = inject(UiStore);
  private readonly body = inject(DOCUMENT).body;
  private aplicados = new Set<ModoPagina>();

  constructor() {
    // Refleja los modos de página como clases de <body>: es el contrato que usan los SCSS
    // (`:host-context(.modo-mision)`) y lo que permitía al prototipo cambiar shell y ficha a la vez.
    effect(() => {
      const modos = this.ui.modos();
      this.aplicados.forEach((m) => modos.has(m) || this.body.classList.remove(m));
      modos.forEach((m) => this.body.classList.add(m));
      this.aplicados = new Set(modos);
    });
  }
}
