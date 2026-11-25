import { ChangeDetectionStrategy, Component, input, linkedSignal, model, output } from '@angular/core';
import { Casillas } from '@features/monitor/components/comunes/casillas/casillas';
import { Icono } from '@features/monitor/components/comunes/icono/icono';
import { Popover } from '@features/monitor/components/comunes/popover/popover';
import { Tooltip } from '@features/monitor/components/comunes/tooltip/tooltip';
import { AccionTabla, GrupoCasillas, NombreIcono, ValoresCasillas } from '@features/monitor/interfaces/comunes';

/**
 * Popovers de la columna verde de acciones de la tabla: el menú (Personalizar, Copiar tabla, Graficar tabla,
 * Analizar con Sami y las propias) y el de «Personalizar» con las casillas de columnas.
 */
@Component({
  selector: 'nc-mon-tabla-acciones',
  imports: [Casillas, Icono, Popover, Tooltip],
  templateUrl: './tabla-acciones.html',
  styleUrl: './tabla-acciones.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TablaAcciones {
  readonly ancla = input.required<HTMLElement>();
  readonly acciones = input<readonly AccionTabla[]>([]);
  readonly deshabilitadas = input<readonly string[]>([]);
  readonly casillas = input<GrupoCasillas | null>(null);
  readonly columnasVisibles = input<ValoresCasillas>({});

  readonly menuAbierto = model(false);
  readonly personalizarAbierto = model(false);

  /** Clave de la acción elegida (las de `personalizar` las resuelve este componente). */
  readonly ejecutar = output<string>();
  readonly aplicarColumnas = output<ValoresCasillas>();

  protected readonly borrador = linkedSignal<ValoresCasillas>(() => ({ ...this.columnasVisibles() }));

  protected deshabilitada(a: AccionTabla): boolean {
    return this.deshabilitadas().includes(a.clave);
  }

  protected icono(a: AccionTabla): NombreIcono | null {
    return typeof a.icono === 'string' ? a.icono : null;
  }

  protected imagen(a: AccionTabla): string | null {
    return typeof a.icono === 'string' ? null : a.icono.imagen;
  }

  protected elegir(a: AccionTabla): void {
    if (this.deshabilitada(a)) {
      return;
    }
    this.menuAbierto.set(false);
    if (a.clave === 'personalizar') {
      this.personalizar();
      return;
    }
    this.ejecutar.emit(a.clave);
  }

  /** Abre el popover de columnas (cierra el menú). */
  personalizar(): void {
    this.menuAbierto.set(false);
    this.personalizarAbierto.set(true);
  }

  protected aplicar(): void {
    this.aplicarColumnas.emit({ ...this.borrador() });
    this.personalizarAbierto.set(false);
  }
}
