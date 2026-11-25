import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Icono } from '@features/monitor/components/comunes/icono/icono';
import { Estilos, IconoTabla, NombreIcono } from '@features/monitor/interfaces/comunes';

/** Ícono de una celda o encabezado de la tabla (`.icon-container .icon`): SVG del Monitor o imagen, de 15px. */
@Component({
  selector: 'nc-mon-tabla-icono',
  imports: [Icono],
  template: `
    @if (nombre(); as n) {
      <nc-mon-icono class="icono" [nombre]="n" [style]="estilo()" [style.color]="color()" [style.font-size.px]="tamano()" />
    } @else if (imagen(); as src) {
      <img class="icono" [src]="src" [alt]="alt()" />
    }
  `,
  styles: `
    :host { display: inline-flex; }
    .icono { width: 15px; height: 15px; margin: 0 4px; font-size: 15px; }
    img.icono { object-fit: contain; }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TablaIcono {
  readonly icono = input.required<IconoTabla>();
  /** Estilos propios del ícono por columna (`customIconStyle`). */
  readonly estilo = input<Estilos | null>(null);

  protected readonly nombre = computed<NombreIcono | null>(() => {
    const i = this.icono();
    return 'icono' in i ? i.icono : null;
  });
  protected readonly color = computed(() => {
    const i = this.icono();
    return 'icono' in i ? (i.color ?? null) : null;
  });
  protected readonly tamano = computed(() => {
    const i = this.icono();
    return 'icono' in i ? (i.tamano ?? null) : null;
  });
  protected readonly imagen = computed(() => {
    const i = this.icono();
    return 'imagen' in i ? i.imagen : null;
  });
  protected readonly alt = computed(() => {
    const i = this.icono();
    return 'imagen' in i ? (i.alt ?? 'Icon') : '';
  });
}
