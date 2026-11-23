import { ChangeDetectionStrategy, Component, DOCUMENT, effect, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ModoPagina, UiStore } from '@core/state/ui.store';
import { EN_TELEFONO } from '@core/vista-previa/vista-previa';
import { VistaPrevia } from '@layout/vista-previa/vista-previa';

@Component({
  selector: 'nc-root',
  imports: [RouterOutlet, VistaPrevia],
  // El control Escritorio/Móvil no se pinta dentro del propio teléfono.
  template: `<router-outlet />
    @if (!enTelefono) {
      <nc-vista-previa />
    }`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly enTelefono = inject(EN_TELEFONO);
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
